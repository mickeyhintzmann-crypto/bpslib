import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export type AdminRole = "owner" | "admin" | "employee" | "viewer";

export type AdminSession = {
  id: string;
  email: string;
  name?: string;
  role: AdminRole;
  iat: number;
  exp: number;
  sid: string;
};

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

const normalizeRole = (role: string | null | undefined): AdminRole => {
  if (role === "owner" || role === "admin" || role === "employee" || role === "viewer") {
    return role;
  }
  return "viewer";
};

export const createAdminSessionToken = (session: Pick<AdminSession, "id" | "email" | "name" | "role">) => {
  const secret = getAdminPassword();
  if (!secret) {
    throw new Error("ADMIN_PASSWORD mangler i miljøvariabler.");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSession = {
    id: session.id,
    email: session.email,
    name: session.name,
    role: normalizeRole(session.role),
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    sid: randomUUID()
  };
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(payloadEncoded, secret);
  return `${payloadEncoded}.${signature}`;
};

export const verifyAdminSessionToken = (token?: string | null): AdminSession | null => {
  if (!token) {
    return null;
  }

  const secret = getAdminPassword();
  if (!secret) {
    return null;
  }

  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payloadEncoded, secret);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as Partial<AdminSession>;
    if (!payload.exp || typeof payload.exp !== "number") {
      return null;
    }
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }
    if (!payload.id || !payload.email) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: normalizeRole(payload.role),
      iat: payload.iat ?? now,
      exp: payload.exp,
      sid: payload.sid || randomUUID()
    };
  } catch {
    return null;
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

export const getAdminSessionFromRequest = (request: Request): AdminSession | null => {
  const sessionToken = getCookieValue(request.headers.get("cookie"), ADMIN_COOKIE_NAME);
  const session = verifyAdminSessionToken(sessionToken);
  if (session) {
    return session;
  }

  const expectedToken = getExpectedAdminToken();
  const requestToken = request.headers.get("x-admin-token");
  if (expectedToken && requestToken === expectedToken) {
    const now = Math.floor(Date.now() / 1000);
    return {
      id: "token",
      email: "token",
      name: "API token",
      role: "owner",
      iat: now,
      exp: now + SESSION_TTL_SECONDS,
      sid: randomUUID()
    };
  }

  return null;
};

export const requireAdmin = (request: Request, roles?: AdminRole[]) => {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ message: "Ingen adgang til admin-endpoint." }, { status: 401 })
    };
  }
  if (roles && roles.length > 0 && !roles.includes(session.role)) {
    return {
      session,
      error: NextResponse.json({ message: "Ingen adgang til denne handling." }, { status: 403 })
    };
  }
  return { session, error: null };
};

export const assertAdminToken = (request: Request): NextResponse | null => {
  const { error } = requireAdmin(request);
  return error ?? null;
};

export const adminSessionCookieName = ADMIN_COOKIE_NAME;
