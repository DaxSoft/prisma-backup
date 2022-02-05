export type EncryptDataProps = {
    password: string;
    text: string;
};

export type EncryptDataResult = {
    encryptedText: string;
    iv: Buffer;
};

export type DecryptDataProps = {
    password: string;
    encryptedText?: string;
    iv?: Buffer;
};
