
import axios from "axios"
import { useEffect } from "react"


import { useDispatch } from 'react-redux';

import { setBookings } from "@/redux/bookingSlice";

const useFetchBookings = () => {
  const dispatch = useDispatch();
  

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // const token = localStorage.getItem("token"); 
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/booking/getAllBookings`, {
            withCredentials : true
        });
        if (res.data.success) {
         console.log(res.data.bookings);
          dispatch(setBookings(res.data.bookings));
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [dispatch]);
};

export default useFetchBookings;
