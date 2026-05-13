import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const HASH_KEYLEN = 64;

export const generateActivationCode = () => randomBytes(4).toString("hex").toUpperCase();

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, HASH_KEYLEN).toString("hex");
  return `scrypt:${salt}:${hash}`;
};

export const verifyPassword = (password: string, encoded: string | null | undefined) => {
  if (!encoded) {
    return false;
  }
  const [algo, salt, storedHash] = encoded.split(":");
  if (algo !== "scrypt" || !salt || !storedHash) {
    return false;
  }
  const derived = scryptSync(password, salt, HASH_KEYLEN);
  const stored = Buffer.from(storedHash, "hex");
  if (derived.length !== stored.length) {
    return false;
  }
  return timingSafeEqual(derived, stored);
};
