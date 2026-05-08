'use client';

import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTrain,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaChair,
  FaRupeeSign,
  FaRoute,
  FaUsers,
  FaTicketAlt,
  FaCog,
  FaWifi,
  FaUtensils,
  FaSnowflake,
  FaPlug,
  FaBed,
  FaShower,
  FaTv,
  FaWheelchair,
  FaImage,
  FaStar,
  FaRegStar
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TrainDetails = () => {
  const router = useRouter();
  const { selectedTrain } = useSelector((state) => state.trains);
  const [train, setTrain] = useState(selectedTrain);
  const [isLoading, setIsLoading] = useState(!selectedTrain);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!selectedTrain) {
      // If no selected train in Redux, try to fetch from API using ID from URL
      const fetchTrainDetails = async () => {
        try {
          setIsLoading(true);
          // You would need to get the train ID from the URL params
          // const { id } = useParams();
          // const res = await axios.get(`http://localhost:8000/api/v1/train/get-train/${id}`);
          // setTrain(res.data.train);
        } catch (error) {
          console.error('Error fetching train details:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTrainDetails();
    } else {
      setTrain(selectedTrain);
      setIsLoading(false);
    }
  }, [selectedTrain]);

  const handleDeleteTrain = async () => {
    if (!confirm('Are you sure you want to delete this train? This action cannot be undone.')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/train/delete-train/${train._id}`);
      router.push('/admin/dashboard/all-trains');
    } catch (err) {
      console.error('Error deleting train:', err);
      alert('Failed to delete train. Please try again.');
    }
  };

  const calculateJourneyTime = (departure, arrival) => {
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

  const getSeatOccupancyPercentage = (coach) => {
    return Math.round(((coach.totalSeats - coach.availableSeats) / coach.totalSeats) * 100);
  };

  const getOccupancyColor = (percentage) => {
    if (percentage < 40) return 'bg-green-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };


  // Sample amenities data (in a real app, these would come from the backend)
  const amenities = [
    { name: 'Wi-Fi', icon: <FaWifi className="text-xl" />, available: true },
    { name: 'Food Service', icon: <FaUtensils className="text-xl" />, available: true },
    { name: 'AC', icon: <FaSnowflake className="text-xl" />, available: true },
    { name: 'Power Outlets', icon: <FaPlug className="text-xl" />, available: true },
    { name: 'Sleeper Berths', icon: <FaBed className="text-xl" />, available: train?.trainType === 'Sleeper' },
    { name: 'Shower', icon: <FaShower className="text-xl" />, available: false },
    { name: 'Entertainment', icon: <FaTv className="text-xl" />, available: false },
    { name: 'Wheelchair Access', icon: <FaWheelchair className="text-xl" />, available: true }
  ];

  // Sample reviews data (in a real app, these would come from the backend)
  const reviews = [
    { user: 'Rajesh Kumar', rating: 4, comment: 'Comfortable journey with good amenities.', date: '2023-10-15' },
    { user: 'Priya Sharma', rating: 5, comment: 'Excellent service and clean compartments.', date: '2023-10-10' },
    { user: 'Amit Singh', rating: 3, comment: 'Average experience. Could improve punctuality.', date: '2023-10-05' }
  ];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? <FaStar key={i} className="text-yellow-400" /> : <FaRegStar key={i} className="text-yellow-400" />);
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading train details...</p>
        </div>
      </div>
    );
  }

  if (!train) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTrain className="text-3xl text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Train Not Found</h2>
          <p className="text-gray-600 mb-6">The train you're looking for doesn't exist or may have been removed.</p>
          <button 
            onClick={() => router.push('/admin/dashboard/all-trains')}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FaArrowLeft /> Back to All Trains
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.push('/admin/dashboard/all-trains')}
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Train Details</h1>
        </div>

        {/* Train Header Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-5 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FaTrain className="text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold">{train.trainName}</h2>
                </div>
                <p className="text-blue-100">Train Number: {train.trainNo} • {train.trainType || 'Express'}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/dashboard/all-trains/manage-trains/${train._id}`}>
                  <button className="flex items-center gap-2 cursor-pointer bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition">
                    <FaEdit /> Edit
                  </button>
                </Link>
                <button 
                  onClick={handleDeleteTrain}
                  className="flex items-center gap-2 bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaRoute className="text-xl text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Route</p>
                <p className="font-semibold">{train.start} to {train.end}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaClock className="text-xl text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Journey Time</p>
                <p className="font-semibold">{train.departureTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaCalendarAlt className="text-xl text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Running Days</p>
                <p className="font-semibold">{train.runningDays?.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>

       
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            <button
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'overview' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'coaches' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('coaches')}
            >
              Coaches ({train.coaches?.length || 0})
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'amenities' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('amenities')}
            >
              Amenities
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'schedule' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('schedule')}
            >
              Schedule
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'reviews' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* General Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCog className="text-blue-600" />
                General Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Source Station</span>
                  <span className="font-medium">{train.start}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination Station</span>
                  <span className="font-medium">{train.end}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Departure Time</span>
                  <span className="font-medium">{train.departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Arrival Time</span>
                  <span className="font-medium">{train.arrivalTime}</span>
                </div>
            
                <div className="flex justify-between">
                  <span className="text-gray-600">Running Days</span>
                  <span className="font-medium text-right">{train.runningDays?.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Train Type</span>
                  <span className="font-medium">{train.trainType || 'Express'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Speed</span>
                  <span className="font-medium">~75 km/h</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaUsers className="text-blue-600" />
                Statistics
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Coaches</span>
                    <span className="font-bold text-blue-700">{train.coaches?.length || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (train.coaches?.length || 0) * 10)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Seats</span>
                    <span className="font-bold text-green-700">
                      {train.coaches?.reduce((total, coach) => total + coach.totalSeats, 0) || 0}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Average Occupancy</span>
                    <span className="font-bold text-amber-700">
                      {train.coaches?.length ? 
                        Math.round(train.coaches.reduce((total, coach) => total + getSeatOccupancyPercentage(coach), 0) / train.coaches.length) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={getOccupancyColor(train.coaches?.length ? 
                        Math.round(train.coaches.reduce((total, coach) => total + getSeatOccupancyPercentage(coach), 0) / train.coaches.length) 
                        : 0) + " h-2 rounded-full"} 
                      style={{ width: `${train.coaches?.length ? 
                        Math.round(train.coaches.reduce((total, coach) => total + getSeatOccupancyPercentage(coach), 0) / train.coaches.length) 
                        : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">On-time Performance</span>
                    <span className="font-bold text-purple-700">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `87%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coaches' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Coach Management</h3>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                <FaPlus /> Add Coach
              </button>
            </div>

            {train.coaches?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {train.coaches.map((coach, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{coach.coachName}</h4>
                        <p className="text-sm text-gray-500">{coach.coachType}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {coach.totalSeats} seats
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Occupancy</span>
                        <span className="font-medium">{getSeatOccupancyPercentage(coach)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${getOccupancyColor(getSeatOccupancyPercentage(coach))} h-2 rounded-full`}
                          style={{ width: `${getSeatOccupancyPercentage(coach)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-gray-500">Available</div>
                        <div className="font-semibold text-green-600">{coach.availableSeats}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-gray-500">Booked</div>
                        <div className="font-semibold text-blue-600">{coach.totalSeats - coach.availableSeats}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded">
                        View Seats
                      </button>
                      <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FaChair className="text-2xl text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">No coaches added</h4>
                <p className="text-gray-500 mb-4">This train doesn't have any coaches yet.</p>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition mx-auto">
                  <FaPlus /> Add First Coach
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'amenities' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Train Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {amenities.map((amenity, index) => (
                <div key={index} className={`border rounded-lg p-4 text-center ${amenity.available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${amenity.available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {amenity.icon}
                  </div>
                  <h4 className="font-medium text-gray-800">{amenity.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{amenity.available ? 'Available' : 'Not Available'}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Need to update amenities?</h4>
              <p className="text-sm text-blue-600">Edit the train details to add or remove amenities.</p>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Train Schedule</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Day</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Departure</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Arrival</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {train.runningDays?.map((day, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{day}</td>
                      <td className="py-3 px-4">{train.departureTime}</td>
                      <td className="py-3 px-4">{train.arrivalTime}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Passenger Reviews</h3>
            
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-800">{review.user}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FaStar className="text-2xl text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">No reviews yet</h4>
                <p className="text-gray-500">This train hasn't received any reviews from passengers yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-wrap gap-4">
          <Link href={`/admin/dashboard/all-trains/manage-trains/${train._id}`}>
            <button className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition">
              <FaPlus /> Add Coach
            </button>
          </Link>
         
        </div>
      </div>
    </div>
  );
};

export default TrainDetails;
