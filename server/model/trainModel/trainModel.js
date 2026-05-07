import mongoose from "mongoose";

const seatMapSchema = new mongoose.Schema({
  seatNo: Number,

  rac: {
    type: Boolean,
    required: true
  },

  seatType: {
    type: String,
    enum: ["UpperBerth", "LowerBerth", "MiddleBerth", "SideUpper", "SideLower"]
  },

});


const seatTypeSchema = new mongoose.Schema({
  rac: {
    type: Boolean,
    required: true
  },



  seatType: {
    type: String,
    enum: ["UpperBerth", "LowerBerth", "MiddleBerth", "SideUpper", "SideLower"],
    required: true
  },


  seatMap: [seatMapSchema],


  totalSeats: {
    type: Number,
    default: 0,

  },

})

seatTypeSchema.pre('save', function (next) {
  // 'this' refers to the seatType document
  this.seatMap = []; // initialize empty array

  for (let i = 1; i <= this.totalSeats; i++) {
    if (this.rac) {
      this.seatMap.push({
        seatNo: i,
        seatType: this.seatType,
        rac: true,

      });
    } else {
      this.seatMap.push({
        seatNo: i,
        seatType: this.seatType,
        rac: false,
      });
    }

  }
  next();
});


//?..........................................................................................................

const CoachListSchema = new mongoose.Schema({

  coachName: {        //// S1, A1 , D1
    type: String,
    required: true,

  },

  seatType: [seatTypeSchema],

  totalSeats: {
    type: Number,
    required: true,
    default: 0
  },


  CNFAvailable: {
    type: Number,
    required: true,
    default: 0
  },

  racLimit: { type: Number, default: 10 }

});


// 👉 Middleware to auto-calculate totals before saving a Coach
CoachListSchema.pre('save', function (next) {
  if (this.isModified('seatType')) {
    let total = 0, racLimit = 0, nonRACAvailable = 0
    this.seatType.forEach(seat => {

      // 🔹 Add up all seats
      total += seat.totalSeats;

      // 🔹 If RAC type seat
      if (seat.rac) {
        racLimit += seat.totalSeats; // count RAC seats separately
      } else {
        // 🔹 CNF / Non-RAC seat
        nonRACAvailable += seat.totalSeats;
      }

    });
    this.totalSeats = total;
    this.racLimit = racLimit;
    this.CNFAvailable = nonRACAvailable;
  }
  next();
});

//?..........................................................................................................




const CoachTypeSchema = new mongoose.Schema({
  trainRoutes: [
    {
      routeName: String,
      routeCode: String,
      arrivalTime: String,
      departureTime: String,
      distance: Number
    }
  ],


  coachType: {
    type: String,
    required: true,
    enum: ['AC', 'Sleeper', 'General', 'SL', 'CC', 'EC', '1A', '2A', '3A'],

  },

  quota: [
    {
      type: { type: String, enum: ["general", "ladies", "senior", "tatkal", "premiumTatkal"] },
      totalSeats: Number,
      isEnabled: Boolean,
      basePrice: Number
    }
  ],

  wlQuotaMap: [
    {
      routeIndex: Number,

      routeName: {
        type : String,
        required : true
      },

      wlQuota: {
        type: String,
        enum: ['GNWL', 'RLWL', 'PQWL'],
        default: 'GNWL'
      },

      wlLimit: {
        type: Number,
        required: true
      },
    }
  ]

  ,
  racLimit: { type: Number, default: 20 },
  tatkalLimit: { type: Number, default: 10 },  /// Tatkal Queue Limit

  totalSeats: {
    type: Number,
    required: true,
    default: 0
  },
  coachList: [CoachListSchema],
});

// CoachTypeSchema.pre('save', function (next) {
//   let total = 0;
//   let available = 0;
//   let racLimit = 0;
//   let CNFAvailable = 0;

//   this.coachList.forEach(coach => {
//     total += coach.totalSeats;
//     available += coach.availableSeats;
//     racLimit += coach.racLimit;
//     CNFAvailable += coach.CNFAvailable;
//   });

//   this.totalSeats = total;
//   this.availableSeats = available;
//   this.racLimit = racLimit;

//   //? count CNF available seats as well as keeping it as general quota

//     this.quota.forEach(quota => {
//       if (quota.type === "General") {
//         quota.totalSeats = Math.floor(CNFAvailable * 0.8); /// eg, 80% seats for general quota
//         quota.availableSeats = quota.totalSeats;
//       }

