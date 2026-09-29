import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_ORIGIN = "https://business-card-line-app-nsl.vercel.app";
const PATCHED_CLIENT_CHUNK = "/_next/static/chunks/0u3lb4cl4dhpz.js";
const LOCAL_PATCH_FILE = "/patched-card-client.js";
const THANK_YOU_SEND_API = "/api/send-thank-you";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === PATCHED_CLIENT_CHUNK) {
    return NextResponse.rewrite(new URL(LOCAL_PATCH_FILE, request.url));
  }

  if (
    request.nextUrl.pathname === LOCAL_PATCH_FILE ||
    request.nextUrl.pathname === THANK_YOU_SEND_API
  ) {
    return NextResponse.next();
  }

  const upstreamUrl = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    UPSTREAM_ORIGIN,
  );

  return NextResponse.rewrite(upstreamUrl);
}

export const config = {
  matcher: "/:path*",
};
