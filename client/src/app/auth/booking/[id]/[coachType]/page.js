'use client';

import { setSelectedPassengers } from "@/redux/passengerSlice";
import { setFare, setSelectedCoachType } from "@/redux/trainSlice";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendar, FaPhone, FaTag, FaTv, FaUserMinus, FaWater } from 'react-icons/fa';
import {
  FaUser,
  FaTrain,
  FaChair,
  FaRupeeSign,
  FaPhoneAlt,
  FaCalendarAlt,
  FaExclamationCircle,
  FaCheckCircle,
  FaInfoCircle,
  FaArrowRight,
  FaClock,
  FaStar,
  FaWifi,
  FaPlug,
  FaUtensils,
  FaSnowflake,
  FaShieldAlt,
  FaUsers,
  FaUserPlus,
  FaBed,
  FaChevronDown,
  FaExclamationTriangle,
  FaLock,
  FaSave
} from "react-icons/fa";
import { Calendar, Clock10, Cross, CrossIcon, Timer, X } from "lucide-react";
import { formatDate } from '@/utils/dateFormat';
import { BiCapsule } from "react-icons/bi";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const BookingPage = () => {
  const { coachType } = useParams();
  const { selectedTrain, selectedSearch, selectedDepartureTime, selectedArrivalTime, distance, status, availability, fare } =
    useSelector((store) => store.trains);
  const { selectedPassengers } = useSelector(store => store.passengers);

  console.log('selected passengers :', selectedPassengers)



  console.log(status, availability);

  const train = selectedTrain;;
  const dispatch = useDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [passengers, setPassengers] = useState(() => {
    return selectedPassengers?.length
      ? selectedPassengers
      : [
        {
          id: crypto.randomUUID(),
          name: "",
          age: "",
          gender: "",
          contactDetails: "",
          upgradeAllowed: false,
          berthPreference: ""
        }
      ];
  });


  const pricePerSeat = fare || 0;
  const totalPassengers = passengers.length;
  const totalFare = pricePerSeat * totalPassengers;

  // Validate form fields
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        else if (value.trim().length < 2) error = 'Name should be at least 2 characters';
        break;
      case 'age':
        if (!value) error = 'Age is required';
        else if (isNaN(value) || value < 1 || value > 120) error = 'Please enter a valid age (1-120)';
        break;
      case 'gender':
        if (!value) error = 'Please select a gender';
        break;
      case 'contactDetails':
        if (!value.trim()) error = 'Contact number is required';
        else if (!/^[0-9]{10}$/.test(value)) error = 'Please enter a valid 10-digit phone number';
        break;
      default:
        break;
    }

    return error;
  };

  const handleSetPassengers = () => {
    dispatch(setSelectedPassengers([...passengers]));

    toast.success('Passenger data saved sucessfully')
  }

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;

    // Validate the field and update errors
    const error = validateField(field, value);
    setFormErrors(prev => ({
      ...prev,
      [`${index}-${field}`]: error
    }));

    setPassengers(updated);
  };

  const addPassenger = () => {
    setPassengers(prev => [
      ...prev,
      {
        id: crypto.randomUUID(), // ✅ truly unique
        name: "",
        age: "",
        gender: "",
        contactDetails: "",
        upgradeAllowed: false,
        berthPreference: ""
      }
    ]);
  };

  const removePassenger = (index) => {
    if (passengers.length <= 1) return;

    // Remove errors for this passenger
    const newErrors = { ...formErrors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`${index}-`)) {
        delete newErrors[key];
      }
    });
    setFormErrors(newErrors);

    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};

    passengers.forEach((passenger, index) => {
      Object.keys(passenger).forEach(field => {
        if (field !== 'id') {
          const error = validateField(field, passenger[field]);
          if (error) {
            errors[`${index}-${field}`] = error;
          }
        }
      });
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (passengers.length === 0) {
      alert("At least one passenger required!");
      setIsSubmitting(false);
      return;
    }

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    dispatch(setSelectedCoachType(coachType));
    dispatch(setSelectedPassengers(passengers));
    dispatch(setFare(pricePerSeat));

    router.push("/auth/booking-summary");
  };

  const ladiesCount = passengers.filter(
    p => p.gender?.toLowerCase() === "female" && p.age < 60
  ).length;

  const generalCount = passengers.filter(
    p => p.gender?.toLowerCase() === "male" && p.age < 60
  ).length;

  const seniorCount = passengers.filter(
    p => p.age >= 60
  ).length;

  // Check if all fields for a passenger are filled
  const isPassengerComplete = (passenger) => {
    return passenger.name && passenger.age && passenger.gender && passenger.contactDetails;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-6 py-3">
      <div className="max-w-10xl gap-3  grid lg:grid-cols-3 ">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-1 bg-white-100 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col h-fit sticky top-3 hover:shadow-[0_30px_80px_-10px_rgba(0,0,0,0.15)] transition-shadow duration-300"
        >
          {/* HEADER */}
          <div className="bg-gradient-to-r rounded-t-2xl  from-blue-800 to-indigo-800 text-white p-5">

            {/* Train Info */}
            <div className="mb-4">
              <h1 className="text-xl font-semibold">
                {train.train.trainNo} · {train.train.trainName}
              </h1>
              <p className="text-sm text-blue-200 mt-1 flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(train.journey.journeyDate)}
              </p>
            </div>

            {/* Route */}
            <div className="flex items-center justify-between mt-4">

              {/* FROM */}
              <div>
                <p className="text-lg font-semibold">{selectedSearch.from}</p>
                <p className="text-xs text-blue-200 flex items-center gap-1 mt-1">
                  <FaClock size={12} />
                  {selectedDepartureTime}
                </p>
              </div>

              {/* CENTER */}
              <div className="flex flex-col items-center text-xs text-blue-200">
                <Timer size={14} />
                <p>{distance}</p>
              </div>

              {/* TO */}
              <div className="text-right">
                <p className="text-lg font-semibold">{selectedSearch.to}</p>
                <p className="text-xs text-blue-200 flex items-center gap-1 justify-end mt-1">
                  <FaClock size={12} />
                  {selectedArrivalTime}
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className={`p-5 space-y-6
            ${status.includes('AVL') && "bg-green-500/10"}
            ${status.includes('RAC') && "bg-yellow-500/10"}
            ${status.includes('WL' || 'GNWL' || 'RLWL' || 'PQWL') && "bg-red-500/10"}
          `}>

            {/* STATUS + COACH */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                {coachType}
              </span>

              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${status.includes("AVL")
                  ? "bg-green-100 text-green-700"
                  : status.includes("RAC")
                    ? "bg-yellow-100 text-yellow-700"
                    : status.includes("WL")
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
              >
                {status}
              </span>
            </div>

            {/* AMENITIES */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Amenities
              </h3>

              <div className="grid grid-cols-5 gap-3">
                {[
                  { icon: FaWifi, label: "Wi-Fi" },
                  { icon: FaPlug, label: "Charging" },
                  { icon: FaUtensils, label: "Pantry" },
                  { icon: FaSnowflake, label: "AC" },
                  { icon: FaWater, label: "Water" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg"
                  >
                    <item.icon className="text-gray-100  text-xs" />
                    <span className="text-xs font-semibold text-gray-200">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>


            <div className="">

              <div className="max-w-md ml-auto bg-white  rounded-2xl shadow-md border border-gray-200 p-5">

                <div className="flex gap-2 flex-wrap mb-2">

                  {ladiesCount > 0 && (
                    <span className="px-2 py-1 text-xs rounded-lg  bg-pink-100 text-pink-700">
                    {ladiesCount}  Female
                    </span>
                  )}

                  {seniorCount > 0 && (
                    <span className="px-2 py-1 text-xs rounded-lg bg-orange-100 text-orange-700">
                    {seniorCount}  Senior
                    </span>
                  )}

                  {generalCount > 0 && (
                    <span className="px-2 py-1 text-xs rounded-lg  bg-blue-100 text-blue-700">
                    {generalCount}  Male
                    </span>
                  )}

                </div>

                {/* Header */}
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Fare Summary
                </h3>

                {/* Breakdown */}
                <div className="space-y-2 text-sm text-gray-600">

                  <div className="flex justify-between">
                    <span>Base Fare</span>
                    <span>₹{pricePerSeat} × {passengers.length}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalFare}</span>
                  </div>

                  {/* Optional future items */}
                  {/*
      <div className="flex justify-between">
        <span>Travel Insurance</span>
        <span>₹{passengers.length * 32}</span>
      </div>

      <div className="flex justify-between">
        <span>Convenience Fee</span>
        <span>₹20</span>
      </div>
      */}

                  {/* Divider */}
                  <div className="border-t my-3"></div>

                  {/* Total */}
                  <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-green-600">₹{totalFare}</span>
                  </div>

                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-5">

                  <button
                    type="submit"
                    onClick={() => (handleSetPassengers(), router.push('/auth/booking-summary'))}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Processing...
                      </>
                    ) : (
                      "Pay Now"
                    )}
                  </button>

                </div>

              </div>

            </div>





          </div>
        </motion.div>


        {/* Right - Passenger Form with IRCTC Enhancements */}
        {/* Right - Passenger Form */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-gray-50  shadow-xl  overflow-hidden"
        >




          {/* STEP HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 text-sm">

            {[
              { step: 1, label: "Journey", active: true },
              { step: 2, label: "Passengers", active: true },
              { step: 3, label: "Payment", active: false }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold
            ${item.active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}
          `}
                >
                  {item.step}
                </div>
                <span className={item.active ? "text-blue-700 font-medium" : "text-gray-500"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex-1 p-5 overflow-y-auto">
              {/* Passenger Details Header with Count */}
              <div className="flex justify-between items-center px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaUsers className="text-blue-600" />
                    Passenger Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Enter details as per ID proof (Max 6)
                  </p>
                </div>

                <button
                  onClick={addPassenger}
                  disabled={passengers.length >= 6}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <FaUserPlus />
                  Add ({passengers.length}/6)
                </button>
              </div>

              <AnimatePresence mode="popLayout">
                {passengers.map((passenger, index) => (
                  <motion.div
                    key={passenger.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-white p-5 rounded-2xl border border-gray-100 mb-5 relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
                  >
                    {/* Decorative header line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-t-2xl"></div>

                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Passenger {index + 1}
                      </h3>

                      <div className="flex items-center gap-2">
                        {isPassengerComplete(passenger) && (
                          <FaCheckCircle className="text-green-500" />
                        )}

                        {passengers.length > 1 && (
                          <button
                            onClick={() => removePassenger(index)}
                            className="text-red-500 text-sm hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                      {/* Name */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Full Name *
                        </label>

                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(index, "name", e.target.value)}
                          placeholder="Enter full name"
                          className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white outline-none transition
        ${formErrors[`${index}-name`]
                              ? "border-red-400 focus:ring-2 focus:ring-red-200"
                              : "border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            }`}
                        />

                        {formErrors[`${index}-name`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors[`${index}-name`]}
                          </p>
                        )}
                      </div>

                      {/* Age */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Age *
                        </label>

                        <input
                          type="number"
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(index, "age", e.target.value)}
                          className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white outline-none transition
        ${formErrors[`${index}-age`]
                              ? "border-red-400 focus:ring-2 focus:ring-red-200"
                              : "border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            }`}
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Gender *
                        </label>

                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(index, "gender", e.target.value)}
                          className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white outline-none transition
        ${formErrors[`${index}-gender`]
                              ? "border-red-400 focus:ring-2 focus:ring-red-200"
                              : "border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            }`}
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Mobile Number *
                        </label>

                        <input
                          type="tel"
                          value={passenger.contactDetails}
                          onChange={(e) => handlePassengerChange(index, "contactDetails", e.target.value)}
                          placeholder="10-digit number"
                          className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white outline-none transition
        ${formErrors[`${index}-contactDetails`]
                              ? "border-red-400 focus:ring-2 focus:ring-red-200"
                              : "border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            }`}
                        />
                      </div>

                      {/* Berth */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Berth Preference
                        </label>

                        <select
                          value={passenger.berthPreference || ""}
                          onChange={(e) =>
                            handlePassengerChange(index, "berthPreference", e.target.value)
                          }
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        >
                          <option value="">Select</option>
                          <option value="lowerberth">Lower Berth</option>
                          <option value="middleberth">Middle Berth</option>
                          <option value="upperberth">Upper Berth </option>
                          <option value="sidelower">Side Lower</option>
                          <option value="sideupper">Side Upper</option>
                        </select>
                      </div>

                    </div>

                    <div className="mt-4 p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Auto Upgradation
                        </p>
                        <p className="text-xs text-gray-500">
                          Upgrade if seats available
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={passenger.upgradeAllowed}
                        onChange={(e) => handlePassengerChange(index, "upgradeAllowed", e.target.checked)}
                      />
                    </div>


                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 ">
                <FaInfoCircle className="text-blue-500" />
                <p className="text-xs text-blue-800">
                  Berth preference is subject to availability. IRCTC allocates berths automatically if preference not available.
                </p>
                <FaInfoCircle className="text-blue-500" />
                <p className="text-xs text-blue-800">
                  Please ensure all passenger details match government-issued ID exactly.
                  Incorrect information may lead to boarding issues.
                </p>
              </div>


            </div>

          </form>
        </motion.div>.
      </div >
    </div >
  );
};

export default BookingPage;
