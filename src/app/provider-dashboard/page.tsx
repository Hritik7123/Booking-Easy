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
  customer: {
    email: string;
    name: string;
  };
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  payment: {
    status: string;
  }[];
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  booking?: {
    customer: {
      email: string;
      name: string;
    };
    service: {
      name: string;
    };
  };
}

export default function ProviderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'slots' | 'analytics'>('bookings');

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user?.role !== "PROVIDER") {
      router.push("/");
      return;
    }
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [bookingsRes, slotsRes] = await Promise.all([
        fetch("/api/provider/bookings"),
        fetch("/api/provider/slots")
      ]);

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings || []);
      }

      if (slotsRes.ok) {
        const slotsData = await slotsRes.json();
        setTimeSlots(slotsData.slots || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/provider/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert(`Booking ${newStatus.toLowerCase()} successfully!`);
        fetchData(); // Refresh data
      } else {
        const errorText = await response.text();
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: "Invalid response from server" };
        }
        
        console.error("Booking update error:", error);
        alert(`Error: ${error.error || error.details || "Failed to update booking"}`);
      }
    } catch (error) {
      console.error("Booking update error:", error);
      alert("Error updating booking. Please try again.");
    }
  };

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
      case "CANCELED":
      case "CANCELLED": // Support both spellings
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!session || session.user?.role !== "PROVIDER") {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Provider Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your bookings, slots, and business</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📅 Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab('slots')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'slots'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ⏰ Time Slots ({timeSlots.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Your Bookings</h2>
                  <button
                    onClick={fetchData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600">When customers book your services, they'll appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-gray-50 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{booking.service.name}</h3>
                            <p className="text-gray-600">with {booking.customer.name || booking.customer.email}</p>
                            <p className="text-sm text-gray-500">{booking.service.description}</p>
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
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Customer Contact</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p><strong>Email:</strong> {booking.customer.email}</p>
                              <p><strong>Name:</strong> {booking.customer.name || "Not provided"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-500">
                            Booked on {formatDate(booking.createdAt)}
                          </div>
                          <div className="flex space-x-3">
                            {booking.status === "CONFIRMED" && (
                              <>
                                <button
                                  onClick={() => handleBookingStatusChange(booking.id, "COMPLETED")}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                                >
                                  Mark Complete
                                </button>
                                <button
                                  onClick={() => handleBookingStatusChange(booking.id, "CANCELED")}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => window.open(`mailto:${booking.customer.email}?subject=Booking Inquiry&body=Hello ${booking.customer.name || booking.customer.email},%0A%0AI have a question about your booking. Please contact me back.%0A%0AThank you!`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              Contact Customer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Time Slots Tab */}
            {activeTab === 'slots' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Your Time Slots</h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={fetchData}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Refresh
                    </button>
                    <a
                      href="/dashboard"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Manage Availability
                    </a>
                  </div>
                </div>

                {timeSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No time slots available</h3>
                    <p className="text-gray-600 mb-4">Set up your availability to start receiving bookings.</p>
                    <a
                      href="/dashboard"
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Set Up Availability
                    </a>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {timeSlots.map((slot) => (
                      <div key={slot.id} className={`rounded-xl p-4 border-2 ${
                        slot.isBooked 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-white'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{formatDate(slot.startTime)}</p>
                            <p className="text-sm text-gray-600">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            slot.isBooked 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {slot.isBooked ? 'Booked' : 'Available'}
                          </span>
                        </div>
                        
                        {slot.isBooked && slot.booking && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-900">{slot.booking.customer.name || slot.booking.customer.email}</p>
                            <p className="text-xs text-gray-600">{slot.booking.service.name}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Business Analytics</h2>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">Total Bookings</p>
                        <p className="text-2xl font-bold text-blue-900">{bookings.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-900">
                          ${(bookings.reduce((sum, booking) => sum + booking.priceCents, 0) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">Available Slots</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {timeSlots.filter(slot => !slot.isBooked).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Breakdown</h3>
                  <div className="space-y-3">
                    {['CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map(status => {
                      const count = bookings.filter(booking => booking.status === status).length;
                      const percentage = bookings.length > 0 ? (count / bookings.length * 100).toFixed(1) : 0;
                      return (
                        <div key={status} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{status}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
