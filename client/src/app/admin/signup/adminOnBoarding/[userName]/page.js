'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminOnboarding() {
  const {userName} = useParams(); // Mock admin name since useParams isn't available
  const adminName = userName;

  const features = [
    { 
      title: "Train Management System", 
      description: "Comprehensive train creation and management with advanced scheduling capabilities. Add new trains with detailed coach configurations, seat mappings, dynamic pricing, route planning, and real-time scheduling updates.",
      icon: "🚆",
      details: ["Multi-class coach configuration", "Dynamic seat allocation", "Route optimization", "Schedule management"],
      color: "from-blue-500 to-blue-700"
    },
    { 
      title: "Booking & Reservation Control", 
      description: "Advanced booking management system with real-time updates and comprehensive passenger handling. Manage reservations, waitlists, cancellations, and passenger preferences with intelligent automation.",
      icon: "📝",
      details: ["Real-time booking updates", "Waitlist management", "Cancellation processing", "Passenger preferences"],
      color: "from-green-500 to-green-700"
    },
    { 
      title: "Passenger Analytics Dashboard", 
      description: "Detailed passenger management with comprehensive analytics and reporting. Track passenger journeys, preferences, loyalty programs, and generate detailed reports for business intelligence.",
      icon: "👤",
      details: ["Journey tracking", "Loyalty program management", "Preference analysis", "Demographic insights"],
      color: "from-purple-500 to-purple-700"
    },
    { 
      title: "Advanced Analytics & Intelligence", 
      description: "Powerful analytics engine with predictive modeling and business intelligence. Generate comprehensive reports, track KPIs, analyze trends, and make data-driven decisions with AI-powered insights.",
      icon: "📊",
      details: ["Predictive analytics", "Revenue optimization", "Trend analysis", "Performance metrics"],
      color: "from-orange-500 to-orange-700"
    },
    { 
      title: "Financial Management Suite", 
      description: "Complete financial management with automated payment processing, refund handling, and comprehensive transaction monitoring. Integrated with multiple payment gateways and financial reporting systems.",
      icon: "💳",
      details: ["Multi-gateway integration", "Automated refunds", "Financial reporting", "Revenue tracking"],
      color: "from-red-500 to-red-700"
    },
    { 
      title: "Smart Notification Center", 
      description: "Intelligent notification system with multi-channel communication capabilities. Send automated alerts, manage emergency communications, and maintain passenger engagement through personalized messaging.",
      icon: "🔔",
      details: ["Multi-channel alerts", "Emergency broadcast", "Personalized messaging", "Automated notifications"],
      color: "from-indigo-500 to-indigo-700"
    },
  ];

  const [currentFeature, setCurrentFeature] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  useEffect(() => {
    if (showOverview) return;
    if (currentFeature >= features.length) {
      // Show overview after all features
      setTimeout(() => setShowOverview(true), 1000);
      return;
    }
    
    setTypedText('');
    setShowDetails(false);
    
    let i = 0;
    const text = features[currentFeature].description;
    
    // Typing animation
    const interval = setInterval(() => {
      setTypedText((prev) => prev + text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(() => setShowDetails(true), 800);
      }
    }, 50);

    // Move to next feature after showing details
    const timeout = setTimeout(() => {
      setCurrentFeature(prev => prev + 1);
    }, text.length * 50 + 4000);

    return () => { 
      clearInterval(interval); 
      clearTimeout(timeout); 
    };
  }, [currentFeature, showOverview]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      scale: 0.9,
      transition: {
        duration: 0.3
      }
    }
  };

  if (showOverview) {
    return (
      <div className="h-screen bg-gradient-to-br  from-slate-50 via-blue-50 to-indigo-100 flex flex-col font-sans">
        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900 text-white py-8 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              IRCTC Admin Portal - Overview
            </h1>
            <p className="text-blue-200 mt-1">Complete Feature Summary</p>
          </div>
        </motion.header>

        {/* Overview Content */}
        <main className="flex-1 px-6 py-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent mb-6">
              🎉 Onboarding Complete!
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              You've explored all the powerful features of the IRCTC Admin Portal. Here's a complete overview of your administrative capabilities.
            </p>
          </motion.div>

          {/* All Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`relative bg-gradient-to-br ${feature.color} p-1 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group`}
              >
                <div className="bg-white rounded-3xl p-6 h-full relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                    <div className="text-6xl">{feature.icon}</div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className={`text-4xl p-3 rounded-2xl bg-gradient-to-br ${feature.color} inline-block mb-4 shadow-lg`}>
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {feature.description}
                    </p>

                    {/* Feature Details */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-800">Key Features:</h4>
                      <div className="space-y-1">
                        {feature.details.map((detail, detailIdx) => (
                          <div
                            key={detailIdx}
                            className="flex items-center space-x-2 text-xs text-gray-600"
                          >
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color} flex-shrink-0`}></div>
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Completed Badge */}
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                      ✓
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white rounded-3xl p-8 shadow-xl mb-12"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Administrative Power</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">12,000+</div>
                <div className="text-gray-600">Trains Managed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">50M+</div>
                <div className="text-gray-600">Daily Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">7,000+</div>
                <div className="text-gray-600">Railway Stations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">24/7</div>
                <div className="text-gray-600">System Monitoring</div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="text-center"
          >
            <Link href="/admin/dashboard"> <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-3 cursor-pointer px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-2xl"
            >
              <span>Access Admin Dashboard</span>
              <span>→</span>
            </motion.button> </Link>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-gray-300">© 2025 Indian Railway Catering and Tourism Corporation Ltd.</p>
            <p className="text-sm text-gray-400 mt-1">Empowering India's Railway Network</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col font-sans overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Header */}
     

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-16">
        {/* Welcome Message */}
        {currentFeature === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 max-w-4xl"
          >
            <h2 className="text-6xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Welcome, {adminName}!
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Let's explore the powerful features of your admin portal step by step.
            </p>
          </motion.div>
        )}

        {/* Progress Indicator */}
        <div className="w-full max-w-2xl mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">Feature Progress</span>
            <span className="text-sm font-medium text-blue-600">
              {Math.min(currentFeature + 1, features.length)}/{features.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(Math.min(currentFeature + 1, features.length) / features.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg"
            />
          </div>
        </div>

        {/* Single Feature Display */}
        <AnimatePresence mode="wait">
          {currentFeature < features.length && (
            <motion.div
              key={currentFeature}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-4xl"
            >
              <motion.div
                variants={itemVariants}
                className={`relative bg-gradient-to-br ${features[currentFeature].color} p-2 rounded-3xl shadow-2xl`}
              >
                <div className="bg-white rounded-3xl p-12 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-40 h-40 opacity-5">
                    <div className="text-9xl">{features[currentFeature].icon}</div>
                  </div>
                  
                  <div className="relative z-10 text-center">
                    {/* Feature Icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className={`text-8xl p-6 rounded-3xl bg-gradient-to-br ${features[currentFeature].color} inline-block mb-8 shadow-xl`}
                    >
                      {features[currentFeature].icon}
                    </motion.div>

                    {/* Feature Title */}
                    <motion.h3
                      variants={itemVariants}
                      className="text-4xl font-bold text-gray-800 mb-6"
                    >
                      {features[currentFeature].title}
                    </motion.h3>

                    {/* Feature Description with Typing Effect */}
                    <motion.div
                      variants={itemVariants}
                      className="mb-8"
                    >
                      <p className="text-gray-600 text-xl leading-relaxed max-w-3xl mx-auto">
                        {typedText}
                        {typedText.length < features[currentFeature].description.length && (
                          <motion.span 
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="text-blue-500 ml-1"
                          >
                            |
                          </motion.span>
                        )}
                      </p>
                    </motion.div>

                    {/* Feature Details */}
                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          className="mt-8"
                        >
                          <h4 className="text-2xl font-semibold text-gray-800 mb-6">Key Capabilities</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            {features[currentFeature].details.map((detail, detailIdx) => (
                              <motion.div
                                key={detailIdx}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: detailIdx * 0.2 }}
                                className="flex items-center space-x-3 bg-gray-50 px-6 py-4 rounded-xl hover:bg-gray-100 transition-colors"
                              >
                                <motion.div 
                                  className={`w-4 h-4 rounded-full bg-gradient-to-r ${features[currentFeature].color} flex-shrink-0`}
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity, delay: detailIdx * 0.3 }}
                                />
                                <span className="text-gray-700 font-medium">{detail}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Feature Number */}
                  <div className="absolute top-6 right-6 bg-white text-gray-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    {currentFeature + 1}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading indicator between features */}
        {currentFeature >= features.length && !showOverview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-xl text-gray-600">Preparing your overview...</p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
     
    </div>
  );
}