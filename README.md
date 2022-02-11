# Prisma Backup

Use this module to create a backup measure for your project that uses Prisma. You can either backup the information, or use them to migrate to another database, or just to reset the database.
Example: Let's say that you need to change a unique key (email) to another like (code). You can backup first,
then change the schema.prisma, and use this module to inject the old information.

In truth, this work with any database, ORM and etc, the only thing you need is that the models returns a Object (that has as value a array of objects).

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

A better documentation will be made at the near future.

```ts
import { runBackup, getBackup } from '@vorlefan/prisma-backup';

// The 'backup' function is async and has these properties

export type BackupProps = {
    encrypt?: boolean; // true to encrypt data
    password?: string; // if encrypt is true, then is required
    folder?: string; // folder that will be saved the data generated
    models:  Record<string, Array<Record<any, any>>>; // models from prisma
    onRoute?: (route: PathRoute) => any; // define the route save
    backupFolderName?: string; // backup folder name that will be generated, by default is 'Date.now()'
};

await runBackup(props: BackupProps)

// To get the bakcup

export type GetBackupProps = {
    password?: string; // if is encrypted, then is required
    folder?: string; // the general folder, by default is '.db'
    backupFolderName?: string; // instend of getting the most recent folder of backup, you can define to get from one
    onRoute?: (route: PathRoute) => any; // define the route
    onCurrentModel: GetBackupOnCurrentModelProps; // async function to handle each model
};

await getBackup(props: GetBackupProps)
```

<hr>

### Highlight

-   Create json backup of your database in fragments
-   Easy to setup and choose what models to backup
-   You can encrypt your backup with a password
-   Method to handle the importing of backup data

<hr>

### Example

Please, take a look at the 'example/backup_test/.db' folder of this repository

```ts
import { PrismaClient } from '@prisma/client';
import { runBackup } from '@vorlefan/prisma-backup';

const prisma = new PrismaClient();

void (async function () {
    const [user] = await prisma.$transaction([prisma.user.findMany({})]);

    // w/out encrypt

    await runBackup({
        models: {
            user,
        },
    });

    // w/ encrypt

    await runBackup({
        models: {
            user,
        },
        encrypt: true,
        password: 'pwd123',
    });
})();
```

### Splitting models

```ts
import { PrismaClient } from '@prisma/client';
import { runBackup } from '@vorlefan/prisma-backup';
import { BackupModels } from '@vorlefan/prisma-backup/dist/types/backup';

const prisma = new PrismaClient();

function chunk(array: Array<any>, size = 2) {
    return Array.from(
        {
            length: Math.ceil(array.length / size),
        },
        (v, i) => array.slice(i * size, i * size + size)
    );
}

void (async function () {
    const user = await prisma.user.findMany();

    const models: BackupModels = {};

    const users = chunk(user, 2);

    users.map((model, i) => {
        const key = `user_${i}`;
        models[key] = model;
    });

    await runBackup({
        models,
        backupFolderName: 'user',
    });
})();
```

### Get the backup data, example

```ts
import { getBackup } from '@vorlefan/prisma-backup';

await getBackup({
    onCurrentModel: async function ({ instance, currentModel, currentFile }) {
        if (currentFile.name === 'user') {
            const data = currentModel;
            await instance.route.json().store({
                routeName: '@',
                filename: `${Date.now().toString(16)}.json`, /// `${data.name}.json`,
                data,
            });
        }
    },
    folder: '.db',
    onRoute: function (route) {
        route.remove('root');
        route.set('root', route.resolve(__dirname, '..'));
    },
    password: 'pwd123',
    backupFolderName: 'encrypted',
});
```
