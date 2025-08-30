import 'dotenv/config';
import { PrismaBackup } from '../modules/backup/backup';
import { PrismaClient, Prisma } from '../../prisma/generated/prisma/client';
import { Route } from '../modules/path-route';
import { PrismaRestore } from '../modules/restore/restore';

const TMP_BACKUP_FOLDER = 'example/backup_test';

const prisma = new PrismaClient();

describe('PrismaBackup', () => {
  test('Without encrypting', async () => {
    const backup = new PrismaBackup(prisma, {
      folderName: TMP_BACKUP_FOLDER,
      database: 'postgres',
      isTesting: true,
      offset: {
        Posts: { limit: 50 },
      },
    });
    await backup.run();
    const files = await Route.files(TMP_BACKUP_FOLDER);
    expect(files.length > 0).toBeTruthy();
    expect(!!files?.find((d) => d.name === '_prisma_migrations')).toBeTruthy();
    expect(!!files?.find((d) => d.name === 'backup_test')).toBeTruthy();
  });
  // test('Restore', async () => {
  //   const restore = new PrismaRestore(prisma, {
  //     baseModels: Prisma.dmmf.datamodel.models as any,
  //     folderName: TMP_BACKUP_FOLDER,
  //     database: 'postgres',
  //     isTesting: true,
  //   });
  //   await restore.run();
  //   expect(true).toBeTruthy();
  // });
});
