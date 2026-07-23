import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const sessionTenantSlug = req.auth?.user?.tenantSlug;

  if (pathname.startsWith("/super-admin")) {
    if (pathname === "/super-admin/login") return NextResponse.next();
    if (role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/super-admin/login", req.url));
    }
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const [tenantSlug, section] = segments;

  if (tenantSlug && section === "admin") {
    if (role !== "ADMIN" || sessionTenantSlug !== tenantSlug) {
      const url = new URL(`/${tenantSlug}/login`, req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (tenantSlug && section === "treinador") {
    if (
      (role !== "TREINADOR" && role !== "ADMIN") ||
      sessionTenantSlug !== tenantSlug
    ) {
      const url = new URL(`/${tenantSlug}/login`, req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/:tenant/admin/:path*",
    "/:tenant/treinador/:path*",
    "/super-admin/:path*",
  ],
};
