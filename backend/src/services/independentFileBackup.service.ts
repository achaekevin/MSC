import { createHash, randomBytes } from 'crypto';
import { createReadStream, promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import {
  assertObjectLockEnabled,
  createBackupStorageClient,
  downloadObject,
  encryptGzipStream,
  hashBackupFile,
  IndependentBackupConfig,
  uploadObject,
  verifyEncryptedGzipFile
} from './independentBackup.service.js';

const MAX_ASSET_BYTES = 50 * 1024 * 1024;
const CLOUDINARY_HOST = 'res.cloudinary.com';

const isCloudinaryUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.toLowerCase() === CLOUDINARY_HOST;
  } catch {
    return false;
  }
};

interface AssetReference {
  id: string;
  entityType: string;
  entityId: string;
  references?: Array<{ entityType: string; entityId: string }>;
  sourceType: 'CLOUDINARY' | 'PRIVATE_LOCAL' | 'EXTERNAL';
  url?: string;
  storageKey?: string;
  contentType?: string;
}

interface FileManifestEntry {
  id: string;
  entityType: string;
  entityId: string;
  references: Array<{ entityType: string; entityId: string }>;
  sourceType: AssetReference['sourceType'];
  status: 'BACKED_UP' | 'MISSING' | 'UNSUPPORTED_EXTERNAL';
  storageKey?: string;
  objectKey?: string;
  contentType?: string;
  sizeBytes?: number;
  contentSha256?: string;
  archiveSha256?: string;
  sourceReferenceSha256?: string;
}

const isInsideDirectory = (root: string, candidate: string): boolean => {
  const relative = path.relative(root, candidate);
  return relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative);
};

export const resolvePrivatePublicationPath = async (
  storageRoot: string,
  storageKey: string
): Promise<string> => {
  if (
    !storageKey ||
    path.isAbsolute(storageKey) ||
    path.basename(storageKey) !== storageKey ||
    storageKey.includes('\0')
  ) {
    throw new Error('Private publication storage key is unsafe.');
  }

  const root = await fs.realpath(storageRoot);
  const candidate = path.resolve(root, storageKey);
  if (!isInsideDirectory(root, candidate)) {
    throw new Error('Private publication path escapes its configured storage directory.');
  }

  const realFile = await fs.realpath(candidate);
  if (!isInsideDirectory(root, realFile)) {
    throw new Error('Private publication file resolves outside its configured storage directory.');
  }
  return realFile;
};

export const safeCloudinaryUrl = (url: string): URL => {
  const parsed = new URL(url);
  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname.toLowerCase() !== CLOUDINARY_HOST ||
    (parsed.port !== '' && parsed.port !== '443') ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error('Asset URL is not an approved Cloudinary HTTPS asset URL.');
  }
  return parsed;
};

const addReference = (
  references: Map<string, AssetReference>,
  reference: AssetReference
): void => {
  const key = reference.url || reference.storageKey;
  if (!key) return;
  const existing = references.get(key);
  if (!existing) {
    reference.references = [{ entityType: reference.entityType, entityId: reference.entityId }];
    references.set(key, reference);
    return;
  }
  existing.references ??= [];
  if (!existing.references.some(item =>
    item.entityType === reference.entityType && item.entityId === reference.entityId
  )) {
    existing.references.push({
      entityType: reference.entityType,
      entityId: reference.entityId
    });
  }
};

const fetchCloudinaryAsset = async (
  url: string,
  contentHash: ReturnType<typeof createHash>
): Promise<{ source: Readable; contentType: string }> => {
  const verifiedUrl = safeCloudinaryUrl(url);
  const response = await fetch(verifiedUrl, {
    redirect: 'error',
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok || !response.body) {
    throw new Error(`Cloudinary asset download returned HTTP ${response.status}.`);
  }
  const declaredSize = Number(response.headers.get('content-length') || 0);
  if (declaredSize > MAX_ASSET_BYTES) {
    throw new Error('Cloudinary asset exceeds the configured backup size limit.');
  }

  let sizeBytes = 0;
  const body = Readable.from((async function* () {
    const reader = response.body!.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sizeBytes += value.byteLength;
        if (sizeBytes > MAX_ASSET_BYTES) {
          await reader.cancel();
          throw new Error('Cloudinary asset exceeds the configured backup size limit.');
        }
        contentHash.update(value);
        yield Buffer.from(value);
      }
    } finally {
      reader.releaseLock();
    }
  })());

  return {
    source: body,
    contentType: response.headers.get('content-type') || 'application/octet-stream'
  };
};

const hashLocalSource = (filePath: string, hash: ReturnType<typeof createHash>): Readable =>
  createReadStream(filePath).pipe(new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      hash.update(chunk);
      callback(null, chunk);
    }
  }));

