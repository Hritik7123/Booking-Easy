import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProviderDetail({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>; 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  
  const provider = await prisma.providerProfile.findUnique({
    where: { id },
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
    if (!provider) return;
    await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/slots/${provider.id}`, { method: "POST" });
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      {/* Success/Error Messagess */}
  
      {search.success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <h3 className="font-semibold">Booking Successful! 🎉</h3>
          <p className="text-sm mt-1">
            {search.message ? decodeURIComponent(String(search.message)) : "Your booking has been confirmed."}
          </p>
        </div>
      )}
      
      {search.canceled && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          <h3 className="font-semibold">Booking Cancelled</h3>
          <p className="text-sm mt-1">Your booking was cancelled. You can try booking again.</p>
        </div>
      )}

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

      <h2 className="mt-6 font-semibold text-lg">Available Slots</h2>
      {slots.length === 0 ? (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600">No available slots. Click the button below to generate slots.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {slots.map((slot) => (
            <div key={slot.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {new Date(slot.start).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(slot.start).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - {new Date(slot.end).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                <div className="ml-4">
                  <BookButton providerId={provider.id} services={provider.services} timeSlotId={slot.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function BookButton({ providerId, services, timeSlotId }: { providerId: string; services: { id: string; name: string }[]; timeSlotId: string }) {
  async function book(formData: FormData) {
    "use server";
    const customerEmail = String(formData.get("email"));
    const serviceId = String(formData.get("serviceId"));
    const couponCode = String(formData.get("couponCode"));
    
    if (!customerEmail || !serviceId) {
      throw new Error("Email and service are required");
    }

    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/checkout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          customerEmail, 
          providerId, 
          serviceId, 
          timeSlotId, 
          couponCode: couponCode || undefined 
        }),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (error) {
        console.error("Failed to parse response:", error);
        throw new Error("Server returned invalid response");
      }
      
      if (!res.ok) {
        throw new Error(data?.error || "Booking failed");
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        redirect(data.url);
      } else if (data.success) {
        // For demo mode (no Stripe), redirect with success message
        redirect(`${baseUrl}/providers/${providerId}?success=1&message=${encodeURIComponent(data.message)}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      throw error;
    }
  }

  return (
    <form action={book} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <select 
        name="serviceId" 
        className="border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Service</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <input 
        name="couponCode" 
        placeholder="Coupon (optional)" 
        className="border rounded px-3 py-2 w-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
      />
      <input 
        name="email" 
        type="email" 
        placeholder="your@email.com"
        required 
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        type="submit" 
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Book Now
      </button>
    </form>
  );
}


