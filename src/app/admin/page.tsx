import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [bookings, notifications, users, coupons] = await Promise.all([
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { customer: true, provider: { include: { user: true } }, service: true, timeSlot: true },
    }),
    prisma.notification.findMany({ orderBy: { scheduledAt: "desc" }, take: 40 }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <main className="mx-auto max-w-5xl p-8 grid gap-8">
      <section>
        <h1 className="text-2xl font-bold">Recent Bookings</h1>
        <ManualBookingForm />
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Provider</th>
                <th className="py-2 pr-4">Service</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{new Date(b.timeSlot.start).toLocaleString()}</td>
                  <td className="py-2 pr-4">{b.customer.email}</td>
                  <td className="py-2 pr-4">{b.provider.user?.name ?? b.provider.userId}</td>
                  <td className="py-2 pr-4">{b.service.name}</td>
                  <td className="py-2 pr-4 flex items-center gap-2">
                    <span>{b.status}</span>
                    {b.status === "CONFIRMED" && (
                      <RefundButton bookingId={b.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Notifications</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Scheduled</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{new Date(n.scheduledAt).toLocaleString()}</td>
                  <td className="py-2 pr-4">{n.targetEmail}</td>
                  <td className="py-2 pr-4">{n.type}</td>
                  <td className="py-2 pr-4">{n.status}{n.sentAt ? ` @ ${new Date(n.sentAt).toLocaleString()}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.role}</td>
                  <td className="py-2 pr-4">
                    <RoleForm email={u.email} currentRole={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Coupons</h2>
        <CouponForm />
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Percent</th>
                <th className="py-2 pr-4">Amount (cents)</th>
                <th className="py-2 pr-4">Max Redemptions</th>
                <th className="py-2 pr-4">Redeem By</th>
                <th className="py-2 pr-4">Active</th>
                <th className="py-2 pr-4">Redeemed</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{c.code}</td>
                  <td className="py-2 pr-4">{c.percentOff ?? "-"}</td>
                  <td className="py-2 pr-4">{c.amountOffCents ?? "-"}</td>
                  <td className="py-2 pr-4">{c.maxRedemptions ?? "-"}</td>
                  <td className="py-2 pr-4">{c.redeemBy ? new Date(c.redeemBy).toLocaleDateString() : "-"}</td>
                  <td className="py-2 pr-4">{c.active ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4">{c.timesRedeemed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function RefundButton({ bookingId }: { bookingId: string }) {
  async function refund() {
    "use server";
    await fetch("/api/admin/refund", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
  }
  return (
    <form action={refund}>
      <button type="submit" className="underline">Refund</button>
    </form>
  );
}

function ManualBookingForm() {
  async function create(formData: FormData) {
    "use server";
    const payload = {
      customerEmail: String(formData.get("email")),
      providerId: String(formData.get("providerId")),
      serviceId: String(formData.get("serviceId")),
      start: String(formData.get("start")),
      end: String(formData.get("end")),
      priceCents: formData.get("priceCents") ? Number(formData.get("priceCents")) : undefined,
    };
    await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
  return (
    <form action={create} className="mt-2 flex flex-wrap items-end gap-2">
      <input name="email" placeholder="customer@email" required className="border rounded px-2 py-1" />
      <input name="providerId" placeholder="providerId" required className="border rounded px-2 py-1" />
      <input name="serviceId" placeholder="serviceId" required className="border rounded px-2 py-1" />
      <input name="start" type="datetime-local" required className="border rounded px-2 py-1" />
      <input name="end" type="datetime-local" required className="border rounded px-2 py-1" />
      <input name="priceCents" type="number" min="0" placeholder="price (cents)" className="border rounded px-2 py-1 w-36" />
      <button type="submit" className="underline">Create booking</button>
    </form>
  );
}

function CouponForm() {
  async function create(formData: FormData) {
    "use server";
    const payload = {
      code: String(formData.get("code")),
      percentOff: formData.get("percentOff") ? Number(formData.get("percentOff")) : undefined,
      amountOffCents: formData.get("amountOffCents") ? Number(formData.get("amountOffCents")) : undefined,
      maxRedemptions: formData.get("maxRedemptions") ? Number(formData.get("maxRedemptions")) : undefined,
      redeemBy: formData.get("redeemBy") ? String(formData.get("redeemBy")) : undefined,
      active: formData.get("active") === "on",
    };
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
  return (
    <form action={create} className="mt-2 flex flex-wrap items-end gap-2">
      <input name="code" placeholder="CODE" required className="border rounded px-2 py-1" />
      <input name="percentOff" type="number" min="0" max="100" placeholder="%" className="border rounded px-2 py-1 w-24" />
      <input name="amountOffCents" type="number" min="0" placeholder="cents" className="border rounded px-2 py-1 w-28" />
      <input name="maxRedemptions" type="number" min="1" placeholder="max" className="border rounded px-2 py-1 w-24" />
      <input name="redeemBy" type="date" className="border rounded px-2 py-1" />
      <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="active" defaultChecked/> Active</label>
      <button type="submit" className="underline">Create</button>
    </form>
  );
}
function RoleForm({ email, currentRole }: { email: string; currentRole: string }) {
  async function setRole(formData: FormData) {
    "use server";
    const role = String(formData.get("role"));
    await fetch("/api/admin/role", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
  }
  return (
    <form action={setRole} className="flex items-center gap-2">
      <select name="role" defaultValue={currentRole} className="border rounded px-2 py-1">
        <option value="CUSTOMER">CUSTOMER</option>
        <option value="PROVIDER">PROVIDER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <button className="underline" type="submit">Update</button>
    </form>
  );
}


