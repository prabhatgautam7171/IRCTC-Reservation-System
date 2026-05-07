'use client'
import { XCircle, AlertCircle, RefreshCw, HelpCircle, ArrowLeft, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';


const PaymentCancelledPage = () => {
  const router = useRouter();
  // const { transactionId, amount, timestamp } = router.query;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Main Card */}
      <div className="relative max-w-2xl w-full">


        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white text-center">
            <div className="inline-flex p-4 bg-white/20 rounded-full backdrop-blur-sm mb-4">
              <XCircle className="w-16 h-16" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>

          </div>

          {/* Body */}
          <div className="p-8">
            {/* Message */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Transaction was not completed</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Your payment was cancelled before completion. No amount has been deducted from your account.
                    If you were trying to make a booking, please try again. For any assistance, our support team is here to help.
                  </p>
                </div>
              </div>
            </div>



            {/* Action Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => router.push("/booking")}
                className="group p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <RefreshCw className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800">Try Again</span>
                </div>
                <p className="text-sm text-gray-600">Return to booking page and complete your payment</p>
              </button>

              <button
                onClick={() => router.push("/support")}
                className="group p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800">Get Help</span>
                </div>
                <p className="text-sm text-gray-600">Contact our 24/7 support team for assistance</p>
              </button>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Need immediate help?</span>
                <a href="tel:18001234567" className="text-blue-600 hover:text-blue-700 font-medium">
                  Call Support
                </a>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-6 items-center text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>256-bit SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>₹0 Cancellation Fee</span>
              </div>
            </div>
          </div>
        </div>



        {/* Related Links */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 mb-3">Looking for something else?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => router.push("/faq")} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              FAQ
            </button>
            <span className="text-gray-300">•</span>
            <button onClick={() => router.push("/refund-policy")} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Refund Policy
            </button>
            <span className="text-gray-300">•</span>
            <button onClick={() => router.push("/contact")} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Contact Us
            </button>
            <span className="text-gray-300">•</span>
            <button onClick={() => router.push("/terms")} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Terms of Service
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-400 mt-5">
          © 2024 Your Company Name. All rights reserved. | Version 2.1.0
        </p>
      </div>
    </div>
  );
};

export default PaymentCancelledPage;
