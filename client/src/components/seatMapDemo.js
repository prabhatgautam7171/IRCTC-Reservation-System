"use client";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Train, User, DoorOpen, Luggage } from "lucide-react";

// Seat UI Component with Indian train style
const Seat = ({ seatType, number, isAvailable }) => {
  const colors = {
    LowerBerth: "bg-green-500 border-green-600",
    MiddleBerth: "bg-yellow-500 border-yellow-600",
    UpperBerth: "bg-blue-500 border-blue-600",
    SideLower: "bg-orange-500 border-orange-600",
    SideUpper: "bg-purple-500 border-purple-600",
  };

  const labels = {
    LowerBerth: "LB",
    MiddleBerth: "MB",
    UpperBerth: "UB",
    SideLower: "SL",
    SideUpper: "SU",
  };

  return (
    <div
      className={`w-16 h-8 flex items-center justify-center text-xs font-bold rounded border-2
        ${isAvailable ? colors[seatType] + " text-white" : "bg-gray-400 border-gray-500 text-gray-200 line-through"} 
        ${isAvailable ? "cursor-pointer hover:brightness-110 transition" : ""}`}
    >
      {labels[seatType]}-{number}
    </div>
  );
};

// Indian Train Seat Map Component
const SeatMapDemo = ({ coach }) => {
  const [open, setOpen] = useState(false);

  if (!coach) return null;

  // Generate seat data
  const generateSeats = () => {
    const seatsByType = {};
    coach?.seatType?.forEach((group) => {
      seatsByType[group.seatType] = Array.from(
        { length: group.totalSeats },
        (_, i) => ({
          number: i + 1,
          isAvailable: i < group.availableSeats,
          seatType: group.seatType,
        })
      );
    });
    return seatsByType;
  };

  // Render Indian train coach layout
  const renderIndianCoachLayout = () => {
    const seatsByType = generateSeats();
    const compartments = [];
    const totalCompartments = 8; // Standard Indian coach has 8 compartments
    
    for (let comp = 0; comp < totalCompartments; comp++) {
      compartments.push(
        <div key={comp} className="relative mb-6 p-4 border-2 border-yellow-700 bg-yellow-50 rounded-lg">
          {/* Compartment label */}
          <div className="absolute -top-3 left-4 bg-yellow-700 text-white text-xs px-3 py-1 rounded-full">
            Bay {comp + 1}
          </div>
          
          {/* Main berths - Indian train layout */}
          <div className="flex gap-8 items-start">
            {/* Left side berths */}
            <div className="flex flex-col gap-2">
              {/* Upper Berth */}
              <div className="flex justify-center">
                {seatsByType.UpperBerth?.[comp * 2] && (
                  <Seat {...seatsByType.UpperBerth[comp * 2]} />
                )}
              </div>
              
              {/* Middle Berth */}
              <div className="flex justify-center">
                {seatsByType.MiddleBerth?.[comp * 2] && (
                  <Seat {...seatsByType.MiddleBerth[comp * 2]} />
                )}
              </div>
              
              {/* Lower Berth */}
              <div className="flex justify-center">
                {seatsByType.LowerBerth?.[comp * 2] && (
                  <Seat {...seatsByType.LowerBerth[comp * 2]} />
                )}
              </div>
            </div>
            
            {/* Right side berths */}
            <div className="flex flex-col gap-2">
              {/* Upper Berth */}
              <div className="flex justify-center">
                {seatsByType.UpperBerth?.[comp * 2 + 1] && (
                  <Seat {...seatsByType.UpperBerth[comp * 2 + 1]} />
                )}
              </div>
              
              {/* Middle Berth */}
              <div className="flex justify-center">
                {seatsByType.MiddleBerth?.[comp * 2 + 1] && (
                  <Seat {...seatsByType.MiddleBerth[comp * 2 + 1]} />
                )}
              </div>
              
              {/* Lower Berth */}
              <div className="flex justify-center">
                {seatsByType.LowerBerth?.[comp * 2 + 1] && (
                  <Seat {...seatsByType.LowerBerth[comp * 2 + 1]} />
                )}
              </div>
            </div>
          </div>
          
          {/* Side berths at the end of each bay */}
          <div className="flex justify-between mt-4 px-4">
            <div className="flex flex-col gap-2">
              {seatsByType.SideUpper?.[comp] && (
                <Seat {...seatsByType.SideUpper[comp]} />
              )}
              {seatsByType.SideLower?.[comp] && (
                <Seat {...seatsByType.SideLower[comp]} />
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              {seatsByType.SideUpper?.[comp + totalCompartments] && (
                <Seat {...seatsByType.SideUpper[comp + totalCompartments]} />
              )}
              {seatsByType.SideLower?.[comp + totalCompartments] && (
                <Seat {...seatsByType.SideLower[comp + totalCompartments]} />
              )}
            </div>
          </div>
        </div>
      );
    }

    return compartments;
  };

  return (
    <div className="p-2">
      <Button 
        onClick={() => setOpen(true)} 
        variant="outline" 
        className="gap-2 text-sm h-8"
      >
        <Train className="w-4 h-4" /> View Seat Map
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="h-[90vh] max-w-4xl mx-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <DrawerHeader className="p-0">
              <DrawerTitle className="flex items-center gap-2 text-xl">
                <Train className="w-6 h-6 text-blue-600" />
                Coach {coach?.coachName} - Seat Layout
              </DrawerTitle>
              <DrawerDescription>
                Indian Railways Style Seating Arrangement
              </DrawerDescription>
            </DrawerHeader>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Coach diagram header */}
          <div className="p-4 bg-blue-50 border-y">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Entrance/Exit</span>
              </div>
              <div className="flex items-center gap-2">
                <Luggage className="w-4 h-4" />
                <span className="text-sm font-medium">Luggage Area</span>
              </div>
            </div>
          </div>

          {/* Scrollable seat layout */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="max-w-2xl mx-auto">
              {/* Toilet and Luggage Area */}
              <div className="flex justify-between mb-6 p-3 bg-gray-200 rounded">
                <div className="w-20 h-12 flex items-center justify-center bg-white border border-gray-400 rounded text-xs">
                  Toilet
                </div>
                <div className="w-20 h-12 flex items-center justify-center bg-white border border-gray-400 rounded text-xs">
                  Luggage
                </div>
              </div>

              {/* Seat compartments */}
              {renderIndianCoachLayout()}

              {/* End of coach */}
              <div className="flex justify-between mt-6 p-3 bg-gray-200 rounded">
                <div className="w-20 h-12 flex items-center justify-center bg-white border border-gray-400 rounded text-xs">
                  Toilet
                </div>
                <div className="w-20 h-12 flex items-center justify-center bg-white border border-gray-400 rounded text-xs">
                  Luggage
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 border-t bg-white">
            <h4 className="font-medium mb-3 text-center">Seat Type Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 border border-green-600 rounded"></div>
                <span>Lower Berth (LB)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 border border-yellow-600 rounded"></div>
                <span>Middle Berth (MB)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
                <span>Upper Berth (UB)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 border border-orange-600 rounded"></div>
                <span>Side Lower (SL)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 border border-purple-600 rounded"></div>
                <span>Side Upper (SU)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 border border-gray-500 rounded"></div>
                <span>Booked</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-4 pt-3 border-t text-center text-sm text-gray-600">
              <div className="flex justify-center gap-6">
                <span>Total Seats: {coach?.totalSeats || 0}</span>
                <span>Available: {coach?.availableSeats || 0}</span>
                <span>Booked: {(coach?.totalSeats || 0) - (coach?.availableSeats || 0)}</span>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default SeatMapDemo;