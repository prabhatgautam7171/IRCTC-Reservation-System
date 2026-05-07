'use client';
import React, { useState } from 'react';
import { FaTrain, FaWindowClose } from 'react-icons/fa';
import { IndianRupee, Users, DoorOpen, Luggage, Wifi, Snowflake } from 'lucide-react';

const COACHES = [
  { id: 'Engine', label: 'WAP-7', type: 'loco', lhb: true },
  { id: 'GEN', label: 'General', type: 'general', seats: { total: 90, available: 22 } },
  { id: 'S1', label: 'Sleeper', type: 'sleeper', seats: { total: 72, available: 18 } },
  { id: 'S2', label: 'Sleeper', type: 'sleeper', seats: { total: 72, available: 16 } },
  { id: 'S3', label: 'Sleeper', type: 'sleeper', seats: { total: 72, available: 20 } },
  { id: 'A1', label: 'AC 2-Tier', type: 'ac2', seats: { total: 52, available: 7 } },
  { id: 'B1', label: 'AC 3-Tier', type: 'ac3', seats: { total: 64, available: 12 } },
  { id: 'B2', label: 'AC 3-Tier', type: 'ac3', seats: { total: 64, available: 8 } },
  { id: 'CC', label: 'Chair Car', type: 'cc', seats: { total: 78, available: 9 } },
  { id: 'EOG', label: 'Guard', type: 'guard', seats: { total: 0, available: 0 } },
];

export default function RealisticTrainDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
      >
        <FaTrain /> View Train Layout
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="relative z-50 mx-4 w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-600 p-2">
                  <FaTrain className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Indian Railways Coach Layout</h3>
                  <p className="text-sm text-gray-600">Train No: 12345 • Rajdhani Express</p>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <FaWindowClose className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="bg-gradient-to-b from-sky-100 to-blue-50 p-6">
              {/* Legend */}
              <div className="mb-6 flex flex-wrap gap-4 rounded-lg bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-red-600 rounded"></div>
                  <span className="text-sm">Locomotive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">General Coach</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-green-600 rounded"></div>
                  <span className="text-sm">Sleeper Class</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-blue-600 rounded"></div>
                  <span className="text-sm">AC 2-Tier</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-purple-600 rounded"></div>
                  <span className="text-sm">AC 3-Tier</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-teal-500 rounded"></div>
                  <span className="text-sm">Chair Car</span>
                </div>
              </div>

              {/* Track */}
              <div className="relative mb-8">
                <div className="h-2 bg-gray-700 rounded-t-lg"></div>
                <div className="h-1 bg-gray-300"></div>
                <div className="absolute inset-0 flex">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="w-6 h-2 border-r border-gray-400"></div>
                  ))}
                </div>
              </div>

              {/* Train Coaches */}
              <div className="flex items-end gap-2 overflow-x-auto pb-4 scrollbar-thin">
                {COACHES.map((coach, index) => (
                  <CoachCompartment key={coach.id} coach={coach} index={index} />
                ))}
              </div>

              {/* Coach Details */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" /> Coach Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Coaches:</span>
                      <span className="font-medium">{COACHES.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Seats:</span>
                      <span className="font-medium">{COACHES.reduce((sum, c) => sum + (c.seats?.total || 0), 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available Seats:</span>
                      <span className="font-medium text-green-600">
                        {COACHES.reduce((sum, c) => sum + (c.seats?.available || 0), 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Wifi className="w-5 h-5" /> Amenities
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Snowflake className="w-4 h-4" />
                      <span>AC Coaches</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      <span>WiFi Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-4 h-4" />
                      <span>Auto Doors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Luggage className="w-4 h-4" />
                      <span>Luggage Space</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 px-6 py-3">
              <p className="text-xs text-gray-600 text-center">
                Indian Railways • This is a visual representation of train coach layout
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CoachCompartment({ coach, index }) {
  const getCoachColor = (type) => {
    switch (type) {
      case 'loco': return 'bg-red-600';
      case 'general': return 'bg-yellow-500';
      case 'sleeper': return 'bg-green-600';
      case 'ac2': return 'bg-blue-600';
      case 'ac3': return 'bg-purple-600';
      case 'cc': return 'bg-teal-500';
      case 'guard': return 'bg-gray-600';
      default: return 'bg-gray-400';
    }
  };

  const getCoachHeight = (type) => {
    switch (type) {
      case 'loco': return 'h-24';
      case 'guard': return 'h-16';
      default: return 'h-20';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Coach Label */}
      <div className="mb-2 text-center">
        <div className="text-xs font-semibold">{coach.id}</div>
        <div className="text-[10px] text-gray-600">{coach.label}</div>
      </div>

      {/* Coach Body */}
      <div className={`${getCoachColor(coach.type)} ${getCoachHeight(coach.type)} w-16 rounded-lg relative shadow-md`}>
        {/* Windows */}
        {coach.type !== 'loco' && coach.type !== 'guard' && (
          <div className="absolute inset-2 flex flex-col gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 bg-blue-200 rounded-sm"></div>
            ))}
          </div>
        )}

        {/* Doors */}
        {(coach.type === 'general' || coach.type === 'sleeper') && (
          <>
            <div className="absolute left-1 bottom-1 w-3 h-10 bg-gray-700 rounded-sm"></div>
            <div className="absolute right-1 bottom-1 w-3 h-10 bg-gray-700 rounded-sm"></div>
          </>
        )}

        {/* Loco Details */}
        {coach.type === 'loco' && (
          <div className="absolute inset-2">
            <div className="h-4 bg-black rounded-t-lg"></div>
            <div className="h-2 bg-yellow-400 mt-1 rounded-sm"></div>
          </div>
        )}

        {/* Coupler */}
        {index > 0 && (
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-gray-700 rounded-l"></div>
        )}
      </div>

      {/* Wheels */}
      {coach.type !== 'loco' && (
        <div className="flex gap-6 mt-2">
          <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
          <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
        </div>
      )}

      {/* Seat Info */}
      {coach.seats && (
        <div className="mt-2 text-center">
          <div className="text-xs font-medium">
            <IndianRupee className="inline w-3 h-3 mr-1" />
            {coach.type === 'ac2' ? '2,000' : coach.type === 'ac3' ? '1,500' : coach.type === 'cc' ? '800' : '400'}
          </div>
          <div className="text-[10px] text-gray-600">
            {coach.seats.available}/{coach.seats.total} seats
          </div>
        </div>
      )}
    </div>
  );
}