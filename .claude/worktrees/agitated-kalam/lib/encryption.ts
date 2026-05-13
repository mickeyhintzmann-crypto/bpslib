import { createHash, createDecipheriv, createCipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

const getKey = () => {
  const raw =
    process.env.EMPLOYEE_SECRETS_KEY ||
    process.env.APP_ENCRYPTION_KEY ||
    process.env.ADMIN_PASSWORD ||
    "";

  if (!raw) {
    throw new Error("Mangler EMPLOYEE_SECRETS_KEY eller APP_ENCRYPTION_KEY i miljøvariabler.");
  }

  return createHash("sha256").update(raw).digest();
};

export const encryptSecret = (value: string) => {
  const clean = value.trim();
  if (!clean) {
    throw new Error("Kan ikke kryptere en tom værdi.");
  }

  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);

  const encrypted = Buffer.concat([cipher.update(clean, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
};

export const decryptSecret = (payload: string) => {
  const [ivRaw, tagRaw, encryptedRaw] = (payload || "").split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) {
    throw new Error("Ugyldigt krypteringsformat.");
  }

  const key = getKey();
  const iv = Buffer.from(ivRaw, "base64url");
  const tag = Buffer.from(tagRaw, "base64url");
  const encrypted = Buffer.from(encryptedRaw, "base64url");

  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
};
