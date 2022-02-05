import crypto, { BinaryLike } from 'crypto';

export async function genCryptoKey(
    password: BinaryLike,
    salt: BinaryLike,
    keylen: number
): Promise<Buffer | undefined> {
    return new Promise((resolve, reject) => {
        crypto.scrypt(
            password,
            salt,
            keylen,
            function (err: Error | null, derivedKey: Buffer) {
                if (err) {
                    reject(undefined);
                }
                resolve(derivedKey);
            }
        );
    });
}
