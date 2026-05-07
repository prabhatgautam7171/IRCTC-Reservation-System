"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function AirlineManagementPage() {
  const {id} = useParams();
  // const [airlineId, setAirlineId] = useState(null);
  // setAirlineId(id);
  const {selectedAirline} = useSelector(store => store.airlines);
  const airline = selectedAirline;
  const [activeTab, setActiveTab] = useState("airline");
  
  const [aircrafts, setAircrafts] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
       
   
          // Fetch aircrafts for this airline
          const aircraftsRes = await axios.get(`http://localhost:8000/api/v1/aircraft/by-airline/${id}`);
          if (aircraftsRes.data.success) {
            setAircrafts(aircraftsRes.data.aircrafts);
            
            //Fetch flights for each aircraft
            const flightPromises = aircraftsRes.data.aircrafts.map(aircraft => 
              axios.get(`http://localhost:8000/api/v1/flight/by-airline/${id}`)
            );
            
            const flightsResults = await Promise.all(flightPromises);
            const allFlights = flightsResults.flatMap(res => res.data.success ? res.data.flights : []);
            setFlights(allFlights);
          }
        }
      
       catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

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
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
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
      {/* Header with navigation */}
      <div className="max-w-7xl mx-auto mb-2">
        <div className="flex justify-between items-center py-4 border-b border-white/20">
          <div className="text-white font-bold text-xl">AirlineManagement</div>
          <div className="flex space-x-6 text-blue-200">
            <span className="hover:text-white cursor-pointer">Dashboard</span>
            <span className="hover:text-white cursor-pointer">Airlines</span>
            <span className="hover:text-white cursor-pointer">Reports</span>
            <span className="hover:text-white cursor-pointer">Settings</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center py-6">
          <h1 className="text-4xl font-bold text-white mb-2">Airline Management System</h1>
          <p className="text-blue-200">Manage {airline?.name} airline operations</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/20 mb-8">
          <button
            className={`py-3 px-6 font-medium text-sm rounded-t-lg ${activeTab === 'airline' ? 'bg-white/10 text-white border-t border-l border-r border-white/20' : 'text-blue-300 hover:text-white'}`}
            onClick={() => setActiveTab('airline')}
          >
            Airline Details
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm rounded-t-lg ${activeTab === 'aircrafts' ? 'bg-white/10 text-white border-t border-l border-r border-white/20' : 'text-blue-300 hover:text-white'}`}
            onClick={() => setActiveTab('aircrafts')}
          >
            Aircrafts ({aircrafts.length})
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm rounded-t-lg ${activeTab === 'flights' ? 'bg-white/10 text-white border-t border-l border-r border-white/20' : 'text-blue-300 hover:text-white'}`}
            onClick={() => setActiveTab('flights')}
          >
            Flights ({flights.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          {activeTab === 'airline' && <AirlineDetailsTab airline={airline} />}
          {activeTab === 'aircrafts' && <AircraftsTab aircrafts={aircrafts} airlineId={airline?._id} />}
          {activeTab === 'flights' && <FlightsTab flights={flights} aircrafts={aircrafts} />}
        </div>
      </div>
    </div>
  );
}

