'use client'
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const OTPPage = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (element, index) => {
    const newOtp = [...otp];
    newOtp[index] = element.value.replace(/[^0-9]/g, "");
    setOtp(newOtp);

    // Move to next input automatically
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalOTP = otp.join("");
    try {
      const res = await axios.post("http://localhost:8000/api/v1/user/verifyAuth", { token: finalOTP });
      setMessage(res.data.message);
      router.push('/auth/resetpass');
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">Enter OTP</h2>
        <p className="text-gray-600 text-center mb-4">We've sent a 6-digit code to your email.</p>

        <div className="flex justify-between mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              className="w-12 h-12 text-center border rounded-md text-xl focus:outline-none focus:ring focus:border-blue-500"
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
        
          Verify OTP
       
        </button>

        {message && <p className="text-center mt-4 text-green-600">{message}</p>}
      </form>
    </div>
  );
};

export default OTPPage;
