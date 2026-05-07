'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useFetchBookings from '@/hooks/getAllBookings';
import { updateBooking } from '@/redux/bookingSlice';
import axios from 'axios';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Page = () => {
  useFetchBookings();
  const dispatch = useDispatch();
  const bookings = useSelector((store) => store.bookings.bookings);
  const [activeTab, setActiveTab] = useState('all'); // all, completed, cancelled
  const [selectedPassengers, setSelectedPassengers] = useState([]);

  //// full cancellation

  const togglePassenger = (bookingId, passengerId) => {
    const key = `${bookingId}-${passengerId}`;

    setSelectedPassengers((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );

  };

  const cancelBookingHandler = async (bookingId, cancelledBookingPassengers) => {
    //  console.log('Passengers :', cancelledBookingPassengers);
    if (!confirm(`Are you sure Do you want to cancel booking ?`)) return;
    try {
      const res = await axios.get(`http://localhost:8000/api/v1/booking/cancel-Booking/${bookingId}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        alert(res.data.message);
        dispatch(updateBooking(res.data.booking));
      }
    } catch (error) {
      console.log(error);
    }
  }



  const today = new Date();

  const filteredBookings = bookings.filter(booking => {
    const journeyDate = new Date(booking.journeyDate);

    if (activeTab === 'all') {
      // Completed if journey date is today or before, and not all cancelled
      return journeyDate > today && booking.status !== 'CANCELLED';
    }

    if (activeTab === 'completed') {
      // Completed if journey date is today or before, and not all cancelled
      return journeyDate <= today && booking.passengers.some(p => p.status !== 'Cancelled');
    }
    if (activeTab === 'cancelled') {
      // Cancelled if all passengers are cancelled
      return booking.status === 'CANCELLED';
    }
    return true; // all bookings
  });

  const tabColors = {
    all: 'blue',
    completed: 'green',
    cancelled: 'red'
  };

  return (
    <div className="relative relative min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 py-12">
      <div className="w-full mx-auto px-4">

        {/* Page Title */}
        <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">Your Bookings</h2>

        {/* Tabs with sliding indicator */}
        <div className="relative mb-10 flex justify-center space-x-4">
          {['all', 'completed', 'cancelled'].map(tab => {
            const tabName = tab.charAt(0).toUpperCase() + tab.slice(1);
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2 font-medium rounded-full transition-colors duration-300
                  ${isActive ? `bg-${tabColors[tab]}-600 text-white shadow-xl` : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                {tabName}
                {isActive && (
                  <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-${tabColors[tab]}-500 rounded-full`} />
                )}
              </button>
            );
          })}
        </div>
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">

            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className=" bg-red-100 border border-red-200 rounded-xl h-full flex flex-col hover:border-gray-300 transition"
              >
                <div className="p-3  flex flex-col h-full">

                  {/* Top Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-gray-500">PNR</p>
                      <p className="font-semibold text-base tracking-wide">
                        {booking.PNR}
                      </p>
                    </div>

                    <div className="text-xs text-gray-500 text-right">
                      {new Date(booking.journeyDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Train Info */}
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-800 text-sm">
                      {booking.train?.trainName} ({booking.train?.trainNo})
                    </h3>

                    <p className="text-xs text-gray-600 mt-1">
                      {booking.source} → {booking.destination}
                      <span className="ml-1 text-gray-400">
                        ({booking.reachingTime})
                      </span>
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="flex justify-between text-xs text-gray-700 mb-4">
                    <span>₹{booking.totalFare}</span>
                    <span>{booking.passengers.length} Pax</span>
                  </div>

                  {/* Passenger Table */}
                  <div className="border rounded-lg overflow-hidden flex-1">

                    {/* Header */}
                    <div className="bg-red-200 text-[11px] font-medium text-gray-500 grid grid-cols-3 px-5 py-2">
                      <span>Name</span>
                      <span>Seat</span>
                      <span>Status</span>
                      {/* <span className="text-right">Select</span> */}
                    </div>

                    {/* Rows */}
                    {booking.passengers.map((passenger) => {
                      const isSelected = selectedPassengers.includes(
                        `${booking._id}-${passenger._id}`
                      );

                      return (
                        <div
                          key={passenger._id}
                          className={`grid grid-cols-3 items-center px-4 py-2 text-xs border-t transition-all duration-200
                    ${passenger.status === "Cancelled"
                              ? "bg-gray-50 text-gray-400"
                              : ""
                            }
                    ${isSelected
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 shadow-sm"
                              : "hover:bg-gray-50"
                            }
                  `}
                        >
                          {/* Name */}
                          <div>
                            <p className={`${passenger.status === "Cancelled" ? "line-through" : ""}`}>
                              {passenger.name}
                            </p>
                            <p className="text-[10px] text-left text-gray-500">
                              {passenger.age}, {passenger?.gender?.charAt(0)}
                            </p>
                          </div>

                          {/* Seat */}
                          <div className="text-gray-600 text-[10px]">
                            {passenger.coach}/{passenger.seatBooked}
                          </div>

                          {/* Status */}
                          <div>
                            <span
                              className={`text-[10px] font-bold px-2 py-[2px] rounded-lg
                        ${passenger.status === "Cancelled"
                                  ? "bg-white text-red-600"
                                  : "bg-white text-green-600"
                                }`}
                            >
                              {passenger.status}
                            </span>
                          </div>

                          {/* Checkbox */}
                          {/* <div className="text-center">

                            {passenger.status !== "Cancelled" && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  togglePassenger(booking._id, passenger._id)
                                }
                                className="cursor-pointer"
                              />
                            )}
                          </div> */}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-col gap-2">

                    {/* Cancel Selected */}
                    {selectedPassengers.some(id =>
                      id.startsWith(booking._id)
                    ) && (
                        <button
                          onClick={() => {
                            const selectedForThisBooking = selectedPassengers.filter(id =>
                              id.startsWith(booking._id)
                            );
                            cancelBookingHandler(selectedForThisBooking);
                          }}
                          className="text-xs px-3 py-2 border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white transition"
                        >
                          Cancel Selected
                        </button>
                      )}

                    {/* Cancel Booking */}
                    {booking.status !== "CANCELLED" &&
                      new Date(booking.journeyDate) > today
                      ? (
                        <button
                          onClick={() => cancelBookingHandler(booking._id)}
                          className="text-xs px-3 py-2 border border-red-400 text-red-700 rounded hover:bg-gray-100 transition"
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <button
                          className="text-xs px-3 py-2 0  text-red-700 font-bold rounded transition cursor-none "
                        >
                          Cancelled
                        </button>
                      )}
                  </div>

                </div>
              </div>
            ))}

          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20 flex flex-col items-center text-lg">
            <img
              width={400}
              src="https://i.pinimg.com/736x/6b/60/02/6b6002e85a67559b0af16cfca7494b6a.jpg"
              alt="No bookings"
              className="mb-4"
            />
            No Upcoming bookings yet...
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
