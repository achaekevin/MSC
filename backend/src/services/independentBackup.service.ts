import {
  GetObjectLockConfigurationCommand,
  GetObjectCommand,
  GetObjectRetentionCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { spawn } from 'child_process';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import {
  createReadStream,
  createWriteStream,
  promises as fs
} from 'fs';
import os from 'os';
import path from 'path';
import { Readable, Transform, Writable } from 'stream';
import { pipeline } from 'stream/promises';
import { createGunzip, createGzip } from 'zlib';
import { z } from 'zod';

const FORMAT_MAGIC = Buffer.from('MSCBKP01');
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;
const S3_PART_SIZE = 16 * 1024 * 1024;

const backupEnvironmentSchema = z.object({
  BACKUP_RUN_MODE: z.literal('nonproduction'),
  DATABASE_URL: z.string().url(),
  BACKUP_ALLOWED_DB_HOST: z.string().min(1),
  BACKUP_MYSQLDUMP_PATH: z.string().min(1).default('mysqldump'),
  BACKUP_MYSQLDUMP_TIMEOUT_MS: z.coerce.number().int().min(1000).max(14400000).default(7200000),
  BACKUP_MYSQL_CA_PATH: z.string().min(1),
  BACKUP_S3_ENDPOINT: z.string().url(),
  BACKUP_S3_REGION: z.string().min(1),
  BACKUP_S3_BUCKET: z.string().min(3),
  BACKUP_S3_ACCESS_KEY_ID: z.string().min(1),
  BACKUP_S3_SECRET_ACCESS_KEY: z.string().min(1),
  BACKUP_S3_PREFIX: z.string().default('msc-backups'),
  BACKUP_ENCRYPTION_KEY_BASE64: z.string().min(1),
  BACKUP_ENCRYPTION_KEY_ID: z.string().min(1),
  BACKUP_OBJECT_LOCK_MODE: z.enum(['GOVERNANCE', 'COMPLIANCE']),
  BACKUP_OBJECT_RETENTION_DAYS: z.coerce.number().int().min(1).max(3000)
});

export interface IndependentBackupConfig {
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
    caPath: string;
    mysqldumpPath: string;
    exportTimeoutMs: number;
  };
  storage: {
    endpoint: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    prefix: string;
  };
  encryptionKey: Buffer;
  encryptionKeyId: string;
  objectLockMode: 'GOVERNANCE' | 'COMPLIANCE';
  objectRetentionDays: number;
}

export interface IndependentBackupResult {
  id: string;
  createdAt: string;
  database: string;
  objectKey: string;
  metadataKey: string;
  sizeBytes: number;
  sha256: string;
  encryptionKeyId: string;
  objectLockMode: 'GOVERNANCE' | 'COMPLIANCE';
  retainUntil: string;
  status: 'UPLOADED_AND_INTEGRITY_VERIFIED';
  restoredInIsolation: false;
}

const decodeEncryptionKey = (value: string): Buffer => {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new Error('BACKUP_ENCRYPTION_KEY_BASE64 must be a valid base64-encoded 32-byte key.');
  }
  const key = Buffer.from(value, 'base64');
  if (key.length !== 32 || key.toString('base64') !== value) {
    throw new Error('BACKUP_ENCRYPTION_KEY_BASE64 must decode to exactly 32 bytes.');
  }
  return key;
};

const parseDatabaseUrl = (
  value: string,
  expectedHost: string
): IndependentBackupConfig['database'] => {
  const url = new URL(value);
  if (!['mysql:', 'mariadb:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL must use the mysql:// or mariadb:// protocol.');
  }

  const host = url.hostname;
  if (!host || host.toLowerCase() !== expectedHost.toLowerCase()) {
    throw new Error('DATABASE_URL host does not match BACKUP_ALLOWED_DB_HOST.');
  }

  const name = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
  if (!name || name.includes('/')) {
    throw new Error('DATABASE_URL must name exactly one database.');
  }

  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  if (!user || !password || /[\r\n]/.test(user + password)) {
    throw new Error('DATABASE_URL must include a valid database user and password.');
  }

  return {
    host,
    port: url.port ? Number(url.port) : 3306,
    user,
    password,
    name,
    caPath: '',
    mysqldumpPath: '',
    exportTimeoutMs: 7200000
  };
};

