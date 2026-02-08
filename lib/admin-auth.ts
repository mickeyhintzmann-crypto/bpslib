import { NextResponse } from "next/server";

const getExpectedAdminToken = () => process.env.ADMIN_TOKEN || process.env.ADMIN_INBOX_TOKEN;

export const assertAdminToken = (request: Request): NextResponse | null => {
  const expectedToken = getExpectedAdminToken();

  if (!expectedToken) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { message: "ADMIN_TOKEN mangler i miljøvariabler for produktion." },
        { status: 500 }
      );
    }
    return null;
  }

  const requestToken = request.headers.get("x-admin-token");
  if (requestToken !== expectedToken) {
    return NextResponse.json({ message: "Ingen adgang til admin-endpoint." }, { status: 401 });
  }

  return null;
};
