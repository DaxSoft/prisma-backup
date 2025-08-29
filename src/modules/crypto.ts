import crypto from 'node:crypto';
import { EncryptDataProps, EncryptDataResult, DecryptDataProps } from '../types';
import { genCryptoKey } from '../utils/utils';

export async function encrypt({ password, text }: EncryptDataProps): Promise<EncryptDataResult | undefined> {
  return new Promise(async (resolve, reject) => {
    const key = await genCryptoKey(password, 'salt', 24);
    if (key === undefined) return reject(undefined);

    const iv = crypto.randomBytes(12);
    const _iv = JSON.stringify(iv);

    const cypher = crypto.createCipheriv('aes-192-ccm', key, iv, {
      authTagLength: 12,
    });
    cypher.setEncoding('hex');

    let encryptedText: string = '';
    cypher.on('data', (chunk) => {
      encryptedText += chunk;
    });
    cypher.on('end', () => resolve({ encryptedText, iv: _iv }));
    cypher.on('error', () => reject(undefined));
    cypher.write(text);

    cypher.end();
  });
}

export async function decrypt({ password, encryptedText, iv }: DecryptDataProps): Promise<string | undefined> {
  return new Promise(async (resolve, reject) => {
    if (!encryptedText || !iv) {
      return reject(undefined);
    }

    const resolveIv = Buffer.from(JSON.parse(iv));

    const key = await genCryptoKey(password, 'salt', 24);
    if (key === undefined) return reject(undefined);

    const decipher = crypto.createCipheriv('aes-192-ccm', key, resolveIv, {
      authTagLength: 12,
    });

    let decrypted: string = '';

    decipher.on('readable', () => {
      let chunk: Buffer | null = decipher.read();
      if (!!chunk) {
        decrypted += chunk.toString('utf-8');
      }
    });

    decipher.on('end', () => {
      resolve(decrypted);
    });

    decipher.write(encryptedText, 'hex');
    decipher.end();
  });
}
