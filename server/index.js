dotenv.config({});
import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './DB/db.js';
import cors from 'cors';
// import passport from "./config/passport.js"
import userRoute from './routes/authRoute/userRoute.js'
import authGoogleRoute from './routes/authRoute/authGoogleRoute.js'
// import authGithubRoute from "./routes/authRoute/authGithubRoute.js"
import cookieParser from 'cookie-parser';
import trainRoute from  './routes/trainRoute/trainroute.js'
import bookingRoute from './routes/trainRoute/bookingRoute.js'
import paymentRoutes from './routes/trainRoute/paymentRoute.js';
import airlineRoute from './routes/airplaneRoute/airlineRoute.js'
import aircraftRoute from './routes/airplaneRoute/aircraftRoute.js'
import flightRoute from './routes/airplaneRoute/flightRoute.js'
import bookingFlightRoute from './routes/airplaneRoute/bookFlightRoute.js'
import flightPaymentRoute from './routes/airplaneRoute/flightPaymentRoute.js'
import { Server } from 'socket.io';
import http from 'http'


const app = express();


const PORT = process.env.PORT || 4000 ;


///default middleware


// Middleware to parse JSON requests
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

// app.use(passport.initialize());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
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


const startServer = async () => {
  try {

    await connectDb();

    server.listen(PORT, () => {
      console.log(`🔌 Server + Socket.io running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Startup Error:", err);
  }
};

startServer();






// train Apis

app.use('/api/v1/user', userRoute);
app.use('/api/v1/google', authGoogleRoute);
// app.use("/api/v1/github", authGithubRoute);
app.use('/api/v1/train', trainRoute);
app.use('/api/v1/booking', bookingRoute);
app.use('/api/v1/payment', paymentRoutes);

// plane Apis
app.use('/api/v1/airline', airlineRoute);
app.use('/api/v1/aircraft', aircraftRoute);
app.use('/api/v1/flight', flightRoute);
app.use('/api/v1/booking', bookingFlightRoute );
app.use('/api/v1/payment-flight', flightPaymentRoute  );



