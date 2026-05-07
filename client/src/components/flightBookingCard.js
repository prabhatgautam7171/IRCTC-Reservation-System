import React from "react";
import { Badge } from "./ui/badge";
import { Calendar, Clock, CreditCard, Plane, User } from "lucide-react";

const AirlineTicket = ({ booking }) => {
  const flights = booking.flights || [];
  const passengers = booking.passengers || [];

  if (!flights.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-3xl bg-white shadow-lg rounded-md p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">Invalid Ticket Data</h2>
          <p className="text-gray-600 mt-2">No flight information available for this booking.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const generateBarcodeLines = () =>
    Array.from({ length: 40 }).map((_, i) => (
      <div
        key={i}
        className="w-0.5 bg-black"
        style={{ height: `${20 + Math.random() * 60}%` }}
      ></div>
    ));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ">
    {flights.map((flight, idx) => (
      <div
        key={idx}
        className="relative w-full max-w-9xl bg-white rounded-2xl overflow-hidden shadow-2xl"
        style={{
          fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        {/* Decorative top stripe */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

        <div className="flex">
          {/* Left Section - Main Ticket */}
          <div className="w-2/3 p-8 border-r-4 border-dashed border-gray-300 relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #4F46E5 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>

            <div className="relative z-10">
              {/* Airline Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200">
                    <img
                      src={flight.airline.logo}
                      alt={flight.airline.name}
                      className="object-contain h-12 w-12"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide">Operated by</div>
                    <div className="font-bold text-lg text-gray-800">{flight.airline.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">Flight</div>
                  <div className="font-bold text-3xl tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {flight.flightNo}
                  </div>
                </div>
              </div>

              {/* Route Info */}
              <div className="flex justify-between items-center mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-8 px-8 py-6 border-y border-blue-100">
                <div className="text-center flex-1">
                  <div className="text-6xl font-black tracking-tight bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {flight.from?.code || "—"}
                  </div>
                  <div className="text-sm text-gray-700 mt-2 font-semibold">{flight.from?.city || "From"}</div>
                  <div className="inline-block mt-2 px-3 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200">
                    {flight.from?.terminal ? ` ${flight.from.terminal}` : "—"}
                  </div>
                  <div className="mt-4 text-2xl font-bold text-indigo-600">{formatTime(flight.departureTime)}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Departure</div>
                </div>

                <div className="flex flex-col items-center px-8">
                  <Plane className="w-6 h-6 text-indigo-600 mb-2" />
                  <div className="relative w-40 flex items-center">
                    <div className="w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full"></div>
                    <div className="absolute left-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                    <div className="absolute right-0 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow"></div>
                  </div>
                  <div className="text-sm font-semibold mt-3 text-gray-600">{flight.duration}</div>
                  <div className="text-xs text-gray-400">Non-stop</div>
                </div>

                <div className="text-center flex-1">
                  <div className="text-6xl font-black tracking-tight bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {flight.to?.code || "—"}
                  </div>
                  <div className="text-sm text-gray-700 mt-2 font-semibold">{flight.to?.city || "To"}</div>
                  <div className="inline-block mt-2 px-3 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200">
                    {flight.to?.terminal ? ` ${flight.to.terminal}` : "—"}
                  </div>
                  <div className="mt-4 text-2xl font-bold text-indigo-600">{formatTime(flight.arrivalTime)}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Arrival</div>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="space-y-4">
                {flight.passengers.map((p, pIdx) => (
                  <div key={pIdx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div className="ml-3">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Passenger Name</div>
                        <div className="font-bold text-lg text-gray-900">{p.firstName} {p.lastName}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <div className="text-gray-500 uppercase text-xs tracking-wider mb-1 flex items-center">
                          <div className="w-1 h-1 bg-indigo-500 rounded-full mr-2"></div>
                          Seat
                        </div>
                        <div className="font-bold text-2xl text-indigo-600">{p.seatNumber || "—"}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 uppercase text-xs tracking-wider mb-1 flex items-center">
                          <div className="w-1 h-1 bg-indigo-500 rounded-full mr-2"></div>
                          Type
                        </div>
                        <div className="font-semibold text-gray-800">{p.seatType || "—"}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 uppercase text-xs tracking-wider mb-1 flex items-center">
                          <div className="w-1 h-1 bg-indigo-500 rounded-full mr-2"></div>
                          Class
                        </div>
                        <div className="inline-block px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full uppercase">
                          {p.seatClass || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 uppercase text-xs tracking-wider mb-1 flex items-center">
                          <div className="w-1 h-1 bg-indigo-500 rounded-full mr-2"></div>
                          Baggage
                        </div>
                        <div className="font-semibold text-gray-800">20 kg</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Details */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Travel Date</div>
                    <div className="font-bold text-gray-900">{formatDate(flight.journeyDate)}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CreditCard className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">PNR / Booking Ref</div>
                    <div className="font-bold text-gray-900 tracking-wider">{booking.PNR}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">E-Ticket Number</div>
                    <div className="font-bold text-gray-900 text-sm">{booking.PNR}{flight.flightNo}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Boarding Pass */}
          <div className="w-1/3 bg-gradient-to-b from-gray-50 to-white relative">
            {/* Decorative circles on the edge */}
            <div className="absolute -left-3 top-1/4 w-6 h-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-full border-4 border-white"></div>
            <div className="absolute -left-3 bottom-1/4 w-6 h-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-full border-4 border-white"></div>

            <div className="p-6 flex flex-col h-full">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 -mx-6 -mt-6 mb-6 shadow-lg">
                  <Plane className="w-5 h-5 mx-auto mb-1" />
                  <div className="font-bold text-sm tracking-widest">BOARDING PASS</div>
                </div>
              </div>

              <div className="space-y-5 flex-grow">
                {/* Passenger */}
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Passenger</div>
                  <div className="font-bold text-sm text-gray-900">
                    {flight.passengers[0]?.firstName} {flight.passengers[0]?.lastName}
                  </div>
                </div>

                {/* Route */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-gray-600 uppercase text-xs tracking-wider mb-1">From</div>
                    <div className="font-black text-3xl text-indigo-600">{flight.from?.code || "—"}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                    <div className="text-gray-600 uppercase text-xs tracking-wider mb-1">To</div>
                    <div className="font-black text-3xl text-purple-600">{flight.to?.code || "—"}</div>
                  </div>
                </div>

                {/* Flight Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Flight</div>
                    <div className="font-bold text-sm tracking-wider text-gray-900">{flight.flightNo}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Date</div>
                    <div className="font-bold text-sm text-gray-900">{formatDate(flight.journeyDate)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Seat</div>
                    <div className="font-bold text-2xl text-indigo-600">{flight.passengers[0]?.seatNumber}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Gate</div>
                    <div className="font-bold text-2xl text-indigo-600">A12</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Boarding</div>
                    <div className="font-bold text-sm text-gray-900 flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-indigo-600" />
                      {formatTime(flight.boardingTime || flight.departureTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Class</div>
                    <div className="font-bold uppercase text-sm text-gray-900">{flight.passengers[0]?.seatClass}</div>
                  </div>
                </div>

                {/* PNR */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
                  <div className="text-gray-600 uppercase text-xs tracking-wider mb-1">PNR</div>
                  <div className="font-bold tracking-widest text-xl text-gray-900">{booking.PNR}</div>
                </div>
              </div>

              {/* Barcode */}
              <div className="mt-6 -mb-6 -mx-6 bg-white p-4 border-t-4 border-dashed border-gray-300 shadow-inner">
                <div className="flex justify-center space-x-0.5 mb-3 h-20">{generateBarcodeLines()}</div>
                <div className="text-center text-xs tracking-widest font-mono text-gray-700 font-bold">
                  {booking.PNR}{flight.flightNo}
                </div>
                
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom stripe */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
      </div>
    ))}
  </div>
  );
};

export default AirlineTicket;