export const loadIndependentBackupConfig = (
  values: NodeJS.ProcessEnv = process.env
): IndependentBackupConfig => {
  const parsed = backupEnvironmentSchema.safeParse(values);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map(issue => issue.path.join('.'))
      .filter(Boolean);
    throw new Error(`Invalid independent backup configuration: ${missing.join(', ')}`);
  }

  const endpoint = new URL(parsed.data.BACKUP_S3_ENDPOINT);
  if (endpoint.protocol !== 'https:') {
    throw new Error('BACKUP_S3_ENDPOINT must use HTTPS.');
  }
  if (
    !/^[A-Za-z0-9][A-Za-z0-9/_-]*$/.test(parsed.data.BACKUP_S3_PREFIX) ||
    parsed.data.BACKUP_S3_PREFIX.split('/').some(part => part === '.' || part === '..')
  ) {
    throw new Error('BACKUP_S3_PREFIX contains invalid path segments.');
  }

  const database = parseDatabaseUrl(
    parsed.data.DATABASE_URL,
    parsed.data.BACKUP_ALLOWED_DB_HOST
  );
  database.caPath = path.resolve(parsed.data.BACKUP_MYSQL_CA_PATH);
  database.mysqldumpPath = parsed.data.BACKUP_MYSQLDUMP_PATH;
  database.exportTimeoutMs = parsed.data.BACKUP_MYSQLDUMP_TIMEOUT_MS;

  return {
    database,
    storage: {
      endpoint: endpoint.toString(),
      region: parsed.data.BACKUP_S3_REGION,
      bucket: parsed.data.BACKUP_S3_BUCKET,
      accessKeyId: parsed.data.BACKUP_S3_ACCESS_KEY_ID,
      secretAccessKey: parsed.data.BACKUP_S3_SECRET_ACCESS_KEY,
      prefix: parsed.data.BACKUP_S3_PREFIX.replace(/\/+$/, '')
    },
    encryptionKey: decodeEncryptionKey(parsed.data.BACKUP_ENCRYPTION_KEY_BASE64),
    encryptionKeyId: parsed.data.BACKUP_ENCRYPTION_KEY_ID,
    objectLockMode: parsed.data.BACKUP_OBJECT_LOCK_MODE,
    objectRetentionDays: parsed.data.BACKUP_OBJECT_RETENTION_DAYS
  };
};

export const hashBackupFile = async (filePath: string): Promise<string> => {
  const hash = createHash('sha256');
  await pipeline(
    createReadStream(filePath),
    new Transform({
      transform(chunk: Buffer, encoding, callback) {
        hash.update(chunk);
        callback(null, chunk);
      }
    }),
    new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      }
    })
  );
  return hash.digest('hex');
};

const createMySqlOptionFile = (user: string, password: string): string => {
  const quote = (value: string) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  return `[client]\nuser=${quote(user)}\npassword=${quote(password)}\n`;
};

export const encryptGzipStream = async (
  source: Readable,
  outputPath: string,
  key: Buffer
): Promise<void> => {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  await fs.writeFile(outputPath, Buffer.concat([FORMAT_MAGIC, iv]), {
    flag: 'wx',
    mode: 0o600
  });
  await pipeline(
    source,
    createGzip(),
    cipher,
    createWriteStream(outputPath, { flags: 'a', mode: 0o600 })
  );
  await fs.appendFile(outputPath, cipher.getAuthTag());
  const output = await fs.open(outputPath, 'r+');
  try {
    await output.sync();
  } finally {
    await output.close();
  }
};

