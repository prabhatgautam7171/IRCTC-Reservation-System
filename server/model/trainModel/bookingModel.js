import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train"
  },

  selectedCoachType: {
    coachTypeId: mongoose.Schema.Types.ObjectId,
    coachTypeName: String
  },


  source: {
    type: String,
    required: true
  },

  destination: {
    type: String,
    required: true
  },

  departureTime: {
    type: String,
    required: true
  },

  arrivalTime: {
    type: String,
    required: true
  },

  fromIndex: {
    type: Number,
    required: true
  },

  toIndex: {
    type: Number,
    required: true
  },

  reachingTime: {
    type: String,
    required: true
  },

  passengers: [
    {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      gender: {
        type: String,
        enum: ['male', 'Male', 'female', 'Female', 'other'],
        required: true
      },
      contactDetails: { type: Number, required: true },
      quota: String,
      coach: String,
      seatType: String,
      seatBooked: String,
      upgradeAllowed: {
        type: Boolean,
        default: false
      },

      status: {
        type: String,
        enum: ["CNF", "RAC", "TQWL", "PQWL", "RLWL" , "GNWL", "WL", "CANCELLED"],
        default: "WL"
      },

      fare: Number,

      seatRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SeatInventory"
      }
    }
  ],

  journeyDate: {
    type: String,
    required: true
  },

  totalFare: {
    type: Number,
    default: 0
  },

  PNR: {
    type: String,
    required: true,
    unique: true
  },

  status: {
    type: String,
    enum: ["PROCESSING", "CONFIRMED", "CANCELLED", "FAILED"],
    default: "PROCESSING"
  }

}, { timestamps: true });


export const Booking = mongoose.model('Booking', bookingSchema);
