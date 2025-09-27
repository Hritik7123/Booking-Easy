"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch('/api/plans');
        if (response.ok) {
          const data = await response.json();
          setPlans(data);
        } else {
          console.error('Failed to fetch plans');
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPlans();
  }, []);

  async function handleSubscribe(customerEmail: string, planId: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const res = await fetch(`${baseUrl}/api/subscriptions/checkout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customerEmail, planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-bold">Plans</h1>
        <div className="mt-4">Loading plans...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Plans</h1>
      <ul className="mt-4 space-y-3">
        {plans.map((p: any) => (
          <li key={p.id} className="border rounded p-4">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-600">Credits per cycle: {p.creditsPerCycle}</div>
            <div className="mt-2 flex gap-2 items-center">
              <input 
                id={`email-${p.id}`}
                type="email" 
                required 
                placeholder="your@email" 
                className="border rounded px-2 py-1" 
              />
              <button 
                className="underline" 
                onClick={() => {
                  const email = (document.getElementById(`email-${p.id}`) as HTMLInputElement)?.value;
                  if (email) handleSubscribe(email, p.id);
                }}
              >
                Subscribe
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}


