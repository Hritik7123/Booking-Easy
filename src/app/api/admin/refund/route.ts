import { NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) return Response.json({ error: "Stripe not configured" }, { status: 500 });
  const { bookingId } = await req.json();
  const payment = await prisma.payment.findUnique({ where: { bookingId } });
  if (!payment?.stripePaymentIntentId) return Response.json({ error: "No payment to refund" }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
  const refund = await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });

  await prisma.payment.update({ where: { bookingId }, data: { status: "REFUNDED", refundId: refund.id } });
  await prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELED" } });
  return Response.json({ ok: true });
}

export const dynamic = "force-dynamic";
