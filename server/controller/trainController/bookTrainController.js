import { User } from "../../model/authModel/userModel.js";
import { generateTicket } from "../../templates/ticketTemplate.js";
import { sendTicketEmail } from "../../utils/sendTicket.js";
import { Booking } from "../../model/trainModel/bookingModel.js";
import { Train } from "../../model/trainModel/trainModel.js";
// import { handleCNFBooking, handleRACBooking, handleWLBooking } from "../../utils/trainBookingHelper.js";
import { SegmentAvailability } from "../../model/trainModel/segmentAvailability.js";
import { initializeSegmentsForJourney } from "../../utils/initializeSegments.js";
import { WlInventorySnapshot } from "../../model/trainModel/wlQuotaInventory.js";
import { initializeWlQuotaForJourney } from "../../utils/initializeWlQuotaInventory.js";
import { handleCNFBooking, handleRACBooking, handleWLBooking } from "../../utils/trainBookingHelper.js";
import { SeatInventory } from "../../model/trainModel/seatInventory.js";
import { initializeSeatInventory } from "../../utils/initializeSeatInventory.js";
import { emitRealTimeUpdate } from "../../services/booking/emitRealTimeUpdate.js";
import { canPassengerFitSeat } from "../../utils/isSeatFree.js";
import { removeRACPassengerFromAllSegments } from "../../utils/freeRacPassHelper.js";
import { promoteRACToCNF } from "../../services/promotion/promoteRACtoCNF.js";
import { runBackgroundTasks } from "../../utils/backgroundTask.js";






