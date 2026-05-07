import { Flight } from "../../model/AirplaneModel/flightModel.js";
import { Aircraft } from "../../model/AirplaneModel/aircraftModel.js";
import { BookFlight } from "../../model/AirplaneModel/bookingFlightModel.js";
import { assignSeats } from "../../utils/seatAssignmentHelper.js";
import { generateAirlineTicket } from "../../templates/flightTicketTemplate.js";
import { sendTicketEmail } from "../../utils/sendTicket.js";
import { User } from "../../model/authModel/userModel.js";

export const bookFlight = async (req, res) => {
  try {
    console.log("✅ Booking route hit");
    console.log("➡️ Body:", JSON.stringify(req.body, null, 2));

    const {
      tripType,
      preferredClass,
      passengers,
      flightId,
      onwardFlightId,
      returnFlightId,
      selectedSeat,
      onwardSelectedSeat,
      returnSelectedSeat,
    } = req.body;


    const userId = req.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: 'user not aunthenticated'
      })
    }

    // ✅ Basic validation
    if (!tripType || !passengers?.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (tripType, passengers)."
      });
    }

    const normalizedClass = (preferredClass || "economy").toLowerCase();
    const validClasses = ["economy", "business", "first"];
    if (!validClasses.includes(normalizedClass)) {
      return res.status(400).json({
        success: false,
        message: `Invalid class. Must be one of: ${validClasses.join(", ")}`
      });
    }

    // 🧩 Helper to build a flight segment with assigned seats and correct price
    const buildFlightSegment = async (flightId, passengersList, selectedSeatData) => {
      const flight = await Flight.findById(flightId)
        .populate("airline")
        .populate("from")
        .populate("to");

      if (!flight) throw new Error(`Flight not found for ID: ${flightId}`);

      const aircraft = await Aircraft.findById(flight.aircraft);
      if (!aircraft) throw new Error(`Aircraft not found for flight ${flightId}`);

      const selectedPrice = flight.price?.[normalizedClass];
      if (!selectedPrice || isNaN(selectedPrice))
        throw new Error(`Invalid price for class "${normalizedClass}" in flight ${flightId}`);

      // ✅ O(1) Seat booking using row + seat number
      const { seatNo, seatRow } = selectedSeatData || {};

      if (!seatNo || !seatRow)
        throw new Error("Seat selection missing seatNo or seatRow.");

      // 🧭 Find correct class
      const classData = aircraft.classes.find(
        (c) => c.classType.toLowerCase() === normalizedClass
      );

      if (!classData)
        throw new Error(`Class "${normalizedClass}" not found in aircraft ${aircraft._id}`);

      // ✅ Get target row within that class
      const rowIndex = Number(seatRow) - 1;
      const targetRow = classData.rows[rowIndex];

      if (!targetRow)
        throw new Error(`Row ${seatRow} not found in ${normalizedClass} class of aircraft.`);

      const targetSeat = targetRow.seats.find((s) => s.seatNo === seatNo);

      if (!targetSeat || !targetSeat.isAvailable)
        throw new Error(`Seat ${seatNo} not available or already booked.`);

      // ✅ Mark seat as booked
      targetSeat.isAvailable = false;
      await aircraft.save();

      // ✅ Return structured flight info
      return {
        flightId: flight._id,
        flightNo: flight.flightNumber,
        airline: {
          name: flight.airline?.name || "Airline",
          logo: flight.airline?.logo
        },
        from: {
          code: flight.from?.code,
          city: flight.from?.city,
          terminal: flight.from?.terminal || "T1"
        },
        to: {
          code: flight.to?.code,
          city: flight.to?.city,
          terminal: flight.to?.terminal || "T1"
        },
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        journeyDate: flight.departureTime,
        duration: flight.duration,
        price: selectedPrice, // ✅ numeric only
        class: normalizedClass,
        aircraftId: aircraft._id,
        passengers: passengersList.map((p) => ({
          ...p,
          seatClass: normalizedClass,
          seatNumber: seatNo,
          seatType : targetSeat.seatType,
          status: "Confirmed",
        }))
      };


    };


    // ✅ ONE-WAY BOOKING
    if (tripType === "oneWay") {
      if (!flightId)
        return res.status(400).json({
          success: false,
          message: "Missing onward flight ID for one-way trip."
        });

      const segment = await buildFlightSegment(flightId, passengers, selectedSeat);

      const totalFare = passengers.length * segment.price;

      const PNR = "PNR" + Date.now() + Math.floor(1000 + Math.random() * 9000);

      const bookingData = {
        user: user._id,
        tripType: "oneWay",
        preferredClass: normalizedClass,
        flights: [segment],
        passengers: segment.passengers,
        contact: passengers[0].contact,
        journeyDate: segment.journeyDate,
        totalFare,
        PNR
      };

      const newBooking = await BookFlight.create(bookingData);

      const html = generateAirlineTicket(newBooking);

      await sendTicketEmail({
        to: user.email,
        subject: 'This is your Flight e-Ticket',
        html: html
      });


      return res.status(201).json({
        success: true,
        message: "✅ One-way flight booked successfully",
        booking: newBooking
      });
    }

    // ✅ ROUND-TRIP BOOKING
    else if (tripType === "roundTrip") {
      if (!onwardFlightId || !returnFlightId)
        return res.status(400).json({
          success: false,
          message: "Missing onward or return flight IDs."
        });

      // Build both flight segments
      const onwardSegment = await buildFlightSegment(onwardFlightId, passengers , onwardSelectedSeat);
      const returnSegment = await buildFlightSegment(returnFlightId, passengers , returnSelectedSeat);

      const totalFare =
        passengers.length * (onwardSegment.price + returnSegment.price);

      const PNR = "PNR" + Date.now() + Math.floor(1000 + Math.random() * 9000);

      const bookingData = {
        user: user._id,
        tripType: "roundTrip",
        preferredClass: normalizedClass,
        flights: [onwardSegment, returnSegment],
        passengers: [...onwardSegment.passengers, ...returnSegment.passengers],
        contact: passengers[0].contact,
        journeyDate: onwardSegment.journeyDate,
        totalFare,
        PNR
      };

      const newBooking = await BookFlight.create(bookingData);

      const html = generateAirlineTicket(newBooking);

      await sendTicketEmail({
        to: user.email,
        subject: 'This is your Flight e-Ticket',
        html: html
      });



      return res.status(201).json({
        success: true,
        message: "✅ Round-trip booked successfully",
        booking: newBooking
      });
    }

  } catch (error) {
    console.error("❌ Error booking flight:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};
