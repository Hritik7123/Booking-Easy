"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BookingApp</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/providers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Providers
            </Link>
            <Link href="/plans" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Plans
            </Link>
            {session?.user?.role !== "PROVIDER" && session?.user?.role !== "ADMIN" && (
              <Link href="/become-provider" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Become Provider
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                {session.user?.role === "CUSTOMER" && (
                  <Link href="/my-bookings" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    My Bookings
                  </Link>
                )}
                {session.user?.role === "PROVIDER" && (
                  <>
                    <Link href="/provider-dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      My Bookings
                    </Link>
                    <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      Availability
                    </Link>
                    <Link href="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      Profile
                    </Link>
                  </>
                )}
                {session.user?.role === "ADMIN" && (
                  <>
                    <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      Admin
                    </Link>
                  </>
                )}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {session.user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{session.user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{session.user?.role}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/become-provider" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Become Provider
                </Link>
                <Link 
                  href="/login" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}