import React from "react";
import { FaTrain, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaClock, FaCut, FaRupeeSign, FaChair } from "react-icons/fa";

const ConfirmBookingCard = ({ booking }) => {
  if (!booking || !booking.train) {
    return <p className="text-gray-500 text-center mt-4">No booking details available.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Indian Railways Ticket
          </h2>
          <p className="text-xs text-gray-500">Booking Confirmation</p>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">
            PNR: <span className="font-mono">{booking.PNR}</span>
          </p>
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
            CONFIRMED
          </span>
        </div>
      </div>

      {/* Train Info */}
      <div className="px-6 py-4 border-b">
        <h3 className="text-md font-semibold text-gray-800">
          {booking.train.trainNo} — {booking.train.trainName}
        </h3>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-lg font-semibold">{booking.source}</p>
            <p className="text-sm text-gray-500">{booking.departureTime}</p>
          </div>

          <div className="flex flex-col items-center text-gray-400">
            <span className="text-xs">Duration</span>
            <div className="w-20 h-[1px] bg-gray-300 my-1"></div>
            <span className="text-xs">{booking.reachingTime}</span>
          </div>

          <div className="text-right">
            <p className="text-lg font-semibold">{booking.destination}</p>
            <p className="text-sm text-gray-500">{booking.arrivalTime}</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-3">
          Journey Date:{" "}
          {new Date(booking.journeyDate).toLocaleDateString()}
        </p>
      </div>

      {/* Passenger Table */}
      <div className="px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Passenger Details
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Age/Gender</th>
                <th className="px-3 py-2 text-left">Seat</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {booking.passengers.map((p, idx) => (
                <tr key={p.id || idx} className="border-t">
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2">{p.age}/{p.gender}</td>
                  <td className="px-3 py-2">
                    {p.coach}-{p.seatBooked}
                  </td>
                  <td className={`px-3 py-2 font-medium ${p.status === "CNF" ? "text-green-600" : "text-red-500"
                    }`}>
                    {p.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t">
        <div>
          <p className="text-xs text-gray-500">
            Booking Date: {new Date().toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Carry valid ID proof during journey
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Total Fare</p>
          <p className="text-lg font-semibold text-gray-800">
            ₹{booking.totalFare}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBookingCard;
