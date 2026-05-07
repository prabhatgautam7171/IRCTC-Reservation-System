import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; // ✅ for unique PNRs

const passengerSchema = new mongoose.Schema({
  title: { type: String, enum: ["Mr", "Mrs", "Ms", "Dr"], default: "Mr" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  dob: { type: String, required: true },

  // Passport info → optional for domestic
  passport: { type: String },
  passportExpiry: { type: String },
  nationality: { type: String },

  mealPreference: { type: String }, // optional


  contact: {
    email: { type: String },
    phone: { type: String },
    countryCode: { type: String }
  },

  seatClass: { type: String, enum: ["economy", "business", "first"], required: true },
  seatType: { type: String, enum: ["window", "middle", "aisle", "No Preference"], default: "No Preference" },
  seatNumber: { type: String },
  status: { type: String, enum: ["Cancelled", "Confirmed", "Completed"], default: "Confirmed" },
}, { _id: false });

const flightSegmentSchema = new mongoose.Schema({
  flightId: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", required: true }, // 👈 rename to avoid collision
  flightNo: { type: String, required: true },
  airline: {
    name: { type: String, required: true },
    logo: { type: String }
  },
  from: {
    code: { type: String, required: true },
    city: { type: String, required: true },
    terminal: { type: String }
  },
  to: {
    code: { type: String, required: true },
    city: { type: String, required: true },
    terminal: { type: String }
  },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  journeyDate: { type: Date, required: true },
  duration: { type: String },
  price: { type: Number, required: true },
  class: { type: String, enum: ["economy", "business", "first"], required: true },
  aircraftId: { type: mongoose.Schema.Types.ObjectId, ref: "Aircraft", required: true },
  passengers: [passengerSchema]
});


const bookingFlightSchema = new mongoose.Schema({
   user : {
          type : mongoose.Schema.Types.ObjectId ,
          ref : 'User'
      },
  tripType: { type: String, enum: ["oneWay", "roundTrip"], required: true },

  // Legacy one-way support
  flight: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Flight" },
    flightNo: { type: String },
    price: { type: Number },
    class: { type: String, enum: ["economy", "business", "first"] },
    journeyDate: { type: Date },
    aircraftId: { type: mongoose.Schema.Types.ObjectId, ref: "Aircraft" }
  },

  // ✅ Unified flights array (one-way has length 1, round-trip has length 2)
  flights: { type: [flightSegmentSchema], required: true },

  // Main passengers list (compatibility / summary only)
  passengers: [passengerSchema],

  contact: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    countryCode: { type: String }
  },

  journeyDate: { type: Date, required: true }, // main journey date (from first segment)
  totalFare: { type: Number, required: true },

  PNR: { type: String, unique: true, default: () => "PNR-" + uuidv4() }, // ✅ UUID for safety
}, { timestamps: true });

export const BookFlight = mongoose.model("BookFlight", bookingFlightSchema);
