import { Aircraft } from "../../model/AirplaneModel/aircraftModel.js";
import { Airline } from "../../model/AirplaneModel/airlineModel.js";
import { Flight } from "../../model/AirplaneModel/flightModel.js";

export const createFlight = async (req, res) => {
  try {

    const { airlineId, aircraftId } = req.params;


    const {
      flightNumber,
      from,
      to,
      departureTime,
      arrivalTime,
      duration,
      status,
      price,
    } = req.body;

    // ✅ Check airline
    const airlineDoc = await Airline.findById(airlineId);
    if (!airlineDoc) {
      return res.status(404).json({ success: false, message: "Airline not found" });
    }

    // ✅ Check aircraft
    const aircraftDoc = await Aircraft.findById(aircraftId);
    if (!aircraftDoc) {
      return res.status(404).json({ success: false, message: "Aircraft not found" });
    }

    // ✅ Create flight with direct references
    const newFlight = await Flight.create({
      flightNumber,
      from,
      to,
      departureTime,
      arrivalTime,
      duration,
      status,
      price,
      airline: airlineId,   // single reference
      aircraft: aircraftId, // single reference
    });

    const populatedFlight = await newFlight.populate([
      { path: "airline", select: "name code" },
      { path: "aircraft", select: "name code" }
    ]);
    
    return res.status(201).json({
      success: true,
      message: "Flight created successfully",
      flight: populatedFlight,
    });
    
  } catch (error) {
    console.error("Error creating flight:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateFlight = async (req, res) => {
  try {
    const { flightNumber,
      from,
      to,
      departureTime,
      arrivalTime,
      duration,
      status,
      price, } = req.body;

    const {id} = req.params;

    const flight = await Flight.findById(id);

    if (!flight) {
      return res.status(400).json({
        message: 'flight not found.',

      })
    }

    if (flightNumber) flight.flightNumber = flightNumber;
    if (from) flight.from = from;
    if (to) flight.to = to;
    if (departureTime) flight.departureTime = departureTime;
    if (arrivalTime) flight.arrivalTime = arrivalTime;
    if (duration) flight.duration = duration;
    if (status) flight.status = status;
    if (price) flight.price = price;

    await flight.save();

    return res.status(200).json({
      message: "flight updated.",
      flight,
      success: true
    })

  } catch (error) {
    console.log(error);
  }
}

export const deleteFlight = async (req, res) => {
  try {
    const {id} = req.params;

    const flight = await Flight.findByIdAndDelete(id);

    if (!flight) {
      return res.status(400).json({
        message: 'flight not found'
      })
    }

    return res.status(200).json({
      message: 'flight deleted.',
      success: true
    })





  } catch (error) {
    console.log(error);
  }
}




export const getFlightsForUser = async (req, res) => {
  console.log('API hit: ✅')
  console.log("➡️ Body:", JSON.stringify(req.query, null, 2));
  try {

    const { from, to, date, returnDate, tripType, segments, preferredClass } = req.query;
    let flightsResult = {};

    // ✅ Helper: parse input like "Delhi (DEL) Indira Gandhi International Airport"
    const parseAirportInput = (input) => {
      if (!input) return {};
      const codeMatch = input.match(/\(([^)]+)\)/); // matches (DEL)
      const code = codeMatch ? codeMatch[1].toUpperCase() : null;
      const city = input.split('(')[0].trim();
      const terminal = input.split(')').slice(1).join(')').trim() || null;
      return { city, code, terminal };
    };

    // ✅ Helper: build filter for from/to/date
    const buildFilter = (fromValue, toValue, dateValue) => {
      let filter = {};

      if (fromValue) {
        const { city, code, terminal } = parseAirportInput(fromValue);
        const orConditions = [
          { "from.city": { $regex: new RegExp(city, "i") } },
        ];
        if (code) orConditions.push({ "from.code": code });
        if (terminal) orConditions.push({ "from.terminal": { $regex: new RegExp(terminal, "i") } });
        filter.$or = orConditions;
      }

      if (toValue) {
        const { city, code, terminal } = parseAirportInput(toValue);
        const toCond = [
          { "to.city": { $regex: new RegExp(city, "i") } },
        ];
        if (code) toCond.push({ "to.code": code });
        if (terminal) toCond.push({ "to.terminal": { $regex: new RegExp(terminal, "i") } });

        if (filter.$or) {
          filter = { $and: [{ $or: filter.$or }, { $or: toCond }] };
        } else {
          filter.$or = toCond;
        }
      }

      if (dateValue) {
        const start = new Date(dateValue);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateValue);
        end.setHours(23, 59, 59, 999);
        filter.departureTime = { $gte: start, $lte: end };
      }

      return filter;
    };

    // ✅ Attach class filter (only include flights that have that class price available)
    const applyClassFilter = (flights) => {
      if (!preferredClass) return flights; // return all if no filter
      return flights
        .filter(f => f.price && f.price[preferredClass] !== undefined)
        .map(f => {
          const flightObj = f.toObject();
          return {
            ...flightObj,
            price: f.price[preferredClass] , // keep price in same format
            preferredClass, // 👈 explicitly add class name
            
          };
        });
    };
    

    // ✅ One Way
    if (tripType === "oneWay") {
      const filter = buildFilter(from, to, date);
      let onwardFlights = await Flight.find(filter)
        .populate("airline")
        .populate("aircraft");

      onwardFlights = applyClassFilter(onwardFlights);
      flightsResult = { onward: onwardFlights };
    }

    // ✅ Round Trip
    else if (tripType === "roundTrip") {
      const onwardFilter = buildFilter(from, to, date);
      const returnFilter = buildFilter(to, from, returnDate);

      let onwardFlights = await Flight.find(onwardFilter)
        .populate("airline")
        .populate("aircraft");

      let returnFlights = await Flight.find(returnFilter)
        .populate("airline")
        .populate("aircraft");

      onwardFlights = applyClassFilter(onwardFlights);
      returnFlights = applyClassFilter(returnFlights);

      flightsResult = { onward: onwardFlights, return: returnFlights };
    }

    // ✅ Multi-City
    else if (tripType === "multiCity" && segments) {
      const parsedSegments = JSON.parse(segments);
      const segmentResults = [];

      for (let seg of parsedSegments) {
        const segFilter = buildFilter(seg.from, seg.to, seg.date);
        let segFlights = await Flight.find(segFilter)
          .populate("airline")
          .populate("aircraft");

        segFlights = applyClassFilter(segFlights);

        segmentResults.push({ segment: seg, flights: segFlights });
      }

      flightsResult = { segments: segmentResults };
    }

    // ✅ No flights found
    if (
      !flightsResult ||
      (tripType === "oneWay" && !flightsResult.onward.length) ||
      (tripType === "roundTrip" &&
        !flightsResult.onward.length &&
        !flightsResult.return.length) ||
      (tripType === "multiCity" &&
        flightsResult.segments.every((s) => !s.flights.length))
    ) {
      return res.status(404).json({
        success: false,
        message: "No flights found",
      });
    }

    return res.status(200).json({
      success: true,
      tripType,
      preferredClass: preferredClass || "all",
      flights: flightsResult,
    });
  } catch (error) {
    console.error("Error fetching flights:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};







export const searchAirportSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const flights = await Flight.find({
      $or: [
        { "from.city": { $regex: query, $options: "i" } },
        { "from.code": { $regex: query, $options: "i" } },
        { "to.city": { $regex: query, $options: "i" } },
        { "to.code": { $regex: query, $options: "i" } }
      ]
    }).select("from to -_id");

    const suggestions = [];
    const seen = new Set();

    flights.forEach(flight => {
      [flight.from, flight.to].forEach(airport => {
        if (airport) {
          const key = `${airport.city}-${airport.code}-${airport.terminal}`;
          if (!seen.has(key)) {
            seen.add(key);
            suggestions.push({
              city: airport.city,
              code: airport.code,
              terminal: airport.terminal
            });
          }
        }
      });
    });

    // Sort suggestions: exact matches or startsWith match first
    const sorted = suggestions.sort((a, b) => {
      const q = query.toLowerCase();
      const aCity = a.city.toLowerCase();
      const bCity = b.city.toLowerCase();

      // If a matches query first, put it before b
      if (aCity.startsWith(q) && !bCity.startsWith(q)) return -1;
      if (!aCity.startsWith(q) && bCity.startsWith(q)) return 1;
      return aCity.localeCompare(bCity);
    });

    return res.json({ success: true, airports: sorted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};








// Get flights for a specific airline
export const getFlightsByAirline = async (req, res) => {
  try {
    const { airlineId } = req.params;

    const flights = await Flight.find({ airline: airlineId })
      .populate("airline", "name code")
      .populate("aircraft", "name code");

    return res.status(200).json({
      success: true,
      flights
    });
  } catch (error) {
    console.error("Error fetching flights:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Get flights for a specific aircraft
export const getFlightsByAircraft = async (req, res) => {
  try {
    const { aircraftId } = req.params;

    const flights = await Flight.find({ aircraft: aircraftId })
      .populate("airline", "name code")
      .populate("aircraft", "name code");

    return res.status(200).json({
      success: true,
      flights
    });
  } catch (error) {
    console.error("Error fetching flights:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

