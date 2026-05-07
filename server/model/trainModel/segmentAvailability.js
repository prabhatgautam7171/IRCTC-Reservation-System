import mongoose from "mongoose";

const SegmentAvailabilitySchema = new mongoose.Schema({

  trainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train",
    required: true
  },

  journeyDate: {
    type: String,
    required: true
  },

  segments: [
    {
      segmentIndex: {
        type: Number,
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

      coachTypes: [
        {
          coachTypeName: {
            type: String,
            required: true
          },

          status: {
            type: String,
            enum: ["AVL", "AVAILABLE", "RAC", "WL", "REGRET"]
          },

          rac: { type: Number, default: 0 },

          racQueue: [
            {
              selectedCoachType: {
                coachTypeId: {
                  type: mongoose.Schema.Types.ObjectId // subdocument _id
                },
                coachTypeName: String                 // snapshot
              },

              // 🔹 Journey segment
              fromIndex: {
                type: Number,
                required: true
              },
              toIndex: {
                type: Number,
                required: true
              },

              // 🔹 Seat reference (assigned at RAC time)
              seatId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SeatInventory",
                required: true
              },

              // 🔑 RAC slot
              slot: {
                type: Number,
                enum: [1, 2],
                required: true
              },

              // 🔹 Queue ordering
              racPosition: {
                type: Number,
                required: true
              },

              // 🔹 Ownership
              userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
              },
              bookingId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Booking",
                required: true
              },

              createdAt: {
                type: Date,
                default: Date.now
              }
            }
          ],

          tatkal: { type: Number, default: 0 },  /// Tatkal Queue Limit

          tatkalQueue: [  /// Tatkal Queue List
            {
              selectedCoachType: {
                coachTypeId: mongoose.Schema.Types.ObjectId,   // subdocument _id
                coachTypeName: String   // snapshot
              },
              //* Journey segment start index (route index)

              fromIndex: {
                type: Number,
                required: true
              },

              toIndex: {
                type: Number,
                required: true
              },

              tatkalPosition: {
                 type : Number,
                 required : true
              },

              userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
              bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
              createdAt: { type: Date, default: Date.now }
            }
          ],

          quota: [
            {
              type: { type: String, enum: ["general", "ladies", "senior", "tatkal", "premiumTatkal"] },
              availableSeats: Number,
              isEnabled: Boolean,
              pricePerSeat: Number
            }
          ],


        }
      ]
    }
  ]




}, { timestamps: true });



export const SegmentAvailability = mongoose.model("SegmentAvailability", SegmentAvailabilitySchema);
