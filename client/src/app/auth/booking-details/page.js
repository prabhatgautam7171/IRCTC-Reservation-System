'use client';
import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckPNRPage() {
  const [pnr, setPnr] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNumClick = (num) => {
    if (pnr.length < 10) setPnr(prev => prev + num);
  };

  const handleBackspace = () => {
    setPnr(prev => prev.slice(0, -1));
  };

  const handleCheckPNR = async () => {
    if (!pnr) return;
    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const res = await axios.post('http://localhost:8000/api/v1/booking/getBookingByPNR', { PNR: pnr });
      if (res.data.success) setBooking(res.data.bookingDetails);
      else setError(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-6">
    {/* Animated Background Pattern */}
    <div className="fixed inset-0 opacity-5 pointer-events-none">
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, gray 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
    </div>

    {/* Page Header with Icon */}
    <div className="max-w-5xl mx-auto mb-10 text-center relative">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="inline-block p-4 bg-blue-600 rounded-full mb-4"
      >
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </motion.div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">PNR Status Check</h1>
      <p className="text-gray-600 text-lg">Check your train ticket confirmation status instantly</p>

      {/* Quick Stats */}
      <div className="flex justify-center gap-8 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600">Real-time Updates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600">Secure & Private</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600">24/7 Available</span>
        </div>
      </div>
    </div>

    {/* Search Section with Info Cards */}
    <div className="max-w-3xl mx-auto">
      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">PNR Format</p>
              <p className="font-semibold text-gray-800">10-digit number</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-green-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Update Time</p>
              <p className="font-semibold text-gray-800">Every 5 mins</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Data Source</p>
              <p className="font-semibold text-gray-800">IRCTC Official</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 mb-10 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <input
              type="text"
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              placeholder="Enter 10-digit PNR Number"
              maxLength={10}
              className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {pnr.length > 0 && pnr.length < 10 && (
              <p className="absolute left-3 -bottom-5 text-xs text-orange-500">
                {10 - pnr.length} digits remaining
              </p>
            )}
          </div>
          <button
            onClick={handleCheckPNR}
            disabled={loading || pnr.length !== 10}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Checking...</span>
              </>
            ) : (
              <>
                <span>Check Status</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Help Text */}
        <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Find your 10-digit PNR number on the top-left corner of your ticket</span>
        </div>
      </motion.div>
    </div>

    {/* Booking Details */}
    <AnimatePresence>
      {booking && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 25 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          {/* Status Badge */}
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                booking.passengers.every(p => p.status === "Cancelled")
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-green-500 animate-pulse'
              }`}></div>
              <span className="text-gray-600">Last Updated: Just now</span>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Ticket
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
            {/* Train Info with Visual Timeline */}
            <div className="border-b pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {booking.train.trainName}
                    <span className="text-lg font-normal text-gray-500 ml-2">({booking.train.trainNo})</span>
                  </h2>
                  <p className="text-gray-500 mt-1">Train running status: On Time</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600">PNR</p>
                  <p className="font-mono font-bold text-lg">{booking.PNR}</p>
                </div>
              </div>

              {/* Journey Timeline */}
              <div className="mt-6 relative">
                <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
                <div className="relative flex justify-between">
                  <div className="text-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2 relative z-10"></div>
                    <p className="font-semibold">{booking.source}</p>
                    <p className="text-sm text-gray-500">{booking.train.departureTime}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2 relative z-10"></div>
                    <p className="font-semibold">{booking.destination}</p>
                    <p className="text-sm text-gray-500">{booking.train.arrivalTime}</p>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Journey Date: {booking.journeyDate} • Duration: 5h 30m
                </p>
              </div>
            </div>

            {/* Passenger Table with Enhanced Design */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Passenger Details</h3>
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  {booking.passengers.length} Passenger(s)
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border-2 border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700">
                    <tr>
                      <th className="p-4 text-left">Name</th>
                      <th className="p-4 text-center">Age/Gender</th>
                      <th className="p-4 text-center">Coach</th>
                      <th className="p-4 text-center">Seat No.</th>
                      <th className="p-4 text-center">Booking Status</th>
                      <th className="p-4 text-center">Current Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.passengers.map((p, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border-t hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 font-medium">{p.name}</td>
                        <td className="p-4 text-center">{p.age}/{p.gender}</td>
                        <td className="p-4 text-center font-mono">{p.coach}</td>
                        <td className="p-4 text-center font-mono">{p.seatBooked}</td>
                        <td className="p-4 text-center">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            {p.bookingStatus || 'Confirmed'}
                          </span>
                        </td>
                        <td className={`p-4 text-center font-semibold`}>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            p.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fare & Status Summary with Progress Bar */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Fare</p>
                  <p className="text-3xl font-bold text-gray-800">₹{booking.totalFare}</p>
                  <p className="text-xs text-gray-500 mt-1">Including all taxes</p>
                </div>

                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Booking Status</span>
                    <span className="font-medium">
                      {booking.passengers.filter(p => p.status !== "Cancelled").length} / {booking.passengers.length} Confirmed
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(booking.passengers.filter(p => p.status !== "Cancelled").length / booking.passengers.length) * 100}%` }}
                      className={`h-full ${
                        booking.passengers.every(p => p.status === "Cancelled")
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                    />
                  </div>
                </div>

                <div className={`px-6 py-3 rounded-xl text-center ${
                  booking.passengers.every(p => p.status === "Cancelled")
                    ? "bg-red-100"
                    : "bg-green-100"
                }`}>
                  <p className={`text-lg font-bold ${
                    booking.passengers.every(p => p.status === "Cancelled")
                      ? "text-red-600"
                      : "text-green-600"
                  }`}>
                    {booking.passengers.every(p => p.status === "Cancelled")
                      ? "✕ Booking Cancelled"
                      : "✓ Booking Confirmed"}
                  </p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="text-sm text-gray-500 border-t pt-6">
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Chart prepared 4 hours before departure</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Carry valid ID proof during journey</span>
                </div>
              </div>
            </div>
          </div>

          {/* Share/Bookmark Actions */}
          <div className="mt-4 flex justify-end gap-3">
            <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* FAQ/Help Section */}
    {!booking && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-3xl mx-auto mt-12"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h4 className="font-medium text-gray-800 mb-2">Where to find PNR?</h4>
            <p className="text-sm text-gray-500">Your PNR is printed on the top-left corner of your railway ticket or SMS.</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h4 className="font-medium text-gray-800 mb-2">How often is status updated?</h4>
            <p className="text-sm text-gray-500">PNR status is updated every 5 minutes from IRCTC database.</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h4 className="font-medium text-gray-800 mb-2">What do status colors mean?</h4>
            <p className="text-sm text-gray-500">Green = Confirmed, Red = Cancelled/RAC, Orange = Waiting List</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h4 className="font-medium text-gray-800 mb-2">Need help?</h4>
            <p className="text-sm text-gray-500">Contact our support at help@pnrstatus.com or call 1800-123-4567</p>
          </div>
        </div>
      </motion.div>
    )}
  </div>

  );
}
