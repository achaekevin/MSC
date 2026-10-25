import 'dotenv/config';
import { backupService } from '../services/backup.service.js';
import { prisma } from '../config/database.js';

async function main() {
  console.log('Initiating database backup via Prisma model serializer...');
  try {
    const backup = await backupService.createBackup({
      type: 'MANUAL',
      triggeredBy: 'Manual CLI Trigger',
      notes: 'Manual snapshot generated via CLI command'
    });
    console.log('==============================================');
    console.log('BACKUP COMPLETED SUCCESSFULLY!');
    console.log(`Filename:   ${backup.filename}`);
    console.log(`Path:       ${backup.filepath}`);
    console.log(`Size:       ${backup.sizeFormatted} (${backup.sizeBytes} bytes)`);
    console.log(`SHA-256:    ${backup.sha256}`);
    console.log(`Tables:     ${backup.tableCount}`);
    console.log(`Records:    ${backup.recordCount}`);
    console.log(`Status:     ${backup.verificationStatus}`);
    console.log('==============================================');
  } catch (error) {
    console.error('Backup failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
