'use client';
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser } from "../../../redux/userSlice";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaHeadset, FaLock, FaShieldAlt, FaTrain } from "react-icons/fa";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MdEmail, MdInfo } from "react-icons/md";
import { GoogleLogin } from "@react-oauth/google";
import { Facebook, Github, GithubIcon } from "lucide-react";


const Login = () => {
  const [form, setForm] = useState({ email: "prabhatgautam347@gmail.com", password: "prabhat@irctc706" });
  const [showPassword, setShowPassword] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/login`,
        form,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.message(`Welcome back ${res.data?.user?.userName}`)
        console.log(res.data.user);
        console.log('auth token :',res.data.token);
        dispatch(setAuthUser(res.data.user));
        localStorage.setItem("token", res.data.token);
        router.push("/");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        console.error("Unexpected error:", error);
        alert("Something went wrong. Please try again.");
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/google/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      console.log("Backend response:", data);

      // Save JWT
      localStorage.setItem("token", data.token);

      // Redirect
      window.location.href = "/";

    } catch (err) {
      console.log("Error:", err);
    }
  };




  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Cinematic Background with Parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center transform scale-105 animate-slowZoom"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1604328748693-92948c6f57b5?auto=format&fit=crop&w=1920&q=80')",
        }}
      ></div>

      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-blue-900/90 to-indigo-950/95 backdrop-blur-[2px]"></div>

      {/* Animated Particles Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>

      {/* Glowing Floating Card with Enhanced Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >


        {/* Main Card */}
        <div className="relative rounded-2xl bg-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">

          {/* Card Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent"></div>

          {/* Content */}
          <div className="relative p-8">
            {/* Branding with Official Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-4 mb-3">

                <div>
                  <h1 className="text-3xl font-extrabold text-white  drop-shadow-lg">
                    GlideGo
                  </h1>
                  <p className="text-blue-200 text-xs mt-1">IRCTC • Official Partner</p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex gap-3 mt-2">
                <span className="px-2 py-1 bg-white/10 rounded-full text-[10px] text-white/80 flex items-center gap-1">
                  <FaShieldAlt className="text-yellow-400" /> SSL Secure
                </span>
                <span className="px-2 py-1 bg-white/10 rounded-full text-[10px] text-white/80">
                  ⚡ Instant Booking
                </span>
              </div>

              <p className="text-gray-200 text-sm mt-4 italic border-l-2 border-yellow-400 pl-3">
                "India's Premier Railway Booking Platform"
              </p>
            </div>

            {/* Form with Enhanced Fields */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field with Icon */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-1.5 flex items-center gap-1">
                  <MdEmail className="text-yellow-400" /> Email Address
                </label>
                <div className="relative group">
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/30 text-white rounded-lg pl-4 pr-4 py-3 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all group-hover:bg-white/15"
                  />
                </div>
              </div>

              {/* Password Field with Icon and Forgot Link */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-white/90 text-sm font-medium flex items-center gap-1">
                    <FaLock className="text-yellow-400" /> Password
                  </label>
                  <Link
                    href="/auth/forgotpass"
                    className="text-yellow-300 hover:text-yellow-400 text-xs hover:underline transition-all"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/30 text-white rounded-lg pl-4 pr-12 py-3 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all group-hover:bg-white/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Password Hint */}
                <p className="text-white/40 text-[10px] mt-1 flex items-center gap-1">
                  <MdInfo /> Use 8+ characters with mix of letters & numbers
                </p>
              </div>

              {/* Captcha Field - New */}
              {/* <div>
              <label className="block text-white/90 text-sm font-medium mb-1.5 flex items-center gap-1">
                <BiCaptcha className="text-yellow-400" /> Security Check
              </label>
              <div className="flex gap-2">
                <input
                  name="captcha"
                  type="text"
                  placeholder="Enter code"
                  value={form.captcha}
                  onChange={handleChange}
                  required
                  className="flex-1 bg-white/10 border border-white/30 text-white rounded-lg px-4 py-3 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <div className="w-24 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg flex items-center justify-center font-mono text-xl text-yellow-400 tracking-wider select-none border border-white/20">
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="px-3 bg-white/10 rounded-lg hover:bg-white/20 text-white transition border border-white/30"
                >
                  ↻
                </button>
              </div>
            </div> */}



              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-blue-900 py-3.5 rounded-lg font-bold text-lg shadow-lg hover:from-yellow-600 hover:to-yellow-700 transform hover:scale-[1.02] hover:shadow-yellow-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                Login to IRCTC Account
              </button>

              


            </form>

            {/* Registration Link */}
            <p className="text-center mt-6 text-sm text-white/70">
              New to Indian Railways?{' '}
              <Link
                href="/auth/register"
                className="text-yellow-300 font-medium hover:text-yellow-400 hover:underline transition"
              >
                Create free account
              </Link>
            </p>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-blue-900/30 rounded-lg border border-blue-400/30">
              <div className="flex items-start gap-2">
                <MdInfo className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-200">
                  This is a secure government website. Never share your password or OTP with anyone.
                  For security, always log out after your session.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-4 flex justify-center gap-4 text-white/50 text-xs">
          <div className="flex items-center gap-1">
            <FaHeadset className="text-yellow-400" />
            <span>Railway Enquiry: 139</span>
          </div>
          <span>|</span>
          <div className="flex items-center gap-1">
            <span>IRCTC Helpline: 1800-123-4567</span>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Glow Effects */}
      <div className="absolute w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl -top-32 -left-32 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-32 -right-32 animate-pulse delay-1000"></div>

      {/* Footer Links */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/30 text-xs flex gap-4">
        <Link href="/terms" className="hover:text-white/50 transition">Terms</Link>
        <Link href="/privacy" className="hover:text-white/50 transition">Privacy</Link>
        <Link href="/security" className="hover:text-white/50 transition">Security</Link>
      </div>
    </div>
  );
};

export default Login;
