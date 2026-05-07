'use client';
import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { setAdmin, setAdminName } from '@/redux/adminSlice';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';

export default function AdminSignupPage() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSignup = async () => {
    setError('');
    setSuccess('');
    if (!userName || !email || !password || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!isAdmin) {
      setError('Please confirm you are an admin');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/v1/user/register', { userName, email, password ,isAdmin});
      if (res.data.success){
       alert(res.data.message);
       toast.message(`Welcome to IRCTC ${res.data?.user?.userName}`)
        setSuccess('Admin account created successfully!');
        dispatch(setAdmin(true));
        dispatch(setAdminName(res.data.user.userName));
        router.push(`/admin/signup/adminOnBoarding/${userName}`);
      }
      else setError(res.data.message || 'Signup failed');
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 flex flex-col font-sans">
      {/* Header */}
      <header className="text-white  py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-wide">IRCTC Admin Panel</h1>
          <nav className="space-x-6 text-lg font-medium">
            <a href="/" className="hover:underline">Home</a>
            <a href="/login" className="hover:underline">Login</a>
          </nav>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-5xl flex flex-col md:flex-row rounded-xl overflow-hidden shadow-2xl"
        >
          {/* Left Info Panel */}
          <div className="md:w-1/2 bg-gradient-to-br from-blue-800 to-blue-600 text-white flex flex-col justify-center p-16 relative">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-extrabold mb-6"
            >
              Welcome Admin!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg opacity-90 leading-relaxed"
            >
              Manage your IRCTC platform efficiently. Create an admin account and get full control over trains, bookings, and users.
            </motion.p>
            <div className="absolute bottom-6 right-6 opacity-20">
              <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M3 10h18M3 3h18"></path>
              </svg>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="md:w-1/2 bg-white flex flex-col justify-center p-12 space-y-5">
            <h3 className="text-3xl font-semibold text-gray-700">Admin Signup</h3>

            {error && <p className="text-red-500 font-medium">{error}</p>}
            {success && <p className="text-green-600 font-medium">{success}</p>}

            <motion.input
              type="text"
              placeholder="User Name"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              whileFocus={{ scale: 1.02 }}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
            />
            <motion.input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              whileFocus={{ scale: 1.02 }}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
            />
            <motion.input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              whileFocus={{ scale: 1.02 }}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
            />
            <motion.input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              whileFocus={{ scale: 1.02 }}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
            />

            <label className="flex items-center space-x-3 mt-2 font-medium">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={e => setIsAdmin(e.target.checked)}
                className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span>I am an Admin</span>
            </label>

            <motion.button
              onClick={handleSignup}
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full p-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-lg transition"
            >
              {loading ? 'Signing up...' : 'Signup'}
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-600 py-6 text-center text-sm">
        &copy; 2025 IRCTC. All rights reserved.
      </footer>
    </div>
  );
}
