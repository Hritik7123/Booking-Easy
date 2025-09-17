import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, role } = await req.json();
  if (!email || !role) return Response.json({ error: "Missing fields" }, { status: 400 });
  if (!["ADMIN", "CUSTOMER", "PROVIDER"].includes(role)) return Response.json({ error: "Invalid role" }, { status: 400 });

  const user = await prisma.user.update({ where: { email }, data: { role } });
  return Response.json({ user: { email: user.email, role: user.role } });
}

export const dynamic = "force-dynamic";
