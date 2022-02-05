import { PathRoute } from '@vorlefan/path';
import {
    BackupModelFileEncrypted,
    BackupModelProps,
    BackupModelsValue,
} from '../../../types/backup';
import { filename } from '../../../utils/filename';
import { encrypt } from '../../crypto';

export class BackupModel {
    currentModel: BackupModelsValue;
    willEncrypt: boolean;
    password: string;
    folder: string;
    key: string;
    private route: PathRoute;

    constructor({
        currentModel,
        encrypt,
        folder,
        password,
        key,
        route,
    }: BackupModelProps) {
        this.currentModel = currentModel;
        this.willEncrypt = encrypt ? encrypt : false;
        this.password = password || '';
        this.folder = folder || '.db';
        this.route = route;
        this.key = key;
    }

    async bootstrap(): Promise<boolean> {
        try {
            await this.handler();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    getFilename(): string {
        return filename(`${this.key}.json`);
    }

    getDestination(): string {
        return this.route.plug('@', this.getFilename());
    }

    private async handler() {
        if (this.willEncrypt) {
            await this.saveWithEncryption();
        } else {
            await this.saveWithoutEncrypting();
        }
    }

    private async saveWithEncryption() {
        const destination = this.getDestination();

        const dataStringfy = JSON.stringify(this.currentModel);

        const dataEncrypted = await encrypt({
            password: this.password,
            text: dataStringfy,
        });

        if (!dataEncrypted) {
            throw new Error('Failed to encrypt the currentData');
        }

        const data: BackupModelFileEncrypted = {
            iv: dataEncrypted.iv.toString('hex'),
            encrypted: dataEncrypted.encryptedText,
        };

        await this.route.stream().writeFile({
            destination,
            data: JSON.stringify(data),
            options: 'utf-8',
        });
    }

    private async saveWithoutEncrypting() {
        const destination = this.getDestination();

        await this.route.stream().writeFile({
            destination,
            data: JSON.stringify(this.currentModel),
            options: 'utf-8',
        });
    }
}
