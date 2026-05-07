'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { setAdmin, setAdminName } from '@/redux/adminSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';


export default function AdminLoginPage() {
  const [email, setEmail] = useState('yuvrajgautam030@gmail.com');
  const [password, setPassword] = useState('prabhat@irctc706');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/v1/user/admin-login' ,  {

        email,
        password,
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.data.success) {
        // Redirect to Dashboard or Onboarding
        if (res.data.isAdmin) {
          toast.message(`Welcome back ${res.data?.user?.userName}`)
          dispatch(setAdmin(true));
          dispatch(setAdminName(res.data.user.userName));
          router.push(`/admin/dashboard`);

        } else {
          router.push('/');
        }
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 flex items-center justify-center px-6 py-12 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl flex flex-col md:flex-row rounded-xl overflow-hidden shadow-2xl bg-white"
      >
        {/* Left Info Panel */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-800 to-blue-600 text-white flex flex-col justify-center p-16 relative">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-extrabold mb-6"
          >
            Welcome Back!
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg opacity-90 leading-relaxed"
          >
            Access your admin panel to manage trains, bookings, and users.
          </motion.p>
        </div>

        {/* Right Form Panel */}
        <div className="md:w-1/2 flex flex-col justify-center p-12 space-y-5">
          <h3 className="text-3xl font-semibold text-gray-700">Admin Login</h3>

          {error && <p className="text-red-500 font-medium">{error}</p>}

          <motion.input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            whileFocus={{ scale: 1.02 }}
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          />
          <motion.input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            whileFocus={{ scale: 1.02 }}
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          />

          <motion.button
            onClick={handleLogin}
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full p-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-lg transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>

          <p className="text-sm text-gray-500 text-center">
            Don't have an account?{' '}
            <a href="/admin/signup" className="text-blue-600 font-medium hover:underline">
              Signup
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
