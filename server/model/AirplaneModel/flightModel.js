import mongoose from "mongoose";



const flightSchema = new mongoose.Schema(
    {
      flightNumber: {
        type: String,
        required: true,
        unique: true, // e.g., "AI-202"
      },
  
      airline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Airline",
        required: true,
      },
  
      aircraft: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Aircraft",
        required: true,
      },
  
      from: { 
         city : {
          type: String, required: true
         },
         code : {
          type: String, required: true
        },
         
         terminal : {
          type: String, required: true
         }
       },

       to: { 
        city : {
         type: String, required: true
        },
        code : {
         type: String, required: true
       },
        
        terminal : {
         type: String, required: true
        }
      },
    
     
  
      departureTime: { type: Date, required: true },
      arrivalTime: { type: Date, required: true },
  
      duration: { type: String }, // e.g., "2h 30m"
  
      status: {
        type: String,
        enum: ["scheduled", "departed", "delayed", "cancelled", "landed"],
        default: "scheduled",
      },
  
      price: {
        economy: { type: Number, required: true },
        business: { type: Number },
        first: { type: Number },
      },
    },
    { timestamps: true }
  );
  
  export const Flight = mongoose.model("Flight", flightSchema);
  