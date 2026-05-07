'use client'

import { FlightCard } from '@/components/flightCard'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  setSelectedAircraft,
  setSelectedFlight,
  setSelectedOnward,
  setSelectedOnwardAircraft,
  setSelectedReturn,
  setSelectedReturnAircraft,
  setUserFlights,
  setUserQueries,
} from '@/redux/flightRedux/flightSlice'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const FlightSearchPage = () => {
  const [date, setDate] = React.useState(new Date());
  const [isSelected, setSelected] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()
  const { userFlights } = useSelector((store) => store.flights)
  console.log('userflights:', userFlights);
  const { selectedOnward, selectedReturn } = useSelector((store) => store.flights)
  const { userQueries } = useSelector((store) => store.flights)
  const [isSearching, setIsSearching] = useState(false);
  console.log('userQueries:', userQueries)
  const [selectedCalendar, setSelectedCalendar] = useState("onward");
  const [onwardDate, setOnwardDate] = useState(userQueries.date);
  const [returnDate, setReturnDate] = useState(userQueries.returnDate);

  // Convert userQueries type to camelCase if needed
  const initialTripType = userQueries.tripType === 'round-trip' ? 'roundTrip' :
    userQueries.type === 'one-way' ? 'oneWay' :
      userQueries.type === 'multi-city' ? 'multiCity' :
        userQueries.tripType || 'roundTrip';

  const [searchParams, setSearchParams] = useState({
    from: userQueries?.from || "",
    to: userQueries?.to || "",
    date: userQueries?.date || "",
    returnDate: userQueries?.return || "",
    travelers: userQueries?.travelers || "1 Traveler",
    preferredClass: userQueries?.preferredClass || "Economy",
    tripType: initialTripType
  });

  const [showTravelerOptions, setShowTravelerOptions] = useState(false)
  const [travelerCounts, setTravelerCounts] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  })

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: [0, 20000],
    airlines: [],
    stops: 'any',
    departureTime: [],
    arrivalTime: [],
  })

  // Filtered flights state
  const [filteredFlights, setFilteredFlights] = useState({
    onward: [],
    return: []
  })

  // Extract all unique airlines from flights
  const getAllAirlines = () => {
    const airlines = new Set();

    if (userFlights?.onward) {
      userFlights.onward.forEach(flight => {
        if (flight.airline?.name) {
          airlines.add(flight.airline.name);
        }
      });
    }

    if (userFlights?.return) {
      userFlights.return.forEach(flight => {
        if (flight.airline?.name) {
          airlines.add(flight.airline.name);
        }
      });
    }

    return Array.from(airlines);
  }

  // Apply filters to flights
  const applyFilters = () => {
    if (!userFlights) return;

    const filterFlight = (flight) => {
      // Price filter
      if (flight.price < filters.priceRange[0] || flight.price > filters.priceRange[1]) {
        return false;
      }

      // Airline filter
      if (filters.airlines.length > 0 && flight.airline?.name) {
        if (!filters.airlines.includes(flight.airline.name)) {
          return false;
        }
      }

      // Stops filter (you'll need to add stops data to your flight objects)
      // For now, this is a placeholder - you'll need to implement based on your actual data structure
      if (filters.stops !== 'any') {
        // Implement stop filtering logic based on your flight data
        // Example: if (flight.stops !== filters.stops) return false;
      }

      // Departure time filter (you can implement based on flight.departureTime)
      if (filters.departureTime.length > 0) {
        // Implement time filtering logic
      }

      return true;
    };

    const filteredOnward = userFlights.onward ? userFlights.onward.filter(filterFlight) : [];
    const filteredReturn = userFlights.return ? userFlights.return.filter(filterFlight) : [];

    setFilteredFlights({
      onward: filteredOnward,
      return: filteredReturn
    });
  }

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [filters, userFlights]);

  // Initialize filtered flights when userFlights changes
  useEffect(() => {
    if (userFlights) {
      setFilteredFlights({
        onward: userFlights.onward || [],
        return: userFlights.return || []
      });
    } else {
      // ✅ Reset when no flights are found
      setFilteredFlights({
        onward: [],
        return: []
      });
    }
  }, [userFlights]);

  const selectedOnwardPrice = selectedOnward?.price || 0;
  const selectedReturnPrice = selectedReturn?.price || 0;
  const totalPrice = selectedOnwardPrice + selectedReturnPrice;

  const handleInputChange = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSwap = () => {
    setSearchParams((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }))
  }

  const handleTravelerChange = (type, delta) => {
    setTravelerCounts((prev) => {
      const newValue = Math.max(0, prev[type] + delta)

      // Validation rules
      if (type === 'infants' && newValue > prev.adults) return prev
      if (type === 'adults' && prev.infants > newValue) {
        return { ...prev, adults: newValue, infants: Math.min(prev.infants, newValue) }
      }

      return { ...prev, [type]: newValue }
    })
  }

  const applyTravelerOptions = () => {
    const total = travelerCounts.adults + travelerCounts.children;
    setSearchParams((prev) => ({
      ...prev,
      travelers: `${total} Traveler${total !== 1 ? 's' : ''}`,
      preferredClass: prev.preferredClass // Ensure this is preserved
    }));
    setShowTravelerOptions(false);
  };

  const handleSearchFlight = async () => {
    if (isSearching) return;

    if (!searchParams.from || !searchParams.to || !searchParams.date) {
      alert('Please fill all required fields to search');
      return;
    }

    console.log('Search params:', searchParams); // Debug log

    // ✅ Fixed: Match the parameter names exactly with your Redux slice
    const userQueriesPayload = {
      from: searchParams.from,
      to: searchParams.to,
      date: searchParams.date,
      return: searchParams.returnDate, // ✅ Your Redux expects 'return', not 'returnDate'
      travelers: searchParams.travelers,
      tripType: searchParams.tripType,
      preferredClass: searchParams.preferredClass // ✅ Fixed: was searchParams.class
    };

    console.log('Dispatching userQueries:', userQueriesPayload);

    // ✅ Update Redux with correct parameter names that match your slice
    dispatch(setUserQueries(userQueriesPayload));

    setIsSearching(true);

    try {
      // ✅ For API call, use the same parameter names as your backend expects
      const apiParams = {
        from: searchParams.from,
        to: searchParams.to,
        date: searchParams.date,
        returnDate: searchParams.returnDate, // Your backend might expect 'returnDate'
        travelers: searchParams.travelers,
        tripType: searchParams.tripType,
        preferredClass: searchParams.preferredClass
      };

      console.log('Making API call with:', apiParams);

      const res = await axios.get('http://localhost:8000/api/v1/flight/flights', {
        params: apiParams,
        withCredentials: true,
      });

      console.log('API Response:', res.data);

      if (res.data.success) {
        console.log('Dispatching flights to Redux');
        dispatch(setUserFlights(res.data.flights));
      } else {
        console.log('API returned success: false', res.data);
        dispatch(setUserFlights(null));
        alert('No flights found. Please try different search criteria.');
      }
    } catch (error) {
      console.log("API Error:", error.response?.data || error.message);
      dispatch(setUserFlights(null));

    } finally {
      setIsSearching(false);
    }
  };

  // Handle airline filter change
  const handleAirlineFilter = (airline, checked) => {
    setFilters(prev => ({
      ...prev,
      airlines: checked
        ? [...prev.airlines, airline]
        : prev.airlines.filter(a => a !== airline)
    }));
  };

  // Handle price range change
  const handlePriceRangeChange = (min, max) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [min, max]
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 20000],
      airlines: [],
      stops: 'any',
      departureTime: [],
      arrivalTime: [],
    });
  };

  // Map trip types to display labels
  const tripTypeDisplay = {
    roundTrip: 'Round Trip',
    oneWay: 'One Way'
  };

  const allAirlines = getAllAirlines();

  return (
    <div className="min-h-screen bg-[#e5eef5] ">
      <div className="max-w-8xl mx-auto px-4 ">
        {/* MakeMyTrip Exact Style Search Bar */}
        <div className="bg-gradient-to-br from-[#0a1929] via-[#0d2847] to-[#1a4d7a] p-10 shadow-2xl overflow-hidden mb-6 relative">
  {/* Decorative Background Elements */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
  </div>

  {/* Trip Type Tabs */}
  <div className="flex bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden mb-8 border border-white/10 relative z-10">
    {Object.entries(tripTypeDisplay).map(([type, label]) => (
      <button
        key={type}
        type="button"
        className={`px-8 py-4 text-sm md:text-base font-heading transition-all duration-300 relative flex-1
          ${searchParams.tripType === type
            ? 'text-white'
            : 'text-gray-300 hover:text-white hover:bg-white/5'}
        `}
        onClick={() => handleInputChange('tripType', type)}
      >
        {searchParams.tripType === type && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm"></div>
        )}
        <span className="relative z-10">{label}</span>
        {searchParams.tripType === type && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400"></div>
        )}
      </button>
    ))}
  </div>

  {/* Search Form */}
  <div className="p-1 relative z-10">
    <div className="flex bg-gradient-to-br from-white via-gray-50 to-blue-50 shadow-2xl overflow-hidden rounded-2xl border border-blue-100">

      {/* FROM */}
      <div className="flex-1 bg-white/80 backdrop-blur-sm font-body p-6 min-w-0 flex flex-col items-center justify-center border-r border-blue-100/50 hover:bg-white transition-all duration-300 group">
        <div className="text-xs text-blue-600 font-bold mb-3 tracking-widest flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
          </svg>
          FROM
        </div>
        <input
          type="text"
          placeholder="Departure city"
          className="w-full text-2xl md:text-3xl text-center font-bold placeholder-gray-300 border-0 p-2 focus:ring-0 focus:outline-none rounded-lg bg-transparent transition-all duration-300 group-hover:placeholder-gray-400"
          value={searchParams.from}
          onChange={(e) => handleInputChange('from', e.target.value)}
        />
      </div>

      {/* Swap Button */}
      <div className="flex items-center justify-center px-3 bg-gradient-to-b from-white to-blue-50">
        <button
          type="button"
          onClick={handleSwap}
          className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 cursor-pointer rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 hover:from-blue-600 hover:to-blue-700 group"
        >
          <svg className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
      </div>

      {/* TO */}
      <div className="flex-1 bg-white/80 backdrop-blur-sm font-body p-6 min-w-0 flex flex-col items-center justify-center border-r border-blue-100/50 hover:bg-white transition-all duration-300 group">
        <div className="text-xs text-blue-600 font-bold mb-3 tracking-widest flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
          </svg>
          TO
        </div>
        <input
          type="text"
          placeholder="Arrival city"
          className="w-full text-2xl md:text-3xl text-center font-bold placeholder-gray-300 border-0 p-2 focus:ring-0 focus:outline-none rounded-lg bg-transparent transition-all duration-300 group-hover:placeholder-gray-400"
          value={searchParams.to}
          onChange={(e) => handleInputChange('to', e.target.value)}
        />
      </div>

      {/* Departure Date */}
      <div className="flex-1 bg-white/80 backdrop-blur-sm font-body border-r border-blue-100/50 p-6 min-w-0 flex flex-col items-center justify-center hover:bg-white transition-all duration-300 group">
        <div className="text-xs text-blue-600 font-bold mb-3 tracking-widest flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
          </svg>
          DEPARTURE
        </div>
        <input
          type="date"
          className="w-full text-xl md:text-2xl text-center font-bold border-0 p-2 focus:ring-0 focus:outline-none rounded-lg bg-transparent cursor-pointer transition-all duration-300"
          value={searchParams.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
        />
      </div>

      {/* Return Date */}
      {searchParams.tripType === 'roundTrip' && (
        <div className="flex-1 bg-white/80 backdrop-blur-sm font-body border-r border-blue-100/50 p-6 min-w-0 flex flex-col items-center justify-center hover:bg-white transition-all duration-300 group animate-fadeIn">
          <div className="text-xs text-blue-600 font-bold mb-3 tracking-widest flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
            </svg>
            RETURN
          </div>
          <input
            type="date"
            className="w-full text-xl md:text-2xl text-center font-bold border-0 p-2 focus:ring-0 focus:outline-none rounded-lg bg-transparent cursor-pointer transition-all duration-300"
            value={searchParams.returnDate || ""}
            onChange={(e) => handleInputChange("returnDate", e.target.value)}
          />
        </div>
      )}

      {/* Class Selector */}
      <div className="flex justify-center items-center bg-gradient-to-b from-white to-blue-50 border-l border-blue-100/50 min-w-0 p-4">
        <RadioGroup
          value={searchParams.preferredClass}
          onValueChange={(value) =>
            setSearchParams((prev) => ({ ...prev, preferredClass: value }))
          }
          className="flex items-center justify-center gap-2"
        >
          {/* Economy */}
          <Label
            htmlFor="economy"
            className={`cursor-pointer px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 font-body shadow-sm hover:shadow-md
              ${searchParams.preferredClass === "economy"
                ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-600 shadow-lg scale-105"
                : "bg-white hover:bg-green-50 border-green-200 text-green-700 hover:border-green-400"
              }`}
          >
            <RadioGroupItem value="economy" id="economy" className="hidden" />
            Economy
          </Label>

          {/* Business */}
          <Label
            htmlFor="business"
            className={`cursor-pointer px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 font-body shadow-sm hover:shadow-md
              ${searchParams.preferredClass === "business"
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-700 shadow-lg scale-105"
                : "bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-400"
              }`}
          >
            <RadioGroupItem value="business" id="business" className="hidden" />
            Business
          </Label>

          {/* First Class */}
          <Label
            htmlFor="first"
            className={`cursor-pointer px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 font-premium shadow-sm hover:shadow-md
              ${searchParams.preferredClass === "first"
                ? "bg-gradient-to-br from-amber-500 to-yellow-600 text-white border-yellow-600 shadow-lg scale-105"
                : "bg-white hover:bg-yellow-50 border-yellow-200 text-yellow-700 hover:border-yellow-400"
              }`}
          >
            <RadioGroupItem value="first" id="first" className="hidden" />
            First
          </Label>
        </RadioGroup>
      </div>

      {/* Search Button */}
      <div className="flex items-center p-3 bg-gradient-to-b from-white to-blue-50">
        <button
          onClick={handleSearchFlight}
          disabled={isSearching}
          type="button"
          className="bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-600 hover:from-blue-700 hover:via-blue-700 hover:to-cyan-700 rounded-xl text-white font-heading px-7 py-7 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 group"
        >
          {isSearching ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>

    </div>
  </div>
</div>


<div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-4">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Filters
                </h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">

                {/* Price Range Filter */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                    </svg>
                    Price Range
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="100"
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(filters.priceRange[0], parseInt(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-blue-900 bg-white px-3 py-1 rounded-lg shadow-sm">₹{filters.priceRange[0]}</span>
                      <span className="text-xs text-gray-500">to</span>
                      <span className="text-sm font-bold text-blue-900 bg-white px-3 py-1 rounded-lg shadow-sm">₹{filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Airlines Filter */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                    </svg>
                    Airlines
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {allAirlines.map(airline => (
                      <label key={airline} className="flex items-center p-2 rounded-lg hover:bg-white/60 transition-colors duration-200 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.airlines.includes(airline)}
                          onChange={(e) => handleAirlineFilter(airline, e.target.checked)}
                          className="h-4 w-4 text-purple-600 focus:ring-2 focus:ring-purple-500 border-gray-300 rounded transition-all duration-200"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 font-medium">{airline}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stops Filter */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    Stops
                  </h4>
                  <div className="space-y-2">
                    {[
                      { value: 'any', label: 'Any' },
                      { value: 'non-stop', label: 'Non-stop' },
                      { value: '1-stop', label: '1 Stop' },
                      { value: '2+-stops', label: '2+ Stops' }
                    ].map(stop => (
                      <label key={stop.value} className="flex items-center p-2 rounded-lg hover:bg-white/60 transition-colors duration-200 cursor-pointer group">
                        <input
                          type="radio"
                          name="stops"
                          checked={filters.stops === stop.value}
                          onChange={() => setFilters({ ...filters, stops: stop.value })}
                          className="h-4 w-4 text-emerald-600 focus:ring-2 focus:ring-emerald-500 border-gray-300 transition-all duration-200"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 font-medium">{stop.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Results Count */}
                <div className="pt-4 border-t border-gray-200">
                  <div className=" p-4 rounded-xl border border-amber-100">
                    {searchParams.tripType === 'roundTrip' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 font-medium">Onward Flights</span>
                          <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-lg">{filteredFlights.onward?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 font-medium">Return Flights</span>
                          <span className="text-sm font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-lg">{filteredFlights.return?.length || 0}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 font-medium">Available Flights</span>
                        <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-lg">{filteredFlights.onward?.length || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-full">
            <div className=" p-1">

              {/* Flight Results */}
              {searchParams.tripType === "roundTrip" ? (
                // Round Trip Layout
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Onward Flights */}
                  <div className=" p-4 ">
                    <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 text-white shadow-xl shadow-blue-400/40 rounded-xl mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm font-bold">
                          <div className="bg-white/20 p-2 rounded-lg mr-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-base">Onward Journey</div>
                            <div className="text-xs font-normal text-blue-100 mt-0.5">{userQueries.from} → {userQueries.to}</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          {filteredFlights?.onward?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {filteredFlights?.onward?.length > 0 ? (
                        <div>
                          {filteredFlights.onward.map((flight, idx) => (
                            <div
                              key={`onward-${idx}`}
                              onClick={() => {
                                if (selectedOnward === flight) {
                                  dispatch(setSelectedOnward(null));
                                } else {
                                  dispatch(setSelectedOnward(flight));
                                }
                              }}
                            >
                              <FlightCard
                                flight={flight}
                                type="onward"
                                tripType={searchParams.tripType}
                                isSelected={selectedOnward === flight}
                                onSelect={() => { }}
                                compact={true}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                          <div className="flex justify-center mb-3">
                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="text-gray-500 text-base font-semibold">No onward flights found</div>
                          <div className="text-gray-400 text-sm mt-1">Try adjusting your filters</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Return Flights */}
                  <div className=" p-4 ">
                    <div className="px-5 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 text-white shadow-xl shadow-green-400/40 rounded-xl mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm font-bold">
                          <div className="bg-white/20 p-2 rounded-lg mr-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-base">Return Journey</div>
                            <div className="text-xs font-normal text-green-100 mt-0.5">{userQueries.to} → {userQueries.from}</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          {filteredFlights?.return?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {filteredFlights?.return?.length > 0 ? (
                        <div>
                          {filteredFlights.return.map((flight, idx) => (
                            <div
                              key={`return-${idx}`}
                              onClick={() => {
                                if (selectedReturn === flight) {
                                  dispatch(setSelectedReturn(null));
                                } else {
                                  dispatch(setSelectedReturn(flight));
                                }
                              }}
                            >
                              <FlightCard
                                flight={flight}
                                type="return"
                                tripType={searchParams.tripType}
                                isSelected={selectedReturn === flight}
                                onSelect={() => { }}
                                compact={true}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                          <div className="flex justify-center mb-3">
                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="text-gray-500 text-base font-semibold">No return flights found</div>
                          <div className="text-gray-400 text-sm mt-1">Try adjusting your filters</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // One Way Layout
                <div className=" p-4 ">
                  <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-400/40 rounded-xl mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm font-bold">
                        <div className="bg-white/20 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-base">One-Way Journey</div>
                          <div className="text-xs font-normal text-blue-100 mt-0.5">{userQueries.from} → {userQueries.to}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        {filteredFlights?.onward?.length || 0} flights
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredFlights?.onward?.length > 0 ? (
                      <div>
                        {filteredFlights.onward.map((flight, idx) => (
                          <div
                            key={`onward-${idx}`}
                            className=""
                          >
                            <FlightCard
                              flight={flight}
                              type="onward"
                              tripType={searchParams.tripType}
                              isSelected={selectedOnward === flight}
                              onSelect={() => {
                                if (selectedOnward === flight) {
                                  dispatch(setSelectedOnward(null));
                                } else {
                                  dispatch(setSelectedOnward(flight));
                                }
                              }}
                              onBook={() => {
                                dispatch(setSelectedFlight(flight));
                                dispatch(setSelectedAircraft(flight.aircraft._id));
                                dispatch(setUserQueries({ ...userQueries, tripType: 'oneWay' }));
                                router.push('/flights/flight-Booking');
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                        <div className="flex justify-center mb-4">
                          <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-gray-600 text-lg font-bold">No flights found</div>
                        <div className="text-gray-500 text-sm mt-2">Try different dates or destinations</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Traveler Options Modal */}
        {showTravelerOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-800">Travelers & Class</h2>
                <button
                  onClick={() => setShowTravelerOptions(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Passengers</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">Adults</div>
                        <div className="text-sm text-gray-500">12+ years</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleTravelerChange('adults', -1)}
                          disabled={travelerCounts.adults <= 1}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center">{travelerCounts.adults}</span>
                        <button
                          onClick={() => handleTravelerChange('adults', 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">Children</div>
                        <div className="text-sm text-gray-500">2-11 years</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleTravelerChange('children', -1)}
                          disabled={travelerCounts.children <= 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center">{travelerCounts.children}</span>
                        <button
                          onClick={() => handleTravelerChange('children', 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">Infants</div>
                        <div className="text-sm text-gray-500">Under 2 years</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleTravelerChange('infants', -1)}
                          disabled={travelerCounts.infants <= 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center">{travelerCounts.infants}</span>
                        <button
                          onClick={() => handleTravelerChange('infants', 1)}
                          disabled={travelerCounts.infants >= travelerCounts.adults}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Cabin Class</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['Economy', 'Premium Economy', 'Business', 'First'].map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${searchParams.preferredClass === cls
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:border-blue-300'
                          }`}
                        onClick={() => handleInputChange('preferredClass', cls)}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={applyTravelerOptions}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Summary Bar */}
      {((selectedOnward || selectedReturn) && searchParams.tripType === 'roundTrip') && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-[#0a233d] border-t border-gray-200 text-white shadow-lg z-40"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">Round Trip</p>
                    <p className="text-xs text-gray-500">2 flights selected</p>
                  </div>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                  {selectedOnward && (
                    <div className="flex items-center">
                      <img src={selectedOnward.airline.logo} alt={selectedOnward.airline.name} className="h-6 w-6 object-contain" />
                      <div className="ml-2">
                        <p className="text-sm font-medium">{selectedOnward.flightNumber}</p>
                        <p className="text-xs text-gray-500">{selectedOnward.from.code} → {selectedOnward.to.code}</p>
                      </div>
                    </div>
                  )}

                  {selectedReturn && (
                    <div className="flex items-center">
                      <img src={selectedReturn.airline.logo} alt={selectedReturn.airline.name} className="h-6 w-6 object-contain" />
                      <div className="ml-2">
                        <p className="text-sm font-medium">{selectedReturn.flightNumber}</p>
                        <p className="text-xs text-gray-500">{selectedReturn.from.code} → {selectedReturn.to.code}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-white">₹{totalPrice || selectedOnward?.price || selectedReturn?.price}</p>
                  <p className="text-xs text-gray-500 line-through">₹14,500</p>
                </div>
                <button
                  onClick={() => {
                    dispatch(setSelectedFlight(null));
                    dispatch(setSelectedOnward(selectedOnward));
                    dispatch(setSelectedReturn(selectedReturn));
                    dispatch(setSelectedOnwardAircraft(selectedOnward.aircraft._id));
                    dispatch(setSelectedReturnAircraft(selectedReturn.aircraft._id));
                    dispatch(setUserQueries({ ...userQueries, tripType: 'roundTrip' }));
                    router.push('/flights/flight-Booking');
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Continue to Book
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default FlightSearchPage