import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";

  // Check if it's a mobile device
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );

  // Check if it's running in Capacitor (mobile app)
  const isCapacitor =
    request.headers.get("x-capacitor") ||
    request.nextUrl.searchParams.get("capacitor") === "true";

  // REDIRECTS DISABLED - All redirect logic commented out below

  // If accessing dashboard routes on mobile (but not in Capacitor app), redirect to mobile app
  // if (pathname.startsWith("/dashboard") && isMobile && !isCapacitor) {
  //   return NextResponse.redirect(new URL("/app", request.url));
  // }

  // If accessing mobile app routes on desktop, redirect to dashboard
  // if (pathname.startsWith("/app") && !isMobile) {
  //   return NextResponse.redirect(new URL("/dashboard/overview", request.url));
  // }

  // Redirect root path based on device
  // if (pathname === "/") {
  //   if (isMobile || isCapacitor) {
  //     return NextResponse.redirect(new URL("/app", request.url));
  //   } else {
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
