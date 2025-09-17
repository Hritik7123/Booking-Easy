"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">Booking App</Link>
        <nav className="flex items-center gap-4">
          <Link href="/providers" className="text-sm hover:underline">Providers</Link>
          <Link href="/plans" className="text-sm hover:underline">Plans</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
              {session.user?.role === "ADMIN" && (
                <Link href="/admin" className="text-sm hover:underline">Admin</Link>
              )}
              <span className="text-sm text-gray-600">
                {session.user?.email} ({session.user?.role})
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm hover:underline">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
