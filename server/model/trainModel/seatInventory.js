import mongoose from "mongoose";

 const SeatInventorySchema = new mongoose.Schema({
  trainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train",
    required: true,

  },

  journeyDate: {
    type: String,
    required: true
  },

  coachTypeName: {
    type: String,          // Sleeper, 3A, 2A, CC
    required: true,

  },

  coachName: {
    type: String,          // S1, S2, B1
    required: true
  },

  seatNo: {
    type: Number,
    required: true
  },

  seatType: {
    type: String           // Lower, Upper, SideLower, etc.
  },

  status: {
    type: String,
    enum: ["CNF", "RAC"],
    default: "CNF",
    index: true
  },

  bookedSegments: [
    {
      fromIndex: Number,
      toIndex: Number,
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
      }
    }
  ],

  racMeta: {
    slot1: {
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      },
      racPosition: {
        type: Number,
        default: null
      },
      bookedSegments: [
        {
          fromIndex: Number,
          toIndex: Number
        }
      ]
    },

    slot2: {
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      },
      racPosition: {
        type: Number,
        default: null
      },
      bookedSegments: [
        {
          fromIndex: Number,
          toIndex: Number
        }
      ]
    }
  }


}, { timestamps: true });

SeatInventorySchema.index(
  { trainId: 1, journeyDate: 1, coachName: 1, seatNo: 1 },
  { unique: true }
);


export const SeatInventory = mongoose.model('SeatInventory', SeatInventorySchema);
