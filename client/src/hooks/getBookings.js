
import { setBookings } from "@/redux/bookingSlice";
import { setUsers } from "@/redux/userSlice";
import axios from "axios"
import { useEffect } from "react"


import { useDispatch } from 'react-redux';


const useFetchAllBookings = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/booking/get-Bookigs` , {
     withCredentials : true});
        if (res.data && res.data.allBookings) {
            console.log(res.data.allBookigs);
          dispatch(setBookings(res.data.allBookings));
        }
      } catch (error) {
        console.error("Error fetching Users:", error);
      }
    };

    fetchBookings();
  }, [dispatch]);
};

export default useFetchAllBookings;


