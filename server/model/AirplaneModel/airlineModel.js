import mongoose from "mongoose";

const airlineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    logo: { type: String },
    country: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    contact: {
      supportEmail: { type: String },
      supportPhone: { type: String },
      address: { type: String },
      website: { type: String },
    },
    aircrafts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Aircraft",
    }], /// aircrafts
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Airline = mongoose.model("Airline", airlineSchema);
