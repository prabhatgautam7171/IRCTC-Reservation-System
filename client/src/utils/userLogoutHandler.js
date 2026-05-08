// utils/logout.js
import { setAuthUser } from "@/redux/userSlice";
import axios from "axios";
import { toast } from "sonner";



export const logoutUser = async ( {dispatch, router} ) => {
  console.log("dispatch received:", dispatch);
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/logout`,
      { withCredentials: true }
    );

    if (response?.data?.success) {
      toast.success("Logged Out Successfully");

      // clear state
      dispatch(setAuthUser(null));

      // clear storage
      localStorage.removeItem("token");

      // redirect
      router.push("/");
    } else {
      console.warn("Unexpected logout response:", response);
    }
  } catch (error) {
    console.error(
      "Logout failed:",
      error.response?.data?.message || error.message
    );

    // even if API fails → force logout locally (important!)
    dispatch(setAuthUser(null));
    localStorage.removeItem("token");
    // redirect
      router.push("/");
  }
};
