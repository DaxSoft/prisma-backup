# Prisma Backup

A module for creating and restoring full backups of a PostgreSQL database when using Prisma. It generates JSON files for each table, handles relational integrity during restoration, and includes options for pagination, encryption, and compression.

[![https://badgen.net/bundlephobia/minzip/@vorlefan/prisma-backup](https://badgen.net/bundlephobia/minzip/@vorlefan/prisma-backup)](https://bundlephobia.com/result?p=@vorlefan/prisma-backup)

<br>

> ### ⚠️ Caution: For Small to Medium Projects
> This tool is designed for convenience and is recommended for small to medium-sized projects. It is **not a substitute for enterprise-grade, point-in-time recovery solutions**. It performs a full dump and restore, which may not be suitable for very large databases or applications requiring zero downtime.

### A Primary Use Case: Migrating from Free-Tier Services

Many database hosting solutions, such as Prisma's Data Platform on the free tier, do not provide a built-in backup/export feature. `prisma-backup` is an ideal tool for this scenario. You can use it to create a complete backup of your database, allowing you to easily migrate your data to another PostgreSQL instance or a different provider without losing information.

## Installation

With [npm](https://npmjs.org) do:

```bash
npm install @vorlefan/prisma-backup
```

With [yarn](https://yarnpkg.com/en/) do:

```bash
yarn add @vorlefan/prisma-backup
```

<hr>

## How It Works

The library is split into two main classes:

1.  **`PrismaBackup`**: Connects to your database via your Prisma Client instance, queries all tables, and saves the data for each table into a separate JSON file within a backup folder.
2.  **`PrismaRestore`**: Reads the backup files and, using Prisma's DMMF (Data Model Meta Format), it calculates the correct insertion order based on table relations. It then inserts the data back into the database table by table, respecting dependencies.

<hr>

## Usage

### 1. Creating a Backup

To create a backup, instantiate the `PrismaBackup` class and call the `.run()` method.

```ts
import { PrismaClient } from '@prisma/client';
import { PrismaBackup } from '@vorlefan/prisma-backup';

const prisma = new PrismaClient();

async function createBackup() {
  const backup = new PrismaBackup(prisma, {
    folderName: '.db_backups', // The root folder for all backups
    database: 'postgres',
    
    // Optional: Handle large tables with offset pagination
    offset: {
      Posts: { limit: 100 }, // Backup the 'Posts' table in batches of 100
    },
    
    // Optional: Encrypt the backup files
    encrypt: true,
    password: 'a-very-strong-password',

    // Optional: Compress the final backup folder into a .zip file
    compress: true,
  });

  await backup.run();
  
  console.log('Backup completed!');
}

createBackup();
```

#### Backup Options (`PrismaBackupArgs`)

| Option       | Type                                    | Description                                                                                             |
|--------------|-----------------------------------------|---------------------------------------------------------------------------------------------------------|
| `folderName` | `string`                                | **Required.** The root directory where backup folders will be created.                                  |
| `database`   | `'postgres'`                            | **Required.** The type of database.                                                                     |
| `offset`     | `{ [tableName: string]: { limit: number } }` | Optional. Specify tables to back up in batches to prevent memory issues with large datasets.          |
| `encrypt`    | `boolean`                               | Optional. If `true`, encrypts the content of each JSON file. Defaults to `false`.                       |
| `password`   | `string`                                | Required if `encrypt` is `true`. Must be at least 5 characters long.                                    |
| `compress`   | `boolean`                               | Optional. If `true`, creates a zip archive of the backup folder upon completion. Defaults to `false`. |
| `isTesting`  | `boolean`                               | Internal flag for testing purposes.                                                                     |

### 2. Restoring a Backup

To restore a backup, instantiate the `PrismaRestore` class and call the `.run()` method. The most important step is providing the `baseModels`, which is necessary to determine the correct order for data insertion.

```ts
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaRestore } from '@vorlefan/prisma-backup';

// Important: Import the 'Prisma' namespace to access the DMMF
const prisma = new PrismaClient();

async function restoreBackup() {
  const restore = new PrismaRestore(prisma, {
    folderName: '.db_backups', // The specific backup folder to restore
    database: 'postgres',

    // This is CRITICAL for the restore to work correctly.
    // It allows the tool to understand your table relationships.
    baseModels: Prisma.dmmf.datamodel.models as any,

    // Optional: Specify tables to ignore during the restore
    ignoredTables: ['_prisma_migrations'], // _prisma_migrations already added
    
    // Optional: Time in ms to wait between inserting data for each table
    waitBetweenModels: 500, 
  });

  await restore.run();
  
  console.log('Restore completed!');
}

restoreBackup();
```

#### Restore Options (`PrismaRestoreArgs`)

| Option              | Type                         | Description                                                                                              |
|---------------------|------------------------------|----------------------------------------------------------------------------------------------------------|
| `folderName`        | `string`                     | **Required.** The full path to the specific backup folder you want to restore.                         |
| `database`          | `'postgres'`                 | **Required.** The type of database.                                                                      |
| `baseModels`        | `Array<any>`                 | **Required.** Pass `Prisma.dmmf.datamodel.models as any`. This contains the schema info needed to resolve insertion order. |
| `ignoredTables`     | `string[]`                   | Optional. An array of table names to skip during the restoration process.                                 |
| `waitBetweenModels` | `number`                     | Optional. Time in milliseconds to wait between processing each model. Defaults to `1000`.                |
| `transaction`       | `{ maxWait: number, timeout: number }` | Optional. Configure the transaction timeout settings for Prisma.                                   |
| `isTesting`         | `boolean`                    | Internal flag for testing purposes.                                                                      |