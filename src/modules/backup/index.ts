import { BackupProps } from '../../types/backup';
import { Route } from '../route';
import { recursiveModels } from './models';
import cli from 'cli-progress';
import colors from 'ansi-colors';
import { compressBackup } from './compress';

/**
 * @function runBackup
 * @description save models objects into json
 * @param {Object} models each key is the filename
 * @param {String} password (optional) if encrypt is true, then requires the password
 * @param {Boolean} encrypt (optional, default = false) to encrypt file
 * @param {String} folder (optional, default = '.db') in which name will be folder that will gets all backup?
 * @param {Function} onRoute (optional) defines the route
 * @param {String} backupFolderName (optional, default = Date.now()) the name for backup folder that will be generated
 * @param {Boolean} compress (optional, default = false) compress the folder into a zip file?
 * @returns
 */
export async function runBackup({
    models,
    password,
    encrypt = false,
    folder = '.db',
    onRoute,
    backupFolderName,
    compress = false,
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

        progress.start(compress ? keys.length + 1 : keys.length, 0);

        await recursiveModels({
            models,
            password,
            encrypt,
            folder,
            route: Route,
            keys,
            progress,
        });

        if (compress === true) {
            await compressBackup(Route, progress);
        }

        progress.stop();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
