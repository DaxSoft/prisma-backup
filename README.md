# Prisma Backup

Use this module to create a backup measure for your project that uses Prisma. You can either backup the information, or use them to migrate to another database, or just to reset the database.
Example: Let's say that you need to change a unique key (email) to another like (code). You can backup first,
then change the schema.prisma, and use the function of PrismaBackupImport to inject the old information.

[![https://badgen.net/bundlephobia/minzip/@vorlefan/prisma-backup](https://badgen.net/bundlephobia/minzip/@vorlefan/prisma-backup)](https://bundlephobia.com/result?p=@vorlefan/prisma-backup)]

With [npm](https://npmjs.org) do:

```
npm install @vorlefan/prisma-backup
```

With [yarn](https://yarnpkg.com/en/) do:

```
yarn add  @vorlefan/prisma-backup
```

<hr>

### Documentation

You can access on the folder 'docs' of this repository
A better documentation will be made at the near future.

<hr>

### Highlight

-   Create json backup of your database in fragments
-   Easy to setup and choose what to backup
-   Easy to reinject the backup

<hr>

### Example of Export

Please, take a look at the 'example/export' folder of this repository

```ts

import {
    PrismaClient,
    UserRole,
} from '@prisma/client';
import { PrismaBackupExport } from '@vorlefan/prisma-backup';

const prisma = new PrismaClient();

void (async function () {
    try {
        await PrismaBackupExport({
            models: {
                user: () => prisma.user.findMany,
            },
            enums: {
                userRole: () => UserRole,
            },
            onRoute: (route) => {
                // If this function isn't set, then gonna save on a new folder named prisma.backup under
                // the root folder of your project. You can use this function to change it.
                // See @vorlefan/path
                route.remove('prisma.backup');
                route.set(
                    'prisma.backup',
                    route.plug('root', 'database-export')
                );
            },
        });
    } catch (error) {
        console.error(error);
    }
})();


```
