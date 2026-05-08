'use client';

import { use, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ConfirmBookingCard from '@/components/trainBookingCard';
import { ForwardIcon, Frown, HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';

export default function PaymentSuccess({ params }) {
  const { sessionId } = use(params);
  console.log("Session:", sessionId);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasBookedRef = useRef(false);

  useEffect(() => {
    const selectedPassengers = JSON.parse(localStorage.getItem("passengers"));
    const selectedQuota = JSON.parse(localStorage.getItem("selectedQuota"));
    const trainData = JSON.parse(localStorage.getItem("trains"));
    const selectedSearch = JSON.parse(localStorage.getItem("selectedSearch"));
    const distance = JSON.parse(localStorage.getItem("reachingTime"));
    const train = trainData?.train;
    const coachType = localStorage.getItem("coachType");
    const bookingKey = `bookingDone_${sessionId}`;

    console.log("Stored in localStorage:",
      selectedPassengers,
      selectedQuota,
      trainData.train.id,
      trainData.train,
      trainData,
      coachType,
      selectedSearch,
      distance
    );

    if (
  localStorage.getItem(bookingKey) ||
  hasBookedRef.current ||
  !sessionId ||
  !selectedPassengers ||
  !train?.id
) {
  console.log("Booking skipped");

  setLoading(false);
  return;
}

    const confirmBooking = async () => {
      hasBookedRef.current = true;
      localStorage.setItem(bookingKey, "true");

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/booking/create-booking/${train?.id}/${coachType}`,
          {
            passengers: selectedPassengers,
            source: selectedSearch?.from,
            destination: selectedSearch?.to,
            journeyDate: selectedSearch?.date,
            reachingTime: distance,
            selectedQuota
          },
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );

        setBooking(res.data.bookingData);

        // Cleanup localStorage
        ["passengers", "trains", "coachType", "selectedSearch", "reachingTime"].forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.error('Booking failed:', error.response?.data || error.message);
        alert('Booking failed: ' + (error.response?.data?.message || error.message));
        localStorage.removeItem(bookingKey);
        hasBookedRef.current = false;
      } finally {
        setLoading(false);
      }
    };

    confirmBooking();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-xl bg-white shadow"
        >
          <p className="text-gray-500 text-lg animate-pulse">Processing your booking...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[80%] bg-gray-50 flex flex-col items-center justify-center ">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
      >
        {/* Success Header */}
        <div className="flex flex-col items-center justify-center p-8 border-b border-gray-200">
          <FaCheckCircle className="text-green-600 text-6xl mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Payment Successful</h1>
          <p className="text-gray-500">Your booking has been confirmed</p>
        </div>

        {/* Booking Summary */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <FaTicketAlt className="text-red-400 text-xl" />
              <div>
                <h2 className="text-sm font-medium text-gray-700">Booking ID</h2>
                <p className="text-gray-600 text-sm">{(booking?._id) || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-orange-400 text-xl" />
              <div>
                <h2 className="text-sm font-medium text-gray-700">Journey Date</h2>
                <p className="text-gray-600 text-sm">{booking?.journeyDate ? new Date(booking.journeyDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric"
              }) : "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-green-600 text-xl" />
              <div>
                <h2 className="text-sm font-medium text-gray-700">Route</h2>
                <p className="text-gray-600 text-sm">{booking?.source} → {booking?.destination}</p>
              </div>
            </div>
          </div>



          {/* ConfirmBookingCard */}
          {booking && <ConfirmBookingCard booking={booking} />}

          {/* Back Home */}
          <div className="flex gap-10 justify-center mt-6">
            <Link
              href="/auth/trains?refresh=true"
              className="flex items-center gap-2 px-6 py-3 bg-white border hover:bg-green-600 hover:text-white    text-green-600 rounded-lg font-medium transition"
            >
              <ForwardIcon className="w-5 h-5" /> Continue Booking

            </Link>
            <Link
              href="/auth/trains"
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-green-600 text-white rounded-lg font-medium transition"
            >
              <MdCancel className="w-5 h-5" /> Cancel Booking

            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
