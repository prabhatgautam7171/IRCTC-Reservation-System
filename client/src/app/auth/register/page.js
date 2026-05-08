'use client'
import { useState } from "react";
import Link from "next/link";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({
    userName: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/register', form, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (res.data.success) {
        console.log(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
      
      {/* Left Side - Train Image */}
      <div className=" p-55 hidden md:block relative h-full">
        <img
          src="https://trendlyne-media-mumbai-new.s3.amazonaws.com/profilepicture/167028_profilepicture.png"
          alt="Train"
          className="w-60 h-60 object-cover "
        />

        <h1 className="text-white text-5xl font-bold ml-12 mt-5">IRCTC</h1>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center h-full p-6 relative">
        {/* Decorative gradient circles */}
        <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-3xl"></div>

        <div className="relative z-10 bg-white/20 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md border border-white/30">
          <h2 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-200 via-white to-blue-200 text-transparent bg-clip-text">
            Create Your IRCTC Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              name="userName"
              type="text"
              placeholder="Username"
              value={form.userName}
              onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
              required
              className="w-full border border-white/40 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
              required
              className="w-full border border-white/40 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
              required
              className="w-full border border-white/40 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.03] shadow-lg"
            >
              Register
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-200">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-300 hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
