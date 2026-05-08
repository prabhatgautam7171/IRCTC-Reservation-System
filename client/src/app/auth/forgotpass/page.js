'use client'

import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaArrowLeft, FaShieldAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { MdEmail, MdInfo, MdMarkEmailRead } from 'react-icons/md';
import { BiSupport } from 'react-icons/bi';


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/forgotPassword`, { email });
      setStatus(res.data.message);
      toast.message('OTP sent to your email.')
      router.push('/auth/verifyauth');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Something went wrong');
   
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
  {/* Background Pattern */}
  <div className="fixed inset-0 opacity-5">
    <div className="absolute inset-0" style={{
      backgroundImage: `radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)`,
      backgroundSize: '40px 40px'
    }}></div>
  </div>

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="relative w-full max-w-md"
  >
    {/* Back Button */}
    <Link
      href="/auth/login"
      className="absolute -top-12 left-0 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
    >
      <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm">Back to Login</span>
    </Link>

    {/* Main Card */}
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full"></div>

        {/* Icon */}
        <div className="inline-flex p-4 bg-white/20 rounded-full backdrop-blur-sm mb-4 relative z-10">
          <MdMarkEmailRead className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Forgot Password?</h1>
        <p className="text-white/90 text-sm relative z-10">
          No worries! Enter your email and we'll send you reset instructions.
        </p>
      </div>

      {/* Form Section */}
      <div className="p-8">
        {/* Status Messages */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
            >
              <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-700">{status}</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
            >
              <FaExclamationTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Sent State */}
        {emailSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Check Your Email</h3>
            <p className="text-gray-600 text-sm mb-4">
              We've sent password reset instructions to:
              <br />
              <span className="font-medium text-blue-600">{email}</span>
            </p>
            <p className="text-xs text-gray-500 mb-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Try with different email
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <MdEmail className="text-blue-500" />
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all group-hover:border-gray-400"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MdInfo className="w-3 h-3" />
                We'll send a password reset link to this email
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <FaShieldAlt className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Secure Password Reset</h4>
                  <p className="text-xs text-blue-600/80">
                    The reset link will expire in 30 minutes for security reasons.
                    If you didn't request this, please ignore this email.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                </>
              )}
            </button>

            {/* Help Link */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Having trouble?{' '}
                <button
                  type="button"
                  onClick={() => window.location.href = '/auth/support'}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Contact Support
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Alternative Options */}
        {!emailSent && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4 text-sm">
              <Link href="/auth/login" className="text-gray-500 hover:text-gray-700 transition-colors">
                Remember password? Sign in
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
                Create account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Support Footer */}
    <div className="mt-6 text-center">
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <BiSupport className="w-4 h-4" />
          <span>24/7 Support: 1800-123-4567</span>
        </div>
        <span>•</span>
        <Link href="/privacy" className="hover:text-gray-700 transition-colors">
          Privacy Policy
        </Link>
        <span>•</span>
        <Link href="/terms" className="hover:text-gray-700 transition-colors">
          Terms
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        © 2024 Indian Railways. All rights reserved.
      </p>
    </div>
  </motion.div>
</div>
  );
};

export default ForgotPassword;
