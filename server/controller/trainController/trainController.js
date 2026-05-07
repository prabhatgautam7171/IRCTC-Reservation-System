
import moment from 'moment';
import { Train } from '../../model/trainModel/trainModel.js';
import { SegmentAvailability } from '../../model/trainModel/segmentAvailability.js';
import { SeatInventory } from '../../model/trainModel/seatInventory.js';
import { WlInventorySnapshot } from '../../model/trainModel/wlQuotaInventory.js';
import { initializeSegmentsForJourney } from '../../utils/initializeSegments.js';
import { initializeWlQuotaForJourney } from '../../utils/initializeWlQuotaInventory.js';
import { getDuration } from '../../utils/calculateJourneyDurationHelper.js';
import { initializeSeatInventory } from '../../utils/initializeSeatInventory.js';
// import { redisClient } from '../../config/redis.js';




export const createTrain = async (req, res) => {
  try {
    const {
      trainName,
      trainNo,
      startTime,
      endTime,
      startStation,
      endStation,
      routes,
      runningDays,
      coaches,
    } = req.body;

    // 1️⃣ Check for existing train
    const existingTrain = await Train.findOne({ trainName, trainNo });

    console.log('coaches', coaches);

    if (existingTrain) {
      return res.status(200).json({
        message: 'This train name or number already exists. Please enter a unique one.',
        success: true
      });
    }


    // 2️⃣ Required fields
    else if (
      !trainName ||
      !trainNo ||
      !startTime ||
      !endTime ||
      !startStation ||
      !endStation ||
      !routes ||
      !runningDays ||
      !Array.isArray(coaches) || coaches.length === 0
    ) {
      return res.status(200).json({
        success: true,
        message: "All fields are required and 'coaches' must be a non-empty array."
      });
    }

    // 3️⃣ Validate coaches
    const allowedCoachTypes = ["CC", "EC", "AC", "Sleeper", "General", "SL", "3A", "2A", "1A"];
    const coachTypeSet = new Set();

    for (let coachGroup of coaches) {
      const { coachType, coachList, wlQuotaMap } = coachGroup;

      // ✅ Check allowed coach types
      if (!allowedCoachTypes.includes(coachType)) {
        return res.status(200).json({
          success: true,
          message: `Invalid coach type '${coachType}'. Allowed types: ${allowedCoachTypes.join(", ")}`
        });
      }

      // ✅ No duplicate coach types
      if (coachTypeSet.has(coachType)) {
        return res.status(200).json({
          success: true,
          message: `Duplicate coach type '${coachType}' is not allowed.`
        });
      }
      coachTypeSet.add(coachType);

      /// ✅ Wl Quota Validation

      if (routes.length === wlQuotaMap.length) {
        throw new Error("End station could not be considered");
      }

      for (let i = 0; i < routes.length - 1; i++) {

        if (!wlQuotaMap[i]) {
          return res.status(400).json({
            success: false,
            message: `Missing WL quota for segment starting at ${routes[i].routeName}`
          });
        }

        if (routes[i].routeName.toLowerCase() !== wlQuotaMap[i].routeName.toLowerCase()) {
          return res.status(400).json({
            success: false,
            message: `Mismatch in ${coachType} at index ${i}: ${routes[i].routeName} !== ${wlQuotaMap[i].routeName}`
          });
        }

        wlQuotaMap[i].routeIndex = i;
      }

      // ✅ Coach list validations
      const nameSet = new Set();

      let expectedNumber = 1;
      for (let coach of coachList) {
        const { coachName, seatType } = coach;

        // First letter must match coach type
        // if (coachName.charAt(0).toUpperCase() !== coachType.charAt(0).toUpperCase()) {
        //   return res.status(200).json({
        //     success: true,
        //     message: `Coach name '${coachName}' is invalid for type '${coachType}'.`
        //   });
        // }

        // Sequence check (C1, C2, C3...) without gaps
        const numPart = parseInt(coachName.slice(1), 10);
        if (numPart !== expectedNumber) {
          return res.status(200).json({
            success: true,
            message: `Coach names for '${coachType}' must be sequential. Expected '${coachType.charAt(0)}${expectedNumber}', got '${coachName}'.`
          });
        }
        expectedNumber++;

        // No duplicate coach names
        if (nameSet.has(coachName)) {
          return res.status(200).json({
            success: true,
            message: `Duplicate coach name '${coachName}' found in '${coachType}'.`
          });
        }
        nameSet.add(coachName);


        // Seat types validation
        if (!seatType || seatType.length === 0) {
          return res.status(200).json({
            success: true,
            message: `Seat types are required for '${coachName}'.`
          });
        }

      }
    }

    // 4️⃣ Create train
    const newTrain = await Train.create({
      trainName,
      trainNo,
      startTime,
      endTime,
      startStation,
      endStation,
      routes,
      runningDays,
      coaches
    });

    // 3️⃣ Save train once
    await newTrain.save();

    return res.status(200).json({
      success: true,
      message: 'Train created successfully',
      train: newTrain
    });

  } catch (error) {
    console.error("❌ Train Creation Error:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    res.status(200).json({ train });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const editTrain = async (req, res) => {
  try {
    const {
      trainName,
      trainNo,
      source,
      destination,
      departureTime,
      arrivalTime,
      runningDays,
      routes
    } = req.body;

    const trainId = req.params.id;

    const updatedTrain = await Train.findByIdAndUpdate(
      trainId,
      {
        ...(trainName && { trainName }),
        ...(trainNo && { trainNo }),
        ...(source && { start: source }),
        ...(destination && { end: destination }),
        ...(departureTime && { departureTime }),
        ...(arrivalTime && { arrivalTime }),
        ...(runningDays && { runningDays }),
        ...(routes && Array.isArray(routes) && { routes })  // 🔹 update full routes array
      },
      { new: true } // return updated doc
    );

    if (!updatedTrain) {
      return res.status(404).json({ message: "Train not found" });
    }

    return res.status(200).json({
      message: "Train updated successfully",
      success: true,
      train: updatedTrain
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error });
  }
};


export const deleteTrain = async (req, res) => {
  try {

    const trainId = req.params.id;

    const deletedTrain = await Train.findByIdAndDelete(trainId);

    if (!deletedTrain) {
      return res.status(400).json({
        message: 'train not found'
      })
    }

    return res.status(200).json({
      message: 'train deleted successfully',
      deletedTrain
    })


  } catch (error) {
    console.log(error);
  }
}

export const getAllTrains = async (_, res) => {
  try {
    const allTrains = await Train.find().sort({ createdAt: -1 });

    return res.status(200).json({
      allTrains
    })
  } catch (error) {
    console.log(error);
  }
}

export const removeRoute = async (req, res) => {
  try {
    const { trainId, routeId } = req.params;

    // Pull route by its _id
    const updatedTrain = await Train.findByIdAndUpdate(
      trainId,
      { $pull: { routes: { _id: routeId } } },
      { new: true }
    );

    if (!updatedTrain) {
      return res.status(404).json({
        message: "Train not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Route deleted successfully",
      success: true,
      train: updatedTrain,
    });
  } catch (error) {
    console.error("Error deleting route:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};


export const addCoach = async (req, res) => {
  try {
    const { coachType, coachName, totalSeats, availableSeats, pricePerSeat } = req.body;
    const trainId = req.params.id;

    // 1. Find the train
    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }


    // 2. Find if coach type exists  eg., AC, Sleeper
    let coachTypeObj = train.coaches.find(c => c.coachType === coachType);

    if (coachTypeObj) {
      // ___________________ Existing Coach ____________________

      // Prevent duplicate coach name
      const isCoachNameExist = coachTypeObj.coachList.some(cn => cn.coachName === coachName);
      if (isCoachNameExist) {
        return res.status(200).json({
          message: "This coachName already exists. Please add a new coachName.",
          success: true
        });
      }

      // Prevent invalid coach name with pre existing coachtype
      if (coachName.charAt(0) !== coachTypeObj.coachType.charAt(0)) {
        return res.status(200).json({
          message: 'This coach name is invalid for the selected coach type',
          success: true
        })
      }


      // Auto-generate correct sequential coach name
      const existingNumbers = coachTypeObj.coachList
        .map(c => parseInt(c.coachName.slice(1))) // numeric part
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b);

      let nextNumber = 1;
      if (existingNumbers.length > 0) {
        nextNumber = existingNumbers[existingNumbers.length - 1] + 1;
      }

      const finalCoachName = `${coachType.charAt(0)}${nextNumber}`;




      // Coach type exists → add new coachName
      coachTypeObj.coachList.push({
        coachName: finalCoachName,
        seatType: [
          { seatType: "UpperBerth", totalSeats, availableSeats },
          { seatType: "LowerBerth", totalSeats, availableSeats },
          { seatType: "MiddleBerth", totalSeats, availableSeats },
          { seatType: "SideUpper", totalSeats, availableSeats },
          { seatType: "SideLower", totalSeats, availableSeats }
        ]
      });

      // _________NEW COACH_________

      // if adding new coachname invalid
    } else if (coachName.charAt(0).toLowerCase() !== coachType.charAt(0).toLowerCase()) {
      return res.status(200).json({
        message: `This coach name is invalid for the selected coach ${coachType}`,
        success: true
      })
    }
    else if (!/^[A-Za-z]1$/.test(coachName)) {
      return res.status(200).json({
        message: `First coach name must be like ${coachType.charAt(0).toUpperCase()}1 for the selected coach type ${coachType}`,
        success: true
      });
    }
    else if (!pricePerSeat) {
      return res.status(200).json({
        message: `The price of coach is mandatory`,
        success: true
      })
    }
    else {
      // Coach type doesn't exist → create new
      train.coaches.push({
        coachType,
        pricePerSeat,
        coachList: [
          {
            coachName,
            seatType: [
              { seatType: "UpperBerth", totalSeats, availableSeats },
              { seatType: "LowerBerth", totalSeats, availableSeats },
              { seatType: "MiddleBerth", totalSeats, availableSeats },
              { seatType: "SideUpper", totalSeats, availableSeats },
              { seatType: "SideLower", totalSeats, availableSeats }
            ]
          }
        ]
      });
    }

    // 3. Save train
    await train.save();

    return res.status(200).json({
      message: "Coach added successfully",
      success: true,
      coaches: train.coaches
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




export const removeCoach = async (req, res) => {
  try {


    const { trainId, coachId } = req.params;


    const train = await Train.findById(trainId);

    if (!train) {
      return res.status(400).json({
        message: 'train not found'
      })
    }

    const coachExist = train.coaches.some(coach => coach._id.toString() === coachId);

    if (!coachExist) {
      return res.status(400).json({
        message: 'coach not found'
      })
    }

    // remove the coach

    train.coaches = train.coaches.filter(coach => coach._id.toString() !== coachId);

    await train.save();

    return res.status(200).json({
      success: true,
      message: 'coach removed successfully',
      train

    })
  }



  catch (error) {
    console.log(error);
  }
}
export const removeSubCoach = async (req, res) => {
  try {
    const { trainId, coachId, coachNameId } = req.params;

    // 1. Find the train
    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    // 2. Find the coach
    const coach = train.coaches.id(coachId);
    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    // 3. Find the sub-coach
    const subCoach = coach.coachList.id(coachNameId);
    if (!subCoach) {
      return res.status(404).json({ message: "Sub-coach not found" });
    }

    // 4. Remove sub-coach and save
    subCoach.deleteOne(); // marks it for removal
    await train.save();

    return res.status(200).json({
      success: true,
      message: `${subCoach.coachName} coach deleted.`,
      deletedSubCoach: subCoach
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateCoach = async (req, res) => {
  try {
    const { coachType, pricePerSeat } = req.body;
    const { trainId, coachId } = req.params;

    const train = await Train.findById(trainId);

    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    // Find the coach section (AC, Sleeper, etc.) by ID
    const coachSection = train.coaches.find(coach => coach._id.toString() === coachId);

    if (!coachSection) {
      return res.status(404).json({ message: 'Coach section not found' });
    }

    // // Check if coachType is actually changing
    // if (coachType && coachSection.coachType === coachType) {
    //   return res.status(200).json({ message: 'This coach type is already set.', success: true , coaches : train.coaches });
    // }

    if (pricePerSeat) coachSection.pricePerSeat = pricePerSeat;

    // Check for duplicates excluding the current coach
    const isCoachTypeExist = train.coaches.find(
      ct => ct.coachType === coachType && ct._id.toString() !== coachId
    );

    if (isCoachTypeExist) {
      return res.status(200).json({
        message: 'This type of coach already exists. You cannot create duplicate types.',
        success: true,
        coaches: train.coaches
      });
    }

    const allowedCoachTypes = ["CC", "EC", "AC", "Sleeper", "General"];

    if (!allowedCoachTypes.includes(coachType)) {
      return res.status(200).json({
        message: `Invalid coach type. Allowed types: ${allowedCoachTypes.join(", ")}`,
        success: true,
        coaches: train.coaches
      });
    }





    // If changing the coach type, update coachType and rename all coach names
    if (coachType) {
      coachSection.coachType = coachType;
      // Auto-update coach names based on new type's first letter
      const prefix = coachType[0].toUpperCase();

      coachSection.coachList = coachSection.coachList.map((coach, index) => ({
        ...coach.toObject(), // Convert Mongoose doc to plain object
        coachName: `${prefix}${index + 1}`
      }));
    }






    await train.save();

    return res.status(200).json({
      success: true,
      message: 'Coach Updated ',
      coaches: train.coaches
    });

  } catch (error) {
    console.error("❌ Update Coach Error:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};






export const getChoiceTrains = async (req, res) => {
  try {
    console.log('Search API hit ✅', 'Query:', req.query);

    const { from, to, date, refresh } = req.query;


    console.log('refresh value:', refresh);


    // =========================
    //? 1️⃣ VALIDATION
    // =========================
    if (!from || !to || !date) {
      return res.status(400).json({
        message: "Source, destination, and date are required",
      });
    }

    const dayOfWeek = moment(date, "YYYY-MM-DD").format("dddd");

    // =========================
    //? 2️⃣ FETCH TRAINS
    // =========================
    const trainsOnDay = await Train.find({
      runningDays: dayOfWeek,
    });

    console.log(`Found ${trainsOnDay.length} trains running on ${dayOfWeek} (${date})`);

    const cleanInput = (input) =>
      input?.split("-")[0]
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const fromValue = cleanInput(from);
    const toValue = cleanInput(to);

    // if (refresh === "false") {

    //   console.log('Attempting to serve from cache with key:', `train:${fromValue}-${toValue}-${date}`);
    //   const cacheKey = `train:${fromValue}-${toValue}-${date}`;

    //   console.log('⚡ Checking Redis cache ')

    //   // 🔥 1. Check Redis
    //   if (redisClient) {
    //     const cached = await redisClient.get(cacheKey);

    //     if (cached) {
    //       const parsed = JSON.parse(cached);
    //       console.log("🚨 CACHED DATA:", parsed);
    //       if (Array.isArray(parsed)) {
    //         return res.json({ success: true, trains: parsed });
    //       }
    //     }

    //   }
    // }

    const response = [];

    // =========================
    //? 3️⃣ PROCESS EACH TRAIN
    // =========================
    for (const train of trainsOnDay) {

      const { _id: trainId, routes, trainName, trainType, trainNo, coaches, runningDays, startStation, endStation, startTime, endTime } = train;



      const fromIndex = train.routes.findIndex(route =>
        route.routeName.toLowerCase().includes(fromValue)
      );

      const toIndex = train.routes.findIndex(route =>
        route.routeName.toLowerCase().includes(toValue)
      );

      if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) continue;

      const boardingStation = routes[fromIndex];
      const destinationStation = routes[toIndex];



      // =========================
      //? 🧠 JOURNEY INFO
      // =========================
      const duration = moment(destinationStation.arrivalTime, "HH:mm")
        .diff(moment(boardingStation.departureTime, "HH:mm"), "minutes");

      const journey = {
        from: boardingStation.routeName,
        to: destinationStation.routeName,
        board: boardingStation.stationName,
        depart: destinationStation.stationName,
        fromCode: boardingStation.routeCode,
        toCode: destinationStation.routeCode,
        departureTime: boardingStation.departureTime,
        arrivalTime: destinationStation.arrivalTime,
        duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
        journeyDate: date,

        // 🔥 INTERNAL (not for UI)
        _fromIndex: fromIndex,
        _toIndex: toIndex
      };

      // =========================
      //? 4️⃣ LAZY INIT
      // =========================

      //  Check if SEG already initialized
      const exists = await SegmentAvailability.findOne({
        trainId: train._id,
        journeyDate: date,
      });

      console.log('Segment Availability exists for journey date:', date, '->', exists ? 'Yes' : 'No');

      if (!exists)

        await initializeSegmentsForJourney(train, date);

      const wlExists = await WlInventorySnapshot.findOne({
        trainId: train._id,
        journeyDate: date,
      });

      if (!wlExists)

        await initializeWlQuotaForJourney(train, date);

      console.log('WL Quota initialized for journey date:', date);

      // find seats
      const seatDocs = await initializeSeatInventory(train, date);
      console.log('Seat inventory initialized for journey date:', date, 'with', seatDocs.length, 'seats.');
      try {
        await SeatInventory.insertMany(seatDocs, { ordered: false });
      } catch (err) {
        if (err.code !== 11000) throw err;
      }




      // =========================
      //? 5️⃣ FETCH AVAILABILITY

      console.log('boardingStation', journey.from);
      // =========================
      const [segmentDoc, wlDoc] = await Promise.all([
        SegmentAvailability.findOne({ trainId, journeyDate: date }),
        WlInventorySnapshot.findOne({
          trainId,
          journeyDate: date,
          boardingStation: journey.from.toLowerCase()
        })
      ]);

      if (!segmentDoc || !wlDoc) {
        throw new Error("Failed to fetch availability data. Please try again later.");
      }

      console.log('Gathering availability for Train:', train.trainName, 'on', date);




      //=========================
      //? 1️⃣ Filter ONLY relevant segments

      console.log('Total segments for train:', segmentDoc.segments);

      const relevantSegments = segmentDoc.segments.filter(
        seg => seg.fromIndex >= fromIndex && seg.toIndex <= toIndex
      );

      // safety check
      if (relevantSegments.length === 0) {
        return res.status(500).json({
          message: "Segment data is corrupted. Please contact support."
        });
      }

      const availability = [];
      const coachIndexMap = {}; // 🔥 key → index mapping

      // =========================
      // 2️⃣ Loop only relevant segments
      // =========================
      for (const seg of relevantSegments) {

        for (const coach of seg.coachTypes) {

          const coachName = coach.coachTypeName;

          // =========================
          // INIT (only once per coachType)
          // =========================
          if (coachIndexMap[coachName] === undefined) {

            const index = availability.length;
            coachIndexMap[coachName] = index;

            availability[index] = {
              coachType: coachName,

              quotas: {
                general: { limit: Infinity, status: "AVAILABLE" },
                ladies: { limit: Infinity, status: "AVAILABLE" },
                senior: { limit: Infinity, status: "AVAILABLE" },
                tatkal: { limit: Infinity, status: "AVAILABLE" },
                premiumTatkal: { limit: Infinity, status: "AVAILABLE" }
              },

              fallback: {
                rac: { queueOccupied: 0, limit: 0, status: "AVAILABLE" },
                wl: { queueOccupied: 0, limit: 0, wlType: '', status: "AVAILABLE" },
                tqwl: { queueOccupied: 0, limit: 0, status: "AVAILABLE" }
              },

              prices: {
                general: 0,
                ladies: 0,
                senior: 0,
                tatkal: 0,
                premiumTatkal: 0
              },

            };
          }

          const coachData = availability[coachIndexMap[coachName]];

          // =========================
          // QUOTAS (MIN across segments)
          // =========================
          for (const q of coach.quota) {
            if (q.type in coachData.quotas) {

              const quotaObj = coachData.quotas[q.type];

              quotaObj.limit = Math.min(
                quotaObj.limit,
                q.availableSeats
              );

              quotaObj.status =
                quotaObj.limit > 0 ? "AVAILABLE" : "NOT_AVAILABLE";
            }
          }

          // =========================
          // RAC + TQWL (segment-based)
          // =========================
          // RAC
          const racObj = coachData.fallback.rac;

          racObj.queueOccupied = Math.max(
            racObj.queueOccupied,
            coach.racQueue?.length || 0
          );

          racObj.limit = coach.rac || racObj.limit;

          racObj.status =
            racObj.queueOccupied < racObj.limit
              ? "AVAILABLE"
              : "FULL";


          // TQWL
          const tqwlObj = coachData.fallback.tqwl;

          tqwlObj.queueOccupied = Math.max(
            tqwlObj.queueOccupied,
            coach.tatkalQueue?.length || 0
          );

          tqwlObj.limit = coach.tatkal || tqwlObj.limit;

          tqwlObj.status =
            tqwlObj.queueOccupied < tqwlObj.limit
              ? "AVAILABLE"
              : "FULL";


        }
      }

      // =========================
      // PRICES (outside loop → optimized)
      // =========================
      for (const c of coaches) {

        const index = coachIndexMap[c.coachType];
        if (index === undefined) continue;

        const coachData = availability[index];

        for (const q of c.quota) {
          coachData.prices[q.type] = q.basePrice;
        }
      }

      // =========================
      // WL MERGE (station-based)
      // =========================
      if (!wlDoc) return;

      for (const coachWL of wlDoc.coachWlInventories) {

        const index = coachIndexMap[coachWL.coachTypeName];
        if (index === undefined) continue;

        const coachData = availability[index];
        if (!coachData) continue;

        const wlObj = coachData.fallback.wl;

        // ✅ Direct assignment (no min/max)
        wlObj.queueOccupied = coachWL.wlQueue?.length || 0;
        wlObj.limit = coachWL.wlLimit || 0;

        wlObj.status =
          wlObj.queueOccupied < wlObj.limit
            ? "AVAILABLE"
            : "FULL";

        wlObj.wlType = coachWL.wlQuota;
      }



      // =========================
      // CLEANUP (Infinity → 0)
      // =========================
      for (const coachData of availability) {

        for (const q in coachData.quotas) {
          if (coachData.quotas[q] === Infinity) {
            coachData.quotas[q] = 0;
          }
        }

        if (coachData.fallback.rac === Infinity) coachData.fallback.rac = 0;
        if (coachData.fallback.wl === Infinity) coachData.fallback.wl = 0;
        if (coachData.fallback.tqwl === Infinity) coachData.fallback.tqwl = 0;
      }

      // =========================
      // 🧠 CLEAN ROUTES (TIMELINE)
      // =========================
      const routeTimeline = routes.map(r => ({
        station: r.routeName,
        arrivalTime: r.arrivalTime,
        departureTime: r.departureTime,
        haltTime: getDuration(r.arrivalTime, r.departureTime)
      }));

      // =========================
      // 🧠 CLEAN COACHES
      // =========================
      const cleanCoaches = coaches.map(c => ({
        type: c.coachType,
        totalSeats: c.totalSeats
      }));

      // =========================
      // 🚆 FINAL RESPONSE
      // =========================
      response.push({
        train: {
          id: trainId,
          trainName,
          trainNo,
          trainType,
          runningDays,
          startStation,
          endStation,
          startTime,
          endTime
        },
        journey,
        coaches: cleanCoaches,
        routeTimeline,
        availability,
      });


      response.forEach(train => {
        console.log("Train:", train);
        console.log("Coaches:", train.coaches);
        console.log("Routes:", train.routeTimeline);
        console.log("Availability:", train.availability);
      });


    }

    // 🔥 2. Store in Redis (TTL = 2 min)
    // if (redisClient) {
    //   if (response.length > 0 && refresh === "false") {
    //     const cacheKey = `train:${fromValue}-${toValue}-${date}`;
    //     await redisClient.setEx(cacheKey, 120, JSON.stringify(response));
    //   }
    // }

    console.log('refresh value:', refresh);


    return res.status(200).json({
      success: true,
      trains: response ? response : []
    });


  } catch (error) {
    console.error("❌ Error in getChoiceTrains:", error);
    return res.status(500).json({ message: "Server error" });
  }
};






export const getStationSuggestions = async (req, res) => {
  try {
    const query = req.query.query?.toLowerCase().trim() || "";

    // ✅ Fetch required fields
    const trains = await Train.find(
      {},
      "routes.routeName routes.routeCode routes.stationName routes.routeState"
    );

    // ✅ Extract stations
    const allStations = trains.flatMap(train =>
      train.routes.map(route => ({
        name: route.routeName,        // ✅ KEEP AS YOU WANT
        code: route.routeCode,
        station: route.stationName,   // ✅ extra info
        state: route.routeState       // ✅ extra info
      }))
    );

    // ✅ Remove duplicates (based on routeCode)
    const uniqueStationsMap = new Map();

    for (const station of allStations) {
      if (station.name && station.code) {
        uniqueStationsMap.set(station.code, station);
      }
    }

    const uniqueStations = Array.from(uniqueStationsMap.values());

    // ✅ Filter (improved)
    const filtered = uniqueStations.filter(station =>
      station.name.toLowerCase().includes(query) ||
      station.code.toLowerCase().includes(query) ||
      station.station?.toLowerCase().includes(query) ||
      station.state?.toLowerCase().includes(query)
    );

    // ✅ Sort (important UX)
    filtered.sort((a, b) => a.station.localeCompare(b.station));

    // ✅ Limit results
    const limitedResults = filtered.slice(0, 20);

    res.json({ stations: limitedResults });

  } catch (error) {
    console.error("Error fetching station suggestions:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

