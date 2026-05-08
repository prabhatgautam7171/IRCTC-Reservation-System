'use client'
import { useEffect, useState } from 'react';
import {
  FaTrain, FaPlane, FaBus, FaHotel,
  FaCalendarAlt, FaSyncAlt, FaSearch,
  FaUser, FaHeart, FaShoppingCart,
  FaStar, FaMapMarkerAlt, FaUsers,
  FaUmbrellaBeach, FaCheckSquare, FaWheelchair,
  FaChevronDown, FaTimes, FaChild, FaBaby,
  FaPlus, FaMinus,
  FaBook,
  FaPlaneArrival,
  FaDoorOpen
} from 'react-icons/fa';
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setUserTrains, setSelectedSearch } from '@/redux/trainSlice';
import { setAuthUser } from '@/redux/userSlice';
import axios from 'axios';
import Link from 'next/link';
import { setUserFlights, setUserQueries } from '@/redux/flightRedux/flightSlice';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import myImage from '@/utils/media/C19DB2F5-8238-4DA9-BD43-F6BBA9ABCB99.png';
import planeHero from '@/utils/media/Gemini_Generated_Image_qlo4v4qlo4v4qlo4.png';
import AdminIDCard from '@/components/adminIdCard';
import { BadgeCheck, BookCheck, BookIcon, BookmarkIcon, ChevronDown, Clock, ContactIcon, DoorOpen, Facebook, GiftIcon, Github, IndianRupee, Instagram, Linkedin, Lock, LockIcon, LockKeyhole, LockKeyholeOpen, LogOut, Menu, PlaneIcon, PlaneLanding, PlaneLandingIcon, PlaneTakeoff, PlaneTakeoffIcon, Shield, Ticket, TicketCheckIcon, Train, TrainFrontIcon, TrainFrontTunnel, TrainIcon, TrainTrack, Twitter, User } from 'lucide-react';
import { IoIosTrain, IoMdTrain } from 'react-icons/io';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Select } from 'react-day-picker';
import { SelectArrow } from '@radix-ui/react-select';
import { formatDate } from '@/utils/dateFormat';
import { jwtDecode } from 'jwt-decode';
import { logoutUser } from '@/utils/userLogoutHandler';





