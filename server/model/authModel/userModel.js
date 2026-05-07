import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        unique : true,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    resetToken : {
        type : String ,
    },
    resetTokenExpire : {
         type : Date
    },
    isTokenVerified : {
        type: Boolean, default: false
    },
    isAdmin : {
        type : Boolean,
        default : false
    },
    bookings : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Booking'
        }
    ],
    flightBookings : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "BookFlight"
        }
    ],
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },
    profilePic: String,
},{timestamps: true});

export const User = mongoose.model('User', userSchema);

