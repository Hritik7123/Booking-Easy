import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return NextResponse.redirect(new URL("/", req.url));
    const user = await prisma.user.findUnique({ where: { email: token.email } });
    if (user?.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};


