"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import AirlineTicket from "@/components/flightBookingCard";

export default function PaymentSuccessPage() {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [error, setError] = useState(null);
  const hasBookedRef = useRef(false);
  const bookingKey = `bookingDone_${sessionId}`;
  const bookingData = JSON.parse(localStorage.getItem("bookingData"));

  console.log('bookingData : ',bookingData)

  useEffect(() => {

    if (localStorage.getItem(bookingKey) || hasBookedRef.current || !sessionId || !bookingData ) {
      setLoading(true);
      return;
    }


    const createBookingAfterPayment = async () => {
      hasBookedRef.current = true;
      localStorage.setItem(bookingKey, "true");
      try {
        if (!sessionId) throw new Error("No session ID found");

   

        if (!bookingData) throw new Error("No booking data found in localStorage");

        const { tripType, passengers, flightId, onwardFlightId, returnFlightId, preferredClass , selectedSeat, onwardSelectedSeat, returnSelectedSeat } = bookingData;

        // --- Validate required fields before sending ---
        if (!tripType || !passengers || passengers.length === 0) {
          throw new Error("Missing trip type or passengers.");
        }

        if (tripType === "oneWay" && !flightId) {
          throw new Error("Missing flightId for one-way booking.");
        }

        if (tripType === "roundTrip" && (!onwardFlightId || !returnFlightId)) {
          throw new Error("Missing onward or return flight IDs for round-trip booking.");
        }

        // --- Build request body for backend ---
        let requestBody;

        if (tripType === "oneWay") {
          requestBody = {
            tripType,
            preferredClass: preferredClass || "economy",
            selectedSeat,
            passengers,
            flightId,
          };
        } else if (tripType === "roundTrip") {
          requestBody = {
            tripType,
            preferredClass: preferredClass || "economy",
            onwardSelectedSeat,
            returnSelectedSeat,
            passengers,
            onwardFlightId,
            returnFlightId,
            
          };
        }
        

        console.log("Booking request body:", requestBody);

        const bookingRes = await axios.post(
          "http://localhost:8000/api/v1/booking/book",
          requestBody,
          { headers: { "Content-Type": "application/json" }, withCredentials : true,
           timeout: 30000 }
        );

        if (bookingRes.data.success) {
          setBookingInfo(bookingRes.data);
          console.log(bookingRes.data);
          localStorage.removeItem("bookingData");
          localStorage.removeItem(bookingKey);
          hasBookedRef.current = false;
        } else {
          throw new Error(bookingRes.data.message || "Booking failed");
        }
      } catch (err) {
        console.error("Error creating booking:", err);
        setError(err.response?.data?.message || err.message || "Booking creation failed");
      } finally {
        setLoading(false);
      }
    };

    createBookingAfterPayment();
  }, [sessionId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-semibold text-gray-700 mt-6">Verifying payment and creating booking...</p>
          <p className="text-sm text-gray-500 mt-2">This will only take a moment</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-lg border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Booking Failed</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = "/flights")}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200"
            >
              Browse Flights
            </button>
            <button
              onClick={() => (window.location.href = "/support")}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex  flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-4">
      {/* Success Animation Container */}
      <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-2xl mb-8 border border-green-100">
        {/* Animated Success Icon */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute inset-0 w-24 h-24 bg-green-400 rounded-full animate-ping opacity-20"></div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
        <p className="text-lg text-gray-600 mb-8">Your booking has been confirmed. Get ready for your journey!</p>

        {/* Booking Details Summary */}
        {bookingInfo.booking && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
            <div className="grid grid-row-2 gap-6 text-left">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Booking ID</p>
                <p className="text-lg font-bold text-gray-900">{(bookingInfo?.booking?._id).slice(0,10) || 'N/A'}...</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Status</p>
                <p className="text-lg font-bold text-green-600">Confirmed</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Confirmation Sent To</p>
                <p className="text-sm font-medium text-gray-700">{bookingInfo.booking.contact.email || 'your email'}</p>
              </div>
              
            </div>
            <div className="mt-5 text-left">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Transaction Date</p>
                <p className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString()}</p>
              </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-left">
          <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            What's Next?
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span>Check your email for booking confirmation and e-ticket</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span>Download your boarding pass 24 hours before departure</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span>Arrive at the airport at least 2 hours before your flight</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => (window.location.href = "/my-bookings")}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            View My Bookings
          </button>
          <button
            onClick={() => (window.location.href = "/flights")}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            Book Another Flight
          </button>
        </div>

        {/* Support Link */}
        <p className="text-sm text-gray-500 mt-6">
          Need help? <a href="/support" className="text-blue-600 font-semibold hover:underline">Contact Support</a>
        </p>
      </div>

      {/* Airline Ticket */}
      {bookingInfo.booking && <AirlineTicket booking={bookingInfo.booking} />}
    </div>
  );
}
