import {Md5} from 'ts-md5';

function hashString(text:string) {
    return Md5.hashStr(text);
}

function hashStringWithSalt(text:string, salt:string) {
    return Md5.hashStr(salt+text+salt);
}

function compareHash(plain:string, hashed:string) {
    let hashedPlain = hashString(plain);
    return hashed == hashedPlain
}

function compareHashWithSalt(plain:string, salt:string, hashed:string) {
    let hashedPlain = hashStringWithSalt(plain, salt);
    return hashed == hashedPlain
}


export {hashString, hashStringWithSalt, compareHash, compareHashWithSalt}