export default async function DashboardPage() {
  const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/me/availability`, { cache: "no-store" });
  const data = await res.json();
  const rules: Array<{ id: string; weekday: number; startMinutes: number; endMinutes: number; timezone: string }>= data.rules ?? [];

  async function addRule(formData: FormData) {
    "use server";
    const body = {
      weekday: Number(formData.get("weekday")),
      startMinutes: Number(formData.get("start")),
      endMinutes: Number(formData.get("end")),
      timezone: String(formData.get("tz")),
    };
    await fetch(`/api/me/availability`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  }

  async function removeRule(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await fetch(`/api/me/availability?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async function generateSlots() {
    "use server";
    if (!data.providerId) return;
    await fetch(`/api/slots/${data.providerId}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ days: 21, slotMinutes: 60 }) });
  }

  const weekdayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Provider Dashboard</h1>
      <h2 className="mt-6 font-semibold">Availability</h2>
      <form action={addRule} className="mt-2 flex flex-wrap items-end gap-2">
        <select name="weekday" className="border rounded px-2 py-1">
          {weekdayNames.map((n, i) => (
            <option key={i} value={i}>{n}</option>
          ))}
        </select>
        <input name="start" type="number" min="0" max="1439" placeholder="start min" className="border rounded px-2 py-1 w-28" />
        <input name="end" type="number" min="1" max="1440" placeholder="end min" className="border rounded px-2 py-1 w-28" />
        <input name="tz" defaultValue="UTC" className="border rounded px-2 py-1 w-28" />
        <button type="submit" className="underline">Add</button>
      </form>

      <ul className="mt-4 space-y-2">
        {rules.map((r) => (
          <li key={r.id} className="flex items-center justify-between border rounded p-2">
            <span>{weekdayNames[r.weekday]} {r.startMinutes}-{r.endMinutes} ({r.timezone})</span>
            <form action={removeRule}><input type="hidden" name="id" value={r.id} /><button className="underline" type="submit">Remove</button></form>
          </li>
        ))}
      </ul>

      <form action={generateSlots} className="mt-6"><button type="submit" className="underline">Generate slots</button></form>
    </main>
  );
}


