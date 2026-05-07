import React, { useState } from "react";



 // Updated Seat Button Component with Person Sitting Icon
 const SeatButton = ({ seat, isSelected, onSeatSelect, isAisle, onSeatHover, onSeatLeave }) => {
  return (
    <button
      onMouseEnter={() => onSeatHover(seat)}
      onMouseLeave={onSeatLeave}
      disabled={!seat.isAvailable}
      onClick={() => onSeatSelect(seat)}
      className={`
        relative w-16 h-20 rounded-lg transition-all duration-300 transform group
        ${!seat.isAvailable
          ? "bg-slate-700 border-2 border-slate-600 cursor-not-allowed scale-95"
          : isSelected
          ? "bg-gradient-to-br from-green-500 to-green-700 border-2 border-green-400 shadow-xl shadow-green-500/40 scale-105 z-20"
          : "bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 border-2 border-slate-500 hover:border-blue-400 hover:shadow-xl hover:scale-105 hover:z-20"
        }
        ${isAisle ? 'mr-2' : ''}
      `}
    >
      {/* Enhanced Seat Backrest */}
      <div
        className={`
          absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-3 rounded-t-lg transition-all duration-300
          ${!seat.isAvailable
            ? "bg-slate-600"
            : isSelected
            ? "bg-green-600 shadow-md shadow-green-400/30"
            : "bg-slate-500 group-hover:bg-slate-400"
          }
        `}
      ></div>

      {/* Enhanced Seat Cushion with Depth */}
      <div
        className={`
          absolute top-3 left-1/2 transform -translate-x-1/2 w-14 h-10 rounded-lg transition-all duration-300
          ${!seat.isAvailable
            ? "bg-slate-800 border border-slate-700"
            : isSelected
            ? "bg-gradient-to-br from-green-600 to-green-700 border border-green-500 shadow-inner"
            : "bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 group-hover:border-slate-500 group-hover:shadow-inner"
          }
        `}
      >
        {/* Enhanced Seat Number */}
        {seat.isAvailable && (
          <span
            className={`
              absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold transition-all duration-300
              ${isSelected 
                ? "text-white drop-shadow-sm" 
                : "text-slate-200 group-hover:text-white"
              }
            `}
          >
            {seat.seatNo}
          </span>
        )}
      </div>

      {/* Enhanced Armrests */}
      <div className="absolute -left-2 top-3 w-2 h-10 bg-gradient-to-r from-slate-500 to-slate-400 rounded-l transition-all duration-300 group-hover:from-slate-400 group-hover:to-slate-300"></div>
      <div className="absolute -right-2 top-3 w-2 h-10 bg-gradient-to-l from-slate-500 to-slate-400 rounded-r transition-all duration-300 group-hover:from-slate-400 group-hover:to-slate-300"></div>

      {/* Enhanced Booked Seat Indicator */}
      {!seat.isAvailable && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-slate-700/90 rounded-full flex items-center justify-center backdrop-blur-sm border border-slate-600">
            <svg
              className="w-5 h-5 text-red-500 drop-shadow-sm"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
      )}

      {/* Enhanced Selection Glow */}
      {isSelected && (
        <div className="absolute inset-0 bg-green-400/30 rounded-lg animate-pulse border border-green-400/50"></div>
      )}

      {/* Seat Type Indicator Dot */}
      {seat.isAvailable && (
        <div className={`
          absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full transition-all duration-300
          ${seat.seatType === 'window' 
            ? 'bg-blue-400 shadow-sm shadow-blue-400/50' 
            : seat.seatType === 'aisle' 
            ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
            : 'bg-slate-400'
          }
          ${isSelected ? 'scale-125' : ''}
        `}></div>
      )}
    </button>
  );
};