export const bookTrain = async (req, res) => {
  try {
    console.log("✅ Booking route hit");
    console.log("➡️ Params:", req.params);
    console.log("➡️ Body:", req.body);

    const { passengers, source, destination, journeyDate, reachingTime, selectedQuota } = req.body;
    const io = req.app.get("io");

    if (!passengers || !source || !destination || !journeyDate || !reachingTime || !selectedQuota) {
      return res.status(400).json({
        message: 'Missing required fields'
      })
    }

    const userId = req.id;
    const trainId = req.params.id;
    const coachTypeParam = req.params.coachType;
    // const quotaParam = req.param.id;


    console.log("train ID :", trainId);

    if (!userId) {
      return res.status(400).json({
        message: 'user not aunthenticated'
      })
    }


    const train = await Train.findById(trainId);


    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    // ✅ Find the coach type (case-insensitive match)
    const selectedCoachType = train.coaches.find(
      (c) => c.coachType.toLowerCase() === coachTypeParam.toLowerCase()
    );

    if (!selectedCoachType) {
      return res.status(400).json({ message: 'Coach type not found in this train' });
    }

    // ✅ Find the quota of selectedCoachType

    const quota = selectedCoachType.quota.find(q => q.type === selectedQuota);

    if (!quota) {
      throw new Error("Quota not supported for this coach");
    }

    console.log('selected quota :', quota);


    // ✅ Log coach list properly
    console.log('Selected Coach Type:', selectedCoachType.coachType);
    console.log('Coach List:', selectedCoachType.coachList.map((coach) => ({
      coachName: coach.coachName,
      available: coach.availableSeats,
      total: coach.totalSeats
    })));

    console.log('selectedCoachTypeStatus :', selectedCoachType.status);

    // ✅ Source Destination Index
    let sourceIndex = -1;
    let destIndex = -1;
    let departureTime;
    let arrivalTime;

    for (let i = 0; i < train.routes.length; i++) {
      const routeName = train.routes[i].routeName;

      console.log('Route Name at index', i, ':', routeName);
      console.log(routeName, source);

      if (routeName.toLowerCase() === source.toLowerCase()) {
        sourceIndex = i;
        departureTime = train.routes[i].departureTime;
      }

      console.log(routeName, destination);

      if (routeName.toLowerCase() === destination.toLowerCase()) {
        destIndex = i;
        arrivalTime = train.routes[i].arrivalTime;
      }
    }
    console.log(source, destination)
    console.log('Source Index:', sourceIndex, departureTime, 'Destination Index:', destIndex, arrivalTime);

    //  Check if SEG already initialized
    const exists = await SegmentAvailability.findOne({
      trainId: train._id,
      journeyDate
    });

    console.log('Segment Availability exists for journey date:', journeyDate, '->', exists ? 'Yes' : 'No');

    if (!exists)

      await initializeSegmentsForJourney(train, journeyDate);
    console.log('Segments initialized for journey date:', journeyDate);

    ///2️⃣ Check if WL already initialized

    const wlExists = await WlInventorySnapshot.findOne({
      trainId: train._id,
      journeyDate
    });

    if (!wlExists)

      await initializeWlQuotaForJourney(train, journeyDate);

    console.log('WL Quota initialized for journey date:', journeyDate);

    // find seats
    const seatInventory = await SeatInventory.findOne({
      trainId: train._id,
      journeyDate,
    });

    console.log('SeatInventory exists:', seatInventory);

    if (!seatInventory) {
      await initializeSeatInventory(train, journeyDate);
    }

    ///✅ Finding all covered segments

    const segmentDoc = await SegmentAvailability.findOne({
      trainId: train._id,
      journeyDate
    });

    const coveredSegments = segmentDoc.segments.filter(
      seg =>
        seg.fromIndex >= sourceIndex &&
        seg.toIndex <= destIndex
    );

    console.log('Covered Segments:', coveredSegments);



    const segmCoach = coveredSegments.every(seg => seg.coachTypes.find(
      ct => ct.coachTypeName === selectedCoachType.coachType
    ));

    console.log('Segment Coach Data:', segmCoach);


    if (!segmCoach) {
      return res.status(400).json({ message: `Coach type ${selectedCoachType.coachType} not available for the selected route segments.` });
    }

    console.log('Segment Coach Data:', segmCoach);

    /// Availability SnapShot ✅

    let availabilitySnapshot = {
      ladies: { isEnabled: false, limit: Infinity, fare: 0 },
      senior: { isEnabled: false, limit: Infinity, fare: 0 },
      general: { isEnabled: false, limit: Infinity, fare: 0 },
      tatkal: { isEnabled: false, limit: Infinity, fare: 0 },
      premiumTatkal: { isEnabled: false, limit: Infinity, fare: 0 },
      rac: Infinity,
      TQWL: Infinity,
      wl: 0
    };

    for (const seg of coveredSegments) {

      const preferredCoach = seg.coachTypes.find(
        ct => ct.coachTypeName === selectedCoachType.coachType
      );

      if (!preferredCoach) {
        throw new Error("Selected coach type not available in segment");
      }

      // RAC & Tatkal WL
      availabilitySnapshot.rac = Math.min(
        availabilitySnapshot.rac,
        preferredCoach.rac
      );

      availabilitySnapshot.TQWL = Math.min(
        availabilitySnapshot.TQWL,
        preferredCoach.tatkal
      );

      for (const q of preferredCoach.quota) {

        if (q.type === "ladies") {
          availabilitySnapshot.ladies.limit = Math.min(
            availabilitySnapshot.ladies.limit,
            q.availableSeats
          );
          availabilitySnapshot.ladies.fare = q.pricePerSeat;
        }

        if (q.type === "senior") {
          availabilitySnapshot.senior.limit = Math.min(
            availabilitySnapshot.senior.limit,
            q.availableSeats
          );
          availabilitySnapshot.senior.fare = q.pricePerSeat;
        }

        if (q.type === "general") {
          availabilitySnapshot.general.limit = Math.min(
            availabilitySnapshot.general.limit,
            q.availableSeats
          );
          availabilitySnapshot.general.fare = q.pricePerSeat;
        }

        if (q.type === "tatkal" && q.isEnabled) {
          availabilitySnapshot.tatkal.isEnabled = true;

          availabilitySnapshot.tatkal.limit = Math.min(
            availabilitySnapshot.tatkal.limit,
            q.availableSeats
          );

          availabilitySnapshot.tatkal.fare = q.pricePerSeat;
        }

        if (q.type === "premiumTatkal" && q.isEnabled) {
          availabilitySnapshot.premiumTatkal.isEnabled = true;

          availabilitySnapshot.premiumTatkal.limit = Math.min(
            availabilitySnapshot.premiumTatkal.limit,
            q.availableSeats
          );

          availabilitySnapshot.premiumTatkal.fare = q.pricePerSeat;
        }
      }
    }

    const quotas = ["ladies", "senior", "general", "tatkal", "premiumTatkal"];

    for (const q of quotas) {
      if (availabilitySnapshot[q].limit === Infinity) {
        availabilitySnapshot[q].limit = 0;
      }
    }

    if (availabilitySnapshot.rac === Infinity) availabilitySnapshot.rac = 0;
    if (availabilitySnapshot.TQWL === Infinity) availabilitySnapshot.TQWL = 0;

    const wlDoc = await WlInventorySnapshot.findOne({
      trainId: train._id,
      journeyDate,
      boardingStation: source.toLowerCase()
    });

    const coachWL = wlDoc?.coachWlInventories.find(
      c => c.coachTypeName === selectedCoachType.coachType
    );

    availabilitySnapshot.wl = coachWL?.wlLimit || 0;



    const canBookCNF =
      availabilitySnapshot.ladies.limit > 0 ||
      availabilitySnapshot.senior.limit > 0 ||
      availabilitySnapshot.general.limit > 0 ||
      (availabilitySnapshot.tatkal.isEnabled && availabilitySnapshot.tatkal.limit > 0) ||
      (availabilitySnapshot.premiumTatkal.isEnabled && availabilitySnapshot.premiumTatkal.limit > 0);

    console.log(availabilitySnapshot);



     //* CNF BOOKING ✅
    if (canBookCNF && passengers.length > 0) {

      const result = await handleCNFBooking({
        train,
        selectedCoachType,
        selectedQuota: quota,
        passengers,
        userId,
        source,
        destination,
        departureTime,
        arrivalTime,
        journeyDate,
        reachingTime,
        coveredSegments,
        io,
        sourceIndex,
        destIndex,
        availabilitySnapshot
      });

      console.log("CNF result", result);

      // ✅ Background tasks
      runBackgroundTasks({
        io,
        train,
        journeyDate,
        source,
        sourceIndex,
        destIndex,
        selectedCoachType,
        userId,
        result
      });

      return res.status(201).json({
        message: "✅ Quota CNF Booking Successful",
        bookingData: result,
      });
    }
    //?? RAC ✅
    else if (availabilitySnapshot.rac > 0 && passengers.length > 0) {

      const result = await handleRACBooking({
        train,
        selectedCoachType,
        passengers,
        userId,
        source,
        destination,
        journeyDate,
        departureTime,
        arrivalTime,
        reachingTime,
        coveredSegments,
        io,
        sourceIndex,
        destIndex,
        availabilitySnapshot
      });

      console.log("RAC result", result);

      runBackgroundTasks({
        io,
        train,
        journeyDate,
        source,
        sourceIndex,
        destIndex,
        selectedCoachType,
        userId,
        result
      });

      return res.status(201).json({
        message: "✅ RAC Booking Successful",
        bookingData: result,
      });
    }
    //?? Waitlist ✅
    else if (availabilitySnapshot.wl > 0 && passengers.length > 0) {

      const result = await handleWLBooking({
        train,
        selectedCoachType,
        passengers,
        userId,
        source,
        destination,
        departureTime,
        arrivalTime,
        journeyDate,
        reachingTime,
        coveredSegments,
        io,
        sourceIndex,
        destIndex,
        availabilitySnapshot
      });

      console.log("WL result", result);

      runBackgroundTasks({
        io,
        train,
        journeyDate,
        source,
        sourceIndex,
        destIndex,
        selectedCoachType,
        userId,
        result
      });

      return res.status(201).json({
        message: "✅ WL Booking Successful",
        bookingData: result,
      });
    }
    else if (passengers.length > 0) {
      return res.status(400).json({
        message: 'No availability for the selected coach type and quota'
      })
    }
    else {
      return res.status(400).json({
        message: 'Booking Rejected'
      })
    }



  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const cancelBooking = async (req, res) => {
  try {
    console.log('cancel booking route hit ✅');
    const { id } = req.params;
    console.log('bookingID :' , id);
    // const { passengers } = req.body;
    // console.log('Cancelled Passengers :' , passengers);


    if (!id) {
      return res.status(404).json({ message: 'Booking ID not get.' });
    }

    /// user id also needed

    const booking = await Booking.findById(id);


    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === "CANCELLED") {
      res.status(200).json({
        message: 'Booking already cancelled.',
        booking,
        success: true,
      });
    };

    booking.status = 'CANCELLED';
    await booking.save();



    res.status(200).json({
      message: 'Booking cancelled and refund initiated',
      booking,
      success: true,
    });

    // const { fromIndex, toIndex, journeyDate } = booking;

    // const passengerTrain = booking.train;

    // const train = await Train.findById(passengerTrain);

    // if (!train) {
    //   return res.status(400).json({ message: `Train not found of ${passengerTrain}`, success: true });
    // }

    // const passengerCoach = booking.selectedCoachType.coachTypeId;
    // const coachType = await train.coaches.find(c => c._id === passengerCoach);

    // if (!coachType) {
    //   return res.status(400).json({ message: `Coach not found of ${passengerTrain}`, success: true });
    // }


    // // Free the seats of Cancelled passengers
    // let cancelledPassengers = [];
    // let cancelledCNFSeats = [];
    // let cancelledRACSeats = [];
    // let cancelledWL = [];

    // let freedCNFSeats = [];
    // let freedRACSeats = [];
    // let promotedTQWL = [];
    // let promotedWL = [];

    // /// if partial Cancellation happened
    // if (passengers) {
    //   cancelledPassengers.push(passengers);
    // }
    // /// full booking cancelled
    // else {
    //   cancelledPassengers.push(booking.passengers);
    // }


    // for (const passenger of cancelledPassengers) {

    //   if (passenger.status === "Cancelled") continue;

    //   // =========================
    //   // ✅ CNF PASSENGER
    //   // =========================
    //   if (passenger.status === 'CNF') {

    //     const seat = await SeatInventory.findOneAndUpdate(
    //       {
    //         _id: passenger.seatRef,
    //         trainId: passengerTrain,
    //         coachTypeName: booking.selectedCoachType.coachTypeName,
    //         coachName: passenger.coach,
    //         journeyDate,
    //         bookedSegments: {
    //           $elemMatch: { fromIndex, toIndex }
    //         }
    //       },
    //       {
    //         $pull: {
    //           bookedSegments: { fromIndex, toIndex }
    //         }
    //       },
    //       { new: true }
    //     );

    //     if (!seat) {
    //       console.warn(`Seat not found for passenger ${passenger._id}`);
    //       continue;
    //     }

    //     cancelledCNFSeats.push({
    //       seat,

    //       passenger: {
    //         passengerId: passenger._id,
    //         quota: passenger.quota,
    //         coach: passenger.coach,
    //         seatType: passenger.seatType,
    //         seatBooked: passenger.seatBooked,
    //         status: passenger.status
    //       },


    //     });
    //   }

    //   // =========================
    //   // ✅ RAC PASSENGER
    //   // =========================
    //   else if (passenger.status === 'RAC') {

    //     const res = await SeatInventory.updateOne(
    //       {
    //         _id: passenger.seatRef,
    //         trainId: passengerTrain,
    //         coachTypeName: booking.selectedCoachType.coachTypeName,
    //         journeyDate,
    //       },
    //       {
    //         $pull: {
    //           racPassengers: {
    //             passengerId: passenger._id,
    //             fromIndex,
    //             toIndex
    //           }
    //         }
    //       }
    //     );

    //     if (!res.modifiedCount) {
    //       console.warn(`RAC removal failed for ${passenger._id}`);
    //       continue;
    //     }

    //     // 🔥 store RAC info (no quota)
    //     cancelledRACSeats.push({
    //       seat,

    //       passenger: {
    //         passengerId: passenger._id,
    //         quota: passenger.quota,
    //         coach: passenger.coach,
    //         seatType: passenger.seatType,
    //         seatBooked: passenger.seatBooked,
    //         status: passenger.status
    //       },
    //     });
    //   }

    //   // =========================
    //   // ✅ WL PASSENGER
    //   // =========================
    //   else if (passenger.status === 'WL') {

    //     // remove from WL queue (you will implement DB logic)

    //     cancelledWL.push({
    //       passenger: {
    //         passengerId: passenger._id,
    //         quota: passenger.quota,
    //         coach: passenger.coach,
    //         seatType: passenger.seatType,
    //         seatBooked: passenger.seatBooked,
    //         status: passenger.status
    //       },
    //     });
    //   }

    //   // // =========================
    //   // // ✅ TQWL PASSENGER
    //   // // =========================
    //   // else if (passenger.status === 'TQWL') {

    //   //   // remove from TQWL queue

    //   //   cancelledTQWL.push({
    //   //     passengerId: passenger._id,
    //   //     fromIndex,
    //   //     toIndex
    //   //   });
    //   // }

    //   // =========================
    //   // FINAL STATUS UPDATE
    //   // =========================
    //   passenger.status = "Cancelled";
    // }

    // const [segmentDoc, wlDoc] = await Promise.all([
    //   SegmentAvailability.findOne({
    //     trainId: passengerTrain,
    //     journeyDate: journeyDate
    //   }).session(session),
    //   WlInventorySnapshot.findOne({
    //     trainId: passengerTrain,
    //     journeyDate: journeyDate,
    //     boardingStation: journey.from.toLowerCase()
    //   })
    // ]);

    // if (!segmentDoc || !wlDoc) {
    //   throw new Error("Failed to fetch Segments DOC or WL Inventory DOC");
    // }

    // // =========================
    // // 🎯 PROMOTION ORCHESTRATOR
    // // =========================
    // if (cancelledCNFSeats.length > 0) {

    //   const cancelledCoveredSegments = segmentDoc.segments.filter(
    //     seg =>
    //       seg.fromIndex >= fromIndex &&
    //       seg.toIndex <= toIndex
    //   );

    //   if (cancelledCoveredSegments.length === 0) {
    //     throw new Error("No relevant segments found for cancellation");
    //   }

    //   // =========================
    //   // 🔍 SPLIT SEATS BY QUOTA
    //   // =========================
    //   const cancelledTatkalSeats = cancelledCNFSeats.filter(
    //     c =>
    //       c.passenger.quota === 'tatkal' ||
    //       c.passenger.quota === 'premiumTatkal'
    //   );

    //   const cancelledNonTatkalSeats = cancelledCNFSeats.filter(
    //     c =>
    //       c.passenger.quota !== 'tatkal' &&
    //       c.passenger.quota !== 'premiumTatkal'
    //   );

    //   let racResult = null;
    //   let tatkalResult = null;

    //   // =========================
    //   // 🚆 NON-TATKAL FLOW → RAC → CNF
    //   // =========================
    //   if (cancelledNonTatkalSeats.length > 0) {

    //     racResult = await promoteRACToCNF({
    //       cancelledNonTatkalSeats,
    //       cancelledCoveredSegments,
    //       coachTypeName: booking.selectedCoachType.coachTypeName,
    //       segmentDoc,
    //       session
    //     });

    //   }

    //   // =========================
    //   // ⚡ TATKAL FLOW → TQWL → CNF
    //   // =========================
    //   if (cancelledTatkalSeats.length > 0) {

    //     tatkalResult = await promoteTQWLToTatkal({
    //       cancelledTatkalSeats,
    //       cancelledCoveredSegments,
    //       coachTypeName: booking.selectedCoachType.coachTypeName,
    //       segmentDoc,
    //       session
    //     });

    //   }

    //   // =========================
    //   // 🎯 FINAL RESPONSE
    //   // =========================
    //   return {
    //     success: true,

    //     rac: racResult || {
    //       promotedRAC: [],
    //       freedRACSlots: 0
    //     },

    //     tatkal: tatkalResult || {
    //       promotedTQWL: [],
    //       remainingTatkalSeats: cancelledTatkalSeats.length
    //     }
    //   };
    // }
    // // =========================
    // // 🎯 WL → RAC PROMOTION
    // // =========================
    // else if (cancelledRACSeats.length > 0 || freedRACSlots > 0) {

    //   const totalFreedRACSlots =
    //     cancelledRACSeats.length + (freedRACSlots || 0);

    //   if (totalFreedRACSlots <= 0) return;

    //   if (!wlDoc || !wlDoc.coachWlInventories?.length) return;

    //   const coachWL = wlDoc.coachWlInventories.find(
    //     c => c.coachTypeName === booking.selectedCoachType.coachTypeName
    //   );

    //   if (!coachWL || !coachWL.wlQueue?.length) {
    //     console.log("🚫 No WL passengers to promote");
    //     return;
    //   }

    //   // =========================
    //   // 🔢 LIMIT PROMOTION
    //   // =========================
    //   const promoteLimit = Math.min(
    //     coachWL.wlQueue.length,
    //     totalFreedRACSlots
    //   );

    //   const promotedWL = [];

    //   // =========================
    //   // 🔁 PROMOTE WL → RAC
    //   // =========================
    //   for (let i = 0; i < promoteLimit; i++) {

    //     const wlPass = coachWL.wlQueue[i];

    //     promotedWL.push(wlPass);

    //     // 👉 Add to RAC queue (ALL relevant segments)
    //     for (const seg of segmentDoc.segments) {

    //       const coach = seg.coachTypes.find(
    //         c => c.coachTypeName === booking.selectedCoachType.coachTypeName
    //       );

    //       if (!coach) continue;

    //       coach.racQueue.push({
    //         ...wlPass,
    //         status: "RAC"
    //       });
    //     }
    //   }

    //   // =========================
    //   // 🧹 REMOVE FROM WL QUEUE
    //   // =========================
    //   coachWL.wlQueue = coachWL.wlQueue.slice(promoteLimit);

    //   // =========================
    //   // 🔥 RETURN RESULT
    //   // =========================
    //   return {
    //     promotedWLtoRAC: promotedWL,
    //     remainingWL: coachWL.wlQueue.length
    //   };
    // }
    // // =========================
    // // 🔥 WL CANCEL → REMOVE ONLY
    // // =========================
    // else if (cancelledWL && cancelledWL.length > 0) {

    //   for (const wlPassObj of cancelledWL) {

    //     const passenger = wlPassObj.passenger;
    //     const passId = String(passenger._id);

    //     const { fromIndex, toIndex } = passenger;

    //     // 🔥 Find exact segments where this WL passenger exists
    //     const coveredSegments = segmentDoc.segments.filter(
    //       seg =>
    //         seg.fromIndex >= fromIndex &&
    //         seg.toIndex <= toIndex
    //     );

    //     for (const seg of coveredSegments) {

    //       const coach = seg.coachTypes.find(
    //         c => c.coachTypeName === booking.selectedCoachType.coachTypeName
    //       );

    //       if (!coach || !coach.wlQueue) continue;

    //       // 🔥 Remove passenger from WL queue
    //       coach.wlQueue = coach.wlQueue.filter(
    //         p => String(p._id) !== passId
    //       );
    //     }

    //     console.log("🗑️ WL passenger removed:", passId);
    //   }

    //   return {
    //     removedWL: cancelledWL.length
    //   };
    // }


  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Cancellation failed' });
  }
};



export const seePastBookings = async (req, res) => {
  try {
    const userId = req.id;

    const bookings = await Booking.find({ user: userId })
      .populate('train')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
      message: bookings.length === 0 ? "No bookings found" : "Bookings fetched successfully",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const getBookingDetailsByPNR = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { PNR } = req.body;

    if (!PNR) {
      return res.status(400).json({ message: "PNR is required", success: false });
    }

    // Convert to number if stored as number in DB
    const PNRNumber = Number(PNR.trim());
    console.log("Searching PNR:", PNRNumber);

    const bookingDetails = await Booking.findOne({ PNR: PNRNumber })
      .populate('train'); // populate train details

    if (!bookingDetails) {
      return res.status(404).json({
        message: "PNR not found",
        success: false
      });
    }

    return res.status(200).json({
      success: true,
      bookingDetails
    });

  } catch (error) {
    console.error("PNR fetch error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


export const getBookings = async (_, res) => {
  try {
    const allBookings = await Booking.find().sort({ createdAt: -1 });

    return res.status(200).json({
      allBookings
    })
  } catch (error) {
    console.log(error);
  }
}
