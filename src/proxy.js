import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(request) {
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.split(" ")[1];

  const url = request.nextUrl.pathname;

  try {
    if (
      url.startsWith("/admin") &&
      !url.startsWith("/admin/login") &&
      !url.startsWith("/admin/setup")
    ) {
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
    if (
      url.startsWith("/doctor") &&
      !url.startsWith("/doctor/login")
    ) {
      if (!token) {
        return NextResponse.redirect(new URL("/doctor/login", request.url));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "doctor") {
        return NextResponse.redirect(new URL("/doctor/login", request.url));
      }
    }
    return NextResponse.next();
  } catch (err) {
    console.error("Proxy auth error:", err.message);

    if (url.startsWith("/admin") && !url.startsWith("/admin/login")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (url.startsWith("/doctor") && !url.startsWith("/doctor/login")) {
      return NextResponse.redirect(new URL("/doctor/login", request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/doctor/:path*"],
};
