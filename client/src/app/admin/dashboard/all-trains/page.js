'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaTrain,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaSubway,
  FaArrowRight,
  FaFilter,
  FaSort,
  FaEye,
  FaRegStar,
  FaStar,
  FaRoute
} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { setTrains, setSelectedTrain, setCoaches } from '@/redux/trainSlice';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();
  const { trains } = useSelector((state) => state.trains);

  const { isAdmin } = useSelector((store) => store.admin);
  
  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
    }
  }, [isAdmin, router]);



  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/train/get-Alltrains`, {
          withCredentials : true,
        });
        if (res.data.allTrains) {
          dispatch(setTrains(res.data.allTrains));
        }
      } catch (err) {
        console.error('Error fetching trains:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrains();
  }, [dispatch]);

  const handleDelete = async (trainId) => {
    if (!confirm('Are you sure you want to delete this train?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/train/delete-train/${trainId}` ,{
        withCredentials: true,
      });
      dispatch(setTrains(trains.filter((train) => train._id !== trainId)));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter and sort trains
  const filteredTrains = trains?.filter(
    (train) =>
      train.trainName.toLowerCase().includes(search.toLowerCase()) ||
      train.trainNo.toString().includes(search)
  ).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.trainName.localeCompare(b.trainName);
      case 'number':
        return a.trainNo - b.trainNo;
      case 'departure':
        return a.departureTime.localeCompare(b.departureTime);
      default:
        return 0;
    }
  });

  // Calculate journey duration
  const calculateDuration = (departure, arrival) => {
    const [depHours, depMins] = departure.split(':').map(Number);
    const [arrHours, arrMins] = arrival.split(':').map(Number);
    
    let hours = arrHours - depHours;
    let mins = arrMins - depMins;
    
    if (mins < 0) {
      hours -= 1;
      mins += 60;
    }
    
    if (hours < 0) hours += 24; // Handle overnight journeys
    
    return `${hours}h ${mins}m`;
  };

  // Get running days with abbreviations
  const formatRunningDays = (days) => {
    if (!days || days.length === 0) return 'N/A';
    
    const dayMap = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    
    return days.map(day => dayMap[day] || day).join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-blue-700 rounded-lg text-white">
                <FaTrain className="text-xl" />
              </div>
              Train Management
            </h1>
            <p className="text-gray-600 mt-2">Manage all trains in the system</p>
          </div>
          <Link
            href="/admin/dashboard/add-train"
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <FaPlus className="text-sm" />
            Add New Train
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-600 text-sm font-medium">Total Trains</h3>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaTrain className="text-blue-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">{trains?.length || 0}</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-600 text-sm font-medium">Active Today</h3>
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCalendarAlt className="text-green-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {trains?.filter(train => train.runningDays?.includes(new Date().toLocaleDateString('en-US', { weekday: 'long' }))).length || 0}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-600 text-sm font-medium">Total Coaches</h3>
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaSubway className="text-purple-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {trains?.reduce((total, train) => total + (train.coaches?.length || 0), 0) || 0}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-600 text-sm font-medium">Routes</h3>
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaRoute className="text-orange-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {new Set(trains?.map(train => `${train.start}-${train.end}`)).size}
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by train name or number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-40">
                <FaSort className="absolute left-3 top-3 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="name">Sort by Name</option>
                  <option value="number">Sort by Number</option>
                  <option value="departure">Sort by Departure</option>
                </select>
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                <FaFilter />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Train Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredTrains?.length > 0 ? (
            filteredTrains.map((train) => (
              <div
                key={train._id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-5 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold truncate">{train.trainName}</h2>
                        <span className="text-yellow-300 flex items-center">
                          <FaStar className="text-sm" />
                          <FaStar className="text-sm" />
                          <FaStar className="text-sm" />
                        </span>
                      </div>
                      <div className="flex items-center text-sm opacity-90">
                        <span className="font-medium">{train.trainNo}</span>
                        <span className="mx-2">•</span>
                        <span>{train.trainType || 'Express'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          dispatch(setSelectedTrain(train));
                          router.push(`/admin/dashboard/all-trains/train-details/${train._id}`);
                        }}
                        className="p-1.5 text-white hover:bg-blue-800 rounded-lg transition"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => {
                          dispatch(setSelectedTrain(train));
                          dispatch(setCoaches(train.coaches));
                          router.push(`/admin/dashboard/all-trains/manage-trains/${train._id}`);
                        }}
                        className="p-1.5 text-white hover:bg-blue-800 rounded-lg transition"
                        title="Edit Train"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(train._id);
                        }}
                        className="p-1.5 text-red-300 hover:text-red-500 rounded-lg transition"
                        title="Delete Train"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-green-600" />
                      <span className="font-medium">{train.start}</span>
                    </div>
                    <div className="flex items-center text-gray-400 mx-2">
                      <FaArrowRight />
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-red-600" />
                      <span className="font-medium">{train.end}</span>
                    </div>
                  </div>
                 
                </div>

                {/* Schedule Information */}
                <div className="p-5 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Departure</p>
                      <p className="flex items-center gap-2 font-medium">
                        <FaClock className="text-blue-600" />
                        {train.departureTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Arrival</p>
                      <p className="flex items-center gap-2 font-medium">
                        <FaClock className="text-green-600" />
                        {train.arrivalTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">Running Days</p>
                    <p className="flex items-center gap-2 text-sm">
                      <FaCalendarAlt className="text-purple-600" />
                      {formatRunningDays(train.runningDays)}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">Coaches</p>
                    <div className="flex gap-1 flex-wrap">
                      {train.coaches?.slice(0, 4).map((coach, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                          {coach.classType}
                        </span>
                      ))}
                      {train.coaches?.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                          +{train.coaches.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Updated: {new Date(train.updatedAt).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => {
                      dispatch(setSelectedTrain(train));
                      router.push(`/admin/dashboard/all-trains/train-details/${train._id}`);
                    }}
                    className="text-blue-700 hover:text-blue-900 text-sm font-medium flex items-center gap-1"
                  >
                    View Details <FaArrowRight className="text-xs" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-4">
                <FaTrain className="text-4xl text-blue-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No trains found</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {search ? 'No trains match your search criteria. Try adjusting your search terms.' 
                        : 'It looks like there are no trains in the system yet.'}
              </p>
              <Link
                href="/admin/dashboard/add-trains/add-train"
                className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg transition"
              >
                <FaPlus />
                Add Your First Train
              </Link>
            </div>
          )}
        </div>

        {/* Pagination (if needed in future) */}
        {filteredTrains?.length > 0 && (
          <div className="flex justify-center">
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-4 py-2 bg-blue-700 text-white rounded-lg">1</button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
