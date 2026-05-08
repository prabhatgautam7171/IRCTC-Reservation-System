'use client'
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

const ResetPassword = () => {
  const { token } = useParams();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/resetPassword`, { newPassword, confirmPassword });
      setStatus(res.data.message);
      if(res.data.success){
        toast.message(res.data.message);
      }
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleReset}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-xl text-green-600 mb-4 text-center">Reset a new secure password.</h2>
        <label className="block mb-2 text-gray-700">New Password</label>
        <input
          type="password"
          className="w-full border border-gray-300 p-2 rounded mb-4 focus:outline-none focus:ring focus:border-blue-400"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <label className="block mb-2 text-gray-700">Confirm Password</label>
         <input
          type="password"
          className="w-full border border-gray-300 p-2 rounded mb-4 focus:outline-none focus:ring focus:border-blue-400"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Reset Password
        </button>
        {status && <p className="mt-4 text-sm text-green-600 text-center">{status}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
