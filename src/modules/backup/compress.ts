import { PathRoute } from '@vorlefan/path';
import Zip from 'adm-zip';

async function writeZip(zip: Zip, path: string) {
    return new Promise((resolve, reject) => {
        zip.writeZip(path, function (error) {
            if (!!error) {
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}

export async function compressBackup(route: PathRoute, progress: any) {
    try {
        const zip = new Zip();

        const folder = route.get('@').filepath;

        zip.addLocalFolder(folder);

        const filename = route.basename(route.get('@').filepath, '');

        await writeZip(zip, route.plug('root', `${filename}.zip`));

        progress.increment();
    } catch (error) {
        console.error(error);
    }
}
