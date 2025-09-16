import { prisma } from "@/lib/prisma";

export default async function ProvidersPage() {
  const providers = await prisma.providerProfile.findMany({
    include: { user: true, services: true },
    take: 20,
  });

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold mb-4">Providers</h1>
      <ul className="space-y-4">
        {providers.map((p) => (
          <li key={p.id} className="border rounded p-4">
            <div className="font-semibold">{p.user?.name ?? p.userId}</div>
            <div className="text-sm text-gray-600">{p.headline}</div>
            <div className="mt-2 text-sm">Services: {p.services.map((s) => s.name).join(", ")}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}


