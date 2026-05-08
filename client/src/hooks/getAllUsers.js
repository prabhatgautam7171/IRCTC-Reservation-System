
import { setUsers } from "@/redux/userSlice";
import axios from "axios"
import { useEffect } from "react"


import { useDispatch } from 'react-redux';


const useFetchUsers = (isAdmin, loading) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (loading || !isAdmin) return; // ✅ wait until admin verified

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/get-AllUsers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(setUsers(res.data.allUsers));
      } catch (error) {
        console.error("Error fetching Users:", error);
      }
    };

    fetchUsers();
  }, [dispatch, isAdmin, loading]);
};


export default useFetchUsers;


