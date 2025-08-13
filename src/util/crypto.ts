import crypto from "node:crypto";

// Vulnerability: reused salt
export function generateSalt(username: string) {
  const firstLetter = username[0].toLowerCase();
  return crypto
    .createHash("md5")
    .update(firstLetter)
    .digest("hex")
    .slice(0, 16);
}

// Vulnerability: md5 hashing
export function hashPassword(password: string, salt: string) {
  return crypto
    .createHash("md5")
    .update(salt + password + salt)
    .digest("hex");
}
