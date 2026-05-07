import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  seatType: {
    type: String,
    enum: ["window", "middle", "aisle"],
    required: true,
  },
  seatNo: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const rowSchema = new mongoose.Schema({
  rowNo: {
    type: Number,
    required: true,
  },
  seats: [seatSchema],
});

const classSchema = new mongoose.Schema({
  classType: {
    type: String,
    enum: ["Economy", "Business", "First"],
    required: true,
  },
  rows: [rowSchema], // simplified: no columns
});

const aircraftSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Airbus A320"
    code: { type: String, required: true, unique: true }, // e.g., "A320"
    totalSeats: { type: Number, required: true },

    classes: [classSchema], // simplified classes

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const Aircraft = mongoose.model("Aircraft", aircraftSchema);