const exportAndEncryptDatabase = async (
  config: IndependentBackupConfig,
  outputPath: string
): Promise<void> => {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'msc-db-backup-'));
  const defaultsPath = path.join(workDir, 'mysql.cnf');

  let child: ReturnType<typeof spawn> | undefined;
  try {
    await fs.writeFile(defaultsPath, createMySqlOptionFile(
      config.database.user,
      config.database.password
    ), { mode: 0o600, flag: 'wx' });
    await fs.chmod(defaultsPath, 0o600);

    child = spawn(config.database.mysqldumpPath, [
      `--defaults-extra-file=${defaultsPath}`,
      `--host=${config.database.host}`,
      `--port=${config.database.port}`,
      '--ssl-mode=VERIFY_IDENTITY',
      `--ssl-ca=${config.database.caPath}`,
      '--single-transaction',
      '--routines',
      '--triggers',
      '--events',
      '--no-tablespaces',
      '--hex-blob',
      '--databases',
      config.database.name
    ], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    const exportStdout = child.stdout;
    const exportStderr = child.stderr;
    if (!exportStdout || !exportStderr) {
      throw new Error('Failed to initialize the MySQL export process.');
    }
    const exportProcess = child;
    exportStderr.resume();

    let exportTimedOut = false;
    let stderr = '';
    exportStderr.setEncoding('utf8');
    exportStderr.on('data', (chunk: string) => {
      stderr = `${stderr}${chunk}`.slice(-4000);
    });

    const timeout = setTimeout(() => {
      exportTimedOut = true;
      exportProcess.kill();
    }, config.database.exportTimeoutMs);

    const exitPromise = new Promise<void>((resolve, reject) => {
      exportProcess.once('error', reject);
      exportProcess.once('close', (code, signal) => {
        if (exportTimedOut) {
          reject(new Error(`mysqldump exceeded its ${config.database.exportTimeoutMs}ms timeout.`));
        } else if (code !== 0) {
          reject(new Error(`mysqldump exited unsuccessfully (${signal || code}). ${stderr.trim()}`));
        } else if (stderr.trim()) {
          reject(new Error(`mysqldump reported a warning; the export was rejected. ${stderr.trim()}`));
        } else {
          resolve();
        }
      });
    });

    try {
      await Promise.all([
        encryptGzipStream(exportStdout, outputPath, config.encryptionKey),
        exitPromise
      ]);
    } catch (error) {
      exportProcess.kill();
      throw error;
    } finally {
      clearTimeout(timeout);
    }

  } finally {
    child?.kill();
    await fs.rm(workDir, { recursive: true, force: true });
  }
};

export const verifyEncryptedGzipFile = async (
  filePath: string,
  key: Buffer
): Promise<void> => {
  const file = await fs.open(filePath, 'r');
  try {
    const { size } = await file.stat();
    const header = Buffer.alloc(FORMAT_MAGIC.length + IV_BYTES);
    const footer = Buffer.alloc(AUTH_TAG_BYTES);
    if (size <= header.length + footer.length) {
      throw new Error('Encrypted backup is truncated.');
    }
    await file.read(header, 0, header.length, 0);
    await file.read(footer, 0, footer.length, size - footer.length);
    if (!header.subarray(0, FORMAT_MAGIC.length).equals(FORMAT_MAGIC)) {
      throw new Error('Encrypted backup format marker is invalid.');
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      header.subarray(FORMAT_MAGIC.length)
    );
    decipher.setAuthTag(footer);
    let decompressedBytes = 0;
    await pipeline(
      createReadStream(filePath, { start: header.length, end: size - footer.length - 1 }),
      decipher,
      createGunzip(),
      new Writable({
        write(chunk: Buffer, _encoding, callback) {
          decompressedBytes += chunk.length;
          callback();
        }
      })
    );
    if (decompressedBytes === 0) throw new Error('Backup export is empty.');
  } finally {
    await file.close();
  }
};

export const downloadObject = async (
  client: S3Client,
  bucket: string,
  key: string,
  destination: string
): Promise<void> => {
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!response.Body) throw new Error('Object storage returned an empty backup body.');
  const body = response.Body as Readable;
  await pipeline(body, createWriteStream(destination, { flags: 'wx', mode: 0o600 }));
};

export const createBackupStorageClient = (config: IndependentBackupConfig): S3Client =>
  new S3Client({
    endpoint: config.storage.endpoint,
    region: config.storage.region,
    forcePathStyle: false,
    maxAttempts: 3,
    requestHandler: new NodeHttpHandler({
      connectionTimeout: 10000,
      requestTimeout: 120000
    }),
    credentials: {
      accessKeyId: config.storage.accessKeyId,
      secretAccessKey: config.storage.secretAccessKey
    }
  });

export const assertObjectLockEnabled = async (
  client: S3Client,
  bucket: string
): Promise<void> => {
  const lockConfiguration = await client.send(new GetObjectLockConfigurationCommand({
    Bucket: bucket
  }));
  if (lockConfiguration.ObjectLockConfiguration?.ObjectLockEnabled !== 'Enabled') {
    throw new Error('Backblaze B2 backup bucket does not have Object Lock enabled.');
  }
};

