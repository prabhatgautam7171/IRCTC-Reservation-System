'use client';

import { Button } from "@/components/ui/button";
import axios from "axios";
import React, { useState } from "react";
import { Plus, Train, Calendar, MapPin, Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import AdminSidebar from "@/components/adminSideBar";

const seatTypesList = ["UpperBerth", "LowerBerth", "MiddleBerth", "SideUpper", "SideLower"];
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function CreateTrainForm() {
  const [formData, setFormData] = useState({
    trainName: "",
    trainNo: "",
    arrivalTime: "",
    departureTime: "",
    start: "",
    end: "",
    runningDays: [],
    routes: [],
    coaches: []
  });

  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    runningDays: true,
    routes: true,
    coaches: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      runningDays: prev.runningDays.includes(day)
        ? prev.runningDays.filter((d) => d !== day)
        : [...prev.runningDays, day]
    }));
  };

  const addRoute = () => {
    setFormData({
      ...formData,
      routes: [
        ...formData.routes,
        { routeName: "", distance: "", arrivalTime: "", departureTime: "", platformNo: "" }
      ]
    });
  };

  const removeRoute = (index) => {
    const newRoutes = [...formData.routes];
    newRoutes.splice(index, 1);
    setFormData({ ...formData, routes: newRoutes });
  };

  const updateRoute = (index, field, value) => {
    const newRoutes = [...formData.routes];
    newRoutes[index][field] = value;
    setFormData({ ...formData, routes: newRoutes });
  };

  const addCoachType = () => {
    setFormData({
      ...formData,
      coaches: [
        ...formData.coaches,
        { coachType: "", pricePerSeat: "", coachList: [] }
      ]
    });
  };

  const removeCoachType = (index) => {
    const newCoaches = [...formData.coaches];
    newCoaches.splice(index, 1);
    setFormData({ ...formData, coaches: newCoaches });
  };

  const updateCoachType = (index, field, value) => {
    const newCoaches = [...formData.coaches];
    newCoaches[index][field] = value;
    setFormData({ ...formData, coaches: newCoaches });
  };

  const addCoach = (coachTypeIndex) => {
    const newCoaches = [...formData.coaches];
    newCoaches[coachTypeIndex].coachList.push({
      coachName: "",
      seatType: seatTypesList.map((type) => ({
        seatType: type,
        totalSeats: 20,
        availableSeats: 20
      }))
    });
    setFormData({ ...formData, coaches: newCoaches });
  };

  const removeCoach = (coachTypeIndex, coachIndex) => {
    const newCoaches = [...formData.coaches];
    newCoaches[coachTypeIndex].coachList.splice(coachIndex, 1);
    setFormData({ ...formData, coaches: newCoaches });
  };

  const updateCoach = (coachTypeIndex, coachIndex, field, value) => {
    const newCoaches = [...formData.coaches];
    newCoaches[coachTypeIndex].coachList[coachIndex][field] = value;
    setFormData({ ...formData, coaches: newCoaches });
  };

  const updateSeatType = (coachTypeIndex, coachIndex, seatIndex, field, value) => {
    const newCoaches = [...formData.coaches];
    newCoaches[coachTypeIndex].coachList[coachIndex].seatType[seatIndex][field] = value;
    setFormData({ ...formData, coaches: newCoaches });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { trainName, trainNo, arrivalTime, departureTime, start, end, runningDays, routes, coaches } = formData;

    if (!trainName || !trainNo || !arrivalTime || !departureTime || !start || !end || runningDays.length === 0 || routes.length === 0 || coaches.length === 0) {
      alert("Please fill all required fields before submitting.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/api/v1/train/create-train", formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      if (res.data.success) {
        alert(res.data.message);
        // Reset form after successful submission
        setFormData({
          trainName: "",
          trainNo: "",
          arrivalTime: "",
          departureTime: "",
          start: "",
          end: "",
          runningDays: [],
          routes: [],
          coaches: []
        });
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      alert(msg);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg p-6 mb-6 shadow-lg">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Train size={32} /> Create New Train
        </h1>
        <p className="text-blue-100 mt-2">Add a new train to the railway system with all necessary details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
        {/* Basic Info */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => toggleSection('basicInfo')}
          >
            <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
            {expandedSections.basicInfo ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.basicInfo && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Train Name *</label>
                  <input 
                    name="trainName" 
                    placeholder="e.g., Rajdhani Express" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                    onChange={handleInputChange}
                    value={formData.trainName}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Train Number *</label>
                  <input 
                    name="trainNo" 
                    placeholder="e.g., 12345" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                    onChange={handleInputChange}
                    value={formData.trainNo}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Station *</label>
                  <input 
                    name="start" 
                    placeholder="e.g., New Delhi" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                    onChange={handleInputChange}
                    value={formData.start}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Station *</label>
                  <input 
                    name="end" 
                    placeholder="e.g., Mumbai Central" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                    onChange={handleInputChange}
                    value={formData.end}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time *</label>
                  <input 
                    name="departureTime" 
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                    onChange={handleInputChange}
                    value={formData.departureTime}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time *</label>
                  <input 
                    name="arrivalTime" 
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                    onChange={handleInputChange}
                    value={formData.arrivalTime}
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Running Days */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => toggleSection('runningDays')}
          >
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={20} /> Running Days *
            </h2>
            {expandedSections.runningDays ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.runningDays && (
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Select all days when this train operates</p>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`px-4 py-2 rounded-md border transition-all ${
                      formData.runningDays.includes(day) 
                        ? "bg-blue-500 text-white border-blue-500 shadow-sm" 
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleDayToggle(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Routes */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => toggleSection('routes')}
          >
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <MapPin size={20} /> Routes *
            </h2>
            {expandedSections.routes ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.routes && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Add all intermediate stations and details</p>
                <Button type="button" onClick={addRoute} className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2">
                  <Plus size={16} /> Add Route
                </Button>
              </div>
              
              {formData.routes.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <MapPin className="mx-auto text-gray-400" size={32} />
                  <p className="mt-2 text-gray-500">No routes added yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.routes.map((route, idx) => (
                    <div key={idx} className="p-4 border rounded-lg shadow-sm bg-white relative">
                      <button
                        type="button"
                        onClick={() => removeRoute(idx)}
                        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <h3 className="font-medium text-gray-700 mb-3">Route #{idx + 1}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Station Name</label>
                          <input 
                            placeholder="Station name" 
                            value={route.routeName} 
                            onChange={(e) => updateRoute(idx, "routeName", e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                          <input 
                            placeholder="Distance" 
                            value={route.distance} 
                            onChange={(e) => updateRoute(idx, "distance", e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                            type="number" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                          <input 
                            placeholder="Arrival" 
                            value={route.arrivalTime} 
                            onChange={(e) => updateRoute(idx, "arrivalTime", e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                          <input 
                            placeholder="Departure" 
                            value={route.departureTime} 
                            onChange={(e) => updateRoute(idx, "departureTime", e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Platform No</label>
                          <input 
                            placeholder="Platform" 
                            value={route.platformNo} 
                            onChange={(e) => updateRoute(idx, "platformNo", e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                            type="number" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coaches */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => toggleSection('coaches')}
          >
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={20} /> Coaches & Seating *
            </h2>
            {expandedSections.coaches ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.coaches && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Configure coach types and seating arrangements</p>
                <Button type="button" onClick={addCoachType} className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2">
                  <Plus size={16} /> Add Coach Type
                </Button>
              </div>
              
              {formData.coaches.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Train className="mx-auto text-gray-400" size={32} />
                  <p className="mt-2 text-gray-500">No coach types added yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.coaches.map((coach, coachIdx) => (
                    <div key={coachIdx} className="border p-5 rounded-xl bg-gray-50 relative">
                      <button
                        type="button"
                        onClick={() => removeCoachType(coachIdx)}
                        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Coach Type</label>
                          <input 
                            placeholder="e.g., AC Sleeper, Chair Car" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                            value={coach.coachType} 
                            onChange={(e) => updateCoachType(coachIdx, "coachType", e.target.value)} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Seat (₹)</label>
                          <input 
                            placeholder="Price" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                            value={coach.pricePerSeat} 
                            onChange={(e) => updateCoachType(coachIdx, "pricePerSeat", e.target.value)} 
                            type="number" 
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="button" 
                        onClick={() => addCoach(coachIdx)} 
                        className="bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-2 mb-4"
                      >
                        <Plus size={16} /> Add Coach
                      </Button>
                      
                      {coach.coachList.length > 0 && (
                        <div className="space-y-4 mt-4">
                          {coach.coachList.map((c, ci) => (
                            <div key={ci} className="mb-4 border p-4 rounded-xl bg-white shadow-sm relative">
                              <button
                                type="button"
                                onClick={() => removeCoach(coachIdx, ci)}
                                className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                              
                              <h4 className="font-medium text-gray-700 mb-3">Coach #{ci + 1}</h4>
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coach Identifier</label>
                                <input 
                                  placeholder="e.g., A1, B2" 
                                  className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                                  value={c.coachName} 
                                  onChange={(e) => updateCoach(coachIdx, ci, "coachName", e.target.value)} 
                                />
                              </div>
                              
                              <h5 className="font-medium text-gray-700 mb-2">Seat Configuration</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {c.seatType.map((s, si) => (
                                  <div key={si} className="bg-gray-50 p-3 rounded border">
                                    <p className="text-sm font-medium text-blue-600 mb-2">{s.seatType}</p>
                                    <div className="space-y-2">
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Total Seats</label>
                                        <input 
                                          placeholder="Total" 
                                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm" 
                                          value={s.totalSeats} 
                                          onChange={(e) => updateSeatType(coachIdx, ci, si, "totalSeats", e.target.value)} 
                                          type="number" 
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Available Seats</label>
                                        <input 
                                          placeholder="Available" 
                                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm" 
                                          value={s.availableSeats} 
                                          onChange={(e) => updateSeatType(coachIdx, ci, si, "availableSeats", e.target.value)} 
                                          type="number" 
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Complete all required fields before submitting</p>
              <p className="text-xs text-gray-500 mt-1">Fields marked with * are required</p>
            </div>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-2 text-lg shadow-md transition-all"
            >
              Create Train
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}