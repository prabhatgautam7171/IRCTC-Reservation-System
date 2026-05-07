import { CloudSun, Moon, Search, Sun, Sunrise, TrainFront } from "lucide-react";

// SidebarContent Component - Reusable with enhanced design
export const SidebarContent = ({
  filters,
  setFilters,
  filteredTrains,
  selectedSearch,
  classIcons,
  trainTypeIcons,
  isMobile = false
}) => {
  return (
    <>
      {/* Results Count - Modern Card Design */}
      <div className="mb-4 sm:mb-5">
        {filteredTrains?.length > 0 ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-100">
            <p className="text-xs sm:text-sm text-blue-700 font-medium flex items-center gap-2">
              <Search size={16} />
              {filteredTrains.length} train{filteredTrains.length > 1 ? 's' : ''} found
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
              From {selectedSearch.from} to {selectedSearch.to} on {selectedSearch.date}
            </p>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 bg-gray-100 rounded-xl">
            <TrainFront className="mx-auto mb-2 text-gray-400 w-8 h-8 sm:w-10 sm:h-10" />
            <p className="text-xs sm:text-sm text-gray-500">No trains match your filters.</p>
            <button
              onClick={() => setFilters({
                searchText: '',
                classes: [],
                type: [],
                quota: '',
                departure: [],
                arrival: [],
                duration: 48,
                fare: [0, 5000],
                availability: []
              })}
              className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 sm:gap-3 ">

      {/* Search Input - Enhanced with icon animation */}
      <div className=" relative group">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 transition-colors group-focus-within:text-blue-600" />
        <input
          type="text"
          placeholder="Search train by name or no"
          value={filters.searchText}
          onChange={e => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
          className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-4xl bg-white  border border-gray-200
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-0
            outline-none font-medium text-sm sm:text-base text-gray-900 placeholder-gray-400
            transition-all duration-200 hover:border-gray-300 shadow-sm"
        />
      </div>

       {/* Train Type Section - Grid Layout with Cards */}
       <div className="mb-6 sm:mb-2 pb-5  border-b border-gray-100 pl-3 pr-3">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {[
            'Rajdhani',
            'Shatabdi',
            'Duronto',
            'Vande Bharat',
            'Garib Rath',
            'Superfast',
            'Express',
            'Mail/Passenger'
          ].map(t => {
            const Icon = trainTypeIcons[t];
            const active = filters.type.includes(t);

            return (
              <label
                key={t}
                className={`flex items-center  gap-2 p-1 rounded-xl cursor-pointer transition-all duration-200
          `}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={active}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      type: e.target.checked
                        ? [...prev.type, t]
                        : prev.type.filter(x => x !== t)
                    }))
                  }
                  className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-200 cursor-pointer"
                />

                {/* Icon */}
                <Icon
                  className={`w-3 h-3 shrink-0 transition ${active ? "text-blue-600" : "text-gray-500"
                    }`}
                />

                {/* Text */}
                <span
                  className={`text-xs leading-none ${active ? "text-blue-700 font-medium" : "text-gray-700"
                    }`}
                >
                  {t}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      </div>

      {/* Class Section - Modern Chip Design */}
      {/* <div className="mb-6 sm:mb-2 pb-5 sm:pb-6 border-b border-gray-100">
        <h3 className="font-semibold mb-3 text-gray-800 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="w-0.5 h-4 bg-blue-600 rounded-full"></span>
          Travel Class
        </h3>
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {["AC", "CC", "EC", "Sleeper", "General"].map((cls) => {
            const active = filters.classes.includes(cls);
            const Icon = classIcons[cls];

            return (
              <button
                key={cls}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    classes: active
                      ? prev.classes.filter((c) => c !== cls)
                      : [...prev.classes, cls],
                  }))
                }
                className={`
                  flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                  ${active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"}
                `}
              >
                <Icon size={14} className="sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap">{cls}</span>
              </button>
            );
          })}
        </div>
      </div> */}


      {/* Departure Time - Modern Timeline Design */}
      <div className="mb-6 sm:mb-2 pb-5 sm:pb-3 border-b border-gray-100">
        <h3 className="font-semibold mb-3 text-gray-800 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="w-0.5 h-4 bg-blue-600 rounded-full"></span>
          Departure Time
        </h3>
        <div className="">
          {[
            { label: 'Early Morning', time: '12 AM - 6 AM', value: 'early', icon: <Sunrise className="w-4 h-4 sm:w-5 sm:h-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { label: 'Morning', time: '6 AM - 12 PM', value: 'morning', icon: <Sun className="w-4 h-4 sm:w-5 sm:h-5" />, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
            { label: 'Afternoon', time: '12 PM - 6 PM', value: 'afternoon', icon: <CloudSun className="w-4 h-4 sm:w-5 sm:h-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
            { label: 'Evening/Night', time: '6 PM - 12 AM', value: 'night', icon: <Moon className="w-4 h-4 sm:w-5 sm:h-5" />, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
          ].map(time => {
            const active = filters.departure?.includes(time.value);
            return (
              <label
                key={time.value}
                className={`flex items-center gap-3 p-1.5 rounded-xl cursor-pointer transition-all duration-200
                  ${active
                    ? `${time.bgColor} border-l-4 ${time.color.replace('text', 'border')} shadow-sm`
                    : "hover:bg-gray-50"}`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      departure: e.target.checked
                        ? [...prev.departure, time.value]
                        : prev.departure.filter(d => d !== time.value)
                    }))
                  }
                  className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-blue-600 border-gray-300 rounded focus:ring-0"
                />
                <div className={`${time.color}`}>
                  {time.icon}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[12px] sm:text-[13px] tracking-wider font-medium ${active ? time.color : 'text-gray-700'}`}>
                    {time.label}
                  </span>
                  <span className="text-[12px] sm:text-[11px] text-gray-500 block">( {time.time} )</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Arrival Time - Same Design */}
      <div className="mb-6 sm:mb-2 pb-5 sm:pb-3 border-b border-gray-100">
        <h3 className="font-semibold mb-3 text-gray-800 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="w-0.5 h-4 bg-blue-600 rounded-full"></span>
          Arrival Time
        </h3>
        <div className="">
          {[
            { label: 'Early Morning', time: '12 AM - 6 AM', value: 'early', icon: <Sunrise className="w-4 h-4 sm:w-5 sm:h-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { label: 'Morning', time: '6 AM - 12 PM', value: 'morning', icon: <Sun className="w-4 h-4 sm:w-5 sm:h-5" />, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
            { label: 'Afternoon', time: '12 PM - 6 PM', value: 'afternoon', icon: <CloudSun className="w-4 h-4 sm:w-5 sm:h-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
            { label: 'Evening/Night', time: '6 PM - 12 AM', value: 'night', icon: <Moon className="w-4 h-4 sm:w-5 sm:h-5" />, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
          ].map(time => {
            const active = filters.arrival?.includes(time.value);
            return (
              <label
                key={time.value}
                className={`flex items-center gap-3 p-1.5 rounded-xl cursor-pointer transition-all duration-200
                  ${active
                    ? `${time.bgColor} border-l-4 ${time.color.replace('text', 'border')} shadow-sm`
                    : "hover:bg-gray-50"}`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      arrival: e.target.checked
                        ? [...prev.arrival, time.value]
                        : prev.arrival.filter(d => d !== time.value)
                    }))
                  }
                  className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-blue-600 border-gray-300 rounded focus:ring-0"
                />
                <div className={`${time.color}`}>
                  {time.icon}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[12px] sm:text-[13px] tracking-wider font-medium ${active ? time.color : 'text-gray-700'}`}>
                    {time.label}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500 block">( {time.time} )</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>



      {/* Journey Duration - Modern Slider */}
      <div className="mb-6 sm:mb-2 pb-5 sm:pb-6 border-b border-gray-100">
        <h3 className="font-semibold mb-3 text-gray-800 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="w-0.5 h-4 bg-blue-600 rounded-full"></span>
          Journey Duration
        </h3>
        <div className="px-1">
          <input
            type="range"
            min="1"
            max="48"
            value={filters.duration}
            onChange={e => setFilters(prev => ({ ...prev, duration: Number(e.target.value) }))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] sm:text-xs text-gray-500">1 hr</span>
            <div className="bg-blue-600 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full">
              {filters.duration} hrs
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500">48 hrs</span>
          </div>
        </div>
      </div>

      {/* Fare Range - Modern Slider with Price Display */}
      <div className="mb-6 sm:mb-7 pb-5 sm:pb-6 border-b border-gray-100">
        <h3 className="font-semibold mb-3 text-gray-800 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="w-0.5 h-4 bg-blue-600 rounded-full"></span>
          Fare Range
        </h3>
        <div className="px-1">
          <input
            type="range"
            min="0"
            max="5000"
            value={filters.fare[1]}
            onChange={e => setFilters(prev => ({ ...prev, fare: [0, Number(e.target.value)] }))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs sm:text-sm font-semibold text-gray-900">₹0</span>
            <span className="text-sm sm:text-base font-bold text-blue-600">₹{filters.fare[1]}</span>
            <span className="text-xs sm:text-sm text-gray-500">₹5000+</span>
          </div>
        </div>
      </div>


    </>
  );
};