export const uploadObject = async (
  client: S3Client,
  config: IndependentBackupConfig,
  objectKey: string,
  filePath: string,
  retainUntil: Date,
  contentType: string
): Promise<void> => {
  const upload = new Upload({
    client,
    params: {
      Bucket: config.storage.bucket,
      Key: objectKey,
      Body: createReadStream(filePath),
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
      ObjectLockMode: config.objectLockMode,
      ObjectLockRetainUntilDate: retainUntil
    },
    partSize: S3_PART_SIZE,
    queueSize: 1,
    leavePartsOnError: false
  });
  await upload.done();

  const retention = await client.send(new GetObjectRetentionCommand({
    Bucket: config.storage.bucket,
    Key: objectKey
  }));
  const retainedUntil = retention.Retention?.RetainUntilDate;
  if (
    retention.Retention?.Mode !== config.objectLockMode ||
    !retainedUntil ||
    retainedUntil.getTime() < retainUntil.getTime()
  ) {
    throw new Error(`Uploaded object does not have the requested Object Lock retention: ${objectKey}`);
  }
};

export class IndependentBackupService {
  public async createDatabaseBackup(
    config = loadIndependentBackupConfig()
  ): Promise<IndependentBackupResult> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Independent backup runner is disabled in production until separately approved.');
    }

    const now = new Date();
    const id = `db-${now.toISOString().replace(/[-:.]/g, '')}-${randomBytes(8).toString('hex')}`;
    const retainUntil = new Date(now.getTime() + config.objectRetentionDays * 86400000);
    const objectKey = `${config.storage.prefix}/nonproduction/database/${id}.sql.gz.enc`;
    const metadataKey = `${config.storage.prefix}/nonproduction/metadata/${id}.json`;
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'msc-backup-run-'));
    const backupPath = path.join(tempDir, `${id}.sql.gz.enc`);
    const retrievedPath = path.join(tempDir, `${id}.readback.enc`);
    const metadataPath = path.join(tempDir, `${id}.json`);

    const client = createBackupStorageClient(config);

    try {
      await fs.access(config.database.caPath);
      await exportAndEncryptDatabase(config, backupPath);
      const stats = await fs.stat(backupPath);
      const sha256 = await hashBackupFile(backupPath);

      await assertObjectLockEnabled(client, config.storage.bucket);

      await uploadObject(
        client,
        config,
        objectKey,
        backupPath,
        retainUntil,
        'application/octet-stream'
      );

      await downloadObject(client, config.storage.bucket, objectKey, retrievedPath);

      const readbackStats = await fs.stat(retrievedPath);
      const readbackSha256 = await hashBackupFile(retrievedPath);
      if (stats.size !== readbackStats.size || sha256 !== readbackSha256) {
        throw new Error('Stored backup size or SHA-256 does not match the uploaded object.');
      }
      await verifyEncryptedGzipFile(retrievedPath, config.encryptionKey);

      const metadata: IndependentBackupResult = {
        id,
        createdAt: now.toISOString(),
        database: `${config.database.host}/${config.database.name}`,
        objectKey,
        metadataKey,
        sizeBytes: stats.size,
        sha256,
        encryptionKeyId: config.encryptionKeyId,
        objectLockMode: config.objectLockMode,
        retainUntil: retainUntil.toISOString(),
        status: 'UPLOADED_AND_INTEGRITY_VERIFIED',
        restoredInIsolation: false
      };
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), {
        encoding: 'utf8',
        flag: 'wx',
        mode: 0o600
      });
      await uploadObject(
        client,
        config,
        metadataKey,
        metadataPath,
        retainUntil,
        'application/json'
      );
      const metadataReadbackPath = path.join(tempDir, `${id}.metadata.readback`);
      await downloadObject(client, config.storage.bucket, metadataKey, metadataReadbackPath);
      const metadataReadback = await fs.readFile(metadataReadbackPath, 'utf8');
      if (metadataReadback !== JSON.stringify(metadata, null, 2)) {
        throw new Error('Stored database backup metadata does not match the uploaded receipt.');
      }

      return metadata;
    } finally {
      client.destroy();
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}
