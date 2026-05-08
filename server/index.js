console.log("STEP 1");
import express from 'express';
import dotenv from 'dotenv';
dotenv.config({});
import { connectDb } from './DB/db.js';
import cors from 'cors';
// // import passport from "./config/passport.js"
import userRoute from './routes/authRoute/userRoute.js'
// import authGoogleRoute from './routes/authRoute/authGoogleRoute.js'
// // import authGithubRoute from "./routes/authRoute/authGithubRoute.js"
import cookieParser from 'cookie-parser';
import trainRoute from  './routes/trainRoute/trainroute.js'
import bookingRoute from './routes/trainRoute/bookingRoute.js'
import paymentRoutes from './routes/trainRoute/paymentRoute.js';
// import airlineRoute from './routes/airplaneRoute/airlineRoute.js'
// import aircraftRoute from './routes/airplaneRoute/aircraftRoute.js'
// import flightRoute from './routes/airplaneRoute/flightRoute.js'
// import bookingFlightRoute from './routes/airplaneRoute/bookFlightRoute.js'
// import flightPaymentRoute from './routes/airplaneRoute/flightPaymentRoute.js'
import { Server } from 'socket.io';
import http from 'http'
console.log("STEP 2");


const app = express();


const PORT = process.env.PORT || 4000 ;


// ///default middleware


// // Middleware to parse JSON requests
app.use(express.json());
// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin : process.env.CLIENT_URL,
    credentials : true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}

app.use(cors(corsOptions));

// // app.use(passport.initialize());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

app.set('io', io); // Make io accessible in routes via req.app.get('io')

io.on('connection', (socket) => {
  console.log('new client connected:', socket.id);

  // ✅ JOIN ROOM (VERY IMPORTANT)
  socket.on('joinTrainRoom', ({ trainId, date, sourceIndex, destIndex }) => {
    const room = `${trainId}_${date}_${sourceIndex}_${destIndex}`;
    socket.join(room);

    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('leaveTrainRoom', ({ trainId, date, sourceIndex, destIndex }) => {
    const room = `${trainId}_${date}_${sourceIndex}_${destIndex}`;
    socket.leave(room);
  });

  // ✅ DISCONNECT
  socket.on('disconnect', () => {
    console.log('client disconnected:', socket.id);
  });
});


app.get("/", (req, res) => {
  res.send("Server Running");
});

console.log("STEP 3");

const startServer = async () => {
  try {

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log("STEP 4 - SERVER STARTED");
    });

    console.log("STEP 5 - CONNECTING DB");

    await connectDb();

    console.log("STEP 6 - DB CONNECTED");

  } catch (err) {
    console.error("Startup Error:", err);
  }
};

startServer();






// train Apis

app.use('/api/v1/user', userRoute);
// app.use('/api/v1/google', authGoogleRoute);
// // app.use("/api/v1/github", authGithubRoute);
app.use('/api/v1/train', trainRoute);
app.use('/api/v1/booking', bookingRoute);
app.use('/api/v1/payment', paymentRoutes);

// // plane Apis
// app.use('/api/v1/airline', airlineRoute);
// app.use('/api/v1/aircraft', aircraftRoute);
// app.use('/api/v1/flight', flightRoute);
// app.use('/api/v1/booking', bookingFlightRoute );
// app.use('/api/v1/payment-flight', flightPaymentRoute  );



