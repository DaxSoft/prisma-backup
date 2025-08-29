export type EncryptDataProps = {
  password: string;
  text: string;
};

export type EncryptDataResult = {
  encryptedText: string;
  iv: string;
};

export type DecryptDataProps = {
  password: string;
  encryptedText?: string;
  iv?: string;
};
