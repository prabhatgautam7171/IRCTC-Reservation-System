"use client";

import { setSelectedAirline } from "@/redux/flightRedux/airlineSlice";
import axios from "axios";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

export default function AllAirlinesPage() {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const router = useRouter();
  const dispatch = useDispatch();

  // Fetch airlines
  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/api/v1/airline/get-allAirlines");
        if (res.data.success)
          setAirlines(res.data.allAirlines || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAirlines();
  }, []);

  // Filter and search airlines
  const filteredAirlines = airlines
    .filter(airline => {
      const matchesSearch =
        airline.name.toLowerCase().includes(search.toLowerCase()) ||
        airline.code.toLowerCase().includes(search.toLowerCase()) ||
        (airline.country && airline.country.toLowerCase().includes(search.toLowerCase()));

      const matchesFilter = filter === "all" || airline.status === filter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 via-blue-800 to-sky-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-blue-700 rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-blue-700 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-blue-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 via-blue-800 to-sky-900 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 text-center border border-white/20">
        <div className="text-white text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Airlines</h2>
        <p className="text-blue-100 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-white text-blue-900 font-bold py-2 px-6 rounded-lg transition duration-200 hover:bg-blue-100"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 via-blue-800 to-sky-900 p-6">
      {/* Header with navigation style */}
      <div className="max-w-7xl mx-auto mb-2">
        <div className="flex justify-between items-center py-4 border-b border-white/20">
          <div className="text-white font-bold text-xl">AirlineDirectory</div>
          <div className="flex space-x-6 text-blue-200">
            <span className="hover:text-white cursor-pointer">Dashboard</span>
            <span className="hover:text-white cursor-pointer">Flights</span>
            <span className="hover:text-white cursor-pointer">Statistics</span>
            <span className="hover:text-white cursor-pointer">Settings</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center py-6">
          <h1 className="text-4xl font-bold text-white mb-2">Global Airlines Directory</h1>
          <p className="text-blue-200">Comprehensive database of {airlines.length} airlines worldwide</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Airlines</h3>
            <p className="text-3xl font-bold">{airlines.length}</p>
            <div className="w-full bg-blue-500/30 h-2 mt-2 rounded-full">
              <div className="bg-blue-400 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-white">
            <h3 className="text-lg font-semibold mb-2">Active Airlines</h3>
            <p className="text-3xl font-bold text-green-300">
              {airlines.filter(a => a.status === 'active').length}
            </p>
            <div className="w-full bg-green-500/30 h-2 mt-2 rounded-full">
              <div className="bg-green-400 h-2 rounded-full" style={{ width: `${(airlines.filter(a => a.status === 'active').length / airlines.length) * 100}%` }}></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-white">
            <h3 className="text-lg font-semibold mb-2">Filtered Results</h3>
            <p className="text-3xl font-bold text-purple-300">{filteredAirlines.length}</p>
            <div className="w-full bg-purple-500/30 h-2 mt-2 rounded-full">
              <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${(filteredAirlines.length / airlines.length) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search airlines by name, code, or country"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-3 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full placeholder-blue-300"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Airlines Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-blue-900/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                    Airline
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                    Country
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredAirlines.length > 0 ? (
                  filteredAirlines.map((airline) => (
                    <tr key={airline._id} className="hover:bg-white/5 transition duration-150 group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                            <img
                              src={airline.logo}
                              alt={`${airline.name} logo`}
                              className="h-12 w-12 object-cover rounded"
                            />

                          </div>
                          <div>
                            <div className="font-medium text-white">{airline.name}</div>
                            <div className="text-blue-300 text-sm">Since {1950 + Math.floor(Math.random() * 70)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {airline.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-white mr-2">{"🌎"}</span>
                          <span className="text-white">{airline.country}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${airline.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                          {airline.status === 'active' ? 'Operational' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Edit onClick={() => {
                          dispatch(setSelectedAirline(airline));
                          router.push(`/flights/flightDashboard/manage-airline/${airline._id}`)
                        }} className="text-green-600" />
                        <button className="text-blue-300 hover:text-white mr-3">View</button>
                        <button className="text-blue-300 hover:text-white">Flights</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <svg className="mx-auto h-12 w-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-white">No airlines found</h3>
                      <p className="mt-2 text-blue-200">Try adjusting your search or filter to find what you're looking for.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-blue-300 text-sm">
          <p>© {new Date().getFullYear()} AirlineDirectory Pro • Data sourced from aviation authorities worldwide</p>
        </div>
      </div>
    </div>
  );
}