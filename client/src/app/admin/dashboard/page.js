'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/adminSideBar';
import {
  FaTrain,
  FaUsers,
  FaClipboardList,
  FaUserShield,
  FaArrowUp,
  FaArrowDown,
  FaRupeeSign,
  FaIdBadge,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaChartLine,
  FaChartPie,
  FaChartBar,
  FaBell,
  FaChevronDown,
  FaDownload,
  FaCalendarAlt,
  FaTrash
} from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import CountUp from 'react-countup';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, CartesianGrid
} from 'recharts';
import useFetchTrains from '@/hooks/getAllTrains';
import { useSelector } from 'react-redux';
import useFetchUsers from '@/hooks/getAllUsers';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { BlocksIcon } from 'lucide-react';
import { MdBlock, MdDateRange, MdRefresh } from "react-icons/md";
import AdminIDCard from '@/components/adminIdCard';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BiExport } from 'react-icons/bi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdminDashboard = () => {
  useFetchTrains();
  useFetchUsers();
  const AdminName = useSelector(store => store.admin.AdminName || null);
  const trains = useSelector(store => store.trains?.trains || []);
  const users = useSelector(store => store.user?.users || []);
  const bookings = useSelector(store => store.bookings?.bookings || []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');
  const revenue = bookings.reduce((acc, booking) => acc + booking.totalFare, 0);




  const { isAdmin, loading } = useSelector((store) => store.admin);
  const router = useRouter();
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, loading, router]);




  //// Show revenue trend /////////////////////////
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weeklyRevenue = bookings.reduce((acc, booking) => {
    const date = new Date(booking.journeyDate);
    const day = weekdays[date.getDay()]; // get day name
    acc[day] = (acc[day] || 0) + booking.totalFare;
    return acc;
  }, {});


  const revenueData = weekdays.map(day => ({
    day,
    revenue: weeklyRevenue[day] || 0
  }));

  console.log(revenueData);

  /////////////// bookings status //////////////////
  const statusCount = bookings.reduce((acc, booking) => {
    booking.passengers.forEach(passenger => {
      const status = passenger.status;
      acc[status] = (acc[status] || 0) + 1;
    });
    // count bookings per status
    return acc;
  }, {});

  const bookingStatusData = Object.keys(statusCount).map(status => ({
    name: status,
    value: statusCount[status]
  }));

  console.log(bookingStatusData);


  ////// train occupancy //////////
  const trainOccupancyData = trains.map(train => {
    let totalSeats = 0;
    let availableSeats = 0;

    train.coaches.forEach(coach => {
      totalSeats += coach.totalSeats || 0;
      availableSeats += coach.availableSeats || 0;
    });

    const occupied = totalSeats - availableSeats;
    const occupancy = totalSeats > 0 ? Math.round((occupied / totalSeats) * 100) : 0;

    return {
      name: train.trainName || `${train.source} → ${train.destination}` || train._id, // fallback
      occupancy
    };
  });

  console.log(trainOccupancyData);

  const stats = {
    revenue: revenue,
    trains: trains.length,
    users: users.length,
    bookings: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };


    const getGreeting = () => {
      const hour = new Date().getHours();

      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    };



  return (
    <div className="flex min-h-screen bg-gray-50">
  <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} activeItem="dashboard" />

  <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
    {/* Top Bar with Gradient */}
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <Link href={'/'}><span className="hover:text-gray-700 transition-colors cursor-pointer">Home</span></Link>
          <IoIosArrowForward className="mx-2 text-xs" />
          <span className="text-blue-600 font-medium">Dashboard</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-gray-600">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Notification Icon */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <FaBell className="text-xl" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-xl border border-blue-100">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              {AdminName?.charAt(0) || 'A'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{AdminName}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <FaIdBadge className="text-blue-500 text-xs" />
              IRCTC Admin
            </p>
          </div>
          <FaChevronDown className="text-gray-400 text-xs cursor-pointer hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </div>

    {/* Dashboard Content */}
    <div className="p-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-20 -mb-20"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">
            {getGreeting()}, {AdminName}! 👋
          </h2>
          <p className="text-white/90 mb-4 max-w-2xl">
            Welcome back to your IRCTC admin dashboard. Here's what's happening with your railway system today.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
              <MdDateRange />
              <span className="text-sm">Last updated: Just now</span>
            </div>
            <button className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition-colors text-sm">
              <MdRefresh className="animate-spin-slow" />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview with Enhanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={stats.revenue}
          change={15.7}
          icon={<FaRupeeSign className="text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          prefix="₹"
          trend="up"
        />
        <StatCard
          title="Total Trains"
          value={stats.trains}
          change={12.3}
          icon={<FaTrain className="text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
          link="/admin/dashboard/add-trains"
          trend="up"
        />
        <StatCard
          title="Registered Users"
          value={stats.users}
          change={-2.1}
          icon={<FaUsers className="text-white" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend="down"
        />
        <StatCard
          title="Total Bookings"
          value={stats.bookings}
          change={8.4}
          icon={<FaClipboardList className="text-white" />}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          trend="up"
        />
      </div>

      {/* Filters and Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {['overview', 'analytics', 'reports'].map((tab) => (
              <button
                key={tab}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaFilter className="text-gray-400" />
              <span>Filter by:</span>
            </div>
            <select
              className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BiExport className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Revenue Trend</h3>
                <p className="text-xs text-gray-500 mt-1">Last 7 days performance</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">+12.5%</span>
                <FaChartLine className="text-blue-500" />
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#2563EB' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Status Pie Chart */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Booking Status</h3>
                <p className="text-xs text-gray-500 mt-1">Current distribution</p>
              </div>
              <FaChartPie className="text-blue-500" />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Second Row - Occupancy Chart */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Train Occupancy Rates</h3>
                <p className="text-xs text-gray-500 mt-1">Top 5 trains by occupancy</p>
              </div>
              <FaChartBar className="text-blue-500" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainOccupancyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${value}%`, 'Occupancy']}
                  />
                  <Bar dataKey="occupancy" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                    {trainOccupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.occupancy > 80 ? '#10B981' : entry.occupancy > 60 ? '#3B82F6' : '#F59E0B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Recent Bookings</h2>
              <p className="text-xs text-gray-500 mt-1">Latest 5 booking transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <FaDownload className="text-xs" /> Export
              </button>
              <Link
                href="/admin/dashboard/all-bookings"
                className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
              >
                View All
                <IoIosArrowForward className="text-xs" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="py-4 px-6 font-semibold">PNR Number</th>
                  <th className="py-4 px-6 font-semibold">Passenger</th>
                  <th className="py-4 px-6 font-semibold">Route</th>
                  <th className="py-4 px-6 font-semibold">Travel Date</th>
                  <th className="py-4 px-6 font-semibold">Fare</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((booking, index) => {
                  const passengerStatus = booking.passengers[0]?.status?.toLowerCase();

                  return (
                    <motion.tr
                      key={booking._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="font-mono text-blue-600 font-medium">{booking.PNR}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {booking?.passengers[0]?.name?.charAt(0)}
                          </div>
                          <span className="font-medium">{booking?.passengers[0]?.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{booking.source}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium">{booking.destination}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400 text-xs" />
                          <span>{new Date(booking.journeyDate).toLocaleDateString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold">₹{booking.totalFare.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          passengerStatus === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : passengerStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {booking.passengers[0]?.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors" title="View">
                            <FaEye className="text-sm" />
                          </button>
                          <button className="p-1.5 hover:bg-green-100 rounded-lg text-green-600 transition-colors" title="Edit">
                            <FaEdit className="text-sm" />
                          </button>
                          <button className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors" title="Delete">
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm">
            <p className="text-gray-500">Showing 5 of {bookings.length} bookings</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Previous</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">2</button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">3</button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
  );
};

const StatCard = ({ title, value, change, icon, color, prefix = "", link }) => {
  const content = (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">
            {prefix}<CountUp end={value} duration={1.5} separator="," />
          </p>
          <span className={`text-sm flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <FaArrowUp className="mr-1" size={12} /> : <FaArrowDown className="mr-1" size={12} />}
            {Math.abs(change)}% {change >= 0 ? 'increase' : 'decrease'}
          </span>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return link ? <Link href={link}>{content}</Link> : content;
};

export default AdminDashboard;
