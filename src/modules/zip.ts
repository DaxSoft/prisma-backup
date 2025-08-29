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

export async function compressBackup(route: PathRoute) {
  const zip = new Zip();

  const folder = route.get('@')?.routePath!;

  zip.addLocalFolder(folder);

  const filename = route.basename(route.get('@')?.routePath!, '');

  await writeZip(zip, route.plug('@', `${filename}.zip`)!);
}
