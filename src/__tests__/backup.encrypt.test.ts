import { BackupModels } from '../types/backup';
import { backup } from '../modules/backup';
import { PathRoute } from '@vorlefan/path';

const TMP_BACKUP_FOLDER = 'backup_test';
const PASSWORD = 'pwd123';

const Route = new PathRoute();
Route.set(
    TMP_BACKUP_FOLDER,
    Route.resolve(__dirname, '..', '..', TMP_BACKUP_FOLDER)
);

const models: BackupModels = {
    user: [
        { id: 1, name: 'John', email: 'john@email.com' },
        { id: 2, name: 'Robert', email: 'robert@email.com' },
    ],
    post: [
        { id: 1, title: 'Encrypted Post', userId: 1 },
        { id: 2, title: 'Decrypted Post', userId: 2 },
    ],
};

describe('Backup', () => {
    test('With encrypting', async () => {
        await backup({
            models,
            onRoute: function (route) {
                route.remove('root');
                route.inject('root', 'main', TMP_BACKUP_FOLDER);
            },
            encrypt: true,
            password: PASSWORD,
            backupFolderName: 'encrypted',
        });

        const folders = Route.io().folders(TMP_BACKUP_FOLDER);
        expect(folders.length > 0).toBeTruthy();
    });
});
