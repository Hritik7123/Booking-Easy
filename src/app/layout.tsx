import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "BookEasy - Professional Service Booking Platform",
  description: "Book appointments with professional service providers. Easy, secure, and reliable booking platform for fitness trainers, consultants, and more.",
  keywords: ["booking", "appointments", "services", "fitness", "consulting", "professional"],
  authors: [{ name: "BookEasy Team" }],
  openGraph: {
    title: "BookEasy - Professional Service Booking Platform",
    description: "Book appointments with professional service providers. Easy, secure, and reliable booking platform.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-12">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">BookEasy</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Professional service booking platform. Book with confidence.
                  </p>
                  <div className="mt-4 text-xs text-gray-500">
                    © 2024 BookEasy. Built with Next.js, Prisma, and Stripe.
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}