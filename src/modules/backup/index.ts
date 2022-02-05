import { BackupProps } from '../../types/backup';
import { Route } from '../route';
import { recursiveModels } from './models';
import cli from 'cli-progress';
import colors from 'ansi-colors';

export async function backup({
    models,
    password,
    encrypt = false,
    folder = '.db',
    onRoute,
    backupFolderName,
}: BackupProps): Promise<boolean> {
    try {
        if (encrypt === true) {
            if (!password || password.length < 5) {
                throw new Error(
                    'If the encrypt is set true, then it is required a password. The password must be at least 5 length'
                );
            }
        }

        if (!folder) {
            throw new Error('It must be set a folder for the generated files');
        }

        if (Object.keys(models).length === 0) {
            throw new Error('It must have at least one model');
        }

        if (onRoute) {
            onRoute(Route);
        }

        const folder_name = backupFolderName
            ? backupFolderName
            : Date.now().toString();

        Route.inject(folder, 'root').inject('@', folder, folder_name);

        const keys = Object.keys(models);

        const progress = new cli.SingleBar({
            format:
                'Backup Prisma |' +
                colors.cyan('{bar}') +
                '| {percentage}% || {value}/{total} Models',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true,
        });

        progress.start(keys.length, 0);

        await recursiveModels({
            models,
            password,
            encrypt,
            folder,
            route: Route,
            keys,
            progress,
        });

        progress.stop();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
