import { NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });

  const { customerEmail, planId } = await req.json();
  if (!customerEmail || !planId) return Response.json({ error: "Missing fields" }, { status: 400 });

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return Response.json({ error: "Plan not found" }, { status: 404 });

  // Ensure user exists
  const user = await prisma.user.upsert({ where: { email: customerEmail }, update: {}, create: { email: customerEmail } });

  // Create Checkout Session for a subscription. Use price_data to avoid pre-creating Stripe Price.
  const interval = plan.interval === "WEEK" ? "week" : "month";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.max(plan.creditsPerCycle, 1) * 1000, // demo pricing: $10 per credit
          recurring: { interval },
          product_data: { name: plan.name },
        },
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/plans?success=1`,
    cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/plans?canceled=1`,
    metadata: { userId: user.id, planId: plan.id },
  });

  return Response.json({ url: session.url });
}

export const dynamic = "force-dynamic";


