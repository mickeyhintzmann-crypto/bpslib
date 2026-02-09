import { NextResponse } from "next/server";

import { adminSessionCookieName, createAdminSessionToken } from "@/lib/admin-auth";

type Payload = {
  password?: unknown;
};

const safeCompare = (left: string, right: string) => {
  if (left.length !== right.length) {
    return false;
  }
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    const password = typeof payload.password === "string" ? payload.password : "";
    const expected = process.env.ADMIN_PASSWORD || "";

    if (!expected) {
      return NextResponse.json({ message: "ADMIN_PASSWORD mangler i miljøvariabler." }, { status: 500 });
    }

    if (!password || !safeCompare(password, expected)) {
      return NextResponse.json({ message: "Forkert adgangskode." }, { status: 401 });
    }

    const token = createAdminSessionToken();
    const response = NextResponse.json({ ok: true });

    response.cookies.set(adminSessionCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved login." }, { status: 500 });
  }
}
