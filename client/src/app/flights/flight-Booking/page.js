'use client'
import SeatMap from '@/components/flightSeatMap';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { FaChair } from 'react-icons/fa';
import { MdChair, MdChairAlt } from 'react-icons/md';








// FlightSegmentCard Component - Improved version with safe class names
const FlightSegmentCard = ({ flight, type }) => {
  const getTypeStyles = (type) => {
    switch (type) {
      case 'onward':
        return {
          borderColor: 'border-blue-200',
          headerBg: 'bg-blue-100',
          headerIcon: 'text-blue-600',
          timelineColor: 'bg-blue-500',
          timelineDot: 'bg-blue-500',
          cardBg: 'bg-blue-50/50'
        };
      case 'return':
        return {
          borderColor: 'border-green-200',
          headerBg: 'bg-green-100',
          headerIcon: 'text-green-600',
          timelineColor: 'bg-green-500',
          timelineDot: 'bg-green-500',
          cardBg: 'bg-green-50/50'
        };
      default:
        return {
          borderColor: 'border-slate-200',
          headerBg: 'bg-slate-100',
          headerIcon: 'text-slate-600',
          timelineColor: 'bg-slate-500',
          timelineDot: 'bg-slate-500',
          cardBg: 'bg-slate-50/50'
        };
    }
  };

  const styles = getTypeStyles(type);
  const isOnward = type === 'onward';

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8 border ${styles.borderColor}`}>
      <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
        <div className={`w-10 h-10 ${styles.headerBg} rounded-lg flex items-center justify-center`}>
          {isOnward ? (
            <svg className={`w-5 h-5 ${styles.headerIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 ${styles.headerIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18m0 0l-4-4m4 4l4-4" />
            </svg>
          )}
        </div>
        {isOnward ? 'Onward Flight' : 'Return Flight'}
      </h2>

      <div className="flex items-center mb-8 p-4 rounded-xl border border-slate-200 bg-white">
        <div className="w-16 h-16 bg-white rounded-lg shadow-xs flex items-center justify-center p-2 border border-slate-200 mr-4">
          <img
            src={flight.airline.logo}
            alt={`${flight.airline.name} logo`}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-lg">{flight.airline.name} ⎯ {flight.flightNumber}</h3>
          <p className="text-slate-600 font-medium">{flight.preferredClass} • {new Date(flight.departureTime).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}</p>
           <p className="text-slate-600 font-medium">{flight.aircraft.name}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">₹ {flight.price}</div>
          <div className="text-slate-500 text-sm">per passenger</div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-slate-50/80 p-6 rounded-xl border border-slate-200">
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-slate-900 mb-1">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="font-semibold text-slate-800 mb-1">{flight.departure}</div>
          <div className="text-slate-600 text-sm">{flight.from.city}</div>
          <div className="text-xs text-slate-500 mt-2">Terminal {flight.from.terminal}</div>
        </div>

        <div className="flex flex-col items-center mx-8 flex-1">
          <div className="text-slate-600 text-sm font-medium mb-2">{flight.duration}</div>
          <div className="relative w-full">
            <div className="w-full h-0.5 bg-slate-300"></div>
            <div className={`absolute top-1/2 left-0 right-0 h-0.5 ${styles.timelineColor} transform -translate-y-1/2`}></div>
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 ${styles.timelineDot} rounded-full`}></div>
          </div>
          <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full mt-2">Direct Flight</div>
        </div>

        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-slate-900 mb-1">{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="font-semibold text-slate-800 mb-1">{flight.arrival}</div>
          <div className="text-slate-600 text-sm">{flight.to.city}</div>
          <div className="text-xs text-slate-500 mt-2">Terminal {flight.to.terminal}</div>
        </div>
      </div>
    </div>
  );
};

const FlightBookingPage = () => {
  const { selectedFlight, selectedOnward, selectedReturn } = useSelector(store => store.flights);
  const { selectedAircraft, selectedOnwardAircraft, selectedReturnAircraft } = useSelector(store => store.flights);
  const { userQueries } = useSelector(store => store.flights);
  console.log('this is selected tripType', userQueries.tripType);
  console.log('this is selected flight', selectedFlight);
  console.log('this is selected aircraft', selectedAircraft);
  console.log('this is selected flight class', selectedFlight?.class);
  console.log('this is user preffered class', userQueries.class);
  console.log('this is selected onward flight', selectedOnward?._id);
  console.log('this is selected return flight', selectedReturn?._id);
  console.log('this is selectedOnward Aircraft', selectedOnwardAircraft);
  console.log('this is selectedReturn Aircraft', selectedReturnAircraft);
  const flightData = selectedFlight;
  console.log('this is selected flight price', flightData?.price);
  const [selectedClass, setSelectedClass] = useState(flightData?.preferredClass || selectedOnward?.preferredClass || selectedReturn?.preferredClass);
  const [selectedSeat, setSelectedSeat] = useState({
    seatNo : '',
    seatRow : '',
    seatType : '',
  });
  const [onwardSelectedSeat, setOnwardSelectedSeat] = useState({
    seatNo : '',
    seatRow : '',
    seatType : '',
  });
  const [returnSelectedSeat, setReturnSelectedSeat] =useState({
    seatNo : '',
    seatRow : '',
    seatType : '',
  });


  if(selectedSeat){
    console.log('this is selected seat  : ',selectedSeat.seatRow , selectedSeat.seatNo , selectedSeat.seatType);
    console.log('this is onwardselected seat  : ',onwardSelectedSeat.seatRow , onwardSelectedSeat.seatNo , onwardSelectedSeat.seatType,);
    console.log('this is returnselected seat  : ',returnSelectedSeat.seatRow , returnSelectedSeat.seatNo , returnSelectedSeat.seatType);
  }else{null}



  const handleSeatSelect = (seat) => {
    setSelectedSeats((prev) => {
      const alreadySelected = prev.find((s) => s.seatNo === seat.seatNo);
      if (alreadySelected) {
        // Deselect seat
        return prev.filter((s) => s.seatNo !== seat.seatNo);
      } else {
        // Select new seat
        return [...prev, seat];
      }
    });
  };


  const stripePromise = loadStripe("pk_test_51RI5XlR8UlCNetg1dO3Ix1WwY03LS1SGxrU5SmAznW2sDCfW3B4SYpTjknU5oxe4bPVPeWRJkPn0jyinELvWIu7p00lPLBQam4");




  const [formData, setFormData] = useState({
    passengers: [
      {
        title: 'Mr',
        firstName: '',
        lastName: '',
        gender: 'Male',
        dob: '',
        passport: '',
        passportExpiry: '',
        nationality: '',
        mealPreference: 'Standard',
        seatPreference: 'No Preference',
        onwardSeatPreference: 'No Preference',
        returnSeatPreference: 'No Preference',
      }
    ],
    contact: {
      email: '',
      phone: '',
      countryCode: '+1'
    },
    agreeToTerms: false,
    receiveUpdates: true
  });

  // const selectedOnwardDate = new Date(selectedOnward.departureTime).toISOString();
  // const selectedReturnDate = new Date(selectedReturn.departureTime).toISOString();
  // const selectedFlightDate = new Date(selectedFlight.departureTime).toISOString();


  // console.log(selectedFlightDate ,selectedOnwardDate, selectedReturnDate);



  const [currentPassenger, setCurrentPassenger] = useState(0);



  const fareBreakdown = {
    baseFare: 520,
    tax: 86.20,
    convenienceFee: 38.80,
    total: flightData?.price
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...formData.passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setFormData({
      ...formData,
      passengers: updatedPassengers
    });
  };

  const handleContactChange = (field, value) => {
    setFormData({
      ...formData,
      contact: {
        ...formData.contact,
        [field]: value
      }
    });
  };

  const addPassenger = () => {
    if (formData.passengers.length < 9) {
      setFormData({
        ...formData,
        passengers: [
          ...formData.passengers,
          {
            title: 'Mr',
            firstName: '',
            lastName: '',
            gender: 'Male',
            dob: '',
            passport: '',
            passportExpiry: '',
            nationality: '',
            mealPreference: 'Standard',
            seatPreference: 'No Preference',
            onwardSeatPreference: 'No Preference',
            returnSeatPreference: 'No Preference',
          }
        ]
      });
    }
  };

  const removePassenger = (index) => {
    if (formData.passengers.length > 1) {
      const updatedPassengers = [...formData.passengers];
      updatedPassengers.splice(index, 1);
      setFormData({
        ...formData,
        passengers: updatedPassengers
      });
      if (currentPassenger >= updatedPassengers.length) {
        setCurrentPassenger(updatedPassengers.length - 1);
      }
    }
  };

  const normalizeFlightData = (flight) => {
    if (!flight) return null;

    return {
      _id: flight._id,
      flightNo: flight.flightNumber || flight.flightNo,
      airline: {
        name: flight.airline?.name,
        logo: flight.airline?.logo
      },
      from: {
        code: flight.from?.code,
        city: flight.from?.city,
        terminal: flight.from?.terminal
      },
      to: {
        code: flight.to?.code,
        city: flight.to?.city,
        terminal: flight.to?.terminal
      },
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      journeyDate: flight.departureTime, // Map to journeyDate for AirlineTicket
      duration: flight.duration,
      price: typeof flight.price === 'object' ?
        flight.price[preferredClass] || Object.values(flight.price)[0] :
        flight.price,
      class: flight.preferredClass
    };
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      alert("You must agree to the terms before proceeding.");
      return;
    }

    try {
      const stripe = await stripePromise;

      if (!formData.passengers || formData.passengers.length === 0) {
        alert("Please add at least one passenger.");
        return;
      }

      const preferredClass = (userQueries?.class || "economy").toLowerCase();
      const tripTypeNormalized = userQueries.tripType || "oneWay";

      const passengersWithContact = formData.passengers.map((p) => ({
        ...p,
        contact: formData.contact
      }));

      // --- Determine flight IDs for minimalData ---
      let flightIdForOneWay = selectedFlight?._id || selectedOnward?._id;
      let onwardId = selectedOnward?._id;
      let returnId = selectedReturn?._id;

      // Validate flight selection
      if (tripTypeNormalized === "oneWay" && !flightIdForOneWay) {
        alert("Cannot proceed: no flight selected for one-way trip.");
        return;
      }

      if (tripTypeNormalized === "roundTrip" && (!onwardId || !returnId)) {
        alert("Cannot proceed: missing onward or return flight for round-trip.");
        return;
      }

      // --- Build minimalData to store in localStorage ---
      const minimalData = {
        tripType: tripTypeNormalized,
        preferredClass : selectedFlight?.preferredClass || selectedOnward?.preferredClass || selectedReturn?.preferredClass,
        selectedSeat,
        onwardSelectedSeat,
        returnSelectedSeat,
        passengers: passengersWithContact,
        flightId: tripTypeNormalized === "oneWay" ? flightIdForOneWay : undefined,
        onwardFlightId: tripTypeNormalized === "roundTrip" ? onwardId : undefined,
        returnFlightId: tripTypeNormalized === "roundTrip" ? returnId : undefined,

      };

      console.log("✅ minimalData to save:", minimalData);
      localStorage.setItem("bookingData", JSON.stringify(minimalData));

      // --- Build full requestData for Stripe ---
      let requestData = {
        passengers: passengersWithContact,
        contact: formData.contact,
        preferredClass : selectedFlight?.preferredClass || selectedOnward?.preferredClass || selectedReturn?.preferredClass,
        tripType: tripTypeNormalized,
      };

      if (tripTypeNormalized === "oneWay") {
        requestData.flight = {
          ...normalizeFlightData(selectedFlight || selectedOnward, selectedFlight.preferredClass),
          journeyDate: new Date((selectedFlight || selectedOnward).departureTime).toISOString(),
          price: selectedFlight?.price || selectedOnward?.price,
        };
        requestData.aircraftId = selectedAircraft?._id || selectedAircraft;
        requestData.totalAmount = requestData.flight.price * passengersWithContact.length;
      } else {
        requestData.onwardFlight = {
          ...normalizeFlightData(selectedOnward, preferredClass),
          journeyDate: new Date(selectedOnward.departureTime).toISOString(),
          price: selectedOnward.price,
        };
        requestData.returnFlight = {
          ...normalizeFlightData(selectedReturn, preferredClass),
          journeyDate: new Date(selectedReturn.departureTime).toISOString(),
          price: selectedReturn.price,
        };
        requestData.aircraftId1 = selectedOnwardAircraft?._id || selectedOnwardAircraft;
        requestData.aircraftId2 = selectedReturnAircraft?._id || selectedReturnAircraft;
        requestData.totalAmount =
          (selectedOnward.price + selectedReturn.price) * passengersWithContact.length;
      }

      console.log("📦 requestData for Stripe:", requestData);

      // --- Call backend to create Stripe checkout session ---
      const response = await axios.post(
        "http://localhost:8000/api/v1/payment-flight/create-checkout-session",
        requestData,
        { headers: { "Content-Type": "application/json" } }
      );

      const session = response?.data;
      if (!session?.id) throw new Error("Failed to create checkout session");

      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result?.error) alert("Payment redirection failed: " + result.error.message);
    } catch (err) {
      console.error("Stripe Checkout error:", err);
      alert("Something went wrong with payment: " + (err.response?.data?.message || err.message));
    }
  };








  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 py-8 relative">
      {/* Sophisticated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-4 w-72 h-72 bg-blue-100 rounded-full blur-6xl opacity-40"></div>
        <div className="absolute bottom-1/3 -left-4 w-72 h-72 bg-slate-200 rounded-full blur-6xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100 rounded-full blur-6xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Professional Header */}
        <header className="mb-8 bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 mb-2">Complete Your Booking</h1>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure SSL Encryption
                </span>
                <span className="text-slate-600 text-sm font-medium">Review details and complete passenger information</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">Booking Reference</div>
              <div className="text-lg font-mono font-semibold text-slate-800">BK-{Math.random().toString(36).substr(2, 8).toUpperCase()}</div>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Enhanced Forms */}
          <div className="lg:w-2/3">
            {/* Flight Details - Premium Design */}
            {selectedFlight ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8 mb-8 border border-slate-200/80">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    Flight Details
                  </h2>
                  <div className="text-sm text-slate-500"><Badge className={'bg-blue-400 text-lg font-mono'}>{flightData.preferredClass}</Badge> • {userQueries.passengers} Passenger{userQueries.passengers > 1 ? 's' : ''}</div>
                </div>

                <div className="bg-slate-50/80 rounded-xl p-6 mb-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white rounded-lg shadow-xs flex items-center justify-center p-2 border border-slate-200">
                        <img src={flightData.airline.logo} alt={flightData.airline.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{flightData.airline.name}</h3>
                        <p className="text-slate-600 text-sm">Flight {flightData.flightNumber} • {flightData.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">${flightData.price}</div>
                      <div className="text-slate-500 text-sm">per passenger</div>
                    </div>
                  </div>

                  {/* Enhanced Flight Timeline */}
                  <div className="flex items-center justify-between py-6">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-slate-900 mb-1">{new Date(flightData.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="font-semibold text-slate-800 mb-1">{flightData.departure}</div>
                      <div className="text-slate-600 text-sm">{flightData.from.city}</div>
                      <div className="text-xs text-slate-500 mt-2">Terminal {flightData.from.terminal}</div>
                    </div>

                    <div className="flex flex-col items-center mx-8 flex-1">
                      <div className="text-slate-600 text-sm font-medium mb-2">{flightData.duration}</div>
                      <div className="relative w-full">
                        <div className="w-full h-0.5 bg-slate-300"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 transform -translate-y-1/2"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full mt-2">Direct Flight</div>
                    </div>

                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-slate-900 mb-1">{new Date(flightData.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="font-semibold text-slate-800 mb-1">{flightData.arrival}</div>
                      <div className="text-slate-600 text-sm">{flightData.to.city}</div>
                      <div className="text-xs text-slate-500 mt-2">Terminal {flightData.to.terminal}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex flex-col gap-6'>
                {selectedOnward && <FlightSegmentCard flight={selectedOnward} type="onward" />}
                {selectedReturn && <FlightSegmentCard flight={selectedReturn} type="return" />}
              </div>
            )}

            {/* Enhanced Passenger Details */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8 mb-8 border border-slate-200/80">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Passenger Details
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => removePassenger(currentPassenger)}
                    disabled={formData.passengers.length <= 1}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors duration-200"
                  >
                    Remove
                  </button>
                  <button
                    onClick={addPassenger}
                    disabled={formData.passengers.length >= 9}
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-800 transition-colors duration-200"
                  >
                    Add Passenger
                  </button>
                </div>
              </div>

              {/* Professional Passenger Navigation */}
              <div className="flex overflow-x-auto mb-8 pb-2 gap-2 scrollbar-hide">
                {formData.passengers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPassenger(index)}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap border ${currentPassenger === index
                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    Passenger {index + 1}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-200">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                      <select
                        value={formData.passengers[currentPassenger].title}
                        onChange={(e) => handlePassengerChange(currentPassenger, 'title', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        required
                      >
                        <option value="Mr">Mr</option>
                        <option value="Ms">Ms</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Mx">Mx</option>
                        <option value="Dr">Dr</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                      <select
                        value={formData.passengers[currentPassenger].gender}
                        onChange={(e) => handlePassengerChange(currentPassenger, 'gender', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.passengers[currentPassenger].firstName}
                        onChange={(e) => handlePassengerChange(currentPassenger, 'firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                        placeholder="Enter legal first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.passengers[currentPassenger].lastName}
                        onChange={(e) => handlePassengerChange(currentPassenger, 'lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                        placeholder="Enter legal last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.passengers[currentPassenger].dob}
                        onChange={(e) => handlePassengerChange(currentPassenger, 'dob', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nationality</label>
                      <input
                        type="text"
                        value={formData.passengers[currentPassenger].nationality}
                        onChange={(e) => handlePassengerChange(currentPassenger, 'nationality', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                        placeholder="Your nationality"
                      />
                    </div>
                  </div>
                </div>

                {/* Travel Documents Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-200">Travel Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Passport Number</label>
                      <input
                        type="text"
                        value={formData.passengers[currentPassenger].passport}
                        onChange={(e) => handlePassengerChange(currentPassenger, 'passport', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                        placeholder="Enter passport number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Passport Expiry</label>
                      <input
                        type="date"
                        value={formData.passengers[currentPassenger].passportExpiry}
                        onChange={(e) => handlePassengerChange(currentPassenger, 'passportExpiry', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Travel Preferences Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-200">Travel Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {userQueries.tripType === 'roundTrip' ? (
                      <div className='flex gap-10'>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Onward Seat Selection
                          </label>

                          <Drawer>
                            <DrawerTrigger asChild>
                              <Button
                                type="button"
                                className="w-full justify-between bg-white border-2 border-blue-400 text-slate-700 hover:bg-slate-50"
                              >
                                {formData.passengers[currentPassenger].onwardSeatPreference
                                  ? ` ${formData.passengers[currentPassenger].onwardSeatPreference}`
                                  : "Choose Seat"}
                                <span className="text-blue-500 text-sm ml-2"><MdChair /></span>
                              </Button>
                            </DrawerTrigger>

                            <DrawerContent className="h-[90vh] bg-slate-950 border-t border-slate-700 rounded-t-3xl overflow-hidden">
                              {/* Header */}
                              <DrawerHeader className="border-b border-slate-800 pb-4 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20">
                                <DrawerTitle className="text-xl font-semibold text-white">{selectedOnward?.airline.name} │ {selectedOnward?.aircraft.name} │ {selectedOnward?.flightNumber}</DrawerTitle>
                              </DrawerHeader>

                              {/* Scrollable Seat Map Section */}
                              <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="max-w-6xl mx-auto">
                                  <SeatMap
                                    flight={selectedOnward}
                                    aircraft={selectedOnward?.aircraft}
                                    selectedClass={selectedClass}
                                    selectedSeat={onwardSelectedSeat} // single seat instead of array
                                    onSeatSelect={(seat) => {
                                      // If same seat clicked again, unselect it
                                      setOnwardSelectedSeat((prev) =>
                                        prev?.seatNo === seat.seatNo ? null : seat
                                      );

                                      // Update passenger seat in form data
                                      handlePassengerChange(currentPassenger, "onwardSeatPreference", seat.seatNo);
                                      setOnwardSelectedSeat({ seatRow : seat.rowNo , seatNo : seat.seatNo, seatType:seat.seatType});
                                    }}
                                  />


                                </div>
                              </div>

                              {/* Footer (Sticky Confirm Button) */}
                              <div className="border-t border-slate-700 bg-slate-900/90 backdrop-blur-md sticky bottom-0 z-20 p-4 flex justify-end">
                                <DrawerClose asChild>
                                  <Button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                                    Confirm Seat
                                  </Button>
                                </DrawerClose>
                              </div>
                            </DrawerContent>

                          </Drawer>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Return seat selection
                          </label>

                          <Drawer>
                            <DrawerTrigger asChild>
                              <Button
                                type="button"
                                className="w-full justify-between bg-white border-2 border-blue-400 text-slate-700 hover:bg-slate-50"
                              >
                                {formData.passengers[currentPassenger].returnSeatPreference
                                  ? ` ${formData.passengers[currentPassenger].returnSeatPreference}`
                                  : "Choose Seat"}
                                <span className="text-blue-500 text-sm ml-2"><MdChair /></span>
                              </Button>
                            </DrawerTrigger>

                            <DrawerContent className="h-[90vh] bg-slate-950 border-t border-slate-700 rounded-t-3xl overflow-hidden">
                              {/* Header */}
                              <DrawerHeader className="border-b border-slate-800 pb-4 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20">
                                <DrawerTitle className="text-xl font-semibold text-white">{selectedReturn?.airline.name} │ {selectedReturn?.aircraft.name} │ {selectedReturn?.flightNumber}</DrawerTitle>
                              </DrawerHeader>

                              {/* Scrollable Seat Map Section */}
                              <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="max-w-6xl mx-auto">
                                <SeatMap
                                    flight={selectedReturn}
                                    aircraft={selectedReturn?.aircraft}
                                    selectedClass={selectedClass}
                                    selectedSeat={returnSelectedSeat} // single seat instead of array
                                    onSeatSelect={(seat) => {
                                      // If same seat clicked again, unselect it
                                      setReturnSelectedSeat((prev) =>
                                        prev?.seatNo === seat.seatNo ? null : seat
                                      );

                                      // Update passenger seat in form data
                                      handlePassengerChange(currentPassenger, "returnSeatPreference", seat.seatNo);
                                      setReturnSelectedSeat({ seatRow : seat.rowNo , seatNo : seat.seatNo, seatType:seat.seatType});
                                    }}
                                  />

                                </div>
                              </div>

                              {/* Footer (Sticky Confirm Button) */}
                              <div className="border-t border-slate-700 bg-slate-900/90 backdrop-blur-md sticky bottom-0 z-20 p-4 flex justify-end">
                                <DrawerClose asChild>
                                  <Button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                                    Confirm Seat
                                  </Button>
                                </DrawerClose>
                              </div>
                            </DrawerContent>

                          </Drawer>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Seat Selection
                        </label>

                        <Drawer>
                          <DrawerTrigger asChild>
                            <Button
                              type="button"
                              className="w-full justify-between bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              {formData.passengers[currentPassenger].seatAssigned
                                ? `Seat ${formData.passengers[currentPassenger].seatAssigned}`
                                : "Choose Seat"}
                              <span className="text-blue-500 text-sm ml-2"><MdChair /></span>
                            </Button>
                          </DrawerTrigger>

                          <DrawerContent className="h-[90vh] bg-slate-950 border-t border-slate-700 rounded-t-3xl overflow-hidden">
                            {/* Header */}
                            <DrawerHeader className="border-b border-slate-800 pb-4 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20">
                              <DrawerTitle className="text-xl font-semibold text-white">{flightData?.airline.name} │ {flightData?.aircraft.name} │ {flightData?.flightNumber}</DrawerTitle>
                            </DrawerHeader>

                            {/* Scrollable Seat Map Section */}
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                              <div className="max-w-6xl mx-auto">
                              <SeatMap
                                    flight={flightData}
                                    aircraft={flightData?.aircraft}
                                    selectedClass={selectedClass}
                                    selectedSeat={selectedSeat} // single seat instead of array
                                    onSeatSelect={(seat) => {
                                      // If same seat clicked again, unselect it
                                      setSelectedSeat((prev) =>
                                        prev?.seatNo === seat.seatNo ? null : seat
                                      );

                                      // Update passenger seat in form data
                                      handlePassengerChange(currentPassenger, "seatAssigned", seat.seatNo);
                                       setSelectedSeat({ seatRow : seat.rowNo , seatNo : seat.seatNo, seatType:seat.seatType});
                                    }}
                                  />
                              </div>
                            </div>

                            {/* Footer (Sticky Confirm Button) */}
                            <div className="border-t border-slate-700 bg-slate-900/90 backdrop-blur-md sticky bottom-0 z-20 p-4 flex justify-end">
                              <DrawerClose asChild>
                                <Button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                                  Confirm Seat
                                </Button>
                              </DrawerClose>
                            </div>
                          </DrawerContent>

                        </Drawer>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Meal Preference</label>
                      <select
                        value={formData.passengers[currentPassenger].mealPreference}
                        onChange={(e) => handlePassengerChange(currentPassenger, 'mealPreference', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      >
                        <option value="Standard">Standard Meal</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="GlutenFree">Gluten-Free</option>
                        <option value="Halal">Halal</option>
                        <option value="Kosher">Kosher</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Enhanced Contact Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-200 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={formData.contact.email}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                        placeholder="your.email@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Country Code</label>
                      <select
                        value={formData.contact.countryCode}
                        onChange={(e) => handleContactChange('countryCode', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        required
                      >
                        <option value="+1">+1 (United States)</option>
                        <option value="+44">+44 (United Kingdom)</option>
                        <option value="+91">+91 (India)</option>
                        <option value="+61">+61 (Australia)</option>
                        <option value="+49">+49 (Germany)</option>
                        <option value="+33">+33 (France)</option>
                        <option value="+81">+81 (Japan)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.contact.phone}
                        onChange={(e) => handleContactChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                        placeholder="Enter mobile number"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Terms & Conditions */}
                <div className="border-t border-slate-200 pt-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    Terms & Conditions
                  </h3>

                  <div className="bg-slate-50/80 p-6 rounded-xl mb-6 max-h-64 overflow-y-auto border border-slate-200">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Fare Rules & Conditions</h4>
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
                          <li>This fare is non-refundable but may be changed for a fee of $100 plus any fare difference</li>
                          <li>Changes must be made at least 24 hours before scheduled departure time</li>
                          <li>Name changes and passenger substitutions are strictly prohibited</li>
                          <li>Seat assignments are subject to availability and aircraft configuration</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Baggage Policy</h4>
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
                          <li>Each passenger is permitted one cabin bag (maximum 7kg) and one personal item</li>
                          <li>Checked baggage allowance: 23kg per passenger in Economy class</li>
                          <li>Excess baggage fees apply for additional weight or oversized items</li>
                          <li>Sports equipment and special items require advance notification</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Check-in Requirements</h4>
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
                          <li>Online check-in available 24 hours to 2 hours before departure</li>
                          <li>Airport check-in counter closes 60 minutes before scheduled departure</li>
                          <li>Valid government-issued photo ID and travel documents required</li>
                          <li>International flights require passport validity of 6 months minimum</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={() => setFormData({ ...formData, agreeToTerms: !formData.agreeToTerms })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mt-1"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-slate-700">
                        I acknowledge that I have read and agree to the{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms & Conditions</a>,{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>, and{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Fare Rules</a>
                      </label>
                    </div>

                    <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                      <input
                        id="updates"
                        type="checkbox"
                        checked={formData.receiveUpdates}
                        onChange={() => setFormData({ ...formData, receiveUpdates: !formData.receiveUpdates })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mt-1"
                      />
                      <label htmlFor="updates" className="text-sm text-slate-700">
                        I wish to receive travel updates, flight status notifications, and promotional offers
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!formData.agreeToTerms}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-xs hover:shadow-md disabled:hover:shadow-xs flex items-center justify-center gap-3 group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Proceed to Payment - ₹{(flightData?.price || selectedOnward?.price + selectedReturn?.price) * formData.passengers.length}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>




          {/* Enhanced Summary Panel */}
          <div className="lg:w-1/3">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-6 sticky top-6 border border-slate-200/80">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 pb-4 border-b border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Booking Summary
              </h2>

              <div className="mb-6 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Base Fare</span>
                  <span className="font-semibold text-slate-900">${fareBreakdown.baseFare * formData.passengers.length}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Taxes & Fees</span>
                  <span className="font-semibold text-slate-900">${fareBreakdown.tax * formData.passengers.length}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Service Charge</span>
                  <span className="font-semibold text-slate-900">${fareBreakdown.convenienceFee}</span>
                </div>

                <div className="border-t border-slate-200 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900">Total Amount</span>
                    <span className="text-xl font-bold text-slate-900">
                      ₹{(flightData?.price || selectedOnward?.price + selectedReturn?.price) * formData.passengers.length}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Including all taxes and charges</div>
                </div>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-emerald-900 text-sm">Secure Payment</div>
                      <div className="text-emerald-700 text-xs">256-bit SSL encrypted transaction</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900 text-sm">24/7 Support</div>
                      <div className="text-blue-700 text-xs">Dedicated customer service team</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightBookingPage;