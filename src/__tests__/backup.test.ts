import 'dotenv/config';
import { PrismaBackup } from '../modules/backup/backup';
import { PrismaClient } from '../../prisma/generated/prisma/client/client';
import { Route } from '../modules/path-route';

const TMP_BACKUP_FOLDER = 'backup_test';

const prisma = new PrismaClient();

describe('PrismaBackup', () => {
  test('Without encrypting', async () => {
    const backup = new PrismaBackup(prisma, { folderName: TMP_BACKUP_FOLDER, database: 'postgres' });
    await backup.run();

    const folders = Route.folders(TMP_BACKUP_FOLDER);
    expect(folders.length > 0).toBeTruthy();
  });
});
