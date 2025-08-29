import crypto, { BinaryLike } from 'node:crypto';

export async function genCryptoKey(
  password: BinaryLike,
  salt: BinaryLike,
  keylen: number
): Promise<Buffer | undefined> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, function (err: Error | null, derivedKey: Buffer) {
      if (err) {
        reject(undefined);
      }
      resolve(derivedKey);
    });
  });
}

export function sanitizeFilename(str: string): string {
  const sanitized = str
    .replace(/[\/\?<>\\:\*\|":]/g, '')
    .replace(/[\x00-\x1f\x80-\x9f]/g, '')
    .replace(/^\.+$/, '')
    .replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, '')
    .replace(/\s/gim, '_');
  return sanitized.split('').splice(0, 255).join('');
}

export function toCamelCase(str: string): string {
  if (!str) return '';
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function omit<T extends Record<string, any>, K extends keyof T>(record: T, keys: K[]): Omit<T, K> {
  const result: Partial<T> = {};
  for (const key in record) {
    if (!keys.includes(key as any)) {
      result[key] = record[key];
    }
  }
  return result as Omit<T, K>;
}

export function pick<T extends Record<string, any>, K extends keyof T>(record: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in record) {
      result[key] = record[key];
    }
  }
  return result;
}

export const sleep = (ms: number) => new Promise((resolve, reject) => setTimeout(() => resolve(true), ms));
