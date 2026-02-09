import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const getExpectedAdminToken = () => process.env.ADMIN_TOKEN || process.env.ADMIN_INBOX_TOKEN || "";
const getAdminPassword = () => process.env.ADMIN_PASSWORD || "";

const base64UrlEncode = (value: string) => Buffer.from(value, "utf8").toString("base64url");

const base64UrlDecode = (value: string) => Buffer.from(value, "base64url").toString("utf8");

const signPayload = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

const safeEqual = (left: string, right: string) => {
  const leftBuf = Buffer.from(left);
  const rightBuf = Buffer.from(right);
  if (leftBuf.length !== rightBuf.length) {
    return false;
  }
  return timingSafeEqual(leftBuf, rightBuf);
};

export const createAdminSessionToken = () => {
  const secret = getAdminPassword();
  if (!secret) {
    throw new Error("ADMIN_PASSWORD mangler i miljøvariabler.");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    sid: randomUUID()
  };
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(payloadEncoded, secret);
  return `${payloadEncoded}.${signature}`;
};

export const verifyAdminSessionToken = (token?: string | null) => {
  if (!token) {
    return false;
  }

  const secret = getAdminPassword();
  if (!secret) {
    return false;
  }

  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) {
    return false;
  }

  const expectedSignature = signPayload(payloadEncoded, secret);
  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as { exp?: number };
    if (!payload.exp || typeof payload.exp !== "number") {
      return false;
    }
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
};

const getCookieValue = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) {
    return "";
  }
  const cookies = cookieHeader.split(";").map((entry) => entry.trim());
  const match = cookies.find((entry) => entry.startsWith(`${name}=`));
  if (!match) {
    return "";
  }
  return match.slice(name.length + 1);
};

export const assertAdminToken = (request: Request): NextResponse | null => {
  const sessionToken = getCookieValue(request.headers.get("cookie"), ADMIN_COOKIE_NAME);
  if (verifyAdminSessionToken(sessionToken)) {
    return null;
  }

  const expectedToken = getExpectedAdminToken();
  const requestToken = request.headers.get("x-admin-token");

  if (expectedToken && requestToken === expectedToken) {
    return null;
  }

  return NextResponse.json({ message: "Ingen adgang til admin-endpoint." }, { status: 401 });
};

export const adminSessionCookieName = ADMIN_COOKIE_NAME;
