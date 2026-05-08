'use client';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import socket from '@/lib/socketio';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import {
  setAvailability,
  setDistance,
  setFare,
  setSelectedArrivalTime,
  setSelectedCoachType,
  setSelectedDepatureTime,
  setSelectedQuota,
  setSelectedSearch,
  setSelectedTrain,
  setStatus,
  setUserTrains
} from '@/redux/trainSlice';

import TrainScheduleDialog from '@/components/trainScheduleDialog';
import TrainLayoutDialog from '@/components/trainLayoutDialog';
import SeatMapDemo from '@/components/seatMapDemo';
import { FaSearch, FaTrain, FaClock, FaArrowRight, FaSync, FaExchangeAlt, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import TrainScheduleDrawer from '@/components/trainScheduleDialog';
import { Button } from '@/components/ui/button';
import { CloudSun, FilterIcon, GlassesIcon, Loader, Locate, LocateFixedIcon, LocateIcon, MapPin, Moon, RectangleGoggles, Search, Sun, Sunrise, SunriseIcon, TicketIcon, TrainFront, Users2Icon } from 'lucide-react';
import { Snowflake, Armchair, Bed, Ticket, Users } from "lucide-react";
import { Train, Zap, Crown, Rocket, Star, Gauge, DiamondPlus } from "lucide-react";
import { SidebarContent } from '@/components/filtersSidebar';
import { MdMan4, MdOutlineSchedule, MdSchedule, MdWoman } from 'react-icons/md';
import { formatDate } from '@/utils/dateFormat';
import { io } from "socket.io-client";
import { logoutUser } from '@/utils/userLogoutHandler';
import { toast } from 'sonner';
import { setAuthUser } from '@/redux/userSlice';
import { jwtDecode } from 'jwt-decode';
import ClassDropdown from '@/components/dropdownClassSelector';



const trainTypeIcons = {
  Rajdhani: Crown,
  Shatabdi: Zap,
  Duronto: Rocket,
  "Vande Bharat": Star,
  "Garib Rath": Gauge,
  Superfast: Zap,
  Express: Train,
  "Mail/Passenger": DiamondPlus,
};

const classIcons = {
  AC: Snowflake,
  CC: Armchair,
  EC: Ticket,
  SL: Bed,
  General: Users,
};

export default function TrainSearchPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { authUser } = useSelector(state => state.user);
  const { userTrains, selectedSearch } = useSelector(state => state.trains);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setHasAnimated(true);
  }, []);
  // ✅ Use Redux state only

  const searchParams = useSearchParams();
  const refresh = searchParams.get("refresh");

  /// FORCED REFRESH AFTER BOOKING (to get latest availability without user having to click Search again)
  useEffect(() => {
    if (refresh === "true") {
      handleSearch();
      console.log("🔄 Forced refresh after booking");
    }
  }, []);

  // 1. Authentication check on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    // ❌ No token or no user
    if (!token || !authUser) {
      dispatch(setAuthUser(null));
      toast.error("You're not logged in yet , Please login to start searching & booking. ");
      router.push("/");
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // ❌ Token expired
      if (decoded.exp < currentTime) {
        dispatch(setAuthUser(null))
        toast.error("Session expired. Please login again");
        logoutUser({ dispatch, router });
        router.push("/");
      }

    } catch (error) {
      // ❌ Invalid token
      dispatch(setAuthUser(null))
      logoutUser({ dispatch, router });
      router.push("/");
    }

  }, [authUser]);
  // 2. Socket connection & listeners
  useEffect(() => {

    socket.on("connect", () => {
      console.log("🟢 CONNECTED:", socket.id);

      // 🔥 REJOIN ALL ROOMS
      joinedRooms.current.forEach(roomKey => {
        const [trainId, date, sourceIndex, destIndex] = roomKey.split("_");

        socket.emit("joinTrainRoom", {
          trainId,
          date,
          sourceIndex: Number(sourceIndex),
          destIndex: Number(destIndex)
        });

        console.log("🔁 Rejoined:", roomKey);
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 DISCONNECTED:", socket.id)
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };

  }, []);

  useEffect(() => {
    socket.onAny((event, ...args) => {
      console.log("📡 ANY EVENT:", event, args);
    });

    return () => {
      socket.offAny();
    };
  }, []);

  // ✅ Socket: real-time seat & status updates
  const joinedRooms = useRef(new Set());

  // 🔥 Join rooms for all trains in user's search results
  useEffect(() => {
    if (!userTrains?.length) return;

    userTrains.forEach(trains => {

      if (!trains.train?.id) return; // 🔥 safety

      const room = `${trains.train.id}_${trains.journey.journeyDate}_${trains.journey._fromIndex}_${trains.journey._toIndex}`;

      if (joinedRooms.current.has(room)) return; // 🔥 already joined

      console.log("JOINING ROOM:", room);

      socket.emit("joinTrainRoom", {
        trainId: trains.train.id,
        date: trains.journey.journeyDate,
        sourceIndex: trains.journey._fromIndex,
        destIndex: trains.journey._toIndex
      });

      joinedRooms.current.add(room);

    });

  }, [userTrains]);
  // 🔥 Leave all rooms on unmount
  useEffect(() => {
    return () => {
      joinedRooms.current.forEach(roomKey => {
        const [trainId, date, sourceIndex, destIndex] = roomKey.split("_");

        socket.emit("leaveTrainRoom", {
          trainId,
          date,
          sourceIndex: Number(sourceIndex),
          destIndex: Number(destIndex)
        });
      });

      joinedRooms.current.clear();
    };
  }, []);
  // 🔥 Listen for seat updates and merge into state
  useEffect(() => {

    socket.on("seatUpdated", (data) => {
      console.log("🔥 EVENT RECEIVED:", data);

      const current = userTrains; // from Redux selector

      if (!current || current.length === 0) {
        console.warn("⚠️ No trains yet");
        return;
      }

      console.log("prev trains:", current);

      const updated = current.map(trains => {

        const isSameTrain =
          String(trains.train?.id || trains.train?._id) === String(data.trainId);

        const isSameSegment =
          Number(trains.journey?._fromIndex) === Number(data.journey?._fromIndex) &&
          Number(trains.journey?._toIndex) === Number(data.journey?._toIndex);

        if (isSameTrain && isSameSegment) {

          console.log("✅ MATCH FOUND");

          const updatedCoach = data.availability[0];

          const mergedAvailability = trains.availability.map(coach => {
            if (coach.coachType === updatedCoach.coachType) {
              return {
                ...coach,
                quotas: {
                  ...coach.quotas,
                  ...updatedCoach.quotas
                },
                fallback: {
                  ...coach.fallback,
                  ...updatedCoach.fallback
                }
              };
            }
            return coach;
          });

          return {
            ...trains,
            availability: mergedAvailability
          };
        }

        return trains;
      });

      dispatch(setUserTrains(updated)); // ✅ ONLY THIS
    });

    return () => {
      socket.off("seatUpdated");
    };

  }, [userTrains]); // ✅ IMPORTANT



  const [from, setFrom] = useState(selectedSearch.from);
  const [to, setTo] = useState(selectedSearch.to);
  const [date, setDate] = useState(selectedSearch.date);
  const quotaOptions = [
    { label: "General", value: "general", icon: Users2Icon },
    { label: "Tatkal", value: "tatkal", icon: Ticket },
    { label: "Ladies", value: "ladies", icon: MdWoman },
    { label: "Senior", value: "senior", icon: GlassesIcon },
    { label: "Premium", value: "premiumTatkal", icon: Crown },
  ];
  const [filters, setFilters] = useState({
    searchText: '',
    class: '',
    type: [],
    quota: "general",
    departure: [],
    arrival: [],
    duration: 48,
    fare: [0, 5000],
    availability: []
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);


  const [loading, setLoading] = useState(false);

  console.log("User Trains:", userTrains);


  // 3. Search handler → dispatch after search

  const handleSearch = async () => {

    if (!from || !to || !date) {
      alert('fill all choices to search')
      dispatch(setUserTrains(null));
      return;
    }

    // ✅ update redux only after clicking Search
    dispatch(setSelectedSearch({ from, to, date }));

    setLoading(true);

    try {
      console.log("Searching:", from, to, date);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/train/get-choicetrains?from=${encodeURIComponent(
          from
        )}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&refresh=${refresh ? "true" : "false"}`,

        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (res.data.success) {
        console.log(res.data.trains);
        dispatch(setUserTrains(res.data.trains)); // ✅ update trains in redux
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /////// Date wise Search

  const dateWiseSearch = async (formattedDate) => {



    if (!from || !to || !date) {
      alert('fill all choices to search')
      dispatch(setUserTrains(null));
      return;
    }


    dispatch(setSelectedSearch({ ...selectedSearch, from, to, date: formattedDate }))
    setDate(formattedDate);

    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/train/get-choicetrains?from=${encodeURIComponent(
          from
        )}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(formattedDate)}`
      );

      if (res.data.success) {
        console.log(res.data.trains);
        dispatch(setUserTrains(res.data.trains)); // ✅ update trains in redux
      }
    } catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false)
    }
  }


  /// filtering by choices

  const filteredTrains = userTrains?.filter(train => {
    if (!train) return false;

    // ✅ SAFE hour extractor (works for 24h + AM/PM)
    const getHour = (time) => {
      if (!time) return 0;
      const [t, modifier] = time.split(" ");
      let [h] = t.split(":").map(Number);

      if (modifier === "PM" && h !== 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;

      return h;
    };

    const depHour = getHour(train.journey?.departureTime);
    const arrHour = getHour(train.journey?.arrivalTime);

    const searchText = filters?.searchText;
    const classFilters = filters?.class || [];
    const typeFilters = filters?.type || [];
    const depFilters = filters?.departure || [];
    const arrFilters = filters?.arrival || [];
    const durationFilter = filters?.duration || 48;
    const availabilityFilters = filters?.availability || [];
    const fareRange = filters?.fare || [0, 5000];
    const quota = filters?.quota || "general"; // ✅ already mapped from UI

    const coaches = train.coaches || [];
    const availability = train.availability || [];

    /* ---------------- SEARCH TEXT FILTER ---------------- */
    if (searchText) {
      return (
        train.train.trainName.toLowerCase().includes(searchText.toLowerCase()) ||
        String(train.train.trainNo).includes(searchText)
      );
    }

    /* ---------------- CLASS FILTER ---------------- */
    const classMatch =
      classFilters.length === 0 ||
      coaches.some(c => classFilters.includes(c.type));

    /* ---------------- TRAIN TYPE FILTER ---------------- */
    const typeMatch =
      typeFilters.length === 0 ||
      typeFilters.includes(train.train.trainType || "Express");

    /* ---------------- FARE FILTER (FIXED) ---------------- */
    const fareMatch =
      availability.length === 0 ||
      availability.some(c => {
        const price = c.prices?.[quota] || 0;
        return price >= fareRange[0] && price <= fareRange[1];
      });

    /* ---------------- DEPARTURE FILTER ---------------- */
    const departureMatch =
      depFilters.length === 0 ||
      depFilters.some(slot => {
        if (slot === "early") return depHour < 6;
        if (slot === "morning") return depHour >= 6 && depHour < 12;
        if (slot === "afternoon") return depHour >= 12 && depHour < 18;
        if (slot === "night") return depHour >= 18;
        return false;
      });

    /* ---------------- ARRIVAL FILTER ---------------- */
    const arrivalMatch =
      arrFilters.length === 0 ||
      arrFilters.some(slot => {
        if (slot === "early") return arrHour < 6;
        if (slot === "morning") return arrHour >= 6 && arrHour < 12;
        if (slot === "afternoon") return arrHour >= 12 && arrHour < 18;
        if (slot === "night") return arrHour >= 18;
        return false;
      });

    /* ---------------- DURATION FILTER ---------------- */
    const durationMatch =
      Number(durationFilter || 0) >=
      Number(train.journey.duration?.split("h")[0] || 48);

    /* ---------------- AVAILABILITY FILTER (FIXED CORE) ---------------- */
    const availabilityMatch =
      availabilityFilters.length === 0 ||
      availability.some(c => {
        const quotaSeats = c.quotas?.[quota].limit || 0;

        let mappedStatus = "Unavailable";

        if (quotaSeats > 0) mappedStatus = "Available";
        else if (c.fallback?.rac.queueOccupied > 0) mappedStatus = "RAC";
        else if (c.fallback?.wl.queueOccupied > 0) mappedStatus = "Waiting";
        else mappedStatus = "REGRET";

        return availabilityFilters.includes(mappedStatus);
      });

    /* ---------------- FINAL ---------------- */
    return (
      classMatch &&
      typeMatch &&
      fareMatch &&
      departureMatch &&
      arrivalMatch &&
      durationMatch &&
      availabilityMatch
    );
  });

  // Add this state at the top of your component
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Add this function to handle body scroll lock when drawer is open
  // useEffect(() => {
  //   if (isFilterDrawerOpen) {
  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     document.body.style.overflow = 'unset';
  //   }
  //   return () => {
  //     document.body.style.overflow = 'unset';
  //   };
  // }, [isFilterDrawerOpen]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="flex flex-col items-center">
          <Loader size={50} className="animate-spin text-blue-600 mb-4" />
          <p className="text-lg text-gray-300">Searching for trains...</p>
        </div>
      </div>
    );

  }




  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-5 z-9 flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">

      {/* Mobile Filter Button - Only visible on mobile/tablet */}
      <div className="md:hidden sticky top-16 sm:top-20 z-20 -mt-2 sm:-mt-3 mb-3">
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 sm:py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <FilterIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Filters</span>
          {Object.keys(filters).some(key =>
            key !== 'searchText' &&
            key !== 'duration' &&
            key !== 'fare' &&
            filters[key]?.length > 0
          ) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {Object.values(filters).filter(v => Array.isArray(v) && v.length > 0).length}
              </span>
            )}
        </button>
      </div>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className='flex'>
        <div className="hidden md:block md:w-80 lg:w-82 flex-shrink-0">
          <motion.div
            initial={hasAnimated ? false : { x: -600 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="w-full bg-gray-50 scrollbar-hide border-r border-gray-200 p-4 sm:p-5 md:p-4 sticky top-5 h-auto max-h-[90vh] md:h-[calc(120vh-100px)] rounded-bl-2xl sm:rounded-bl-3xl md:rounded-bl-4xl overflow-y-auto shadow-sm md:shadow-none"
          >
            <SidebarContent
              filters={filters}
              setFilters={setFilters}
              filteredTrains={filteredTrains}
              selectedSearch={selectedSearch}
              classIcons={classIcons}
              trainTypeIcons={trainTypeIcons}
            />
          </motion.div>
        </div>

        {/* Mobile Drawer/Dialog */}
        {/* <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setIsFilterDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] sm:w-[70%] max-w-md bg-gray-50 z-50 shadow-2xl overflow-y-auto md:hidden"
            >
              <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-4 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FilterIcon className="text-red-500 w-5 h-5" />
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  </div>
                  <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4 pb-24">
                <SidebarContent
                  filters={filters}
                  setFilters={setFilters}
                  filteredTrains={filteredTrains}
                  selectedSearch={selectedSearch}
                  classIcons={classIcons}
                  trainTypeIcons={trainTypeIcons}
                  isMobile={true}
                />
              </div>
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3 shadow-lg">
                <button
                  onClick={() => {
                    setFilters({
                      searchText: '',
                      classes: [],
                      type: [],
                      quota: '',
                      departure: [],
                      arrival: [],
                      duration: 48,
                      fare: [0, 5000],
                      availability: []
                    });
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md">
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence> */}

        {/* Quick Date Selector - Vertical Sidebar */}
        <motion.div
          // initial={{ y: -900 }}
          // animate={{ y: 0 ,  }}
          // transition={{ delay: 1, type: "spring", stiffness: 80, damping: 30 }}
          className="

        bg-gray-50
        rounded-br-4xl
        hidden sm:flex flex-col
        w-16 sm:w-20
        p-2

        h-[calc(102vh-100px)]
        sticky top-5
        overflow-y-auto scrollbar-transparent
        scrollbar-hide
        "
        >
          {(() => {
            const today = new Date();
            const daysToShow = 15;

            return Array.from({ length: daysToShow }, (_, idx) => {
              const dt = new Date();
              dt.setDate(today.getDate() + idx);
              const formattedDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
              const isSelected = selectedSearch.date === formattedDate;
              const isToday = today.getDate() === dt.getDate() && today.getMonth() === dt.getMonth() && today.getFullYear() === dt.getFullYear();

              return (
                <button
                  key={idx}
                  onClick={() => dateWiseSearch(formattedDate)}
                  className={`flex flex-col items-center justify-center w-full py-2 mb-1 rounded-xl cursor-pointer transition-all duration-300
              ${isSelected ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 hover:bg-white/10'}
              ${isToday && !isSelected ? 'border border-blue-400' : ''}`}
                >
                  <span className="text-[10px] sm:text-[11px] font-medium">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getDay()]}
                  </span>
                  <span className="text-[13px] sm:text-[15px]   mt-0.5">{dt.getDate()}</span>
                </button>
              );
            });
          })()}
        </motion.div>
      </div>

      {/* Mobile Horizontal Date Scroller */}
      {/* <div className="sm:hidden overflow-x-auto pb-2 -mt-2">
        <div className="flex gap-2 px-1">
          {(() => {
            const today = new Date();
            const daysToShow = 10;
            return Array.from({ length: daysToShow }, (_, idx) => {
              const dt = new Date();
              dt.setDate(today.getDate() + idx);
              const formattedDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
              const isSelected = selectedSearch.date === formattedDate;
              return (
                <button
                  key={idx}
                  onClick={() => dateWiseSearch(formattedDate)}
                  className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-xl transition-all duration-300 min-w-[60px]
                ${isSelected ? 'bg-red-600 text-white shadow-md' : 'bg-white/10 text-gray-300'}`}
                >
                  <span className="text-[10px] font-medium">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getDay()]}</span>
                  <span className="text-[14px] font-semibold">{dt.getDate()}</span>
                </button>
              );
            });
          })()}
        </div>
      </div> */}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Search Form */}
        <motion.div   initial={hasAnimated ? false : { x: -100 }} animate={{ x: 0 }} className="mb-4 sticky top-5 z-10 pl-3 pr-3">
          <div className="rounded-2xl mb-1  ">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center  ">
              {/* Source */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 flex text-sm tracking-wider items-center pl-8 pointer-events-none z-10">
                  <MapPin className='text-blue-700' />
                </div>



                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}

                  className="w-full  py-4 text-center rounded-tl-lg
                bg-white
                outline-none font-semibold text-xl  tracking-wider text-blue-800 placeholder-gray-400
                transition-all duration-200 hover:border-gray-400 capitalize"
                />
              </div>

              {/* Swap Button */}
              <button

                onClick={() => {
                  const temp = from;
                  setFrom(to);
                  setTo(temp);
                }}
                className="bg-white absolute left-48  z-30
               cursor-pointer
              transition-all duration-200   min-w-[48px] flex items-center justify-center"
              >
                <FaExchangeAlt size={18} className="transition-transform duration-300" />
              </button>

              {/* Destination */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 flex items-center tracking-wider  text-sm pl-8 pointer-events-none z-10">
                  {/* <FaMapMarkerAlt className="text-orange-600 text-lg transition-colors group-hover:text-orange-700" /> */}
                  <MapPin className='text-orange-700' />
                </div>



                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}

                  className="w-full  pl-12 pr-4 py-4  text-center
                bg-white  text-blue-800
                outline-none font-semibold text-xl  tracking-wider  placeholder-gray-400
                transition-all duration-200 hover:border-gray-400 capitalize"
                />
              </div>

              {/* Date */}
              <div className="relative flex-1 group ml-1">




                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full pl-12 pr-7 py-4 bg-white

                outline-none font-semibold text-xl  text-blue-800 cursor-pointer
                transition-all duration-200 hover:border-gray-400"
                />




              </div>



              {/* Search Button */}
              <div className="relative ml-1 flex-1">



                <motion.button
                  onClick={handleSearch}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full  py-4 flex justify-center gap-1 items-center  rounded-tr-lg   bg-blue-100

                outline-none font-medium text-xl  text-blue-800 cursor-pointer
                transition-all duration-200 hover:border-gray-400"
                >
                  <FaSearch className="text-blue-800 text-md" />
                  Search
                </motion.button>
              </div>
            </div>


          </div>

          {/* Quota Options */}
          {(
            <div className="flex justify-center gap-1 w-full ">

              <div className="flex items-center gap-2 ">
                <ClassDropdown filters={filters} setFilters={setFilters} />
              </div>

              <div className="flex justify-center items-center bg-gray-200 pl-1 pr-2  border-r-[0.5px] border-gray-400">
                {quotaOptions.map(q => {
                  const isActive = filters.quota === q.value;
                  return (
                    <button
                      key={q.value}
                      onClick={() => setFilters(prev => ({ ...prev, quota: prev.quota === q.value ? "" : q.value }))}
                      className={`flex justify-center items-center px-3 sm:px-4 py-1.5 rounded-lg text-[11px]  sm:text-xs font-medium transition-all duration-200
                      ${isActive ? "bg-blue-600 text-white shadow-md" : " text-gray-700 hover:bg-gray-600/50"}
                      ${filters.quota === 'tatkal' && q.value === 'tatkal' ? 'bg-red-600 text-white shadow-md' : ''}
                      ${filters.quota === 'premiumTatkal' && q.value === 'premiumTatkal' ? 'bg-red-800 text-white shadow-md' : ''}
                      ${filters.quota === 'ladies' && q.value === 'ladies' ? 'bg-pink-500 text-white shadow-md' : ''}
                      ${filters.quota === 'senior' && q.value === 'senior' ? 'bg-green-600 text-white shadow-md' : ''}
                      ${filters.quota === 'general' && q.value === 'general' ? 'bg-gray-700 text-white shadow-md' : ''}
                      `}

                    >
                      {q.label}
                      {q.icon && <q.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline-block ml-1" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center items-center bg-gray-200 pr-1 gap-2 rounded-br-lg">
                {['Available', 'Waitlist', 'RAC', 'Chart Prepared'].map(a => {
                  const active = filters.availability?.includes(a);
                  let badgeColor = '';
                  if (a === 'Available') badgeColor = 'text-green-600  border-green-200';
                  if (a === 'Waitlist') badgeColor = 'text-orange-600 border-orange-200';
                  if (a === 'RAC') badgeColor = 'text-yellow-600 border-yellow-200';
                  if (a === 'Chart Prepared') badgeColor = 'text-purple-600 border-purple-200';

                  return (
                    <label
                      key={a}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200
                  ${active
                          ? `${badgeColor} `
                          : " "}`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={e =>
                          setFilters(prev => ({
                            ...prev,
                            availability: e.target.checked
                              ? [...prev.availability, a]
                              : prev.availability.filter(x => x !== a)
                          }))
                        }
                        className="w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-full text-blue-600 focus:ring-offset-0"
                      />
                      <span className={`text-xs tracking-wide select-none font-medium ${active ? 'text-inherit' : 'text-gray-700'}`}>
                        {a}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Train Results */}
        {filteredTrains?.length ? (
          <div className="space-y-3">
            {filteredTrains?.map(train => (
              <motion.div
                key={train?.train?.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative w-full p-3 sm:p-4 rounded-xl bg-blue-900/20 backdrop-blur-lg border border-blue-700/20"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-md  underline racking-wide font-mono  font-bold text-blue-400">{train.train.trainNo}</p>
                    <h2 className="text-base text-md tracking-wide  font-medium text-white">{train.train.trainName}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-1">
                      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => {
                        const fullNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        const isActive = train.train.runningDays?.includes(fullNames[i]);
                        return (
                          <span key={i} className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-medium
                        ${isActive ? " text-blue-200 " : "text-gray-600 "}`}>
                            {d}
                          </span>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setIsDrawerOpen(true)}
                      className="z-9  text-white px-5 py-2   font-medium text-xs transition-all"
                    >

                      <MdOutlineSchedule className=' text-blue-200 rounded-full w-5 h-5' />

                    </button>


                    <TrainScheduleDrawer
                      open={isDrawerOpen}
                      onOpenChange={setIsDrawerOpen}
                      key={train.train.id}
                      train={train.train}
                      routeTimeline={train.routeTimeline}
                      coaches={train.coaches}
                    />
                  </div>
                </div>

                {/* Journey Details */}
                <div className="flex  items-center justify-between  mb-4">
                  <div className="text-center sm:text-left">
                    <p className="text-md font-semibold tracking-wider text-white">{train.journey.departureTime}</p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {train.journey.fromCode} • {train.journey.board.slice(0, 10)}...
                    </p>

                  </div>
                  <div className="">
                    <span className="text-xs tracking-wide text-gray-300 ">
                      ⎯ {train.journey.duration} ⎯
                    </span>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-md  font-semibold tracking-wider text-white">{train.journey.arrivalTime}</p>
                    <span className="text-xs sm:text-sm  text-gray-400">{train.journey.toCode} • {train.journey.depart.slice(0, 10)}...</span>
                  </div>
                </div>

                {/* Coach Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  {train.availability.map((c, i) => {
                    const selectedQuota = filters.quota || "general";

                    const quotaObj = c.quotas[selectedQuota];
                    const racObj = c.fallback.rac;
                    const wlObj = c.fallback.wl;
                    const tqwlObj = c.fallback.tqwl;

                    const NON_TATKAL = ["general", "ladies", "senior"];
                    const isTatkal = selectedQuota === "tatkal" || selectedQuota === "premiumTatkal";

                    const hasNonTatkalCNF = NON_TATKAL.some(q => c.quotas?.[q]?.limit > 0);

                    let displayText = "";

                    // =========================
                    // 🔥 CASE 1: Tatkal selected (HANDLE FIRST)
                    // =========================
                    if (isTatkal) {
                      if (quotaObj?.limit > 0) {
                        displayText = `AVL ${quotaObj.limit}`;
                      }
                      else if (tqwlObj.queueOccupied > 0) {
                        displayText = `TQWL ${tqwlObj.queueOccupied}`;
                      } else {
                        displayText = "REGRET";
                      }
                    }

                    // =========================
                    // 🔥 CASE 2: Non-Tatkal selected
                    // =========================
                    else if (hasNonTatkalCNF) {
                      displayText =
                        quotaObj?.limit > 0
                          ? `AVL ${quotaObj.limit}`
                          : "NOT AVAILABLE";
                    }

                    // =========================
                    // 🔥 CASE 3: No CNF anywhere
                    // =========================
                    else if (racObj?.queueOccupied > 0 && racObj?.limit > 0) {
                      displayText = `RAC ${racObj.queueOccupied}`;
                    }

                    else if (wlObj?.queueOccupied > 0 && wlObj?.limit > 0) {
                      displayText = `${wlObj.wlType || "WL"} ${wlObj.queueOccupied}`;
                    }

                    else {
                      displayText = "REGRET";
                    }

                    const isRegret = displayText === "REGRET";

                    return (
                      <div
                        key={i}
                        onClick={() => {
                          if (!isRegret) {
                            dispatch(setSelectedTrain(train));
                            dispatch(setSelectedCoachType(c.coachType));
                            dispatch(setSelectedQuota(selectedQuota))
                            dispatch(setSelectedDepatureTime(train.journey.departureTime));
                            dispatch(setSelectedArrivalTime(train.journey.arrivalTime));
                            dispatch(setDistance(train.journey.duration));
                            dispatch(setStatus(displayText));
                            dispatch(setAvailability(c.quotas[selectedQuota] || 0));
                            dispatch(setFare(c.prices[selectedQuota] || 0));
                            router.push(`/auth/booking/${train.train.id}/${c.coachType}`);
                          }
                        }}
                        className={`group relative rounded-xl border border-white/10 backdrop-blur-xl bg-white/10'  overflow-hidden shadow-sm transition-all p-3
                      ${isRegret || displayText === "NOT AVAILABLE" ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-white/10'}
                      ${displayText.includes('AVL') && "bg-green-500/10"}
                      ${displayText.includes('RAC') && "bg-yellow-500/10"}
                      ${displayText.includes('WL' || 'GNWL' || 'RLWL' || 'PQWL') && "bg-red-500/10"}
                      ${displayText.includes('NOT AVAILABLE') && "bg-gray-500/10"}

                      `}

                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm tracking-wider text-white font-semibold">{c.coachType}</h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full
                        ${displayText.includes('AVL') ? "bg-green-500/20 text-green-300 "
                              : displayText.includes('RAC') ? "bg-yellow-500/20 text-yellow-300 "
                                : displayText.includes('WL' || 'GNWL' || 'RLWL' || 'PQWL') ? "bg-orange-500/20 text-orange-300 "
                                  : "bg-red-500/20 text-red-300 "}`}>
                            {displayText}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-200 font-medium">₹{c.prices.general}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Skeleton Loader */

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full p-5 rounded-xl bg-white/5 animate-pulse">
                <div className="flex justify-between mb-6">
                  <div className="h-6 bg-gray-700 rounded w-1/3 "></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 "></div>

                </div>
                <div className="flex items-center justify-between mb-6 gap-4">

                  {/* LEFT */}
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                  </div>

                  {/* CENTER */}
                  <div className="flex-1 flex justify-center">
                    <div className="h-4 bg-gray-700 rounded-lg w-2/5"></div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col gap-2 flex-1 items-end">
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                  </div>

                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-15 bg-gray-700/50 rounded-xl"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        )}
      </main>
    </div>
  )
}
