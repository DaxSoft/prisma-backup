import { GetBackupProps } from '../../types/backup';
import { Route } from '../route';
import cli from 'cli-progress';
import colors from 'ansi-colors';
import { runModels } from './models';

/**
 * @function getBackup
 */
export async function getBackup({
    backupFolderName,
    folder = '.db',
    onRoute,
    password,
    onCurrentModel,
}: GetBackupProps): Promise<boolean> {
    try {
        if (!folder) {
            throw new Error(`It is required to define the folder variable`);
        }

        if (onRoute) {
            onRoute(Route);
        }

        Route.join(folder, 'root').alias('@', folder);
        Route.setItem('folder', folder);
        Route.setItem('password', password);
        Route.setItem('backupFolderName', backupFolderName);

        const progress = new cli.SingleBar({
            format:
                'Get Backup Prisma |' +
                colors.cyan('{bar}') +
                '| {percentage}% || {value}/{total} Models',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true,
        });

        await runModels(Route, onCurrentModel, progress);

        progress.stop();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
