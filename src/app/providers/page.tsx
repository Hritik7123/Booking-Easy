"use client";
import { useState, useEffect } from "react";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const response = await fetch('/api/providers');
        if (response.ok) {
          const data = await response.json();
          setProviders(data);
        } else {
          console.error('Failed to fetch providers');
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProviders();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Providers</h1>
            <p className="text-xl text-gray-600">Loading providers...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Providers</h1>
          <p className="text-xl text-gray-600">Choose from our network of skilled professionals</p>
          
          {providers.length === 0 && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">No providers available yet</h3>
              <p className="text-blue-700 mb-4">
                Be the first to join our platform and start offering your services!
              </p>
              <a 
                href="/become-provider" 
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Become a Provider
              </a>
            </div>
          )}
        </div>

        {providers.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {providers.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold text-lg">
                        {(p.user?.name ?? p.userId ?? 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{p.user?.name ?? p.userId ?? 'Unknown'}</h3>
                      <p className="text-blue-600">{p.headline ?? 'No headline'}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{p.bio ?? 'No bio available'}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {p.services && p.services.length > 0 ? (
                        p.services.map((s: any) => (
                          <span key={s.id} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {s.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No services listed</span>
                      )}
                    </div>
                  </div>

                  <a 
                    href={`/providers/${p.id}`} 
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center block"
                  >
                    View Profile & Book
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}


