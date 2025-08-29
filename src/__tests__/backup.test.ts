import 'dotenv/config';
import { PrismaBackup } from '../modules/backup/backup';
import { PrismaClient } from '../../prisma/generated/prisma/client/client';
import { Route } from '../modules/path-route';

const TMP_BACKUP_FOLDER = 'example/backup_test';

const prisma = new PrismaClient();

describe('PrismaBackup', () => {
  test('Without encrypting', async () => {
    const backup = new PrismaBackup(prisma, { folderName: TMP_BACKUP_FOLDER, database: 'postgres', isTesting: true });
    await backup.run();

    const files = await Route.files(TMP_BACKUP_FOLDER);
    expect(files.length > 0).toBeTruthy();
    expect(!!files?.find((d) => d.name === '_prisma_migrations')).toBeTruthy();
  });
});
