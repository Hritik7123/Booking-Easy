import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProviderDetail({ params }: { params: { id: string } }) {
  const provider = await prisma.providerProfile.findUnique({
    where: { id: params.id },
    include: { user: true, services: true },
  });
  if (!provider) return <div className="p-8">Provider not found</div>;

  const slots = await prisma.timeSlot.findMany({
    where: { providerId: provider.id, isBooked: false, start: { gte: new Date() } },
    orderBy: { start: "asc" },
    take: 20,
  });

  async function createSlots() {
    "use server";
    await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/slots/${provider.id}`, { method: "POST" });
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">{provider.user?.name ?? provider.userId}</h1>
      <p className="text-gray-600">{provider.headline}</p>

      <h2 className="mt-6 font-semibold">Services</h2>
      <ul className="list-disc pl-6">
        {provider.services.map((s) => (
          <li key={s.id}>{s.name} — ${(s.priceCents / 100).toFixed(2)}</li>
        ))}
      </ul>

      <form action={createSlots} className="mt-6">
        <button className="underline" type="submit">Generate next 3 weeks of slots</button>
      </form>

      <h2 className="mt-6 font-semibold">Available Slots</h2>
      <ul className="space-y-2">
        {slots.map((slot) => (
          <li key={slot.id} className="flex items-center justify-between border rounded p-2">
            <span>{new Date(slot.start).toLocaleString()} — {new Date(slot.end).toLocaleTimeString()}</span>
            <BookButton providerId={provider.id} services={provider.services} timeSlotId={slot.id} priceCents={provider.services[0]?.priceCents ?? 0} />
          </li>
        ))}
      </ul>
    </main>
  );
}

function BookButton({ providerId, services, timeSlotId }: { providerId: string; services: { id: string; name: string }[]; timeSlotId: string }) {
  async function book(formData: FormData) {
    "use server";
    const customerEmail = String(formData.get("email"));
    const serviceId = String(formData.get("serviceId"));
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customerEmail, providerId, serviceId, timeSlotId }),
    });
    const data = await res.json();
    if (data.url) {
      // Redirect to Stripe Checkout
      // @ts-ignore
      redirect(data.url);
    }
  }

  return (
    <form action={book} className="flex items-center gap-2">
      <select name="serviceId" className="border rounded px-2 py-1">
        {services.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <input name="couponCode" placeholder="COUPON (optional)" className="border rounded px-2 py-1 w-40" />
      <input name="email" type="email" placeholder="your@email"
        required className="border rounded px-2 py-1" />
      <button type="submit" className="underline">Book</button>
    </form>
  );
}


