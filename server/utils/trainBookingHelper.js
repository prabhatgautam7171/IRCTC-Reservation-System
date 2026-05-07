import mongoose from "mongoose";
import { User } from "../model/authModel/userModel.js";
import { Booking } from "../model/trainModel/bookingModel.js";
import { SeatInventory } from "../model/trainModel/seatInventory.js";
import { SegmentAvailability } from "../model/trainModel/segmentAvailability.js";
import { generateTicket } from "../templates/ticketTemplate.js";
import { sendTicketEmail } from "./sendTicket.js";
import { assign } from "nodemailer/lib/shared/index.js";
import { assignQuotaSeats } from "../services/booking/assignQuotaSeats.js";
import { assignRACSeats } from "../services/booking/assignRACSeats.js";
import { finalizeBooking } from "../services/booking/finalizeBooking.js";
import { assignTQWL } from "../services/booking/assignTQWL.js";
import { assignWL } from "../services/booking/assignWL.js";
import { WlInventorySnapshot } from "../model/trainModel/wlQuotaInventory.js";





// ✅ General Booking Helper
export async function handleCNFBooking({
  train,
  selectedCoachType,
  selectedQuota,
  passengers,
  userId,
  source,
  destination,
  departureTime,
  arrivalTime,
  journeyDate,
  reachingTime,
  io,
  requiredSeats,
  sourceIndex,
  destIndex,
  availabilitySnapshot,
}) {

  console.log(train,
    selectedCoachType,
    passengers,
    userId,
    source,
    destination,
    journeyDate,
    reachingTime,
    requiredSeats);
  console.log("🚉 Starting CNF Booking...");


  /// ⚠️ Note : we are using passenger for filtering , and requiredSeats for counting remaining seats to be assigned.

  console.log('selectedCoachType ID:', selectedCoachType._id);
  console.log(departureTime, arrivalTime);

  console.log('availability :', availabilitySnapshot);


  //** Initializing Transaction ✅

  const session = await mongoose.startSession();


  try {


    let bookingData = null;

    // 🟢 classify passengers
    const femalePassengers = passengers.filter(p => p.gender === "Female" && p.age < 60);
    const seniorPassengers = passengers.filter(p => p.age >= 60); // (male / female)
    let remainingPassengers = [...passengers];


    console.log('remainingPassengers :', remainingPassengers);
    console.log('female passengers :', femalePassengers);
    console.log('senior passengers :', seniorPassengers);



    const assignments = {
      ladies: [],
      senior: [],
      general: [],
      tatkal: [],
      premiumTatkal: [],
      tqwl: [],
      rac: [],
      wl: []
    };

    await session.withTransaction(async () => {

      //**  Generate PNR ✅
      const generatePNR = () => Math.floor(1000000000 + Math.random() * 9000000000).toString();

      //** */ Initializing Booking ✅

      const [booking] = await Booking.create(
        [{
          user: userId,
          train: train._id,

          selectedCoachType: {
            coachTypeId: selectedCoachType._id,
            coachTypeName: selectedCoachType.coachType
          },

          source,
          destination,
          departureTime,
          arrivalTime,
          fromIndex: sourceIndex,
          toIndex: destIndex,
          journeyDate,
          reachingTime,

          passengers: passengers.map((p) => ({
            name: p.name,
            age: p.age,
            gender: p.gender,
            contactDetails: p.contactDetails,
            status: "WL"
          })),

          PNR: generatePNR(),
          status: "PROCESSING"
        }],
        { session }
      );

      const bookingId = booking._id;

      console.log('booking initialized ✅')

      //?? 🔒 Only For takal Bookings (Opens on SAT, SUN at 10:00 AM)

      console.log('selectedQuota :', selectedQuota.type);

      // -------------------- 🔒 TATKAL / PREMIUM FLOW --------------------

      if (selectedQuota.type === "tatkal") {

        // 🟢 1️⃣ Tatkal CNF
        if (availabilitySnapshot.tatkal.isEnabled && availabilitySnapshot.tatkal.limit > 0 && remainingPassengers.length > 0) {

          const limit = Math.min(availabilitySnapshot.tatkal.limit, remainingPassengers.length);

          console.log("Assigning Tatkal CNF:", limit);

          const res = await assignQuotaSeats({
            quotaType: "tatkal",
            limit,
            fare: availabilitySnapshot.tatkal.fare,
            status: "CNF",
            assignedSeats: [],
            passengers: remainingPassengers,
            train,
            selectedCoachType,
            journeyDate,
            sourceIndex,
            destIndex,
            session
          });


          assignments.tatkal.push(...res.assignedSeats);

          // 🔑 Extract assigned passenger IDs
          const assignedIds = new Set(
            res.assignedSeats.map(p => p.id)
          );

          // 🔥 Remove only assigned passengers
          remainingPassengers = remainingPassengers.filter(
            p => !assignedIds.has(p.id)
          );

          console.log('assignment at tatkal :', assignments.tatkal);
          console.log('remaining pass at tatkal :', remainingPassengers.length);
        }

        // 🟠 2️⃣ TQWL (Tatkal WL)
        if (availabilitySnapshot.tatkal.isEnabled && availabilitySnapshot.TQWL > 0 && remainingPassengers.length > 0) {

          const limit = Math.min(availabilitySnapshot.TQWL, remainingPassengers.length);

          console.log("Assigning TQWL:", limit);

          const res = await assignTQWL({
            limit,
            quotaType: "TQWL",
            fare: availabilitySnapshot.tatkal.fare,
            status: "TQWL",
            assignedSeats: [],
            passengers: remainingPassengers,
            train,
            selectedCoachType,
            journeyDate,
            sourceIndex,
            destIndex,
            bookingId,
            userId,
            session
          });


          assignments.tqwl.push(...res.assignedSeats);


          // 🔑 Extract assigned passenger IDs
          const assignedIds = new Set(
            res.assignedSeats.map(p => p.id)
          );

          // 🔥 Remove only assigned passengers
          remainingPassengers = remainingPassengers.filter(
            p => !assignedIds.has(p.id)
          );

          console.log('assignment at tqwl :', assignments.tqwl);
          console.log('remaining pass at tqwl :', remainingPassengers.length);
        }
      }


      // -------------------- 💎 PREMIUM TATKAL --------------------

      if (selectedQuota.type === "premiumTatkal") {

        // 🟢 1️⃣ Premium CNF
        if (availabilitySnapshot.premiumTatkal.isEnabled && availabilitySnapshot.premiumTatkal.limit > 0 && remainingPassengers.length > 0) {

          const limit = Math.min(availabilitySnapshot.premiumTatkal.limit, remainingPassengers.length);

          console.log("Assigning Premium Tatkal CNF:", limit);

          const res = await assignQuotaSeats({
            quotaType: "premiumTatkal",
            limit,
            fare: availabilitySnapshot.premiumTatkal.fare,
            status: "CNF",
            assignedSeats: [],
            passengers: remainingPassengers,
            train,
            selectedCoachType,
            journeyDate,
            sourceIndex,
            destIndex,
            session
          });


          assignments.premiumTatkal.push(...res.assignedSeats);

          // 🔑 Extract assigned passenger IDs
          const assignedIds = new Set(
            res.assignedSeats.map(p => p.id)
          );

          // 🔥 Remove only assigned passengers
          remainingPassengers = remainingPassengers.filter(
            p => !assignedIds.has(p.id)
          );
          console.log('assignment at premiumTatkal :', assignments.premiumTatkal);
          console.log('remaining pass at premiumTatkal :', remainingPassengers.length);
        }

        // 🟠 2️⃣ TQWL (Premium)
        if (availabilitySnapshot.premiumTatkal.isEnabled && availabilitySnapshot.TQWL > 0 && remainingPassengers.length > 0) {

          const limit = Math.min(availabilitySnapshot.TQWL, remainingPassengers.length);

          console.log("Assigning Premium TQWL:", limit);

          const res = await assignTQWL({
            limit,
            quotaType: "TQWL",
            fare: availabilitySnapshot.premiumTatkal.fare,
            status: "TQWL",
            assignedSeats: [],
            passengers: remainingPassengers,
            train,
            selectedCoachType,
            journeyDate,
            sourceIndex,
            destIndex,
            bookingId,
            userId,
            session
          });


          assignments.tqwl.push(...res.assignedSeats);

          // 🔑 Extract assigned passenger IDs
          const assignedIds = new Set(
            res.assignedSeats.map(p => p.id)
          );

          // 🔥 Remove only assigned passengers
          remainingPassengers = remainingPassengers.filter(
            p => !assignedIds.has(p.id)
          );

          console.log('assignment at tqwl :', assignments.tqwl);
          console.log('remaining pass at tqwl :', remainingPassengers.length);
        }
      }

      //?? ⚠️ Only For General Bookings

      // -------------------- 1️⃣ LADIES --------------------
      if (availabilitySnapshot.ladies.limit > 0 && femalePassengers.length > 0 && selectedQuota.type !== 'tatkal' || 'premiumTatkal' && remainingPassengers.length > 0) {

        /// How much posibility to assign seats in ladies quota
        const limit = Math.min(availabilitySnapshot.ladies.limit, femalePassengers.length);


        const res = await assignQuotaSeats({
          quotaType: "ladies",
          limit,
          fare: availabilitySnapshot.ladies.fare,
          status: "CNF",
          passengers: femalePassengers,
          assignedSeats: [],
          train,
          selectedCoachType,
          journeyDate,
          sourceIndex,
          destIndex,
          session
        });

        assignments.ladies.push(...res.assignedSeats);
        console.log('assign count', res.count);


        // 🔑 Extract assigned passenger IDs
        const assignedIds = new Set(
          res.assignedSeats.map(p => p.id)
        );

        // 🔥 Remove only assigned passengers
        remainingPassengers = remainingPassengers.filter(
          p => !assignedIds.has(p.id)
        );

        console.log('assignment at ladies :', assignments.ladies);
        console.log('remaining pass at ladies :', remainingPassengers.length)
      }

      // -------------------- 2️⃣ SENIOR --------------------
      if (availabilitySnapshot.senior.limit > 0 && seniorPassengers.length > 0 && selectedQuota.type !== 'tatkal' || 'premiumTatkal' && remainingPassengers.length > 0) {

        const limit = Math.min(availabilitySnapshot.senior.limit, seniorPassengers.length);

        const res = await assignQuotaSeats({
          quotaType: "senior",
          limit,
          fare: availabilitySnapshot.senior.fare,
          status: "CNF",
          passengers: seniorPassengers,
          assignedSeats: [],
          train,
          selectedCoachType,
          journeyDate,
          sourceIndex,
          destIndex,
          session
        });

        assignments.senior.push(...res.assignedSeats);
        console.log('assign count', res.count);

        // 🔑 Extract assigned passenger IDs
        const assignedIds = new Set(
          res.assignedSeats.map(p => p.id)
        );

        // 🔥 Remove only assigned passengers
        remainingPassengers = remainingPassengers.filter(
          p => !assignedIds.has(p.id)
        );

        console.log('assignment at senior :', assignments.senior);
        console.log('remaining pass at senior :', remainingPassengers.length)
      }

      // -------------------- 3️⃣ GENERAL --------------------
      if (availabilitySnapshot.general.limit > 0 && selectedQuota.type !== 'tatkal' || 'premiumTatkal' && remainingPassengers.length > 0) {

        console.log('Booking general...')

        const limit = Math.min(availabilitySnapshot.general.limit, remainingPassengers.length);

        const res = await assignQuotaSeats({
          quotaType: "general",
          limit,
          fare: availabilitySnapshot.general.fare,
          status: "CNF",
          passengers: remainingPassengers,
          assignedSeats: [],
          train,
          selectedCoachType,
          journeyDate,
          sourceIndex,
          destIndex,
          session
        });

        assignments.general.push(...res.assignedSeats);
        console.log('assign count', res.count);

        // 🔑 Extract assigned passenger IDs
        const assignedIds = new Set(
          res.assignedSeats.map(p => p.id)
        );

        // 🔥 Remove only assigned passengers
        remainingPassengers = remainingPassengers.filter(
          p => !assignedIds.has(p.id)
        );
        console.log('assignment at General :', assignments.general);
        console.log('remaining pass at General :', remainingPassengers.length)
      }

      // -------------------- 4️⃣ RAC --------------------
      if (availabilitySnapshot.rac > 0 && selectedQuota.type !== 'tatkal' || 'premiumTatkal' &&  remainingPassengers.length > 0) {
        console.log('Booking RAC...')

        const limit = Math.min(availabilitySnapshot.rac, remainingPassengers.length);

        console.log("Assigning RAC:", limit);

        const res = await assignRACSeats({
          quotaType: "RAC",
          limit,
          fare: availabilitySnapshot.general.fare,
          status: "RAC",
          assignedSeats: [],
          passengers: remainingPassengers,
          train,
          selectedCoachType,
          journeyDate,
          sourceIndex,
          destIndex,
          bookingId,
          userId,
          session
        });

        assignments.rac.push(...res.assignedSeats);
        console.log('assign count', res.count);


        // 🔑 Extract assigned passenger IDs
        const assignedIds = new Set(
          res.assignedSeats.map(p => p.id)
        );

        // 🔥 Remove only assigned passengers
        remainingPassengers = remainingPassengers.filter(
          p => !assignedIds.has(p.id)
        );
        console.log('assignment at rac :', assignments.rac);
        console.log('remaining pass at RAC :', remainingPassengers.length)
      }

      // -------------------- 5️⃣ WL --------------------
      if ( availabilitySnapshot.wl > 0 && selectedQuota.type !== 'tatkal' || 'premiumTatkal' && remainingPassengers.length > 0) {
        console.log('Booking WL...')

        const res = await assignWL({
          limit: remainingPassengers.length,
          quotaType: "WL",
          fare: availabilitySnapshot.general.fare,
          status: "WL",
          assignedSeats: [],
          passengers: remainingPassengers,
          train,
          selectedCoachType,
          journeyDate,
          sourceIndex,
          destIndex,
          bookingId,
          userId,
          session
        });

        assignments.wl.push(...res.assignedSeats);

        // 🔑 Extract assigned passenger IDs
        const assignedIds = new Set(
          res.assignedSeats.map(p => p.id)
        );

        // 🔥 Remove only assigned passengers
        remainingPassengers = remainingPassengers.filter(
          p => !assignedIds.has(p.id)
        );
      }

      // -------------------- FINAL MERGE --------------------
      const finalAssignedSeats = [
        ...assignments.ladies,
        ...assignments.senior,
        ...assignments.general,
        ...assignments.tatkal,
        ...assignments.tqwl,
        ...assignments.rac,
        ...assignments.wl
      ];

      console.log('final assignment seats :', finalAssignedSeats);

      // -------------------- VALIDATION --------------------
      if (finalAssignedSeats.length !== passengers.length) {
        throw new Error("Seat assignment mismatch");
      }


      bookingData = await finalizeBooking({
        io : io,
        trainId : train._id,
        journeyDate : journeyDate,
        bookingId: bookingId,
        passengers: passengers,
        assignedSeats: finalAssignedSeats,
        userId: userId,
        sourceIndex ,
        destIndex ,
        session,
        boardingStation : source,
        selectedCoachType : selectedCoachType

      });

      console.log('returning outside of finalize booking ✅')
      return bookingData;

    });
    console.log('returning outside of transaction ✅')
    return bookingData;

  } catch (error) {
    console.error("Error during CNF booking transaction:", error);
  } finally {
    session.endSession();
  }

}
// ✅ RAC Booking Helper
export async function handleRACBooking({
  train,
  selectedCoachType,
  selectedQuota,
  passengers,
  userId,
  source,
  destination,
  departureTime,
  arrivalTime,
  journeyDate,
  reachingTime,
  io,
  requiredSeats,
  sourceIndex,
  destIndex,
  availabilitySnapshot,

}) {

  console.log(train,
    selectedCoachType,
    passengers,
    userId,
    source,
    destination,
    journeyDate,
    reachingTime,
    requiredSeats);
  console.log("🚉 Starting RAC Booking...");


  let assignedSeats = [];

  /// ⚠️ Note : we are using passenger for filtering , and requiredSeats for counting remaining seats to be assigned.

  console.log('selectedCoachType ID:', selectedCoachType._id);


  console.log('availability :', availabilitySnapshot);


  //** Initializing Transaction ✅

  const session = await mongoose.startSession();

  try {


    let bookingData = null;

    let remainingPassengers = [...passengers];




    const assignments = {
      rac: [],
      wl: []
    };

    await session.withTransaction(async () => {

      //**  Generate PNR ✅
      const generatePNR = () => Math.floor(1000000000 + Math.random() * 9000000000).toString();

      //** */ Initializing Booking ✅

      const [booking] = await Booking.create(
        [{
          user: userId,
          train: train._id,

          selectedCoachType: {
            coachTypeId: selectedCoachType._id,
            coachTypeName: selectedCoachType.coachType
          },

          source,
          destination,
          departureTime,
          arrivalTime,
          fromIndex: sourceIndex,
          toIndex: destIndex,
          journeyDate,
          reachingTime,

          passengers: passengers.map((p) => ({
            name: p.name,
            age: p.age,
            gender: p.gender,
            contactDetails: p.contactDetails,
            status: "WL"
          })),

          PNR: generatePNR(),
          status: "PROCESSING"
        }],
        { session }
      );

      const bookingId = booking._id;

      console.log('booking initialized ✅')


      // -------------------- 4️⃣ RAC --------------------
      if (availabilitySnapshot.rac > 0 && remainingPassengers.length > 0) {


        const limit = Math.min(availabilitySnapshot.rac, remainingPassengers.length);

         console.log("Assigning RAC:", limit);

        const res = await assignRACSeats({
          quotaType: "RAC",
          limit,
          fare: availabilitySnapshot.general.fare,
          status: "RAC",
          assignedSeats: [],
          passengers: remainingPassengers,
          train,
          selectedCoachType,
          journeyDate,
          sourceIndex,
          destIndex,
          bookingId,
          userId,
          session
        });

        assignments.rac.push(...res.assignedSeats);
        console.log('assign count', res.count);


        // 🔑 Extract assigned passenger IDs
        const assignedIds = new Set(
          res.assignedSeats.map(p => p.id)
        );

        // 🔥 Remove only assigned passengers
        remainingPassengers = remainingPassengers.filter(
          p => !assignedIds.has(p.id)
        );
        console.log('assignment at rac :', assignments.rac);
        console.log('remaining pass at RAC :', remainingPassengers.length)
      }

      // -------------------- 5️⃣ WL --------------------
      if ( availabilitySnapshot.wl > 0 && remainingPassengers.length > 0) {
        console.log('Booking WL...')

        const res = await assignWL({
          limit: remainingPassengers.length,
          quotaType: "WL",
          fare: availabilitySnapshot.general.fare,
          status: "WL",
          assignedSeats: [],
          passengers: remainingPassengers,
          train,
          selectedCoachType,
          journeyDate,
          source,
          sourceIndex,
          destIndex,
          bookingId,
          userId,
          session
        });

        assignments.wl.push(...res.assignedSeats);

        // 🔑 Extract assigned passenger IDs
        const assignedIds = new Set(
          res.assignedSeats.map(p => p.id)
        );

        // 🔥 Remove only assigned passengers
        remainingPassengers = remainingPassengers.filter(
          p => !assignedIds.has(p.id)
        );

        console.log('assignment at waitlist :', assignments.wl);
        console.log('remaining pass at waitlist :', remainingPassengers.length)
      }

      // -------------------- FINAL MERGE --------------------
      const finalAssignedSeats = [
        ...assignments.rac,
        ...assignments.wl
      ];

      console.log('final assignment seats :', finalAssignedSeats);

      // -------------------- VALIDATION --------------------
      if (finalAssignedSeats.length !== passengers.length) {
        throw new Error("Seat assignment mismatch");
      }


      bookingData = await finalizeBooking({
        io : io,
        trainId : train._id,
        journeyDate : journeyDate,
        bookingId: bookingId,
        passengers: passengers,
        assignedSeats: finalAssignedSeats,
        userId: userId,
        sourceIndex ,
        destIndex ,
        session,
        boardingStation : source,
        selectedCoachType : selectedCoachType
      });

      console.log('returning outside of finalize booking ✅')
      return bookingData;

    });
    console.log('returning outside of transaction ✅')
    return bookingData;

  } catch (error) {
    console.error("Error during CNF booking transaction:", error);
  } finally {
    session.endSession();
  }

}
// ✅ Waitlist Booking helper
export async function handleWLBooking({
  train,
  selectedCoachType,
  selectedQuota,
  passengers,
  userId,
  source,
  destination,
  departureTime,
  arrivalTime,
  journeyDate,
  reachingTime,
  io,
  requiredSeats,
  sourceIndex,
  destIndex,
  availabilitySnapshot,

}) {

  console.log(train,
    selectedCoachType,
    passengers,
    userId,
    source,
    destination,
    journeyDate,
    reachingTime,
    requiredSeats);
  console.log("🚉 Starting WL Booking...");


  let assignedSeats = [];

  /// ⚠️ Note : we are using passenger for filtering , and requiredSeats for counting remaining seats to be assigned.

  console.log('selectedCoachType ID:', selectedCoachType._id);


  console.log('availability :', availabilitySnapshot);


  //** Initializing Transaction ✅

  const session = await mongoose.startSession();

  try {


    let bookingData = null;

    let remainingPassengers = [...passengers];




    const assignments = {
      wl: []
    };

    await session.withTransaction(async () => {

      //**  Generate PNR ✅
      const generatePNR = () => Math.floor(1000000000 + Math.random() * 9000000000).toString();

      //** */ Initializing Booking ✅

      const [booking] = await Booking.create(
        [{
          user: userId,
          train: train._id,

          selectedCoachType: {
            coachTypeId: selectedCoachType._id,
            coachTypeName: selectedCoachType.coachType
          },

          source,
          destination,
          departureTime,
          arrivalTime,
          fromIndex: sourceIndex,
          toIndex: destIndex,
          journeyDate,
          reachingTime,

          passengers: passengers.map((p) => ({
            name: p.name,
            age: p.age,
            gender: p.gender,
            contactDetails: p.contactDetails,
            status: "WL"
          })),

          PNR: generatePNR(),
          status: "PROCESSING"
        }],
        { session }
      );

      const bookingId = booking._id;

      console.log('booking initialized ✅')

      // -------------------- 5️⃣ WL --------------------
      if ( availabilitySnapshot.wl > 0 && remainingPassengers.length > 0) {
        console.log('Booking WL...')

        const res = await assignWL({
          limit: remainingPassengers.length,
          quotaType: "WL",
          fare: availabilitySnapshot.general.fare,
          status: "WL",
          assignedSeats: [],
          passengers: remainingPassengers,
          train,
          selectedCoachType,
          journeyDate,
          source,
          sourceIndex,
          destIndex,
          bookingId,
          userId,
          session
        });

        assignments.wl.push(...res.assignedSeats);

        // 🔑 Extract assigned passenger IDs
        const assignedIds = new Set(
          res.assignedSeats.map(p => p.id)
        );

        // 🔥 Remove only assigned passengers
        remainingPassengers = remainingPassengers.filter(
          p => !assignedIds.has(p.id)
        );

        console.log('assignment at waitlist :', assignments.wl);
        console.log('remaining pass at waitlist :', remainingPassengers.length)
      }

      // -------------------- FINAL MERGE --------------------
      const finalAssignedSeats = [
        ...assignments.wl
      ];

      console.log('final assignment seats :', finalAssignedSeats);

      // -------------------- VALIDATION --------------------
      if (finalAssignedSeats.length !== passengers.length) {
        throw new Error("Seat assignment mismatch");
      }


      bookingData = await finalizeBooking({
        io : io,
        trainId : train._id,
        journeyDate : journeyDate,
        bookingId: bookingId,
        passengers: passengers,
        assignedSeats: finalAssignedSeats,
        userId: userId,
        sourceIndex ,
        destIndex ,
        session,
        boardingStation : source,
        selectedCoachType : selectedCoachType
      });

      console.log('returning outside of finalize booking ✅')
      return bookingData;

    });
    console.log('returning outside of transaction ✅')
    return bookingData;

  } catch (error) {
    console.error("Error during CNF booking transaction:", error);
  } finally {
    session.endSession();
  }

}



