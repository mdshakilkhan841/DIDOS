import { NextRequest, NextResponse } from "next/server";
import { getBaseDomain, getCookieDomain, safeJsonParse } from "@/lib/subdomains";

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Skip static assets, Next.js internal chunks, images, and static files
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/static") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Parse subdomain and root domain reliably
  const { subdomain, rootDomain, isLocalhost } = getBaseDomain(hostname);
  const port = hostname.includes(":") ? `:${hostname.split(":")[1]}` : "";
  const protocol = req.nextUrl.protocol || (isLocalhost ? "http:" : "https:");
  const mainHost = isLocalhost ? `localhost${port}` : `${rootDomain}${port}`;
  const mainOrigin = `${protocol}//${mainHost}`;
  const cookieDomain = getCookieDomain(hostname);

  // Read query params and existing cookies
  const paramToken = url.searchParams.get("dudos_at");
  const paramSession = url.searchParams.get("dudos_session");
  const dudosAt = req.cookies.get("dudos_at")?.value;
  const dudosSessionRaw = req.cookies.get("dudos_session")?.value;

  // Extract user role safely without throwing SyntaxErrors on encoded cookies
  let userRole: string | null = null;
  const effectiveSessionRaw = paramSession || dudosSessionRaw;
  if (effectiveSessionRaw) {
    const parsed = safeJsonParse(effectiveSessionRaw);
    if (parsed && parsed.role) {
      userRole = parsed.role;
    }
  }

  function clearAuthCookies(res: NextResponse) {
    const epoch = new Date(0);
    // 1. Host-only cookies
    res.cookies.delete("dudos_at");
    res.cookies.delete("dudos_session");
    res.cookies.set("dudos_at", "", { path: "/", maxAge: 0, expires: epoch });
    res.cookies.set("dudos_session", "", { path: "/", maxAge: 0, expires: epoch });

    // 2. Explicit domain scoped cookies if configured
    if (cookieDomain) {
      res.cookies.set("dudos_at", "", { path: "/", domain: cookieDomain, maxAge: 0, expires: epoch });
      res.cookies.set("dudos_session", "", { path: "/", domain: cookieDomain, maxAge: 0, expires: epoch });
    }

    // 3. Localhost domain variations
    if (isLocalhost) {
      res.cookies.set("dudos_at", "", { path: "/", domain: "localhost", maxAge: 0, expires: epoch });
      res.cookies.set("dudos_session", "", { path: "/", domain: "localhost", maxAge: 0, expires: epoch });
      res.cookies.set("dudos_at", "", { path: "/", domain: ".localhost", maxAge: 0, expires: epoch });
      res.cookies.set("dudos_session", "", { path: "/", domain: ".localhost", maxAge: 0, expires: epoch });
    }
  }

  // ─── 0. Universal Logout Interceptor ──────────────────────────────────────
  if (url.pathname === "/logout" || url.pathname.startsWith("/logout/")) {
    const returnTo = url.searchParams.get("return_to") || "/login";

    // If requested on a subdomain (app or admin), clear subdomain cookies and redirect to main domain /logout
    if (subdomain === "app" || subdomain === "admin") {
      const mainLogoutUrl = new URL(`${mainOrigin}/logout`);
      mainLogoutUrl.searchParams.set("return_to", returnTo);
      const response = new NextResponse(null, {
        status: 307,
        headers: {
          Location: mainLogoutUrl.toString(),
        },
      });
      clearAuthCookies(response);
      return response;
    }

    // On main domain: clear main cookies and render LogoutPage to wipe localStorage
    const response = NextResponse.next();
    clearAuthCookies(response);
    return response;
  }

  // ─── 1. Main Domain: Strict Subdomain Routing ─────────────────────────────
  // Redirect /app and /tenant-admin on main domain to dedicated subdomains immediately
  const isAppRoute =
    url.pathname.startsWith("/app") ||
    url.pathname.startsWith("/en/app") ||
    url.pathname.startsWith("/bn/app") ||
    url.pathname.startsWith("/tenant-admin") ||
    url.pathname.startsWith("/admin");

  if (subdomain !== "app" && subdomain !== "admin" && isAppRoute) {
    const isTenantAdmin = url.pathname.includes("tenant-admin") || url.pathname.includes("/admin");
    const targetSub = isTenantAdmin ? "admin" : "app";
    const subBase = isLocalhost ? `${protocol}//${targetSub}.localhost${port}` : `${protocol}//${targetSub}.${rootDomain}${port}`;
    const destUrl = new URL(`${subBase}${url.pathname}${url.search}`);

    const token = paramToken || dudosAt;
    const session = paramSession || dudosSessionRaw;
    if (token) {
      destUrl.searchParams.set("dudos_at", token);
    }
    if (session) {
      const parsed = safeJsonParse(session);
      destUrl.searchParams.set("dudos_session", parsed ? JSON.stringify(parsed) : session);
    }
    return NextResponse.redirect(destUrl);
  }

  // ─── 2. SSO Token Handshake on Subdomains ─────────────────────────────────
  // If redirected with ?dudos_at=... and ?dudos_session=..., store cookies cleanly on this subdomain
  if (paramToken && paramSession) {
    const cleanUrl = new URL(req.url);
    cleanUrl.searchParams.delete("dudos_at");
    cleanUrl.searchParams.delete("dudos_session");

    const response = NextResponse.redirect(cleanUrl);
    const cookieOpts: { path: string; maxAge: number; sameSite: "lax"; domain?: string } = {
      path: "/",
      maxAge: 2592000,
      sameSite: "lax",
    };
    if (cookieDomain) {
      cookieOpts.domain = cookieDomain;
    }

    response.cookies.set("dudos_at", paramToken, cookieOpts);

    const parsed = safeJsonParse(paramSession);
    const sessionToStore = parsed ? JSON.stringify(parsed) : paramSession;
    response.cookies.set("dudos_session", sessionToStore, cookieOpts);
    return response;
  }

  // Allow public auth routes (/login, /register, /logout) on all domains
  if (
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/register") ||
    url.pathname.startsWith("/logout")
  ) {
    return NextResponse.next();
  }

  const targetUrl = `${protocol}//${hostname}${url.pathname}${url.search}`;

  // ─── 3. Admin Subdomain: admin.<domain> ─────────────────────────────────────
  if (subdomain === "admin") {
    // If not authenticated, redirect to login on main domain
    if (!dudosAt && !paramToken) {
      const loginUrl = new URL(`${mainOrigin}/login`);
      loginUrl.searchParams.set("return_to", targetUrl);
      return NextResponse.redirect(loginUrl);
    }

    // Role check: Only admin allowed
    if (userRole && userRole !== "admin") {
      const appUrl = isLocalhost ? `${protocol}//app.localhost${port}` : `${protocol}//app.${rootDomain}${port}`;
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>403 Forbidden - DUDOS</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #18181b; border: 1px solid #27272a; padding: 2.5rem; border-radius: 12px; max-width: 460px; text-align: center; }
            h2 { font-size: 1.5rem; color: #ef4444; margin-bottom: 0.75rem; }
            p { font-size: 0.95rem; color: #a1a1aa; line-height: 1.5; margin-bottom: 1.5rem; }
            a { display: inline-block; background: #2563eb; color: #fff; padding: 0.6rem 1.2rem; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 0.9rem; }
            a:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>403 Forbidden</h2>
            <p>Administrative privileges are required to access <strong>admin.${mainHost}</strong>.<br>You are currently logged in as a Client.</p>
            <a href="${appUrl}">Go to Customer Workspace (app.${mainHost})</a>
          </div>
        </body>
        </html>`,
        { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // Rewrite admin root and alias paths to Admin Panel view (/en/app/tenant-admin)
    if (
      url.pathname === "/" ||
      url.pathname === "/en" ||
      url.pathname === "/bn" ||
      url.pathname === "/app" ||
      url.pathname === "/tenant-admin" ||
      url.pathname === "/admin"
    ) {
      url.pathname = "/en/app/tenant-admin";
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // ─── 4. Customer Workspace Subdomain: app.<domain> ──────────────────────────
  if (subdomain === "app") {
    // If not authenticated, redirect to login on main domain
    if (!dudosAt && !paramToken) {
      const loginUrl = new URL(`${mainOrigin}/login`);
      loginUrl.searchParams.set("return_to", targetUrl);
      return NextResponse.redirect(loginUrl);
    }

    // Rewrite app root to customer workspace (/en/app)
    if (url.pathname === "/" || url.pathname === "/en" || url.pathname === "/bn" || url.pathname === "/app") {
      url.pathname = "/en/app";
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
