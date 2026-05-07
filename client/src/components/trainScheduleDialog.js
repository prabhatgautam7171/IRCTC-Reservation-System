'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Train,
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  IndianRupee,
  Users,
  Wifi,
  Snowflake,
  Utensils,
  X,
  ChartPieIcon,
  Bed,
  Sofa
} from "lucide-react";

const TrainScheduleDrawer = ({ open, onOpenChange, train , routeTimeline, coaches}) => {
  if (!train) return null;




  // Get running days badges
  const getRunningDaysBadges = () => {
    if (!train.runningDays || train.runningDays.length === 0) {
      return <Badge variant="outline" className="bg-gray-100">Not Available</Badge>;
    }

    return train.runningDays.map((day, index) => (
      <Badge
        key={index}
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200 mx-1 mb-1"
      >
        {day}
      </Badge>
    ));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-2xl  ml-auto h-full rounded-l-xl">
        <div className="p-6 h-full">
          <DrawerHeader className="px-0 pt-0 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Train className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <DrawerTitle className="text-2xl font-bold text-blue-900">
                    {train.trainNo} - {train.trainName}
                  </DrawerTitle>
                  <DrawerDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {train.startStation} → {train.endStation}
                    </span>
                  </DrawerDescription>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <X className="w-5 h-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* Train Info Summary */}
          <div className="flex flex-col gap-3 py-4 bg-blue-50 rounded-lg px-4 my-4">
            <div className="flex items-center justify-center gap-2">
            <div className="text-center">
              <div className="text-sm text-gray-600">Start</div>
              <div className="font-bold text-lg">{train.startTime}</div>
              <div className="text-xs text-gray-500">{train.startStation}</div>
            </div>
            <div>⎯⎯⎯⎯➤</div>
            <div className="text-center">
              <div className="text-sm text-gray-600">End</div>
              <div className="font-bold text-lg">{train.endTime}</div>
              <div className="text-xs text-gray-500">{train.endStation}</div>
            </div>
            </div>
            <div className="text-center col-span-2">

              <div className="flex flex-wrap justify-center mt-1">
                {getRunningDaysBadges()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>{0} km</span>
              <span className="mx-2">•</span>
              <Clock className="w-4 h-4" />
              <span>duration</span>
            </div>

            <div className="flex gap-1">
              {coaches?.some(c => c.type === 'AC' || '3A' || '2A' || '1A') && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <Snowflake className="w-3 h-3 mr-1" /> AC
                </Badge>
              )}
              {coaches?.some(c => c.type === 'Sleeper' || 'SL') && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <Bed className="w-3 h-3 mr-1" /> Sleeper
                </Badge>
              )}
              {coaches?.some(c => c.type === 'CC') && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  <Sofa className="w-3 h-3 mr-1" /> CC
                </Badge>
              )}
              {train.coaches?.some(c => c.type === 'General') && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  <Sofa className="w-3 h-3 mr-1" /> CC
                </Badge>
              )}
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-280px)] border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Station</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Arrival</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Departure</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Halt</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Distance</th>

                </tr>
              </thead>
              <tbody>
                {routeTimeline?.map((route, index) => {


                  const isFirst = index === 0;
                  const isLast = index === routeTimeline.length - 1;

                  return (
                    <tr
                      key={index}
                      className={`border-t transition-colors hover:bg-gray-50 ${
                        isFirst ? "bg-blue-50 hover:bg-blue-100" :
                        isLast ? "bg-green-50 hover:bg-green-100" : ""
                      }`}
                    >
                      <td className="p-3 font-medium">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            isFirst ? "bg-red-500" : isLast ? "bg-green-500" : "bg-blue-500"
                          }`} />
                          {route.station}
                          {isFirst && <Badge className="ml-2 bg-red-100 text-red-700">Start</Badge>}
                          {isLast && <Badge className="ml-2 bg-green-100 text-green-700">End</Badge>}
                        </div>
                      </td>
                      <td className="p-3">{route.arrivalTime || "-"}</td>
                      <td className="p-3">{route.departureTime || "-"}</td>
                      <td className="p-3 text-gray-500">{route.haltTime}</td>
                      <td className="p-3">{route.distance || 0} km</td>


                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>

          {/* Footer with additional info */}
          <div className="flex flex-wrap gap-4 pt-4 text-xs text-gray-600 border-t mt-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Origin Station</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Destination Station</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Intermediate Stations</span>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TrainScheduleDrawer;
