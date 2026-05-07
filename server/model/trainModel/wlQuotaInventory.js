import mongoose from "mongoose";

/**
 * WlInventorySnapshot
 *
 * Represents the waiting list (WL) inventory of a train
 * for a specific journey date and boarding station.
 *
 * This model is independent from seat / segment availability.
 */
const WlInventorySnapshotSchema = new mongoose.Schema({

  // 🔹 Train for which WL is maintained
  trainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train",
    required: true
  },

  // 🔹 Journey date (WL is always date-specific)
  journeyDate: {
    type: String,
    required: true
  },

  /**
   * Boarding station name
   * Example: Jhansi, Gwalior, Agra
   *
   * WL is decided based on boarding station.
   */
  boardingStation: {
    type: String,
    required: true
  },

  /**
   * Default WL quota declared by railway for this station
   * Acts as a reference / baseline.
   *
   * Example: GNWL, RLWL, PQWL
   */
  // stationWlPolicy: {
  //   type: String,
  //   enum: ['GNWL', 'RLWL', 'PQWL'],
  //   required: true
  // },

  /**
   * Coach-wise WL inventory
   * Each coach type can have its own WL policy and queue.
   */
  coachWlInventories: [
    {
      /**
       * Coach type
       * Example: SL, 3A, 2A
       */
      coachTypeName: {
        type: String,
        required: true
      },

      /**
       * WL quota applied to this coach at this station.
       * This may override stationWlPolicy.
       */
      wlQuota: {
        type: String,
        enum: ['GNWL', 'RLWL', 'PQWL'],
        required: true
      },

      wlLimit: {
        type: Number,
        required: true
      },

      /**
       * Waiting list queue for this coach type.
       * Each entry represents one booking request.
       */
      wlQueue: [
        {

          selectedCoachType: {
            coachTypeId: mongoose.Schema.Types.ObjectId,   // subdocument _id
            coachTypeName: String   // snapshot
          },

          /**
           * Journey segment start index (route index)
           */
          fromIndex: {
            type: Number,
            required: true
          },

          /**
           * Journey segment end index (route index)
           */
          toIndex: {
            type: Number,
            required: true
          },

          wlPosition: {
            type: Number,
            required: true
          },


          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
          },

          bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking"
          },

          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ]
    }
  ]

}, { timestamps: true });







export const WlInventorySnapshot = mongoose.model("WlInventorySnapshot", WlInventorySnapshotSchema);