export interface IndependentFileBackupResult {
  id: string;
  createdAt: string;
  manifestObjectKey: string;
  assetCount: number;
  backedUpCount: number;
  unsupportedExternalCount: number;
  missingCount: number;
  manifestSha256: string;
  status: 'UPLOADED_AND_INTEGRITY_VERIFIED' | 'INCOMPLETE';
  restoredInIsolation: false;
}

export class IndependentFileBackupService {
  public async createFileBackup(
    config: IndependentBackupConfig
  ): Promise<IndependentFileBackupResult> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Independent file backup runner is disabled in production until separately approved.');
    }

    const references = new Map<string, AssetReference>();
    const media = await prisma.media.findMany({
      select: {
        id: true,
        url: true,
        secureUrl: true,
        publicId: true,
        cloudinaryPublicId: true,
        mimeType: true
      }
    });
    for (const item of media) {
      const mediaUrl = item.secureUrl || item.url;
      if (!mediaUrl.startsWith('http')) continue;
      addReference(references, {
        id: item.id,
        entityType: 'Media',
        entityId: item.id,
        sourceType: isCloudinaryUrl(mediaUrl) ? 'CLOUDINARY' : 'EXTERNAL',
        url: mediaUrl,
        storageKey: item.cloudinaryPublicId || item.publicId,
        contentType: item.mimeType
      });
    }

    const [programs, news, team, publications] = await Promise.all([
      prisma.program.findMany({ select: { id: true, image: true } }),
      prisma.newsArticle.findMany({ select: { id: true, featuredImage: true } }),
      prisma.teamMember.findMany({ select: { id: true, photo: true } }),
      prisma.publication.findMany({
        where: { deletedAt: null },
        select: { id: true, privateFileKey: true, pdfUrl: true }
      })
    ]);

    for (const item of programs) {
      if (!item.image.startsWith('http')) continue;
      addReference(references, {
        id: `program-${item.id}`,
        entityType: 'Program image',
        entityId: item.id,
        sourceType: isCloudinaryUrl(item.image) ? 'CLOUDINARY' : 'EXTERNAL',
        url: item.image
      });
    }
    for (const item of news) {
      if (!item.featuredImage.startsWith('http')) continue;
      addReference(references, {
        id: `news-${item.id}`,
        entityType: 'News image',
        entityId: item.id,
        sourceType: isCloudinaryUrl(item.featuredImage) ? 'CLOUDINARY' : 'EXTERNAL',
        url: item.featuredImage
      });
    }
    for (const item of team) {
      if (!item.photo || !item.photo.startsWith('http')) continue;
      addReference(references, {
        id: `team-${item.id}`,
        entityType: 'Team image',
        entityId: item.id,
        sourceType: isCloudinaryUrl(item.photo) ? 'CLOUDINARY' : 'EXTERNAL',
        url: item.photo
      });
    }
    for (const item of publications) {
      if (item.privateFileKey) {
        addReference(references, {
          id: `publication-${item.id}`,
          entityType: 'Private publication PDF',
          entityId: item.id,
          sourceType: 'PRIVATE_LOCAL',
          storageKey: item.privateFileKey,
          contentType: 'application/pdf'
        });
      } else if (item.pdfUrl?.startsWith('http')) {
        addReference(references, {
          id: `publication-${item.id}`,
          entityType: 'Publication PDF URL',
          entityId: item.id,
          sourceType: isCloudinaryUrl(item.pdfUrl) ? 'CLOUDINARY' : 'EXTERNAL',
          url: item.pdfUrl,
          contentType: 'application/pdf'
        });
      }
    }

    const now = new Date();
    const id = `files-${now.toISOString().replace(/[-:.]/g, '')}-${randomBytes(8).toString('hex')}`;
    const retainUntil = new Date(now.getTime() + config.objectRetentionDays * 86400000);
    const prefix = `${config.storage.prefix}/nonproduction/files/${id}`;
    const manifestObjectKey = `${prefix}/manifest.json.gz.enc`;
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'msc-file-backup-'));
    const client = createBackupStorageClient(config);
    const entries: FileManifestEntry[] = [];
    let unsupportedExternalCount = 0;
    let missingCount = 0;
    let backedUpCount = 0;

    try {
      await assertObjectLockEnabled(client, config.storage.bucket);
      const publicationRoot = path.resolve(
        process.cwd(),
        env.PRIVATE_STORAGE_PATH || './storage/private_publications'
      );

      for (const reference of references.values()) {
        const rawRef = reference.url || reference.storageKey || '';
        const entry: FileManifestEntry = {
          id: reference.id,
          entityType: reference.entityType,
          entityId: reference.entityId,
          references: reference.references || [],
          sourceType: reference.sourceType,
          status: 'MISSING',
          storageKey: reference.storageKey,
          contentType: reference.contentType,
          sourceReferenceSha256: createHash('sha256').update(rawRef).digest('hex')
        };
        const assetPath = path.join(tempDir, `${entries.length}.asset.gz.enc`);
        const readbackPath = path.join(tempDir, `${entries.length}.asset.readback.gz.enc`);
        const contentHash = createHash('sha256');

        try {
          let source: Readable;
          let sizeBytes = 0;
          if (reference.sourceType === 'EXTERNAL') {
            throw new Error('External asset provider is not configured for independent backup.');
          } else if (reference.sourceType === 'PRIVATE_LOCAL' && reference.storageKey) {
            const filePath = await resolvePrivatePublicationPath(
              publicationRoot,
              reference.storageKey
            );
            const stats = await fs.stat(filePath);
            if (stats.size > MAX_ASSET_BYTES) {
              throw new Error('Private publication exceeds the configured backup size limit.');
            }
            sizeBytes = stats.size;
            source = hashLocalSource(filePath, contentHash);
          } else if (reference.sourceType === 'CLOUDINARY' && reference.url) {
            const fetched = await fetchCloudinaryAsset(reference.url, contentHash);
            source = fetched.source;
            entry.contentType = fetched.contentType;
            const encryptedInput = source;
            source = Readable.from((async function* () {
              for await (const chunk of encryptedInput) {
                sizeBytes += (chunk as Buffer).length;
                yield chunk;
              }
            })());
          } else {
            throw new Error('Asset reference does not contain a usable source URL or storage key.');
          }

          await encryptGzipStream(source, assetPath, config.encryptionKey);
          const objectKey = `${prefix}/objects/${entries.length}.asset.gz.enc`;
          await uploadObject(
            client,
            config,
            objectKey,
            assetPath,
            retainUntil,
            'application/octet-stream'
          );
          await downloadObject(client, config.storage.bucket, objectKey, readbackPath);
          const archiveSha256 = await hashBackupFile(assetPath);
          if (archiveSha256 !== await hashBackupFile(readbackPath)) {
            throw new Error(`Stored file backup checksum mismatch for ${reference.id}.`);
          }
          await verifyEncryptedGzipFile(readbackPath, config.encryptionKey);
          entry.status = 'BACKED_UP';
          entry.objectKey = objectKey;
          entry.sizeBytes = sizeBytes;
          entry.contentSha256 = contentHash.digest('hex');
          entry.archiveSha256 = archiveSha256;
          backedUpCount++;
        } catch (error) {
          entry.status = reference.sourceType === 'EXTERNAL'
            ? 'UNSUPPORTED_EXTERNAL'
            : 'MISSING';
          if (entry.status === 'UNSUPPORTED_EXTERNAL') unsupportedExternalCount++;
          else missingCount++;
          entry.contentSha256 = undefined;
          entry.archiveSha256 = undefined;
          const reason = error instanceof Error ? error.message : 'Unknown asset backup error.';
          if (
            reference.sourceType === 'PRIVATE_LOCAL' &&
            !reason.includes('ENOENT')
          ) {
            throw error;
          }
        } finally {
          await Promise.all([
            fs.rm(assetPath, { force: true }),
            fs.rm(readbackPath, { force: true })
          ]);
        }

        entries.push(entry);
      }

      const result: IndependentFileBackupResult = {
        id,
        createdAt: now.toISOString(),
        manifestObjectKey,
        assetCount: entries.length,
        backedUpCount,
        unsupportedExternalCount,
        missingCount,
        manifestSha256: '',
        status: missingCount === 0 && unsupportedExternalCount === 0
          ? 'UPLOADED_AND_INTEGRITY_VERIFIED'
          : 'INCOMPLETE',
        restoredInIsolation: false
      };
      const manifestPath = path.join(tempDir, 'manifest.json.gz.enc');
      const manifestBytes = Buffer.from(JSON.stringify({
        id,
        createdAt: now.toISOString(),
        entries
      }, null, 2));
      await encryptGzipStream(Readable.from(manifestBytes), manifestPath, config.encryptionKey);
      result.manifestSha256 = await hashBackupFile(manifestPath);
      await uploadObject(
        client,
        config,
        manifestObjectKey,
        manifestPath,
        retainUntil,
        'application/octet-stream'
      );
      const manifestReadbackPath = path.join(tempDir, 'manifest.readback.json.gz.enc');
      await downloadObject(client, config.storage.bucket, manifestObjectKey, manifestReadbackPath);
      if (result.manifestSha256 !== await hashBackupFile(manifestReadbackPath)) {
        throw new Error('Stored file manifest checksum does not match the uploaded manifest.');
      }
      await verifyEncryptedGzipFile(manifestReadbackPath, config.encryptionKey);

      if (missingCount > 0 || unsupportedExternalCount > 0) {
        throw new Error(
          `File backup is incomplete: ${missingCount} missing and ${unsupportedExternalCount} unsupported external assets.`
        );
      }
      return result;
    } finally {
      client.destroy();
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}
