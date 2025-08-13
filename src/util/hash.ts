import { Md5 } from 'ts-md5';

function hash(text: string, salt?: string): string {
  const saltedText = salt ? `${salt}${text}${salt}` : text;
  return Md5.hashStr(saltedText);
}

function compareHash(plain: string, hashed: string, salt?: string): boolean {
  return hash(plain, salt) === hashed;
}

export {
  hash as hashString,             // without salt
  compareHash,                    // without or with salt
};
