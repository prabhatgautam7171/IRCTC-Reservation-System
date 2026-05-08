
import axios from "axios"
import { useEffect } from "react"


import { useDispatch } from 'react-redux';
import { setTrains } from '@/redux/trainSlice';

const useFetchTrains = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/train/get-Alltrains` , {
        withCredentials : true});
        if (res.data && res.data.allTrains) {
          dispatch(setTrains(res.data.allTrains));
        }
      } catch (error) {
        console.error("Error fetching trains:", error);
      }
    };

    fetchTrains();
  }, [dispatch]);
};

export default useFetchTrains;
