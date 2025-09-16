export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Service Booking + Subscriptions</h1>
      <p className="mt-3 text-gray-500">
        Providers set availability. Customers book sessions and subscribe to monthly plans.
      </p>
      <div className="mt-6 grid gap-3">
        <a href="/providers" className="underline">Browse providers</a>
        <a href="/dashboard" className="underline">Provider dashboard</a>
      </div>
    </main>
  );
}
