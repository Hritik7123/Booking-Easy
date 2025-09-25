"use client";
import { useState } from "react";

export default function TestProviderPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      // Simulate provider login (in real app, this would be handled by authentication)
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
        setSlots(slotsData.slots || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Provider Test Page</h1>
          <p className="text-xl text-gray-600">Test your provider dashboard functionality</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <button
              onClick={fetchProviderData}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Fetch Provider Data"}
            </button>
          </div>

          {bookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📅 Your Bookings ({bookings.length})</h2>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.service?.name || "Service"}</h3>
                        <p className="text-gray-600">Customer: {booking.customer?.email || "Unknown"}</p>
                        <p className="text-sm text-gray-500">
                          Status: <span className="font-medium">{booking.status}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${((booking.priceCents || 0) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slots.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">⏰ Your Time Slots ({slots.length})</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.slice(0, 12).map((slot) => (
                  <div key={slot.id} className={`rounded-xl p-4 border-2 ${
                    slot.isBooked 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {new Date(slot.startTime).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}
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
                        <p className="text-sm font-medium text-gray-900">
                          {slot.booking.customer?.email || "Customer"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {slot.booking.service?.name || "Service"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {slots.length > 12 && (
                <p className="text-center text-gray-500 mt-4">
                  Showing first 12 slots. Total: {slots.length} slots
                </p>
              )}
            </div>
          )}

          {bookings.length === 0 && slots.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No data found</h3>
              <p className="text-gray-600">Click "Fetch Provider Data" to load your bookings and slots.</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 How to Access Your Provider Dashboard</h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>1. Login as Provider:</strong> Use any email with provider role or create a provider account</p>
            <p><strong>2. Access Dashboard:</strong> Click "My Bookings" in the header after login</p>
            <p><strong>3. Manage Bookings:</strong> View, update, and manage all customer bookings</p>
            <p><strong>4. Set Availability:</strong> Click "Availability" to set up your working hours</p>
            <p><strong>5. Generate Slots:</strong> Create time slots for customers to book</p>
          </div>
        </div>
      </div>
    </main>
  );
}
