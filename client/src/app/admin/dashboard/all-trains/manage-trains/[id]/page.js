"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Label } from "@/components/ui/label";
import { setUpdatedTrain } from "@/redux/trainSlice";
import AddCoachDialog from "@/components/addCoachDialog";
import CoachList from "@/components/coachesAccordian";
import {
  Pencil,
  TrainFront,
  MapPin,
  Clock,
  CalendarDays,
  Trash2,
  PlusCircle,
  TrendingUp,
  Save,
  AlertCircle,
  Route,
  Settings2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TrainManager = () => {
  const { id } = useParams();
  const { selectedTrain } = useSelector((state) => state.trains);
  const [train, setTrain] = useState(selectedTrain);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [form, setForm] = useState({
    trainName: train?.trainName || "",
    trainNo: train?.trainNo || "",
    source: train?.start || "",
    destination: train?.end || "",
    departureTime: train?.departureTime || "",
    arrivalTime: train?.arrivalTime || "",
    runningDays: train?.runningDays || "",
    routes:
      train?.routes?.map((route) => ({
        routeName: route?.routeName || "",
        distance: route?.distance ?? "",
        arrivalTime: route?.arrivalTime || "",
        departureTime: route?.departureTime || "",
        platformNo: route?.platformNo || "",
      })) || [],
  });

  // Check for changes
  useEffect(() => {
    const hasFormChanged = JSON.stringify(form) !== JSON.stringify({
      trainName: train?.trainName || "",
      trainNo: train?.trainNo || "",
      source: train?.start || "",
      destination: train?.end || "",
      departureTime: train?.departureTime || "",
      arrivalTime: train?.arrivalTime || "",
      runningDays: train?.runningDays || "",
      routes:
        train?.routes?.map((route) => ({
          routeName: route?.routeName || "",
          distance: route?.distance ?? "",
          arrivalTime: route?.arrivalTime || "",
          departureTime: route?.departureTime || "",
          platformNo: route?.platformNo || "",
        })) || [],
    });
    
    setHasChanges(hasFormChanged);
  }, [form, train]);

  const updateTrain = async () => {
    // Validation before request
   
    
    if (form.routes.some((r) => !r.routeName.trim())) {
      return toast.error("Each route must have a station name");
    }
    
    if (form.routes.some((r) => r.distance < 0)) {
      return toast.error("Distance cannot be negative");
    }

    setIsLoading(true);
    
    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/train/edit-train/${id}`,
        form,
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      if (res.data.success) {
        toast.success("✅ Train updated successfully");
        dispatch(setUpdatedTrain(res.data.train));
        setTrain(res.data.train);
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update train details");
    } finally {
      setIsLoading(false);
    }
  };

  const addRoute = () => {
    setForm({
      ...form,
      routes: [
        ...form.routes,
        {
          routeName: "",
          distance: "",
          arrivalTime: "",
          departureTime: "",
          platformNo: "",
        },
      ],
    });
  };

  const removeRoute = (idx) => {
    if (form.routes.length <= 1) {
      return toast.error("At least one route is required");
    }
    
    setForm({ 
      ...form, 
      routes: form.routes.filter((_, i) => i !== idx) 
    });
  };

  // Format running days for display
  const formatRunningDays = (days) => {
    if (!days) return ""; // handle undefined/null
  
    // If it's a string, split it into an array
    if (typeof days === "string") {
      days = days.split(','); // or split by space if that's how it's stored
    }
  
    const dayMap = {
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
      Sun: "Sunday"
    };
  
    return days.map(day => dayMap[day.trim()] || day.trim()).join(' ');
  };
  

  // Calculate total distance for summary
  const totalDistance = form.routes.reduce(
    (sum, r) => sum + (Number(r.distance) || 0),
    0
  );

  // Calculate journey duration
  const calculateDuration = () => {
    if (!form.departureTime || !form.arrivalTime) return "N/A";
    
    try {
      const [depHours, depMins] = form.departureTime.split(':').map(Number);
      const [arrHours, arrMins] = form.arrivalTime.split(':').map(Number);
      
      let totalMins = (arrHours * 60 + arrMins) - (depHours * 60 + depMins);
      if (totalMins < 0) totalMins += 24 * 60; // Handle next day arrival
      
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      
      return `${hours}h ${mins}m`;
    } catch (error) {
      return "Invalid time format";
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrainFront className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Train Management</h1>
              <p className="text-slate-600">Manage train details, routes & coaches</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                <AlertCircle className="w-3 h-3 mr-1" /> Unsaved changes
              </Badge>
            )}
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="w-4 h-4 mr-2" /> Actions
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Train Management Actions</DialogTitle>
                  <DialogDescription>
                    Select an action to perform on this train
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-4">
                  <Button variant="outline" className="justify-start">
                    View Schedule
                  </Button>
                  <Button variant="outline" className="justify-start">
                    Manage Fares
                  </Button>
                  <Button variant="outline" className="justify-start text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" /> Deactivate Train
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold">
                    {form.trainName} ({form.trainNo})
                  </h2>
                  <Badge variant="secondary" className="bg-slate-100">
                    {train?.coaches?.length || 0} coaches
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-slate-700">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-green-600 mr-1" />
                    <span className="font-medium">{form.source}</span>
                    <span className="mx-2 text-slate-400">→</span>
                    <span className="font-medium">{form.destination}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-blue-600 mr-1" /> 
                      {form.departureTime || "N/A"} - {form.arrivalTime || "N/A"}
                    </span>
                    
                    <span className="flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                      {totalDistance} km • {calculateDuration()}
                    </span>
                    
                    <span className="flex items-center text-sm">
                      <CalendarDays className="w-4 h-4 text-amber-600 mr-1" />
                      {formatRunningDays(form.runningDays)}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={updateTrain} 
                disabled={!hasChanges || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="details">Train Details</TabsTrigger>
            <TabsTrigger value="routes">Routes & Schedule</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Pencil className="w-5 h-5 text-red-500" /> Basic Information
                  </CardTitle>
                  <CardDescription>
                    Update train identification and schedule details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Train Name", key: "trainName", placeholder: "Express Train" },
                      { label: "Train Number", key: "trainNo", placeholder: "12345" },
                      { label: "Source Station", key: "source", placeholder: "Starting station" },
                      { label: "Destination Station", key: "destination", placeholder: "Terminal station" },
                    ].map((field) => (
                      <div key={field.key} className="flex flex-col">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                          id={field.key}
                          value={form[field.key]}
                          onChange={(e) =>
                            setForm({ ...form, [field.key]: e.target.value })
                          }
                          placeholder={field.placeholder}
                          className="bg-white"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <Label htmlFor="departureTime">Departure Time</Label>
                      <Input
                        id="departureTime"
                        type="time"
                        value={form.departureTime}
                        onChange={(e) =>
                          setForm({ ...form, departureTime: e.target.value })
                        }
                        className="bg-white"
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <Label htmlFor="arrivalTime">Arrival Time</Label>
                      <Input
                        id="arrivalTime"
                        type="time"
                        value={form.arrivalTime}
                        onChange={(e) =>
                          setForm({ ...form, arrivalTime: e.target.value })
                        }
                        className="bg-white"
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <Label htmlFor="runningDays">Running Days</Label>
                      <Input
                        id="runningDays"
                        value={form.runningDays}
                        onChange={(e) =>
                          setForm({ ...form, runningDays: e.target.value })
                        }
                        placeholder="Mon, Tue, Wed..."
                        className="bg-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Route className="w-5 h-5 text-blue-500" /> Route Summary
                  </CardTitle>
                  <CardDescription>
                    Overview of the train's route and stations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">Total Distance</span>
                      <span className="font-semibold">{totalDistance} km</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">Number of Stops</span>
                      <span className="font-semibold">{form.routes.length} stations</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">Journey Duration</span>
                      <span className="font-semibold">{calculateDuration()}</span>
                    </div>
                  </div>
                  
                  <Alert className="mt-6 bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      Changes to routes and schedule are managed in the Routes & Schedule tab.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="routes" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-green-500" /> Routes & Schedule
                </CardTitle>
                <CardDescription>
                  Manage stations, timings, and platform information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {form.routes.map((route, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative bg-slate-50 border border-slate-200 rounded-lg p-5"
                    >
                      <div className="absolute -left-2 top-5 flex items-center justify-center w-6 h-6 bg-slate-500 text-white text-xs font-bold rounded-full">
                        {idx + 1}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {[
                          { key: "routeName", label: "Station Name", type: "text", placeholder: "Station name" },
                          { key: "distance", label: "Distance (km)", type: "number", placeholder: "0" },
                          { key: "arrivalTime", label: "Arrival Time", type: "time", placeholder: "" },
                          { key: "departureTime", label: "Departure Time", type: "time", placeholder: "" },
                          { key: "platformNo", label: "Platform No.", type: "text", placeholder: "1" },
                        ].map((field) => (
                          <div key={field.key} className="flex flex-col">
                            <Label className="text-sm font-medium mb-1">
                              {field.label}
                            </Label>
                            <Input
                              type={field.type}
                              value={route[field.key] === 0 ? "0" : route[field.key] || ""}
                              onChange={(e) => {
                                const newRoutes = [...form.routes];
                                newRoutes[idx][field.key] =
                                  field.type === "number"
                                    ? e.target.value === ""
                                      ? ""
                                      : Number(e.target.value)
                                    : e.target.value;
                                setForm({ ...form, routes: newRoutes });
                              }}
                              placeholder={field.placeholder}
                              className="bg-white"
                            />
                          </div>
                        ))}
                      </div>
                      
                      {form.routes.length > 1 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="absolute -top-2 -right-2 bg-slate-500 hover:bg-slate-600 text-white p-1.5 rounded-full shadow-md">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Removal</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove this station from the route? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button 
                                variant="destructive" 
                                onClick={() => removeRoute(idx)}
                              >
                                Remove Station
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </motion.div>
                  ))}
                </div>
                
                <Button
                  type="button"
                  onClick={addRoute}
                  className="mt-6 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Add Station
                </Button>
                
                <Alert className="mt-6 bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    Ensure stations are added in the correct geographical order. Distance should be cumulative from the source station.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="coaches" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrainFront className="w-5 h-5 text-blue-500" /> Coach Management
                </CardTitle>
                <CardDescription>
                  Add and manage coaches for this train
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CoachList train={train} id={id} />
                
                <div className="mt-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Total Coaches: {train?.coaches?.length || 0}</h3>
                    <p className="text-sm text-slate-500">Add new coaches as needed</p>
                  </div>
                  
                  <AddCoachDialog trainId={id} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TrainManager;