//       if( quota.type === "Ladies") {
//         quota.totalSeats = Math.floor(CNFAvailable * 0.1);  // eg, 100 seats -> 10 seats for ladies
//         quota.availableSeats = quota.totalSeats;
//       }

//       if( quota.type === "Tatkal") {
//         quota.totalSeats = Math.floor(CNFAvailable * 0.3); // eg, 100 seats -> 30 seats for tatkal
//         quota.availableSeats = quota.totalSeats;
//       }

//       if( quota.type === "Senior") {
//         quota.totalSeats = Math.floor(CNFAvailable * 0.15); // eg, 100 seats -> 15 seats for senior citizen
//         quota.availableSeats = quota.totalSeats;
//       }

//       if( quota.type === "PremiumTatkal") {
//         quota.totalSeats = Math.floor(CNFAvailable * 0.05); // eg, 100 seats -> 5 seats for premium tatkal
//         quota.availableSeats = quota.totalSeats;
//       }
//     });

//     /// if  seats were minimum and did not fullfill the quota so assign the seats to general quota

//     this.quota.forEach(quota => {

//        if(quota.availableSeats <= 0)

//             this.quota.forEach(q => {
//               if(q.type === "General") {
//                 q.totalSeats += CNFAvailable;
//                 q.availableSeats += q.totalSeats;
//               }
//             });

//     });

//     this.segment.forEach(s => ({
//       s.general =  Math.floor(CNFAvailable * 0.8),
//       s.ladies = Math.floor(CNFAvailable * 0.1),
//       s.tatkal = Math.floor(CNFAvailable * 0.1),
//       s.preminumTatkal = Math.floor(CNFAvailable * 0.1),
//       s.senior = Math.floor(CNFAvailable * 0.1),
//       s.rac = this.racLimit
//       s.wl = this.wlQuotaMap.
//     })
//     )

//   next();
// });



//?..........................................................................................................

///// routes

CoachTypeSchema.pre('save', function (next) {
  let total = 0;
  let racLimit = 0;
  let CNFAvailable = 0;

  // 1. Aggregate coach data
  this.coachList.forEach(coach => {
    total += coach.totalSeats;
    racLimit += coach.racLimit;
    CNFAvailable += coach.CNFAvailable;
  });

  this.totalSeats = total;
  this.racLimit = racLimit;

  // 2. Distribute quotas
  const quotaPercent = {
    general: 0.8,
    ladies: 0.1,
    tatkal: 0.05,
    senior: 0.04,
    premiumTatkal: 0.01
  };

  let assigned = 0;

  this.quota.forEach(quota => {
    const p = quotaPercent[quota.type] || 0;
    quota.totalSeats = Math.floor(CNFAvailable * p);
    assigned += quota.totalSeats;
  });

  // 3. Give leftover seats to General Quota
  const leftover = CNFAvailable - assigned;

  if (leftover > 0) {
    const general = this.quota.find(q => q.type === "general");
    general.totalSeats += leftover;
  }




  next();
});


const routeSchema = new mongoose.Schema({
  routeName: {   // eg : Mumbai to Delhi
    type: String,
    required: true
  },
  stationName : {
    type: String,
    required: true
  },
  routeState : {
    type: String,
    required: true
  },
  routeCode: {  // eg : MUM-DEL
    type: String,
    required: true
  },
  distance: {
    type: Number,
    default: 0
  },

  arrivalTime: {
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },


  platformNo: {
    type: Number,
    required: true
  }

})

//?..........................................................................................................


const trainSchema = new mongoose.Schema({
  trainName: {
    type: String,
    required: true
  },
  trainNo: {
    type: Number,
    required: true
  },

  trainType: {
    type: String,
    enum: ["Express", "Local", "Superfast", "Rajdhani", "Shatabdi", "Duronto", "GaribRath"],
    default: "Express"
  },

  startTime: {
    type: String,
    required: true
  },


  endTime: {
    type: String,
    required: true
  },

  startStation: {
    type: String,
    required: true,
  },

  endStation: {
    type: String,
    required: true
  },

  routes: [routeSchema],
  coaches: [
    CoachTypeSchema
  ],

  runningDays: [String]


}, { timestamps: true });

export const Train = mongoose.model("Train", trainSchema);




