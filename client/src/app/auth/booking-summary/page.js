'use client';
import { useEffect, useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useSelector } from "react-redux";
import { FaTrain, FaUser, FaCalendarAlt, FaChair, FaMoneyBillWave, FaLock, FaInfoCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/dateFormat";

export default function BookingSummary() {
  const router = useRouter();
  const { selectedPassengers } = useSelector(store => store.passengers);
  const { selectedTrain, selectedCoachType, selectedSearch, fare, distance , selectedQuota} = useSelector(store => store.trains);
  const [timeLeft, setTimeLeft] = useState(600);
  const pricePerSeat = fare;
  const totalPassengers = selectedPassengers.length;
  const totalFare = pricePerSeat * totalPassengers;

  const handleExpireBooking = () => {
    alert("Booking session expired!");
    router.push("/auth/trains"); // Redirect to booking page or homepage
  };

  useEffect(() => {
    const timer = setInterval(() => {
      console.log("Timer tick:", timeLeft);
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);

          // 🔥 टाइम खत्म → action
          handleExpireBooking();

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // cleanup
  }, []);

  const stripePromise = loadStripe("pk_test_51RI5XlR8UlCNetg1dO3Ix1WwY03LS1SGxrU5SmAznW2sDCfW3B4SYpTjknU5oxe4bPVPeWRJkPn0jyinELvWIu7p00lPLBQam4");

  const handlePayment = async () => {
    try {
      localStorage.setItem("passengers", JSON.stringify(selectedPassengers));
      localStorage.setItem("trains", JSON.stringify(selectedTrain));
      localStorage.setItem("coachType", selectedCoachType);
      localStorage.setItem("selectedQuota", JSON.stringify(selectedQuota));
      localStorage.setItem("selectedSearch", JSON.stringify(selectedSearch));
      localStorage.setItem("reachingTime", JSON.stringify(distance));

      console.log("Stored in localStorage:",
        selectedPassengers,
        selectedTrain.train,
        selectedCoachType,
        selectedSearch,
        distance
      );

      const stripe = await stripePromise;
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment/create-checkout-session`, {
        journey : selectedTrain?.journey,
        totalAmount: totalFare,
        trainName: selectedTrain.train.trainName,
        coachType: selectedCoachType,
        passengers: selectedPassengers,
      });

      await stripe.redirectToCheckout({ sessionId: res.data.id });
    } catch (err) {
      console.error("Payment Error:", err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">

      <div className="max-w-6xl mx-auto bg-white border rounded-lg overflow-hidden">
        <div className="bg-gray-50 flex justify-between text-gray-600 px-6 py-4">

          <div className="flex items-center gap-4">
            <FaTrain className="text-2xl" />
            <div className="flex justify-center items-center gap-2">
              <h1 className="text-lg font-semibold">
                {selectedTrain.train.trainName}
              </h1>
              <p className="text-sm opacity-90">
                | {selectedTrain?.journey?.from} → {selectedTrain?.journey?.to} |  {formatDate(selectedTrain?.journey?.journeyDate)}
              </p>

            </div>
          </div>

          <div>
            <p className="text-red-500 font-bold text-sm ">
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 border-b text-sm">
          <div className="p-4 border-r">
            <p className="text-gray-500">Class</p>
            <p className="font-medium">{selectedCoachType}</p>
          </div>
          <div className="p-4 border-r">
            <p className="text-gray-500">Fare / Passenger</p>
            <p className="font-medium">₹{fare}</p>
          </div>
          <div className="p-4 border-r">
            <p className="text-gray-500">Passengers</p>
            <p className="font-medium">{totalPassengers}</p>
          </div>
          <div className="p-4">
            <p className="text-gray-500">Distance</p>
            <p className="font-medium">{selectedTrain?.journey?.duration}</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <h2 className="text-base font-semibold mb-3">
            Passenger Details
          </h2>

          <div className="divide-y border rounded">
            {selectedPassengers.map((p, i) => (
              <div
                key={i}
                className="grid grid-cols-2 md:grid-cols-6 gap-3 px-4 py-3 text-sm items-center"
              >
                <div className="md:col-span-2 font-medium text-gray-800">
                  {p.name} , {p.age} yrs , {p.gender}, {p.contactDetails} , {p.berthPreference} 
                </div>


              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-4">
          <div className="bg-yellow-50 border border-yellow-300 text-xs p-3 rounded">
            <div className="flex items-center gap-2 mb-2 font-semibold text-amber-800">
              <FaInfoCircle />
              Important Information
            </div>
            <ul className="list-disc ml-4 space-y-1">
              <li>
                Passenger details once submitted <strong>cannot be modified</strong>.
              </li>
              <li>Berth allocation is subject to availability.</li>
              <li>Senior citizens may get lower berth preference.</li>
              <li>Carry original ID proof during travel.</li>
              <li>
                In case of RAC / Waitlisted tickets, <strong>boarding is subject to availability</strong>.
              </li>
              <li>
                Refund rules are applicable as per <strong>IRCTC cancellation policy</strong>.
              </li>
            </ul>
          </div>
        </div>



        <div className="bg-slate-50 rounded-md p-4 text-xs text-gray-600 leading-relaxed">
          <strong>Cancellation Policy : </strong>
          Cancellation charges and refund amount will be calculated as per IRCTC
          rules applicable at the time of cancellation. Convenience fee is
          non-refundable.
        </div>




        <div className="px-6 py-5 border-t bg-slate-50">

          <div className="flex justify-between items-center">


            <div>
              <p className="text-sm text-gray-600">Total Fare</p>
              <p className="text-xl font-semibold text-gray-900">
                ₹{totalFare}
              </p>
            </div>



            <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
              <FaLock />
              Payments are processed through secure and encrypted gateways.
            </div>
            <div className="flex flex-col items-end gap-1">

              <button
                onClick={handlePayment}
                className="bg-green-600 hover:bg-[#e56f25] text-white px-3 py-2 rounded font-semibold"
              >
                Proceed to Payment
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

/* Small reusable info card */
function InfoCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm">
      {icon}
      <div>
        <p className="text-xs uppercase text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