const TravelBookingPlatform = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { authUser } = useSelector((store) => store.user);
  const isAdmin = useSelector((store) => store.admin.isAdmin);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ❌ No token or no user
    if (!token || !authUser) {
      dispatch(setAuthUser(null));
      toast.error("You're not logged in yet , Please login to start searching & booking. ");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // ❌ Token expired
      if (decoded.exp < currentTime) {
        dispatch(setAuthUser(null))
        toast.error("Session expired. Please login again");
        logoutUser({ dispatch, router });
      }

    } catch (error) {
      // ❌ Invalid token
      dispatch(setAuthUser(null))
      logoutUser({ dispatch, router });
    }

  }, [authUser]);




  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trains');
  const [tripType, setTripType] = useState('roundTrip');
  const [travelerDrawerOpen, setTravelerDrawerOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    from: 'agra',
    to: 'mathura',
    departure: Date.now(),
    return: '',
    travelers: 1,
    type: 'roundTrip',
    class: 'economy'
  });

  const [multiCitySegments, setMultiCitySegments] = useState([
    { from: '', to: '', departure: '' }
  ]);

  const [travelerOptions, setTravelerOptions] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    class: 'economy'
  });

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [segmentSuggestions, setSegmentSuggestions] = useState(
    multiCitySegments.map(() => ({ from: [], to: [] }))
  );









  // Handle trip type change
  const handleTripTypeChange = (type) => {
    setTripType(type);
    setSearchParams(prev => ({
      ...prev,
      type: type
    }));

    // Clear return date if oneWay is selected
    if (type === 'oneWay') {
      setSearchParams(prev => ({
        ...prev,
        return: ''
      }));
    }
  };

  // Update traveler count
  const updateTravelerCount = (type, operation) => {
    setTravelerOptions(prev => {
      let newValue = prev[type];

      if (operation === 'increment') {
        // Set limits based on type
        const maxValues = {
          adults: 9,
          children: 8,
          infants: prev.adults // Infants can't exceed adults
        };

        if (newValue < maxValues[type]) {
          newValue++;
        }
      } else if (operation === 'decrement') {
        // Set minimum values
        const minValues = {
          adults: 1,
          children: 0,
          infants: 0
        };

        if (newValue > minValues[type]) {
          newValue--;
        }
      }

      return {
        ...prev,
        [type]: newValue
      };
    });
  };

  // // Handle class change
  // const handleClassChange = (newClass) => {
  //   setTravelerOptions(prev => ({
  //     ...prev,
  //     class: newClass
  //   }));
  // };

  // Apply traveler options
  const applyTravelerOptions = () => {
    const totalTravelers = travelerOptions.adults + travelerOptions.children;
    const travelerText = `${totalTravelers} Traveler${totalTravelers !== 1 ? 's' : ''}`;
    const classText = travelerOptions.class.charAt(0).toUpperCase() + travelerOptions.class.slice(1);

    setSearchParams(prev => ({
      ...prev,
      travelers: totalTravelers,
      class: classText
    }));

    setTravelerDrawerOpen(false);
  };

  // Handle multi-city segment changes
  const handleMultiCitySegmentChange = (index, field, value) => {
    const updatedSegments = [...multiCitySegments];
    updatedSegments[index][field] = value;
    setMultiCitySegments(updatedSegments);
  };

  const addMultiCitySegment = () => {
    setMultiCitySegments([...multiCitySegments, { from: "", to: "", departure: "" }]);
    setSegmentSuggestions([...segmentSuggestions, { from: [], to: [] }]); // keep in sync
  };

  const removeMultiCitySegment = (index) => {
    const updatedSegments = multiCitySegments.filter((_, i) => i !== index);
    const updatedSuggestions = segmentSuggestions.filter((_, i) => i !== index);
    setMultiCitySegments(updatedSegments);
    setSegmentSuggestions(updatedSuggestions);
  };

  const { userTrains } = useSelector(state => state.trains);

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("API CALL FROM HOME:", searchParams);
    const token = localStorage.getItem("token");

    console.log('auth token :', token);

    // ❌ No token or no user
    if (!authUser || !token) {
      toast.error("Please login to search trains");
      router.push("/auth/login");
      return;
    }



    // Validate based on trip type
    if (tripType === 'multiCity') {
      const isValid = multiCitySegments.every(segment =>
        segment.from && segment.to && segment.departure
      );

      if (!isValid) {
        alert("Please fill all fields for all segments");
        return;
      }
    } else if (!searchParams.from || !searchParams.to || !searchParams.departure) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'trains') {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/train/get-choicetrains?from=${encodeURIComponent(searchParams.from)}&to=${encodeURIComponent(searchParams.to)}&date=${encodeURIComponent(searchParams.departure)}`
        );

        if (res.data.success) {
          console.log('these are trains', res.data.trains);
          dispatch(setUserTrains(res.data.trains));
          console.log('userTrains from home ', userTrains);
          dispatch(setSelectedSearch({
            from: searchParams.from,
            to: searchParams.to,
            date: searchParams.departure
          }));
          router.push(`/auth/trains`);
        }
      } else if (activeTab === 'flights') {
        let requestParams = {};

        if (tripType === 'oneWay') {
          requestParams = {
            from: searchParams.from,
            to: searchParams.to,
            date: searchParams.departure,
            travelers: searchParams.travelers,
            tripType: 'oneWay',
            preferredClass: searchParams.class
          };
        }
        else if (tripType === 'roundTrip') {
          requestParams = {
            from: searchParams.from,
            to: searchParams.to,
            date: searchParams.departure,
            returnDate: searchParams.return,
            tripType: 'roundTrip',
            preferredClass: searchParams.class
          };
        }
        else if (tripType === 'multiCity') {
          requestParams = {
            segments: JSON.stringify(multiCitySegments),
            travelers: searchParams.travelers,
            tripType: 'multiCity',
            preferredClass: searchParams.class
          };
        }

        const res = await axios.get(
          'http://localhost:8000/api/v1/flight/flights', {
          params: requestParams,
          withCredentials: true
        });

        if (res.data.success) {
          console.log('these are flights', res.data.flights);
          dispatch(setUserFlights(res.data.flights));

          if (tripType === 'multiCity') {
            dispatch(setUserQueries({
              segments: multiCitySegments,
              travelers: searchParams.travelers,
              class: searchParams.class,
              type: 'multiCity'
            }));
          } else {
            dispatch(setUserQueries({
              from: searchParams.from,
              to: searchParams.to,
              date: searchParams.departure,
              return: searchParams.return,
              travelers: searchParams.travelers,
              tripType: tripType,
              preferredClass: searchParams.class
            }));
          }

          router.push(`/flights`);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));

    if ((name === 'from' || name === 'to') && value.length > 0) {
      try {
        if (activeTab === 'trains') {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/train/stations?query=${value}`
          );
          if (name === 'from') {
            setFromSuggestions(res.data.stations || []);
          } else {
            setToSuggestions(res.data.stations || []);
          }
        } else if (activeTab === 'flights') {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/flight/suggestions?query=${value}`
          );
          if (name === 'from') {
            console.log(res.data.airports);
            setFromSuggestions(res.data.airports || []);
          } else {
            setToSuggestions(res.data.airports || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        if (name === 'from') setFromSuggestions([]);
        else if (name === 'to') setToSuggestions([]);
      }
    } else {
      if (name === 'from') setFromSuggestions([]);
      else if (name === 'to') setToSuggestions([]);
    }
  };

  const handleMultiCityInputChange = async (index, field, value) => {
    const updatedSegments = [...multiCitySegments];
    updatedSegments[index][field] = value;
    setMultiCitySegments(updatedSegments);

    if ((field === "from" || field === "to") && value.length > 0) {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/flight/suggestions?query=${encodeURIComponent(value)}`
        );

        const updatedSuggestions = [...segmentSuggestions];
        updatedSuggestions[index][field] = res.data.airports || [];
        setSegmentSuggestions(updatedSuggestions);
      } catch (err) {
        console.error("MultiCity suggestions error:", err);
      }
    } else {
      const updatedSuggestions = [...segmentSuggestions];
      updatedSuggestions[index][field] = [];
      setSegmentSuggestions(updatedSuggestions);
    }
  };

  const selectSuggestion = (field, value, index = null) => {
    if (tripType === "multiCity" && index !== null) {
      const updated = [...multiCitySegments];
      updated[index][field] = value;
      setMultiCitySegments(updated);

      const updatedSuggestions = [...segmentSuggestions];
      updatedSuggestions[index][field] = [];
      setSegmentSuggestions(updatedSuggestions);
    } else {
      setSearchParams(prev => ({ ...prev, [field]: value }));
      if (field === "from") setFromSuggestions([]);
      else setToSuggestions([]);
    }
  };

  const handleSwap = () => {
    setSearchParams((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }))
  }


  //   const d = date ? new Date(date) : new Date();

  //   return d.toLocaleDateString("en-IN", {
  //     weekday: "short",
  //     day: "numeric",
  //     month: "short"
  //   });
  // };

  const getDate = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  };

  const handleQuickDate = (offset) => {
    setSearchParams(prev => ({
      ...prev,
      departure: getDate(offset)
    }));
  };




  return (
    <div>
      <div className="flex md:hidden items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-black text-white text-center px-6">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
          <h1 className="text-xl font-semibold tracking-wide mb-2">
            Desktop Experience Required
          </h1>
          <p className="text-xs text-gray-400">
            For best performance and features, please use a desktop or laptop device.
          </p>
        </div>
      </div>

      <div className="min-h-screen hidden md:block">
        {/* Header */}
        <header className={`fixed top-0 z-999 w-full bg-[#c55858]`}>
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
            {/* Top Bar with Official Notice - Responsive */}
            <div className="flex justify-between items-center text-[10px] sm:text-xs text-white/80 border-b border-white/20 pb-2 mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <BadgeCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="whitespace-nowrap">IRCTC Authorized Partner</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="whitespace-nowrap">24/7 Support: 1800-123-4567</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden xs:inline text-[10px] sm:text-xs">Follow us:</span>
                <Facebook className="w-2.5 h-2.5 sm:w-3 sm:h-3 cursor-pointer hover:text-blue-600 transition-colors" />
                <Twitter className="w-2.5 h-2.5 sm:w-3 sm:h-3 cursor-pointer hover:text-blue-600 transition-colors" />
                <Linkedin className="w-2.5 h-2.5 sm:w-3 sm:h-3 cursor-pointer hover:text-blue-600 transition-colors" />
                <Github className="w-2.5 h-2.5 sm:w-3 sm:h-3 cursor-pointer hover:text-blue-600 transition-colors" />
                <Instagram className="w-2.5 h-2.5 sm:w-3 sm:h-3 cursor-pointer hover:text-blue-600 transition-colors" />
              </div>
            </div>

            {/* Main Header Content */}
            <div className="flex justify-between items-center gap-3">
              {/* Logo Section */}
              <div className="flex items-end gap-2 sm:gap-3 flex-shrink-0">
                <div className="relative">
                  <span className="text-white text-xl sm:text-2xl md:text-3xl font-extrabold leading-none tracking-tight">
                    GlideGo
                  </span>
                  <div className="absolute -top-2 -right-5 sm:-right-6">
                    <span className="text-[16px] sm:text-[20px] text-white px-1 rounded-lg">®</span>
                  </div>
                </div>
              </div>

              {/* Navigation Icons - Responsive */}
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
                {/* PNR Status Button - Desktop */}
                <button
                  onClick={() => router.push('/auth/booking-details')}
                  className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 border border-white/30 whitespace-nowrap"
                >
                  <TicketCheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Check PNR Status</span>
                </button>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {
                    authUser ? (
                      <>
                        {/* User Menu */}
                        <div className="relative group">
                          <button className="flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200">
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline text-xs sm:text-sm font-medium">{authUser.name?.split(' ')[0]}</span>
                            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>

                          {/* Dropdown Menu - Touch friendly */}
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="py-2">
                              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <User className="w-4 h-4" /> Profile
                              </button>
                              <Link href='/auth/all-bookings' className="relative group">
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                  <BookCheck className="w-4 h-4" /> My Bookings
                                </button>
                              </Link>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                onClick={() => logoutUser({ dispatch, router })}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <LogOut className="w-4 h-4" /> Logout
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 sm:gap-2 border-r border-white/20 pr-2 sm:pr-3">
                        {/* PNR Status - Mobile */}
                        <button
                          onClick={() => router.push('/auth/booking-details')}
                          className="md:hidden p-1.5 sm:p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                        >
                          <TicketCheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <button
                          onClick={() => router.push('/auth/login')}
                          className="bg-white text-[#c55858] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-md text-xs sm:text-sm whitespace-nowrap"
                        >
                          Login
                        </button>

                        <button
                          onClick={() => router.push('/auth/register')}
                          className="hidden sm:inline-block border border-white text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium hover:bg-white/10 transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
                        >
                          Sign Up
                        </button>
                      </div>
                    )}

                  {/* Admin Button */}
                  <button
                    onClick={() => router.push(isAdmin ? '/admin/dashboard' : '/admin/login')}
                    className="hidden sm:flex items-center gap-1.5 sm:gap-2 bg-[#b34848] hover:bg-[#a33e3e] text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 border border-white/20 whitespace-nowrap"
                  >
                    {!isAdmin ? (
                      <LockKeyhole className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <LockKeyholeOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                    <span className="text-xs sm:text-sm hidden xs:inline">Admin</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button - Positioned correctly */}
          <button className="md:hidden absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-white">
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </header>



        {/* Hero Section with Search */}
        <div className={`mt-20 relative bg-[linear-gradient(to_left,#212f57_40%,#9a3741_60%)] rounded-b-[40px] bg-[#f6f7f9] text-blue-600`}>
          <div className=''>
            <div className="relative w-full">
              <Image
                src={myImage}
                alt="logo"
                className="w-auto h-auto"
                priority
              />
            </div>
          </div>

          <div className="container mx-auto px-3 sm:px-4 text-center -mt-10 sm:-mt-16 md:-mt-20 lg:-mt-24 relative z-10">
            {/* Search Tabs with Enhanced Design */}
            <div className="flex justify-center mb-4 w-full">
              <div className="relative">
                {/* Decorative Background Elements */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-red-500/20 rounded-2xl blur-xl opacity-70"></div>

                {/* Main Tabs Container */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-4xl shadow-xl ">
                  <div className="flex items-center gap-1">
                    {/* Trains Tab */}
                    {/* <button
                    className={`group relative px-8 py-4 rounded-4xl font-semibold flex items-center transition-all duration-300 overflow-hidden ${activeTab === 'trains'
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                    onClick={() => setActiveTab('trains')}
                  > */}
                    {/* Animated Background */}
                    {/* {activeTab === 'trains' && (
                      <motion.div
                        layoutId="activeTabBackground"
                        className="absolute inset-0 bg-gradient-to-r from-[#2a3a6b] to-[#374a7f]"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )} */}

                    {/* Hover Effect Background */}
                    {/* <div className={`absolute inset-0 bg-gray-100 transition-opacity duration-300 ${activeTab === 'trains' ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                      }`}></div> */}

                    {/* Content */}
                    {/* <div className="relative flex items-center gap-3">
                      <div className={`relative transition-transform duration-300 group-hover:scale-110 ${activeTab === 'trains' ? 'text-white' : 'text-[#374a7f]'
                        }`}>
                        <TrainFrontIcon className="w-5 h-5" />

                      </div>
                      <span className="relative text-base tracking-wide">Trains</span>


                    </div>
                  </button> */}

                    {/* Divider */}
                    {/* <div className="w-px h-8 bg-gray-200"></div> */}

                    {/* Flights Tab */}
                    {/*
                  <button
                    className={`group relative px-8 py-4  rounded-4xl font-semibold flex items-center transition-all duration-300 overflow-hidden ${activeTab === 'flights'
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                    onClick={() => setActiveTab('flights')}
                  > */}
                    {/* Animated Background */}
                    {/* {activeTab === 'flights' && (
                      <motion.div
                        layoutId="activeTabBackground"
                        className="absolute inset-0 bg-gradient-to-r from-[#b34848] to-[#c55858]"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )} */}


                    {/* Hover Effect Background */}
                    {/* <div className={`absolute inset-0 bg-gray-100 transition-opacity duration-300 ${activeTab === 'flights' ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                      }`}></div> */}

                    {/* Content */}
                    {/* <div className="relative flex items-center gap-3">
                      <div className={`relative transition-transform duration-300 group-hover:scale-110 ${activeTab === 'flights' ? 'text-white' : 'text-[#c55858]'
                        }`}> */}
                    {/* <PlaneIcon className="w-5 h-5" /> */}
                    {/* Glow Effect */}
                    {/* {activeTab === 'flights' && (
                          <div className="absolute -inset-2 bg-white/30 rounded-full blur-md animate-pulse"></div>
                        )}
                      </div> */}
                    {/* <span className="relative text-base tracking-wide">Flights</span> */}

                    {/* </div>
                  </button> */}

                  </div>


                </div>

              </div>
            </div>


            {/* Search Form */}
            <div className="flex rounded-lg  px-2 sm:px-0">
              <form onSubmit={handleSearch} className="text-gray-700 w-full">
                {/* Trip Type Selector - Only for Flights */}
                {activeTab === 'flights' && (
                  <div className="flex flex-wrap justify-center mb-4 sm:mb-6 gap-2">
                    {['roundTrip', 'oneWay'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`pb-2 sm:pb-3 px-3 sm:px-4 font-medium capitalize text-sm sm:text-base ${tripType === type ? 'text-white border-b-2 border-white' : 'text-gray-300 hover:text-gray-700'}`}
                        onClick={() => handleTripTypeChange(type)}
                      >
                        {type === 'roundTrip' ? 'Round Trip' : type === 'oneWay' ? 'One Way' : 'Multi City'}
                      </button>
                    ))}
                  </div>
                )}

                {/* Multi-city flight form */}
                {activeTab === 'flights' && tripType === 'multiCity' ? (
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
                      <h3 className="font-medium text-sm sm:text-base">Flight Segments</h3>
                      <button
                        type="button"
                        onClick={addMultiCitySegment}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm sm:text-base"
                      >
                        <FaPlus className="mr-1" /> Add another flight
                      </button>
                    </div>

                    {multiCitySegments.map((segment, index) => (
                      <div key={index} className="mb-4 p-3 sm:p-4 border border-gray-200 rounded-lg relative">
                        {multiCitySegments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMultiCitySegment(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 z-10"
                          >
                            <FaTimes />
                          </button>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          <div>
                            <div className='flex-1 bg-white p-2 sm:p-3 min-w-0'>
                              <div className="text-xs text-blue-600 font-medium mb-1">FROM</div>
                              <div className="relative">
                                <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 text-sm" />
                                <input
                                  type="text"
                                  placeholder="from"
                                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                  value={segment.from}
                                  onChange={(e) => handleMultiCityInputChange(index, "from", e.target.value)}
                                />
                              </div>
                              {segmentSuggestions[index]?.from?.length > 0 && (
                                <ul className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
                                  {segmentSuggestions[index].from.map((item, idx) => (
                                    <li
                                      key={idx}
                                      onClick={() =>
                                        selectSuggestion(
                                          "from",
                                          `${item.city} (${item.code}) - ${item.terminal || "N/A"}`,
                                          index
                                        )
                                      }
                                      className="px-3 sm:px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                                    >
                                      <span className="font-bold">{item.city}</span> ⎯ <Badge className="bg-blue-600">{item.code}</Badge>
                                      <br />
                                      <span className="text-gray-500 text-xs">{item.terminal || "N/A"}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">To</label>
                            <div className="relative">
                              <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 text-sm" />
                              <input
                                type="text"
                                placeholder="Destination"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                value={segment.to}
                                onChange={(e) => handleMultiCityInputChange(index, 'to', e.target.value)}
                              />
                              {segmentSuggestions[index]?.to?.length > 0 && (
                                <ul className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
                                  {segmentSuggestions[index].to.map((item, idx) => (
                                    <li
                                      key={idx}
                                      onClick={() =>
                                        selectSuggestion(
                                          "to",
                                          `${item.city} (${item.code}) - ${item.terminal || "N/A"}`,
                                          index
                                        )
                                      }
                                      className="px-3 sm:px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                                    >
                                      <span className="font-bold">{item.city}</span> ⎯ <Badge className="bg-blue-600">{item.code}</Badge>
                                      <br />
                                      <span className="text-gray-500 text-xs">{item.terminal || "N/A"}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Departure</label>
                            <div className="relative">
                              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400 text-sm" />
                              <input
                                type="date"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                value={segment.departure}
                                onChange={(e) => handleMultiCitySegmentChange(index, 'departure', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Regular form for other trip types */
                  <>
                    <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-2 rounded-3xl pb-8 mt-20  bg-white p-5">

                      {/* FROM */}
                      <div className="relative border-1 border-l-gray-400 border-t-gray-400 border-b-gray-400  bg-white rounded-t-xl sm:rounded-l-2xl sm:rounded-tr-none p-3 sm:p-4 min-w-0">
                        <label className="block text-[11px] sm:text-xs font-medium mb-0.5">
                          {activeTab === 'hotels' ? 'Destination' : 'From'}
                        </label>

                        <input
                          type="text"
                          placeholder={activeTab === 'hotels' ? "Enter destination" : "Where?"}
                          className="w-full text-center text-lg sm:text-5xl uppercase tracking-wide font-semibold text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                          name="from"
                          value={searchParams.from}
                          onChange={handleInputChange}
                        />

                        {fromSuggestions.length > 0 && (activeTab === 'trains' || activeTab === 'flights') && (
                          <ul className="absolute z-50 mt-9 w-full max-h-56 overflow-y-auto bg-white shadow-lg left-0 rounded-md">

                            <p className="text-[10px] px-3 pt-2 text-gray-400 uppercase">
                              Boarding Stations
                            </p>

                            {fromSuggestions.map((item, idx) => (
                              <li
                                key={idx}
                                onClick={() =>
                                  selectSuggestion(
                                    'from',
                                    activeTab === 'flights'
                                      ? `${item.city} (${item.code}) - ${item.terminal || 'N/A'}`
                                      : `${item.name}`
                                  )
                                }
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                {activeTab === 'flights' ? (
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">{item.city}</span>
                                    <span className="text-xs bg-blue-600 text-white px-2 rounded">
                                      {item.code}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex justify-between text-xs">
                                    <div className='flex flex-col justify-center '>
                                      <span className="text-blue-600 text-start font-medium">{item.station}</span>
                                      <span className="text-gray-600 text-start font-sm">{item.state}</span>
                                    </div>
                                    <span className="text-gray-500">{item.code}</span>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* 🔄 Center Swap Button */}
                      {activeTab !== 'hotels' && (
                        <button
                          type="button"
                          onClick={handleSwap}
                          className="hidden sm:flex absolute top-[45%] left-1/3 lg:left-[31%] -translate-y-1/2 translate-x-1/2 z-20
               bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md
               transition-all duration-200 active:scale-90"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                        </button>
                      )}

                      {/* TO */}
                      {activeTab !== 'hotels' && (
                        <div className="relative border-1 border-gray-400 bg-white p-3 sm:p-4 min-w-0">
                          <label className="block text-[11px] sm:text-xs font-medium mb-0.5">To</label>



                          <input
                            type="text"
                            placeholder="Where?"
                            className="w-full text-center text-lg sm:text-5xl uppercase tracking-wide font-semibold text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                            name="to"
                            value={searchParams.to}
                            onChange={handleInputChange}
                          />

                          {toSuggestions.length > 0 && (activeTab === 'trains' || activeTab === 'flights') && (
                            <ul className="absolute z-50 mt-9 w-full max-h-56 overflow-y-auto bg-white shadow-lg left-0 rounded-md">

                              <p className="text-[10px] px-3 pt-2 text-gray-400 uppercase">
                                Destination Stations
                              </p>

                              {toSuggestions.map((item, idx) => (
                                <li
                                  key={idx}
                                  onClick={() =>
                                    selectSuggestion(
                                      'to',
                                      activeTab === 'flights'
                                        ? `${item.city} (${item.code}) - ${item.terminal || 'N/A'}`
                                        : `${item.name}`
                                    )
                                  }
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                  <div className="flex justify-between text-xs">
                                    <div className='flex flex-col justify-center '>
                                      <span className="text-blue-600 text-start font-medium">{item.station}</span>
                                      <span className="text-gray-600 text-start font-sm">{item.state}</span>
                                    </div>
                                    <span className="text-gray-500">{item.code}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* DATE */}
                      <div className="bg-white border-1 border-r-gray-400 border-t-gray-400 border-b-gray-400 sm:rounded-r-xl sm:rounded-bl-none p-3 sm:p-2 min-w-0">
                        <label className="block text-[11px] sm:text-xs font-medium mb-0.5">
                          {activeTab === 'hotels' ? 'Check-in' : 'Departure'}
                        </label>

                        <div className="relative rounded-xl px-2 sm:px-4">
                          <div className="flex justify-center gap-2">
                            <div className="relative w-5 h-5 sm:w-6 sm:h-6 mt-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
                              </svg>
                              <input type="date"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                name="departure"
                                value={searchParams.departure}
                                onChange={handleInputChange} />
                            </div>

                            <span className="text-lg sm:text-xl md:text-4xl text-gray-800 font-semibold">
                              {formatDate(searchParams.departure)}
                            </span>

                          </div>
                          <div className="flex justify-center gap-2 text-[10px] mt-2">
                            <button
                              type="button"
                              onClick={() => handleQuickDate(0)}
                              className="px-2 py-0.5 rounded-full border border-blue-500 text-blue-600 bg-blue-50"
                            >
                              Today
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickDate(1)}
                              className="px-2 py-0.5 rounded-full border border-blue-500 text-blue-600 bg-blue-50"
                            >
                              Tomorrow
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickDate(2)}
                              className="px-2 py-0.5 rounded-full border border-blue-500 text-blue-600 bg-blue-50"
                            >
                              Day after Tomorrow
                            </button>
                          </div>
                        </div>


                      </div>

                    </div>

                    {/* Additional Fields - Show for all except trains */}
                    {activeTab !== 'trains' && activeTab !== 'hotels' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                        {activeTab !== 'buses' && (
                          <div className="relative flex-1 bg-white rounded-lg p-4 sm:p-6 md:p-8 min-w-0">
                            <label hidden={activeTab === 'flights' && tripType === 'oneWay'} className="block text-xs sm:text-sm font-medium mb-1">
                              {activeTab === 'flights' ? 'Return Date' : null}
                            </label>
                            <div className="relative">
                              <input
                                type="date"
                                className="w-full text-lg sm:text-xl md:text-2xl font-bold text-gray-800 placeholder-gray-400 border-0 p-0 focus:ring-0 focus:outline-none bg-transparent"
                                name="return"
                                value={searchParams.return}
                                onChange={handleInputChange}
                                hidden={activeTab === 'flights' && tripType === 'oneWay'}
                              />
                            </div>
                          </div>
                        )}

                        <div className="relative flex-1 bg-white rounded-lg p-4 sm:p-6 md:p-8 min-w-0">
                          <label className="block text-xs sm:text-sm font-medium mb-1">
                            {activeTab === 'flights' && 'Travelers'}
                          </label>
                          {activeTab === 'flights' ? (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setTravelerDrawerOpen(true)}
                                className="flex gap-3 sm:gap-5 w-full text-lg sm:text-xl md:text-2xl font-bold text-gray-800 placeholder-gray-400 border-0 p-0 focus:ring-0 focus:outline-none bg-transparent text-left"
                              >
                                <div>
                                  <div className="text-gray-900 text-sm sm:text-base md:text-lg">{searchParams.travelers} Traveler{searchParams.travelers !== 1 ? 's' : ''}</div>
                                  <div className="text-xs sm:text-sm text-gray-500 capitalize">{searchParams.class}</div>
                                </div>
                                <FaChevronDown className="text-gray-400 text-sm sm:text-base" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative">
                              <FaUsers className="absolute left-3 top-3 text-gray-400 text-sm" />
                              <input
                                type="number"
                                min="1"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                name="travelers"
                                value={searchParams.travelers}
                                onChange={handleInputChange}
                              />
                            </div>
                          )}
                        </div>

                        {activeTab === 'flights' && (
                          <div className="relative flex-1 bg-white rounded-lg p-4 sm:p-6 md:p-8 min-w-0">
                            <label className="block text-xs sm:text-sm font-medium mb-1">Class</label>
                            <select
                              className="w-full text-lg sm:text-xl md:text-2xl font-bold text-gray-800 placeholder-gray-400 border-0 p-0 focus:ring-0 focus:outline-none bg-transparent"
                              name="class"
                              value={searchParams.class}
                              onChange={handleInputChange}
                            >
                              <option value="economy">Economy</option>
                              <option value="premium economy">Premium Economy</option>
                              <option value="business">Business</option>
                              <option value="first">First Class</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Additional Fields for Hotels */}
                    {activeTab === 'hotels' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium mb-1">Check-out Date</label>
                          <div className="relative">
                            <FaCalendarAlt className="absolute left-3 top-3 text-gray-400 text-sm" />
                            <input
                              type="date"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                              name="return"
                              value={searchParams.return}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium mb-1">Guests</label>
                          <div className="relative">
                            <FaUsers className="absolute left-3 top-3 text-gray-400 text-sm" />
                            <input
                              type="number"
                              min="1"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                              name="travelers"
                              value={searchParams.travelers}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium mb-1">Rooms</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                              name="rooms"
                              value={searchParams.rooms || 1}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Traveler and class selection for multi-city */}
                {activeTab === 'flights' && tripType === 'multiCity' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Travelers</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setTravelerDrawerOpen(true)}
                          className="w-full flex justify-between items-center p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                          <div className="text-left">
                            <div className="text-gray-900">{searchParams.travelers} Traveler{searchParams.travelers !== 1 ? 's' : ''}</div>
                            <div className="text-xs text-gray-500 capitalize">{searchParams.class}</div>
                          </div>
                          <FaChevronDown className="text-gray-400" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Class</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize text-sm sm:text-base"
                        name="class"
                        value={searchParams.class}
                        onChange={handleInputChange}
                      >
                        <option value="economy">Economy</option>
                        <option value="premium economy">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First Class</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`  mb-5
    ${activeTab === 'trains'
                      ? 'bg-[#D63941] hover:bg-[#2f3f6d]'
                      : 'bg-[#c55858] hover:bg-[#a94a4a]'
                    }
                    relative bottom-8
                    left-130
    text-white font-semibold
    font-16px
    py-3 px-10 rounded-4xl
    flex items-center justify-center gap-2
    text-sm sm:text-base
    shadow-md hover:shadow-lg
    transition-all duration-200 ease-in-out
    active:scale-[0.98]
    ${loading ? 'opacity-70 cursor-not-allowed' : ''}
  `}
                >
                  {loading ? (
                    <>
                      {/* Spinner */}
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaSearch className="text-sm sm:text-base" />
                      {activeTab === 'hotels'
                        ? 'Search Hotels'
                        : `Search ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div >
        </div >

        {/* Traveler & Class Selection Dialog */}
        {
          travelerDrawerOpen && activeTab === 'flights' && (
            <div className=" fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative overflow-y-auto max-h-[90vh] animate-fadeInScale">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                  <h2 className="text-xl font-bold text-gray-900">Travelers & Class</h2>
                  <button
                    onClick={() => setTravelerDrawerOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                {/* Body */}
                <div className="space-y-6">
                  {/* Adults Selection */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center">
                        <FaUser className="mr-2 text-blue-600" /> Adults
                      </div>
                      <div className="text-sm text-gray-500">12+ years</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateTravelerCount('adults', 'decrement')}
                        disabled={travelerOptions.adults <= 1}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{travelerOptions.adults}</span>
                      <button
                        onClick={() => updateTravelerCount('adults', 'increment')}
                        disabled={travelerOptions.adults >= 9}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children Selection */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center">
                        <FaChild className="mr-2 text-blue-600" /> Children
                      </div>
                      <div className="text-sm text-gray-500">2-11 years</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateTravelerCount('children', 'decrement')}
                        disabled={travelerOptions.children <= 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{travelerOptions.children}</span>
                      <button
                        onClick={() => updateTravelerCount('children', 'increment')}
                        disabled={travelerOptions.children >= 8}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Infants Selection */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center">
                        <FaBaby className="mr-2 text-blue-600" /> Infants
                      </div>
                      <div className="text-sm text-gray-500">Under 2 years</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateTravelerCount('infants', 'decrement')}
                        disabled={travelerOptions.infants <= 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{travelerOptions.infants}</span>
                      <button
                        onClick={() => updateTravelerCount('infants', 'increment')}
                        disabled={travelerOptions.infants >= travelerOptions.adults || travelerOptions.infants >= 9}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>


                </div>

                {/* Footer */}
                <div className="mt-8">
                  <button
                    onClick={applyTravelerOptions}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )
        }




        <section className="py-12 bg-[#f2f2f2] relative ">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold  mb-2">GlideGo</h2>
            <p className="text-gray-600 text-sm  mb-10">About Us, Investor Relations, Careers, Sustainability, MMT Foundation, Legal Notices, CSR Policy & Committee, myBiz for Corporate Travel, myPartner - Travel Agent Portal, List your hotel, Partners- Redbus, Partners- Goibibo, Advertise with Us, Holiday-Franchise, Partners- BookMyForex, RedBus Ferry Malaysia, RedBus Ferry Singapore, redBus Vietnam, redBus Cambodia, redBus Columbia, redBus Peru, redBus Indonesia, Things to Do in Malaysia, Things to Do in Singapore
            </p>
            <h2 className="text-xl font-bold mb-2">Quick Links</h2>
            <p className="text-gray-600 text-sm mb-10">Delhi Chennai Flights, Delhi Mumbai Flights, Delhi Goa Flights, Chennai Mumbai flights, Mumbai Hyderabad flights, Kolkata to Rupsi Flights, Rupsi to Guwahati Flights, Pasighat to Guwahati Flights, Delhi to Khajuraho Flights, Cochin to Agatti Island Flights, Hotels in Delhi, Hotels in Mumbai, Hotels In Goa, Hotels In Jaipur, Hotels In Ooty, Hotels In Udaipur, Hotels in Puri, Hotels In North Goa, Hotels In Rishikesh, Honeymoon Packages, Kerala Packages, Kashmir Packages, Ladakh Packages, Goa Packages, Thailand Packages, Sri Lanka Visa, Thailand Visa, Explore Goa, Explore Manali, Explore Shimla, Explore Jaipur, Explore Srinagar

            </p>
            <h2 className="text-xl font-bold  mb-2">About the Site</h2>
            <p className="text-gray-600 text-sm mb-10">Customer Support, Payment Security, Privacy Policy, Cookie Policy, User Agreement, Terms of Service, Franchise Offices, Make A Payment, Work From Home, Escalation Channel, Report Security Issues
            </p>
            <h2 className="text-xl font-bold  mb-2">Important Links</h2>
            <p className="text-gray-600 text-sm mb-10">Customer Support, Payment Security, Privacy Policy, Cookie Policy, User Agreement, Terms of Service, Franchise Offices, Make A Payment, Work From Home, Escalation Channel, Report Security Issues
            </p>


          </div>
        </section>



        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 sm:py-10 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 md:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-8">
              {/* Company Info Section */}
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start mb-3 sm:mb-4">
                  <FaUmbrellaBeach className="text-blue-400 text-xl sm:text-2xl mr-2" />
                  <span className="text-lg sm:text-xl md:text-2xl font-bold">GlideGo</span>
                </div>
                <p className="text-gray-400 text-sm sm:text-base px-4 sm:px-0">
                  Making travel planning effortless and enjoyable for everyone.
                </p>
              </div>

              {/* Company Links */}
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">Company</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">About Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">Press</a></li>
                </ul>
              </div>

              {/* Support Links */}
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">Support</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">Contact Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">Terms of Service</a></li>
                </ul>
              </div>

              {/* Connect Section */}
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">Connect</h3>
                <div className="flex justify-center sm:justify-start space-x-4 sm:space-x-5">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 transform text-lg sm:text-xl"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 transform text-lg sm:text-xl"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 transform text-lg sm:text-xl"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 transform text-lg sm:text-xl"
                    aria-label="Pinterest"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.5 2C7.5 2 4 5.5 4 10.5c0 2.9 1.5 5.5 3.8 7.1-.1-.6-.1-1.2.1-1.8.1-.5.5-2.1.7-2.9.1-.4.2-.9.1-1.4-.3-.9-.1-1.8.5-2.5.5-.6 1.2-1 2-1 .8 0 1.6.2 2.2.6.6.4 1.1 1 1.3 1.7.1.3.1.6.1 1 0 .7-.1 1.4-.4 2.1-.2.5-.5 1-.9 1.3-.4.3-.9.5-1.4.5-.8 0-1.4-.5-1.7-1.3-.2-.5-.2-1.1.1-1.7.2-.6.5-1.3.8-1.9.3-.7.4-1.4.2-2.1-.1-.4-.4-.7-.8-.9-.4-.2-.9-.3-1.4-.1-.5.2-1 .5-1.4 1-.4.5-.6 1.1-.6 1.8 0 .6.1 1.1.3 1.5.1.3.2.6.2.9 0 .4-.1.8-.3 1.1-.1.3-.3.5-.6.5-.5 0-1-.3-1.3-.8-.3-.5-.4-1.1-.4-1.8 0-1.8.6-3.3 1.6-4.5.9-1.1 2.2-1.7 3.6-1.7 1.3 0 2.5.4 3.4 1.2.9.8 1.4 1.9 1.4 3.2 0 1.3-.3 2.5-.9 3.5-.5 1-1.3 1.5-2.2 1.5-.4 0-.8-.1-1.1-.3-.3-.2-.5-.5-.6-.9-.2.5-.3 1-.3 1.5-.1.6-.2 1.1-.4 1.6-.2.5-.5 1-.8 1.4.7.2 1.5.3 2.3.3 5 0 9-4 9-9s-4-8.5-9-8.5z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Copyright Section */}
            <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
              <p className="text-xs sm:text-sm md:text-base">
                © 2023 GlideGo. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div >

    </div>
  );
};

export default TravelBookingPlatform;
