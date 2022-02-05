import { encrypt, decrypt } from '../modules/crypto';

const PASSWORD = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const TEXT = 'some clear text data';

describe('Encrypt & Decrypt', () => {
    test('encrypt', async () => {
        const data = await encrypt({
            password: PASSWORD,
            text: TEXT,
        });
        expect(data !== undefined).toBeTruthy();
        expect(data?.encryptedText.length === 40).toBeTruthy();
    });

    test('decrypt', async () => {
        const data = await encrypt({
            password: PASSWORD,
            text: TEXT,
        });

        const result = await decrypt({
            password: PASSWORD,
            encryptedText: data?.encryptedText,
            iv: data?.iv,
        });

        expect(result === TEXT).toBeTruthy();
    });
});
