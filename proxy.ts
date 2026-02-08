import { NextRequest, NextResponse } from "next/server";

import { getRedirectTarget } from "@/lib/redirects";

const PUBLIC_FILE = /\.[^/]+$/;

const normalizePath = (pathname: string) => {
  let normalized = pathname.replace(/\/{2,}/g, "/");
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

const redirectTo = (request: NextRequest, pathname: string) => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url, 301);
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const normalized = normalizePath(pathname);
  const mappedTarget = getRedirectTarget(normalized);

  if (mappedTarget) {
    return redirectTo(request, mappedTarget);
  }

  const lowercased = normalized.toLowerCase();
  if (normalized !== lowercased) {
    return redirectTo(request, lowercased);
  }

  if (normalized !== pathname) {
    return redirectTo(request, normalized);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|.*\\..*).*)"]
};
