import 'dotenv/config';
import { loadIndependentBackupConfig, IndependentBackupService } from '../services/independentBackup.service.js';

const redactSecrets = (message: string): string => {
  const values = [
    process.env.BACKUP_S3_SECRET_ACCESS_KEY,
    process.env.BACKUP_ENCRYPTION_KEY_BASE64
  ].filter((value): value is string => Boolean(value));
  const databaseUrl = process.env.DATABASE_URL;

  let safeMessage = message;
  if (databaseUrl) {
    try {
      const password = decodeURIComponent(new URL(databaseUrl).password);
      if (password) safeMessage = safeMessage.split(password).join('[REDACTED]');
    } catch {
      safeMessage = safeMessage.split(databaseUrl).join('[REDACTED]');
    }
  }
  for (const value of values) safeMessage = safeMessage.split(value).join('[REDACTED]');
  return safeMessage;
};

const main = async (): Promise<void> => {
  try {
    const config = loadIndependentBackupConfig();
    const result = await new IndependentBackupService().createDatabaseBackup(config);
    console.info(JSON.stringify(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown backup error.';
    console.error(`Independent database backup failed: ${redactSecrets(message)}`);
    process.exitCode = 1;
  } finally {
    const { prisma } = await import('../config/database.js');
    await prisma.$disconnect();
  }
};

void main();
