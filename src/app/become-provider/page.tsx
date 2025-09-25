"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BecomeProviderPage() {
  const session = useSession();
  const { data } = session || {};
  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    bio: "",
    location: "",
    serviceName: "",
    serviceDescription: "",
    servicePrice: "",
    serviceDuration: "",
    serviceCategory: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (session?.status === "loading") return; // Still loading
    if (!data) {
      router.push("/login");
      return;
    }
    if (data?.user?.role === "PROVIDER") {
      router.push("/dashboard");
      return;
    }
  }, [session, data, router]);

  if (session?.status === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null; // Will redirect to login
  }

  if (data?.user?.role === "PROVIDER") {
    return null; // Will redirect to dashboard
  }

  const checkSession = async () => {
    try {
      const response = await fetch("/api/debug-session");
      const data = await response.json();
      setDebugInfo(data);
      console.log("Debug session info:", data);
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitting form data:", formData);
      console.log("Current session:", session);
      
      const requestData = {
        ...formData,
        email: data?.user?.email, // Include email in request
      };
      
      const response = await fetch("/api/become-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        alert("Provider profile created successfully! You can now access your dashboard.");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        console.error("API Error:", error);
        alert(`Error: ${error.error || error.message || "Failed to create provider profile"}`);
      }
    } catch (error) {
      alert("Error creating provider profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Provider</h1>
            <p className="text-gray-600">Create your provider profile and start offering services</p>
            
            {/* Debug Session Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={checkSession}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
              >
                Debug Session
              </button>
              {debugInfo && (
                <div className="mt-2 p-3 bg-gray-50 rounded text-left text-xs">
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g., John Smith, Sarah Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Headline *
                </label>
                <input
                  id="headline"
                  type="text"
                  placeholder="e.g., Personal Trainer, Life Coach, Yoga Instructor"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio *
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  placeholder="Tell potential clients about your experience, qualifications, and approach..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g., New York, NY or Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Your First Service</h2>
              
              <div>
                <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  id="serviceName"
                  type="text"
                  placeholder="e.g., 1-on-1 Personal Training, Life Coaching Session"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Description *
                </label>
                <textarea
                  id="serviceDescription"
                  rows={3}
                  placeholder="Describe what clients can expect from this service..."
                  value={formData.serviceDescription}
                  onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    id="servicePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="50.00"
                    value={formData.servicePrice}
                    onChange={(e) => setFormData({ ...formData, servicePrice: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="serviceDuration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    id="serviceDuration"
                    type="number"
                    min="15"
                    step="15"
                    placeholder="60"
                    value={formData.serviceDuration}
                    onChange={(e) => setFormData({ ...formData, serviceDuration: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="serviceCategory" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Category</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Coaching">Coaching</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Education">Education</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Profile...
                </div>
              ) : (
                "Create Provider Profile"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              After creating your profile, you'll be able to set your availability and start accepting bookings.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
