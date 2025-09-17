import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return Response.json({ coupons });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, percentOff, amountOffCents, maxRedemptions, redeemBy, active } = body;
  if (!code) return Response.json({ error: "Code required" }, { status: 400 });
  const coupon = await prisma.coupon.create({
    data: {
      code,
      percentOff: percentOff ?? null,
      amountOffCents: amountOffCents ?? null,
      maxRedemptions: maxRedemptions ?? null,
      redeemBy: redeemBy ? new Date(redeemBy) : null,
      active: active ?? true,
    },
  });
  return Response.json({ coupon });
}

export const dynamic = "force-dynamic";


