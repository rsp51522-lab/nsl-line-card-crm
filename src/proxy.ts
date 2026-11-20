import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_ORIGIN = "https://business-card-line-app-nsl.vercel.app";
const PATCHED_CLIENT_CHUNK = "/_next/static/chunks/2e_sz6qf68aa1.js";
const LOCAL_PATCH_FILE = "/patched-card-client.js";
const THANK_YOU_SEND_API = "/api/send-thank-you";

export async function proxy(request: NextRequest) {
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

  if (request.nextUrl.pathname === "/cards" && !request.headers.get("rsc")) {
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("accept-encoding");
    const upstream = await fetch(upstreamUrl, { headers, redirect: "manual" });
    if (upstream.headers.get("content-type")?.includes("text/html")) {
      const html = (await upstream.text()).replaceAll(
        PATCHED_CLIENT_CHUNK,
        LOCAL_PATCH_FILE,
      );
      const responseHeaders = new Headers(upstream.headers);
      responseHeaders.delete("content-encoding");
      responseHeaders.delete("content-length");
      responseHeaders.delete("etag");
      responseHeaders.set("cache-control", "no-store");
      return new NextResponse(html, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: upstream.headers,
    });
  }

  return NextResponse.rewrite(upstreamUrl);
}

export const config = {
  matcher: "/:path*",
};
