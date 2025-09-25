"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Booking {
  id: string;
  status: string;
  priceCents: number;
  createdAt: string;
  service: {
    name: string;
    description: string;
    durationMin: number;
  };
  provider: {
    user: {
      name: string;
      email: string;
    };
    headline: string;
    location: string;
  };
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  payment: {
    status: string;
  }[];
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetchBookings();
  }, [session, status, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/my-bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancelling(bookingId);
    try {
      const response = await fetch(`/api/bookings/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, reason: "Customer requested cancellation" }),
      });

      if (response.ok) {
        alert("Booking cancelled successfully!");
        fetchBookings(); // Refresh the bookings list
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to cancel booking"}`);
      }
    } catch (error) {
      alert("Error cancelling booking. Please try again.");
    } finally {
      setCancelling(null);
    }
  };

  const handleContactProvider = (providerEmail: string, providerName: string) => {
    const subject = encodeURIComponent(`Booking Inquiry - ${providerName}`);
    const body = encodeURIComponent(`Hello ${providerName},\n\nI have a question about my booking. Please contact me back.\n\nThank you!`);
    window.open(`mailto:${providerEmail}?subject=${subject}&body=${body}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-xl text-gray-600">View and manage your appointments</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start by browsing our providers!</p>
            <a
              href="/providers"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Providers
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{booking.service.name}</h3>
                    <p className="text-gray-600">with {booking.provider.user.name}</p>
                    <p className="text-sm text-gray-500">{booking.provider.headline}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <p className="text-lg font-semibold text-gray-900 mt-2">{formatPrice(booking.priceCents)}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Appointment Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Date:</strong> {formatDate(booking.timeSlot.startTime)}</p>
                      <p><strong>Time:</strong> {formatTime(booking.timeSlot.startTime)} - {formatTime(booking.timeSlot.endTime)}</p>
                      <p><strong>Duration:</strong> {booking.service.durationMin} minutes</p>
                      <p><strong>Location:</strong> {booking.provider.location}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Service Description</h4>
                    <p className="text-sm text-gray-600">{booking.service.description}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Booked on {formatDate(booking.createdAt)}
                  </div>
                  <div className="flex space-x-3">
                    {booking.status === "CONFIRMED" && (
                      <button 
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancelling === booking.id}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelling === booking.id ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    )}
                    <button 
                      onClick={() => handleContactProvider(booking.provider.user.email, booking.provider.user.name)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      Contact Provider
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
