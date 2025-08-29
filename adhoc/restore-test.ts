// yarn tsx adhoc/restore-test
import 'dotenv/config';
import { PrismaRestore } from '../src/index';
import { PrismaClient } from '../prisma/generated/prisma/client/client';

const TMP_BACKUP_FOLDER = 'example/backup_test';

const prisma = new PrismaClient();

void (async function main() {
  const restore = new PrismaRestore(prisma, {
    baseModels: [],
    folderName: TMP_BACKUP_FOLDER,
    database: 'postgres',
  });

  await restore.run();
})();
