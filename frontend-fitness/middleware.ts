import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

// Routes publiques (sans auth requise)
const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register", "/auth/error"];
const AUTH_ROUTES   = ["/auth/login", "/auth/register"];

export default auth((req: NextRequest & { auth: any }) => {
  const { nextUrl, auth: session } = req as any;
  const isLoggedIn   = !!session;
  const isPublic     = PUBLIC_ROUTES.some(r => nextUrl.pathname === r || nextUrl.pathname.startsWith(r + "/"));
  const isAuthRoute  = AUTH_ROUTES.some(r => nextUrl.pathname.startsWith(r));

  // Connecté → redirige la page login vers dashboard
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Non connecté → redirige vers login
  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/auth/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
