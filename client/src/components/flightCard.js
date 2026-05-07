import { setUserQueries } from "@/redux/flightRedux/flightSlice";
import { motion } from "framer-motion";
import { Check, CheckCircleIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";





export const FlightCard = ({ flight, tripType, isSelected, onSelect, onBook, compact }) => {
  const isCompact = compact || tripType === 'roundTrip';
  const dispatch = useDispatch();
  const { userQueries } = useSelector((store) => store.flights)
  return (
    <div className={`m-2  overflow-hidden transition-all duration-300 ${isSelected && tripType === 'roundTrip'
      ? 'bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg ring-2 ring-blue-400 scale-[1.01]'
      : 'bg-white shadow-sm hover:shadow-lg hover:scale-[1.005]'
      } border border-gray-100`}>

      <div className={isCompact ? "px-4 py-3" : "px-6 py-4"}>
        {/* Main Flight Info Row */}
        <div className="flex items-center justify-between gap-4">

          {/* Airline Info - Compact */}
          <div className={`flex items-center ${isCompact ? 'min-w-[100px]' : 'min-w-[140px]'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg blur-sm opacity-40"></div>
              <img
                src={flight.airline.logo}
                alt={flight.airline.name}
                className={`object-contain relative z-10 ${isCompact ? 'h-12 w-12' : 'h-16 w-16'} p-1.5 bg-white rounded-lg shadow-sm`}
              />
            </div>
            <div className="ml-2.5">
              <div className={`font-bold text-gray-800 leading-tight ${isCompact ? 'text-xs' : 'text-sm'}`}>
                {flight.airline.name}
              </div>
              <div className={`text-gray-500 font-medium ${isCompact ? 'text-[10px]' : 'text-xs'} mt-0.5`}>
                {flight.airline.code || 'Flight'}
              </div>
            </div>
          </div>

          {/* Flight Times - Optimized */}
          <div className="flex items-center flex-1 max-w-md">
            {/* Departure */}
            <div className="text-center">
              <div className={`font-bold text-gray-900 ${isCompact ? 'text-lg' : 'text-xl'}`}>
                {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className={`text-gray-600 font-semibold ${isCompact ? 'text-xs' : 'text-sm'} mt-0.5`}>
                {flight.from.code}
              </div>
            </div>

            {/* Duration & Route - Compact */}
            <div className="flex-1 px-3">
              <div className="text-center">
                <div className={`text-gray-600 font-medium ${isCompact ? 'text-[10px] mb-1' : 'text-xs mb-1.5'}`}>
                  {flight.duration}
                </div>
                <div className="relative flex items-center">
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                  {flight.stops > 0 ? (
                    <div className="px-1.5">
                      <div className={`${isCompact ? 'w-2 h-2' : 'w-2.5 h-2.5'} bg-gradient-to-br from-orange-400 to-red-400 rounded-full`}></div>
                    </div>
                  ) : (
                    <div className="px-1.5">
                      <svg className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-cyan-500`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                </div>
                <div className={`${isCompact ? 'text-[10px] mt-1' : 'text-xs mt-1.5'}`}>
                  {flight.stops > 0 ? (
                    <span className="inline-flex items-center gap-0.5 bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                      {flight.stops} Stop{flight.stops > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                      Non-stop
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <div className={`font-bold text-gray-900 ${isCompact ? 'text-lg' : 'text-xl'}`}>
                {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className={`text-gray-600 font-semibold ${isCompact ? 'text-xs' : 'text-sm'} mt-0.5`}>
                {flight.to.code}
              </div>
            </div>
          </div>

          {/* Price & Action - Responsive */}
          <div className={`flex  ${tripType === 'roundTrip' ? 'flex-col' : 'flex-row'} items-center gap-3 ${isCompact ? 'min-w-[110px]' : 'min-w-[160px]'}`}>
            <div className={`${tripType === 'roundTrip' ? 'text-center' : 'text-right'}`}>
              <div className={`font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ${isCompact ? 'text-lg' : 'text-2xl'}`}>
                ₹{flight.price.toLocaleString()}
              </div>
              <div className={`text-gray-500 font-medium ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                per adult
              </div>
            </div>

            <div className={`${tripType === 'roundTrip' ? 'w-full' : ''}`}>
              {tripType === 'roundTrip' ? (
                <button
                  onClick={onSelect}
                  className={`w-full transition-all duration-300 ${isCompact ? 'py-2' : 'py-2.5'} rounded-lg font-bold ${isCompact ? 'text-xs' : 'text-sm'} ${
                    isSelected
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-sm hover:shadow-md'
                  }`}
                >
                  {isSelected ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="flex items-center justify-center gap-1.5"
                    >
                      <Check size={isCompact ? 14 : 16} strokeWidth={3} />
                      <span>SELECTED</span>
                    </motion.div>
                  ) : (
                    <span>SELECT</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    dispatch(setUserQueries({ ...userQueries, tripType : 'oneWay' }));
                    onBook();
                  }}
                  className={`bg-gradient-to-r from-orange-500 to-red-500 text-white  font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg rounded-lg ${
                    isCompact ? 'px-5 py-2 text-xs' : 'px-6 py-2.5 text-sm'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    BOOK NOW
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
