import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({ orderBy: { creditsPerCycle: "asc" } });

  async function start(formData: FormData) {
    "use server";
    const customerEmail = String(formData.get("email"));
    const planId = String(formData.get("planId"));
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/subscriptions/checkout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customerEmail, planId }),
    });
    const data = await res.json();
    if (data.url) redirect(data.url);
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Plans</h1>
      <ul className="mt-4 space-y-3">
        {plans.map((p) => (
          <li key={p.id} className="border rounded p-4">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-600">Credits per cycle: {p.creditsPerCycle}</div>
            <form action={start} className="mt-2 flex gap-2 items-center">
              <input name="email" type="email" required placeholder="your@email" className="border rounded px-2 py-1" />
              <input type="hidden" name="planId" value={p.id} />
              <button className="underline" type="submit">Subscribe</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}


