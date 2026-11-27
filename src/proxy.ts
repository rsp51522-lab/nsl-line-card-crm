import { NextRequest, NextResponse } from "next/server";
import { addCardEstimatePrefill, refreshCardClientUrls } from "./lib/card-estimate-prefill";

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

  // Upstream chunk names and module IDs change with each deployment. Patch only
  // the estimate URL parameters in the bundle actually requested by the page.
  if (
    request.nextUrl.pathname.startsWith("/_next/static/chunks/") &&
    request.nextUrl.pathname.endsWith(".js")
  ) {
    const upstream = await fetch(upstreamUrl, { redirect: "manual" });
    if (!upstream.ok) {
      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: upstream.headers,
      });
    }
    const source = await upstream.text();
    const patched = addCardEstimatePrefill(source);
    const headers = new Headers(upstream.headers);
    headers.delete("content-encoding");
    headers.delete("content-length");
    if (patched !== source) {
      headers.delete("etag");
      headers.delete("last-modified");
      headers.set("cache-control", "no-store");
    }
    return new NextResponse(patched, { status: upstream.status, headers });
  }

  if (request.nextUrl.pathname === "/cards") {
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("accept-encoding");
    const upstream = await fetch(upstreamUrl, { headers, redirect: "manual" });
    const contentType = upstream.headers.get("content-type") || "";
    if (contentType.includes("text/html") || contentType.includes("text/x-component")) {
      const html = refreshCardClientUrls((await upstream.text()).replaceAll(
        PATCHED_CLIENT_CHUNK,
        LOCAL_PATCH_FILE,
      ));
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
