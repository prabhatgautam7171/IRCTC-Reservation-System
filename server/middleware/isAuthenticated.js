import jwt from "jsonwebtoken";
import { User } from "../model/authModel/userModel.js";
import dotenv from 'dotenv'

dotenv.config({});



export const isAuthenticated = async (req, res, next) => {
  try {
    // const authHeader = req.headers.authorization;

    // console.log("🔐 AUTH HEADER:", authHeader); // ✅ log this

    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return res.status(401).json({ success: false, message: "No token provided" });
    // }

    let token = req.cookies.token;

    // ✅ also allow Authorization header (for testing tools)
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log("📦 Extracted Token:", token); // ✅ log this too

    if (!token) {
      return res.status(401).json({
        message: "token not found"
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ❗ will throw error if malformed
    console.log("🧾 Decoded token:", decoded);
    const user = await User.findById(decoded?._id);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token: user not found" });
    }

    req.id = user._id;
    next();

  } catch (error) {
    console.error("❌ JWT Error:", error.message);
    res.status(401).json({ success: false, message: "Unauthorized: invalid token" });
  }
};