const SeatMap = ({ aircraft, selectedClass, selectedSeat, onSeatSelect, flight }) => {
  const [hoveredSeat, setHoveredSeat] = React.useState(null);

  const flightClass = aircraft.classes.find(
    (c) => c.classType.toLowerCase() === selectedClass.toLowerCase()
  );

  if (!flightClass) return null;

  const handleSeatHover = (seat) => {
    setHoveredSeat(seat);
  };

  const handleSeatLeave = () => {
    setHoveredSeat(null);
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-600/50 backdrop-blur-sm">
      {/* Enhanced Header Section */}
      <div className="mb-8 pb-6 border-b border-slate-600/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl font-bold text-white drop-shadow-sm">
            Select Your Seat
          </h3>
          <span className="px-4 py-2 bg-blue-500/30 text-blue-200 rounded-full text-sm font-semibold border border-blue-400/40 backdrop-blur-sm shadow-lg">
            {selectedClass}
          </span>
        </div>
        <p className="text-slate-300 text-sm">Click on available seats to select your preferred spot</p>
      </div>

      {/* Enhanced Aircraft Cabin Top */}
      <div className="relative mb-6">
        <div className="absolute inset-x-0 -top-4 h-8 bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 rounded-t-2xl shadow-inner"></div>
        <div className="absolute inset-x-0 -top-2 flex justify-center">
          <div className="w-32 h-1 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full shadow-sm"></div>
        </div>
      </div>

      {/* Enhanced Column Labels */}
      <div className="flex justify-center mb-4">
        <div className="flex gap-3">
          {['A', 'B', 'C'].map(col => (
            <div key={col} className="w-16 text-center text-xs font-bold text-slate-300 uppercase tracking-wider drop-shadow-sm">
              {col}
            </div>
          ))}
        </div>
        <div className="w-16"></div>
        <div className="flex gap-3">
          {['D', 'E', 'F'].map(col => (
            <div key={col} className="w-16 text-center text-xs font-bold text-slate-300 uppercase tracking-wider drop-shadow-sm">
              {col}
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Seat Grid Container */}
      <div className="mb-8 bg-gradient-to-b from-slate-700/40 to-slate-800/30 rounded-2xl p-8 border border-slate-600/40 backdrop-blur-sm shadow-inner">
        {/* Split rows into pairs for two-row display */}
        {(() => {
          const rowPairs = [];
          for (let i = 0; i < flightClass.rows.length; i += 2) {
            rowPairs.push(flightClass.rows.slice(i, i + 2));
          }
          
          return rowPairs.map((pair, pairIndex) => (
            <div key={pairIndex} className="flex justify-center gap-12 mb-8 last:mb-0">
              {/* First Row in Pair */}
              <div className="flex-1">
                <div className="flex justify-center items-center gap-3">
                  <span className="w-8 text-right text-sm font-bold text-slate-400 mr-3 drop-shadow-sm">
                    {pair[0].rowNo || pairIndex * 2 + 1}
                  </span>
          
                  {/* Left Section (ABC) */}
                  <div className="flex gap-3">
                    {pair[0].seats.slice(0, 3).map((seat, seatIndex) => (
                      <SeatButton
                        key={seatIndex}
                        seat={seat}
                        isSelected={selectedSeat?.seatNo === seat.seatNo}
                        onSeatSelect={() => onSeatSelect({ ...seat, rowNo: pair[0].rowNo, seatType: seat.seatType })}
                        onSeatHover={handleSeatHover}
                        onSeatLeave={handleSeatLeave}
                        isAisle={seat.seatNo.includes("C")}
                      />
                    ))}
                  </div>
          
                  {/* Right Section (DEF) */}
                  <div className="flex gap-3">
                    {pair[0].seats.slice(3, 6).map((seat, seatIndex) => (
                      <SeatButton
                        key={seatIndex}
                        seat={seat}
                        isSelected={selectedSeat?.seatNo === seat.seatNo}
                        onSeatSelect={() => onSeatSelect({ ...seat, rowNo: pair[0].rowNo, seatType: seat.seatType })}
                        onSeatHover={handleSeatHover}
                        onSeatLeave={handleSeatLeave}
                        isAisle={seat.seatNo.includes("D")}
                      />
                    ))}
                  </div>
          
                  <span className="w-8 text-left text-sm font-bold text-slate-400 ml-3 drop-shadow-sm">
                    {pair[0].rowNo || pairIndex * 2 + 1}
                  </span>
                </div>
              </div>
          
              {/* Second Row in Pair */}
              {pair[1] && (
                <div className="flex-1">
                  <div className="flex justify-center items-center gap-3">
                    <span className="w-8 text-right text-sm font-bold text-slate-400 mr-3 drop-shadow-sm">
                      {pair[1].rowNo || pairIndex * 2 + 2}
                    </span>
            
                    {/* Left Section (ABC) */}
                    <div className="flex gap-3">
                      {pair[1].seats.slice(0, 3).map((seat, seatIndex) => (
                        <SeatButton
                          key={seatIndex}
                          seat={seat}
                          isSelected={selectedSeat?.seatNo === seat.seatNo}
                          onSeatSelect={() => onSeatSelect({ ...seat, rowNo: pair[1].rowNo, seatType: seat.seatType })}
                          onSeatHover={handleSeatHover}
                          onSeatLeave={handleSeatLeave}
                          isAisle={seat.seatNo.includes("C")}
                        />
                      ))}
                    </div>
            
                    {/* Right Section (DEF) */}
                    <div className="flex gap-3">
                      {pair[1].seats.slice(3, 6).map((seat, seatIndex) => (
                        <SeatButton
                          key={seatIndex}
                          seat={seat}
                          isSelected={selectedSeat?.seatNo === seat.seatNo}
                          onSeatSelect={() => onSeatSelect({ ...seat, rowNo: pair[1].rowNo, seatType: seat.seatType })}
                          onSeatHover={handleSeatHover}
                          onSeatLeave={handleSeatLeave}
                          isAisle={seat.seatNo.includes("D")}
                        />
                      ))}
                    </div>
            
                    <span className="w-8 text-left text-sm font-bold text-slate-400 ml-3 drop-shadow-sm">
                      {pair[1].rowNo || pairIndex * 2 + 2}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ));
        })()}
      </div>

      {/* Enhanced Aircraft Cabin Bottom */}
      <div className="relative mt-6 mb-4">
        <div className="absolute inset-x-0 -bottom-4 h-8 bg-gradient-to-t from-slate-700 to-slate-800 border border-slate-600 rounded-b-2xl shadow-inner"></div>
        <div className="absolute inset-x-0 -bottom-2 flex justify-center">
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-slate-500 to-transparent rounded-full shadow-sm"></div>
        </div>
      </div>

      {/* Enhanced Emergency Exit Notice */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-orange-500/30 border border-orange-400/40 rounded-2xl backdrop-blur-sm shadow-lg">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-orange-200 drop-shadow-sm">Emergency Exit Row - Please read safety instructions</span>
        </div>
      </div>

      {/* Enhanced Hover Tooltip */}
      {hoveredSeat && hoveredSeat.isAvailable && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800/95 border border-slate-600/50 rounded-2xl p-6 shadow-2xl backdrop-blur-sm z-50 min-w-[200px]">
          <div className="text-center">
            <div className="text-lg font-bold text-white mb-2">Seat {hoveredSeat.seatNo}</div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                hoveredSeat.seatType === 'window' ? 'bg-blue-400' : 
                hoveredSeat.seatType === 'aisle' ? 'bg-amber-400' : 'bg-slate-400'
              }`}></div>
              <span className="text-sm text-slate-300 capitalize">{hoveredSeat.seatType} Seat</span>
            </div>
            <div className="text-slate-400 text-sm mb-1">Class: {selectedClass}</div>
            <div className="text-green-400 font-semibold">${flight.price}</div>
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-800/95 rotate-45 border-b border-r border-slate-600/50"></div>
        </div>
      )}

      {/* Enhanced Legend */}
      <div className="flex items-center justify-center gap-8 pt-6 border-t border-slate-600/50">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg border border-slate-500">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-slate-500 rounded-t-lg"></div>
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-11 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-slate-600"></div>
          </div>
          <span className="text-sm font-medium text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-14 bg-slate-700 rounded-lg border border-slate-600">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-slate-600 rounded-t-lg"></div>
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-11 h-8 bg-slate-800 rounded-lg border border-slate-700">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600">
                  <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <span className="text-sm font-medium text-slate-300">Occupied</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-lg border border-green-400 shadow-lg shadow-green-500/30">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-green-600 rounded-t-lg shadow-md shadow-green-400/30"></div>
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-11 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg border border-green-500"></div>
            <div className="absolute inset-0 bg-green-400/30 rounded-lg animate-pulse border border-green-400/50"></div>
          </div>
          <span className="text-sm font-medium text-slate-300">Selected</span>
        </div>
      </div>

      {/* Enhanced Selected Seats Summary */}
      {selectedSeat && (
        <div className="mt-6 p-6 bg-blue-500/30 border border-blue-400/40 rounded-2xl backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-blue-200">
                Selected Seat
              </span>
              <span className="block text-xl font-bold text-white mt-1 drop-shadow-sm">
                {selectedSeat.seatNo}
              </span>
              <span className="text-xs text-blue-300 capitalize mt-1">
                {selectedSeat.seatType} Seat • {selectedClass}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-blue-200 block">Total Price</span>
              <span className="text-xl font-bold text-white drop-shadow-sm">
                ${flight.price}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SeatMap;
