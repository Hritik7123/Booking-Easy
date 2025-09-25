import DashboardForm from "@/components/DashboardForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // If no session, return early with error message
  if (!session?.user?.email) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-bold">Provider Dashboard</h1>
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Please log in to access the dashboard.
        </div>
      </main>
    );
  }

  // Check if user is a provider
  if (session.user.role === "PROVIDER") {
    let rules: Array<{ id: string; weekday: number; startMinutes: number; endMinutes: number; timezone: string }> = [];
    let data = { providerId: "demo-provider-id", rules };
    
    // Try to fetch real data from API
    try {
      const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/me/availability`, { 
        cache: "no-store",
        headers: {
          'Cookie': `next-auth.session-token=${session.user.email}` // Pass session info
        }
      });
      if (res.ok) {
        const apiData = await res.json();
        rules = apiData.rules || [];
        data = { providerId: apiData.providerId || "demo-provider-id", rules };
      }
    } catch (error) {
      console.log("Failed to fetch rules from API, using mock data");
    }

    async function addRule(formData: FormData) {
      "use server";
      try {
        const body = {
          weekday: Number(formData.get("weekday")),
          startMinutes: Number(formData.get("start")),
          endMinutes: Number(formData.get("end")),
          timezone: String(formData.get("tz")),
        };
        
        const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/me/availability`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        
        if (!response.ok) {
          console.log("Failed to add rule via API, using mock data");
        }
      } catch (error) {
        console.log("Error adding rule:", error);
      }
    }

    async function removeRule(formData: FormData) {
      "use server";
      try {
        const id = String(formData.get("id"));
        const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/me/availability?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          console.log("Failed to remove rule via API");
        }
      } catch (error) {
        console.log("Error removing rule:", error);
      }
    }

    async function generateSlots() {
      "use server";
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/slots/${data.providerId}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ days: 21, slotMinutes: 60 }),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log("Generated slots:", result.created);
        } else {
          console.log("Failed to generate slots via API");
        }
      } catch (error) {
        console.log("Error generating slots:", error);
      }
    }

    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-bold">Provider Dashboard</h1>
        <DashboardForm 
          rules={rules}
          providerId={data.providerId}
          addRuleAction={addRule}
          removeRuleAction={removeRule}
          generateSlotsAction={generateSlots}
        />
      </main>
    );
  }

  // For other users, show a message
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Provider Dashboard</h1>
      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        This dashboard is only available for providers. Please log in with a provider account.
      </div>
    </main>
  );
}