function AirlineDetailsTab({ airline }) {
  const [formData, setFormData] = useState({
    name: airline?.name || '',
    code: airline?.code || '',
    country: airline?.country || '',
    status: airline?.status || 'active',
    contact: {
      supportEmail: airline?.contact?.supportEmail || '',
      supportPhone: airline?.contact?.supportPhone || '',
      address: airline?.contact?.address || '',
      website: airline?.contact?.website || ''
    }
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(airline?.logoUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create FormData object to handle file upload
      const submitData = new FormData();
      
      // Append all regular form fields
      submitData.append('name', formData.name);
      submitData.append('code', formData.code);
      submitData.append('country', formData.country);
      submitData.append('status', formData.status);
      submitData.append('contact', JSON.stringify(formData.contact));
      
      // Append logo file if selected
      if (logoFile) {
        submitData.append('logo', logoFile);
      }
      
      const res = await axios.put(
        `http://localhost:8000/api/v1/airline/update-airline/${airline._id}`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (res.data.success) {
        alert('Airline details updated successfully!');
      }
    } catch (error) {
      alert('Error updating airline details: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contact.')) {
      const contactField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [contactField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Please select an image smaller than 2MB');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">Airline Information</h2>
      
      {/* Logo Upload Section */}
      <div className="mb-8 p-6 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-300 mb-4">Airline Logo</h3>
        
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Logo Preview */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center bg-gray-700 mb-2">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Airline logo preview" 
                  className="w-full h-full object-cover p-2"
                />
              ) : (
                <img 
                src={airline.logo} 
                alt="Airline logo preview" 
                className="w-full h-full object-cover p-2"
              />
              )}
            </div>
            {logoPreview && (
              <button
                type="button"
                onClick={removeLogo}
                className="text-red-400 text-sm hover:text-red-300 mt-2"
              >
                Remove Logo
              </button>
            )}
          </div>
          
          {/* Upload Controls */}
          <div className="flex-1">
            <div className="mb-4">
              <label className="block text-blue-200 mb-2">Upload Logo</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 px-4 py-2 bg-blue-800 border border-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                {logoFile && (
                  <span className="text-blue-200 text-sm">{logoFile.name}</span>
                )}
              </div>
            </div>
            
            <div className="text-blue-300 text-sm">
              <p>• Accepted formats: JPG, PNG, SVG, WebP</p>
              <p>• Max file size: 2MB</p>
              <p>• Recommended dimensions: 300×300 pixels</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Airline Details Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-blue-200 mb-2">Airline Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-blue-200 mb-2">Airline Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
            required
          />
        </div>
        <div>
          <label className="block text-blue-200 mb-2">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-blue-200 mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-blue-200 mb-2">Support Email</label>
          <input
            type="email"
            name="contact.supportEmail"
            value={formData.contact.supportEmail}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-blue-200 mb-2">Support Phone</label>
          <input
            type="tel"
            name="contact.supportPhone"
            value={formData.contact.supportPhone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-blue-200 mb-2">Address</label>
          <input
            type="text"
            name="contact.address"
            value={formData.contact.address}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-blue-200 mb-2">Website</label>
          <input
            type="url"
            name="contact.website"
            value={formData.contact.website}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}



// Aircraft Seat Map Component
function AircraftSeatMap({ aircraft }) {
  if (!aircraft.classes || aircraft.classes.length === 0) {
    return <div className="text-blue-200 p-4 text-center">No seat configuration available for this aircraft.</div>;
  }

  return (
    <div className="w-full">
      {/* Aircraft Outline */}
      <div className="relative mx-auto mb-6">
        <div className="bg-gray-200 h-4 rounded-t-lg mx-auto w-3/4"></div>
        <div className="bg-gray-800 h-8 rounded-lg mx-auto w-5/6"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-700 font-bold text-sm bg-gray-200 px-3 py-1 rounded-lg">
            {aircraft.name} ({aircraft.code})
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center mb-6 space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 mr-1 rounded-sm"></div>
          <span className="text-white">Window</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 mr-1 rounded-sm"></div>
          <span className="text-white">Aisle</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-500 mr-1 rounded-sm"></div>
          <span className="text-white">Middle</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 mr-1 rounded-sm"></div>
          <span className="text-white">Occupied</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="space-y-8">
        {aircraft.classes.map((classItem, classIndex) => (
          <div key={classIndex} className="bg-blue-900/30 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">
              {classItem.classType} Class
            </h3>
            
            <div className="flex">
              {/* Left side of aircraft */}
              <div className="flex-1 pr-2">
                {classItem.rows && classItem.rows.length > 0 && (
                  <div className="space-y-2">
                    {classItem.rows.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex items-center justify-end">
                        <div className="w-8 text-white font-bold mr-2">{row.rowNo}</div>
                        <div className="flex space-x-1">
                          {row.seats && row.seats.filter(seat => 
                            seat.seatNo.endsWith('A') || seat.seatNo.endsWith('B') || 
                            (classItem.classType === 'First' && seat.seatNo.endsWith('C'))
                          ).map((seat, seatIndex) => (
                            <Seat key={seatIndex} seat={seat} row={row} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Aisle */}
              <div className="w-12 bg-gray-700/50 mx-2 rounded-lg flex items-center justify-center">
                <div className="text-white text-xs rotate-90 uppercase tracking-widest">Aisle</div>
              </div>
              
              {/* Right side of aircraft */}
              <div className="flex-1 pl-2">
                {classItem.rows && classItem.rows.length > 0 && (
                  <div className="space-y-2">
                    {classItem.rows.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex items-center">
                        <div className="flex space-x-1">
                          {row.seats && row.seats.filter(seat => 
                            seat.seatNo.endsWith('D') || seat.seatNo.endsWith('E') || 
                            seat.seatNo.endsWith('F') || (classItem.classType === 'First' && seat.seatNo.endsWith('C'))
                          ).map((seat, seatIndex) => (
                            <Seat key={seatIndex} seat={seat} row={row} />
                          ))}
                        </div>
                        <div className="w-8 text-white font-bold ml-2">{row.rowNo}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Class divider */}
            {classIndex < aircraft.classes.length - 1 && (
              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="text-white text-sm text-center">————— {classItem.classType} Class End —————</div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Aircraft Tail Section */}
      <div className="mt-8 mx-auto w-1/4 h-12 bg-gray-800 rounded-t-lg flex items-center justify-center">
        <div className="text-white text-xs">Tail</div>
      </div>
    </div>
  );
}

// Individual Seat Component
function Seat({ seat, row }) {
  const getSeatColor = (type) => {
    switch(type) {
      case 'window': return 'bg-blue-500';
      case 'aisle': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`w-8 h-8 flex flex-col items-center justify-center rounded-md text-xs font-medium
        ${getSeatColor(seat.seatType)} 
        ${seat.isAvailable ? 'text-white' : 'text-red-300 bg-red-700/80'}`}
      title={`Seat: ${seat.seatNo}, Type: ${seat.seatType}, ${seat.isAvailable ? 'Available' : 'Occupied'}`}
    >
      <div className="text-[10px] leading-3">{row.rowNo}</div>
      <div className="font-bold">{seat.seatNo.replace(row.rowNo, '')}</div>
    </div>
  );
}

// Aircrafts Tab Component
function AircraftsTab({ aircrafts, airlineId }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    totalSeats: '',
    status: 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:8000/api/v1/airline/${airlineId}/aircrafts`, formData);
      if (res.data.success) {
        alert('Aircraft added successfully!');
        setShowForm(false);
        setFormData({ name: '', code: '', totalSeats: '', status: 'active' });
        // In a real app, you would refresh the aircraft list
      }
    } catch (error) {
      alert('Error adding aircraft: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleViewSeats = (aircraft) => {
    setSelectedAircraft(aircraft);
    setShowSeatMap(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Aircraft Fleet</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-blue-900 font-bold py-2 px-4 rounded-lg transition duration-200 hover:bg-blue-100"
        >
          {showForm ? 'Cancel' : 'Add New Aircraft'}
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-900/30 p-6 rounded-lg mb-6 border border-blue-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Add New Aircraft</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-200 mb-2">Aircraft Model</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Aircraft Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Total Seats</label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-white text-blue-900 font-bold py-2 px-6 rounded-lg transition duration-200 hover:bg-blue-100"
              >
                Add Aircraft
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-blue-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Aircraft</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Seats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {aircrafts.length > 0 ? (
              aircrafts.map((aircraft) => (
                <tr key={aircraft._id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-white">{aircraft.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-300">
                      {aircraft.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{aircraft.totalSeats}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${aircraft.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {aircraft.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => handleViewSeats(aircraft)}
                      className="text-blue-300 hover:text-white mr-3"
                    >
                      View Seats
                    </button>
                    <button className="text-blue-300 hover:text-white mr-3">Edit</button>
                    <button className="text-red-300 hover:text-red-100">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <div className="text-blue-300">No aircrafts found. Add your first aircraft to get started.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Seat Map Modal */}
      {showSeatMap && selectedAircraft && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-sky-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedAircraft.name} ({selectedAircraft.code}) - Seat Configuration
              </h2>
              <button 
                onClick={() => setShowSeatMap(false)}
                className="text-white hover:text-blue-200 text-2xl bg-blue-700 w-8 h-8 rounded-full"
              >
                &times;
              </button>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                <div>
                  <span className="text-blue-200">Total Seats:</span> {selectedAircraft.totalSeats}
                </div>
                <div>
                  <span className="text-blue-200">Classes:</span> {selectedAircraft.classes?.length || 0}
                </div>
                <div>
                  <span className="text-blue-200">Status:</span> 
                  <span className={`ml-1 ${selectedAircraft.status === 'active' ? 'text-green-300' : 'text-red-300'}`}>
                    {selectedAircraft.status}
                  </span>
                </div>
                <div>
                  <span className="text-blue-200">Code:</span> {selectedAircraft.code}
                </div>
              </div>
            </div>
            
            <AircraftSeatMap aircraft={selectedAircraft} />
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSeatMap(false)}
                className="bg-white text-blue-900 font-bold py-2 px-6 rounded-lg transition duration-200 hover:bg-blue-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Flights Tab Component
function FlightsTab({ flights, aircrafts }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    flightNumber: '',
    aircraft: '',
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    status: 'scheduled',
    price: {
      economy: '',
      business: '',
      first: ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:8000/api/v1/aircraft/${formData.aircraft}/flights`, formData);
      if (res.data.success) {
        alert('Flight added successfully!');
        setShowForm(false);
        setFormData({
          flightNumber: '',
          aircraft: '',
          from: '',
          to: '',
          departureTime: '',
          arrivalTime: '',
          status: 'scheduled',
          price: { economy: '', business: '', first: '' }
        });
      }
    } catch (error) {
      alert('Error adding flight: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('price.')) {
      const priceField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        price: {
          ...prev.price,
          [priceField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Flight Schedule</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-blue-900 font-bold py-2 px-4 rounded-lg transition duration-200 hover:bg-blue-100"
        >
          {showForm ? 'Cancel' : 'Add New Flight'}
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-900/30 p-6 rounded-lg mb-6 border border-blue-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Add New Flight</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-200 mb-2">Flight Number</label>
              <input
                type="text"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Aircraft</label>
              <select
                name="aircraft"
                value={formData.aircraft}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg"
                required
              >
                <option value="">Select Aircraft</option>
                {aircrafts.map(aircraft => (
                  <option key={aircraft._id} value={aircraft._id}>{aircraft.name} ({aircraft.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-blue-200 mb-2">From</label>
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                placeholder="e.g., DEL"
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">To</label>
              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="e.g., BOM"
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Departure Time</label>
              <input
                type="datetime-local"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Arrival Time</label>
              <input
                type="datetime-local"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Economy Price ($)</label>
              <input
                type="number"
                name="price.economy"
                value={formData.price.economy}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Business Price ($)</label>
              <input
                type="number"
                name="price.business"
                value={formData.price.business}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">First Class Price ($)</label>
              <input
                type="number"
                name="price.first"
                value={formData.price.first}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/50 text-white rounded-lg"
              >
                <option value="scheduled">Scheduled</option>
                <option value="departed">Departed</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
                <option value="landed">Landed</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-white text-blue-900 font-bold py-2 px-6 rounded-lg transition duration-200 hover:bg-blue-100"
              >
                Add Flight
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-blue-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Flight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Departure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Arrival</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Aircraft</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {flights.length > 0 ? (
              flights.map((flight) => (
                <tr key={flight._id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-white">{flight.flightNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white">{flight.from} → {flight.to}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {new Date(flight.departureTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {new Date(flight.arrivalTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                     {flight?.aircraft.name}


                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      flight.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' :
                      flight.status === 'departed' ? 'bg-green-500/20 text-green-300' :
                      flight.status === 'delayed' ? 'bg-yellow-500/20 text-yellow-300' :
                      flight.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {flight.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-300 hover:text-white mr-3">Edit</button>
                    <button className="text-red-300 hover:text-red-100">Cancel</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="text-blue-300">No flights found. Add your first flight to get started.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}