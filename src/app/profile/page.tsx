import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  // Get user and provider profile
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: { include: { services: true } } },
    });
  } catch (error) {
    console.error("Database error fetching user:", error);
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Connection Error</h1>
              <p className="text-gray-600">Unable to connect to database. Please try again later.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
            <p className="text-gray-600">Manage your provider information and services</p>
          </div>

          <ProfileForm
            user={user as any}
            providerProfile={user.providerProfile as any}
            services={user.providerProfile?.services || [] as any}
          />
        </div>
      </div>
    </main>
  );
}
