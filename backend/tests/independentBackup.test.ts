import { createHash, randomBytes } from 'crypto';
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { Readable } from 'stream';
import { afterEach, describe, expect, it } from 'vitest';
import {
  encryptGzipStream,
  hashBackupFile,
  IndependentBackupService,
  loadIndependentBackupConfig,
  verifyEncryptedGzipFile
} from '../src/services/independentBackup.service.js';
import {
  resolvePrivatePublicationPath,
  safeCloudinaryUrl
} from '../src/services/independentFileBackup.service.js';
import { backupService } from '../src/services/backup.service.js';

const tempDirectories: string[] = [];

const makeConfigValues = () => ({
  BACKUP_RUN_MODE: 'nonproduction',
  NODE_ENV: 'test',
  DATABASE_URL: 'mysql://backup%40user:password%3Awith%40symbols@db-test.example:3306/msc_test',
  BACKUP_ALLOWED_DB_HOST: 'db-test.example',
  BACKUP_MYSQLDUMP_PATH: 'missing-mysqldump-for-test',
  BACKUP_MYSQL_CA_PATH: path.resolve('prisma/ca.pem'),
  BACKUP_S3_ENDPOINT: 'https://s3.us-west-004.backblazeb2.com',
  BACKUP_S3_REGION: 'us-west-004',
  BACKUP_S3_BUCKET: 'msc-test-backups',
  BACKUP_S3_ACCESS_KEY_ID: 'test-key-id',
  BACKUP_S3_SECRET_ACCESS_KEY: 'test-secret',
  BACKUP_S3_PREFIX: 'msc-backups',
  BACKUP_ENCRYPTION_KEY_BASE64: randomBytes(32).toString('base64'),
  BACKUP_ENCRYPTION_KEY_ID: 'nonproduction-key-v1',
  BACKUP_OBJECT_LOCK_MODE: 'GOVERNANCE',
  BACKUP_OBJECT_RETENTION_DAYS: '7'
});

const makeTempDir = async (): Promise<string> => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'msc-backup-test-'));
  tempDirectories.push(dir);
  return dir;
};

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map(dir => rm(dir, { recursive: true, force: true })));
});

describe('independent backup configuration', () => {
  it('accepts an explicitly pinned non-production MySQL target and private B2 destination', () => {
    const config = loadIndependentBackupConfig(makeConfigValues());
    expect(config.database.host).toBe('db-test.example');
    expect(config.database.user).toBe('backup@user');
    expect(config.database.password).toBe('password:with@symbols');
    expect(config.database.name).toBe('msc_test');
    expect(config.objectRetentionDays).toBe(7);
  });

  it('rejects missing settings without falling back to local or production defaults', () => {
    expect(() => loadIndependentBackupConfig({})).toThrow('Invalid independent backup configuration');
  });

  it('rejects a database host that differs from the explicit non-production allowlist', () => {
    const values = { ...makeConfigValues(), BACKUP_ALLOWED_DB_HOST: 'production.example' };
    expect(() => loadIndependentBackupConfig(values)).toThrow(
      'DATABASE_URL host does not match BACKUP_ALLOWED_DB_HOST'
    );
  });

  it('rejects insecure endpoints, unsafe prefixes, malformed encryption keys, and invalid retention', () => {
    expect(() => loadIndependentBackupConfig({
      ...makeConfigValues(),
      BACKUP_S3_ENDPOINT: 'http://storage.example'
    })).toThrow('must use HTTPS');

    expect(() => loadIndependentBackupConfig({
      ...makeConfigValues(),
      BACKUP_S3_PREFIX: 'msc/../other'
    })).toThrow('invalid path segments');

    expect(() => loadIndependentBackupConfig({
      ...makeConfigValues(),
      BACKUP_ENCRYPTION_KEY_BASE64: 'aGVsbG8='
    })).toThrow('exactly 32 bytes');

    expect(() => loadIndependentBackupConfig({
      ...makeConfigValues(),
      BACKUP_OBJECT_RETENTION_DAYS: '3001'
    })).toThrow('Invalid independent backup configuration');
  });
});

describe('encrypted database backup integrity', () => {
  it('encrypts a gzip stream, verifies the authenticated archive, and hashes stored bytes', async () => {
    const dir = await makeTempDir();
    const backupPath = path.join(dir, 'test.sql.gz.enc');
    const key = randomBytes(32);
    const sql = Buffer.from('-- isolated synthetic test fixture\nCREATE TABLE backup_test (id INT PRIMARY KEY);\n');

    await encryptGzipStream(Readable.from(sql), backupPath, key);
    await expect(verifyEncryptedGzipFile(backupPath, key)).resolves.toBeUndefined();

    const storedBytes = await readFile(backupPath);
    const expectedHash = createHash('sha256').update(storedBytes).digest('hex');
    await expect(hashBackupFile(backupPath)).resolves.toBe(expectedHash);
  });

  it('rejects ciphertext tampering and an incorrect encryption key', async () => {
    const dir = await makeTempDir();
    const backupPath = path.join(dir, 'test.sql.gz.enc');
    const key = randomBytes(32);

    await encryptGzipStream(
      Readable.from(Buffer.from('synthetic database dump')),
      backupPath,
      key
    );
    const bytes = await readFile(backupPath);
    bytes[25] ^= 1;
    await writeFile(backupPath, bytes);

    await expect(verifyEncryptedGzipFile(backupPath, key)).rejects.toThrow();
    await expect(
      verifyEncryptedGzipFile(backupPath, randomBytes(32))
    ).rejects.toThrow();
  });
});

describe('database backup safety', () => {
  it('fails on an unavailable exporter before any storage upload', async () => {
    const config = loadIndependentBackupConfig(makeConfigValues());
    await expect(
      new IndependentBackupService().createDatabaseBackup(config)
    ).rejects.toThrow();
  });

  it('blocks legacy production backup, restore, and deletion operations', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      await expect(backupService.createBackup()).rejects.toThrow(
        'legacy local backup is disabled in production'
      );
      await expect(backupService.restoreDatabase('legacy-id', {
        confirmation: 'CONFIRM RESTORE'
      })).rejects.toThrow('restoration is disabled');
      expect(() => backupService.deleteBackup('legacy-id')).toThrow(
        'deletion is disabled in production'
      );
      expect(backupService.getBackupsOverview().config.autoBackupEnabled).toBe(false);
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
    }
  });
});

describe('uploaded-file backup path and URL safety', () => {
  it('rejects unsafe and traversal publication keys while resolving a valid file', async () => {
    const dir = await makeTempDir();
    const source = path.join(dir, 'publication.pdf');
    await writeFile(source, '%PDF-1.7 synthetic test');

    await expect(resolvePrivatePublicationPath(dir, 'publication.pdf')).resolves.toBe(source);
    await expect(resolvePrivatePublicationPath(dir, '..\\outside.pdf')).rejects.toThrow();
    await expect(resolvePrivatePublicationPath(dir, path.resolve('outside.pdf'))).rejects.toThrow();
  });

  it('allows only HTTPS URLs from the Cloudinary asset host', () => {
    expect(safeCloudinaryUrl('https://res.cloudinary.com/msc/image/upload/test.jpg').hostname)
      .toBe('res.cloudinary.com');
    expect(() => safeCloudinaryUrl('http://res.cloudinary.com/test.jpg')).toThrow();
    expect(() => safeCloudinaryUrl('https://attacker.example/image.jpg')).toThrow();
    expect(() => safeCloudinaryUrl('https://res.cloudinary.com@attacker.example/image.jpg')).toThrow();
  });
});
