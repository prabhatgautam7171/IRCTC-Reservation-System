# 🚆 IRCTC Reservation System (MERN Stack)

A full-scale real-world railway reservation system inspired by the Indian Railways IRCTC platform, built using the MERN stack with advanced reservation logic, RAC/CNF seat management, real-time updates, and segment-based seat allocation.

This project focuses not only on UI design but also on solving complex backend reservation problems similar to real-world railway systems.

---

# 🌐 Live Demo

* **Frontend:** Add Deployment Link Here
* **Backend API:** Add Backend Link Here
* **GitHub Repository:** Add Repository Link Here

---

# 📌 Project Overview

This project simulates a production-level train reservation system where users can:

* Search trains between stations
* View seat availability
* Book tickets
* Manage passengers
* Handle RAC/WL logic (included all main Waitlists like GNWL , RLWL, PQWL)
* Cancel tickets
* Automatically promote RAC passengers to CNF and TQWL to Tatkal (if Tatkal Booking Opens)
* Receive real-time seat updates
* Make online payments
* Track booking details

The system is designed with segment-based seat allocation logic to handle overlapping train routes efficiently.

---

# ✨ Key Features

## 👤 Authentication & Authorization

* User Signup/Login
* JWT Authentication
* Protected Routes
* Role-Based Access Control
* Admin Dashboard Access

---

## 🚆 Train Management

* Add/Edit/Delete Trains
* Dynamic Coach Creation
* Multiple Coach Types
* Route-Based Train Structure
* Train Schedule Management
* Platform & Timing Management

---

## 🔍 Smart Train Search

Users can search trains using:

* Source Station
* Destination Station
* Journey Date
* Class Type

Additional Features:

* Travel Duration Calculation
* Dynamic Availability Display
* Route Validation
* Multi-Station Route Handling

---

# 🎟️ Advanced Reservation Engine

One of the core highlights of this project is the real-world reservation logic.

## Implemented Reservation Features

* Segment-Based Seat Allocation
* Overlapping Route Management
* CNF Booking Logic
* RAC Queue System
* Waiting List Support
* Automatic Seat Promotion
* Real-Time Availability Updates
* Partial Route Occupancy Handling
* Seat Reusability Across Segments

---

# 🔄 Cancellation & Promotion System

This project includes a complex cancellation engine inspired by real railway reservation systems.

## Features

* Ticket Cancellation
* Segment Availability Recalculation
* RAC to CNF Promotion
* Queue-Based Passenger Promotion
* Automatic Seat Reassignment
* Real-Time Passenger Status Updates

The system intelligently determines which passengers can be promoted based on overlapping travel segments and seat availability.

---

# ⚡ Real-Time Features

Implemented using Socket.IO.

## Real-Time Capabilities

* Live Seat Availability Updates
* Instant Booking Synchronization
* Real-Time Promotion Notifications
* Multi-User Reservation Consistency
* Live Booking Changes Across Clients

---

# 💳 Payment Integration

Integrated payment workflow using Stripe.

## Payment Features

* Secure Payment Flow
* Booking Confirmation After Payment
* Payment Failure Handling
* Transaction Validation

---

# 🧠 System Design Highlights

This project focuses heavily on backend logic and reservation system architecture.

## Advanced Concepts Used

* Segment-Based Availability Calculation
* Dynamic Seat Allocation
* Reservation Queue Management
* Concurrent Booking Handling
* Nested Data Structures
* Optimized Route Searching
* Real-Time Event Synchronization

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Redux Toolkit
* Tailwind CSS
* React Router DOM
* Axios
* Socket.IO Client

---

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.IO

---

## Payment & Deployment

* Stripe
* Vercel
* Render / Railway
* MongoDB Atlas

---

# 🧱 Project Architecture

## Frontend Structure

```bash
src/
 ├── components/
 ├── pages/
 ├── redux/
 ├── utils/
 ├── hooks/
 ├── layouts/
 └── services/
```

---

## Backend Structure

```bash
server/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── sockets/
 ├── services/
 ├── utils/
 └── config/
```

---

# 📊 Reservation Workflow

## Booking Flow

1. User searches train
2. System validates route
3. Available segments are calculated
4. Suitable seat is assigned
5. Payment is completed
6. Booking status is generated
7. Real-time updates are emitted

---

## Cancellation Flow

1. User cancels ticket
2. Reserved segments are released
3. Availability recalculates
4. RAC queue is checked
5. Eligible passenger gets promoted
6. Seat data updates in real-time

---

# 🗄️ Database Design

The database is designed to support:

* Dynamic routes
* Nested coach structures
* Segment-level booking tracking
* Passenger management
* Seat occupancy mapping
* Queue handling

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing
* Protected APIs
* Role Authorization
* Secure Payment Validation
* Environment Variable Protection

---

# 📱 Responsiveness

Currently optimized primarily for desktop experience.

The main focus of the project was building a real-world reservation engine and advanced backend architecture.

---

# 📸 Screenshots

## Home Page

![alt text](image-1.png)

## Train Search Page

![alt text](image-2.png)

## Booking Page

![alt text](E822523D-A450-4084-B855-F38AE543B125_1_105_c.jpeg)


## Admin Dashboard

![alt text](image-3.png)

---

# 🚀 Installation & Setup

## Clone Repository

```bash
git clone <your-repo-link>
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## Backend Setup

```bash
cd server
npm install
npm run dev
```

---

# 🔑 Environment Variables

## Backend (.env)

```env
PORT=
MONGO_URI=
JWT_SECRET=
STRIPE_SECRET_KEY=
CLIENT_URL=
```

---

## Frontend (.env)

```env
VITE_API_URL=
VITE_STRIPE_PUBLISHABLE_KEY=
```

---

# 🧪 Future Improvements

* Full Mobile Responsiveness
* Email Notifications
* SMS Alerts
* AI-Based Seat Prediction
* PNR Tracking
* Ticket PDF Generation
* Analytics Dashboard
* Train Delay Tracking
* Multi-Language Support

---

# 🎯 Learning Outcomes

This project helped in understanding:

* Real-world system design
* Complex backend logic
* Reservation algorithms
* Queue handling systems
* Real-time communication
* MERN architecture at scalenpm run build
* Database optimization
* State management

---

# 🙌 Acknowledgements

Inspired by the real Indian Railways reservation workflow and IRCTC platform.

---

# 👨‍💻 Author

## Prabhat Gautam

* MERN Stack Developer
* Passionate about System Design & Real-World Backend Logic

---

# ⭐ Support

If you found this project useful, consider giving it a star on GitHub.
