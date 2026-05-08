'use client';
import { setAdmin } from "@/redux/adminSlice";
import axios from "axios";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTrain, FaPlus, FaList, FaUsers, FaCog, FaTicketAlt, FaBars } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  FaSearch,  FaDatabase } from 'react-icons/fa';


export default function AdminSidebar({ isOpen, onToggle }) {
  const AdminName = useSelector(store => store.admin.AdminName || null);
  const dispatch = useDispatch();
  const pathname = usePathname(); // For active route highlighting
  const adminName = AdminName; // From your auth context
  const adminInitials = 'A'; // Derived from admin name
  const menuItems = [
    { name: "Dashboard", icon: <FaTrain />, path: "/admin/dashboard" },
    { name: "Add Train", icon: <FaPlus />, path: "/admin/dashboard/add-train" },
    { name: "View Trains", icon: <FaList />, path: "/admin/dashboard/all-trains" },
    { name: "Bookings", icon: <FaTicketAlt />, path: "/admin/dashboard/all-bookings" },
    { name: "Users", icon: <FaUsers />, path: "/admin/dashboard/all-users" },


  ];

  const logoutHandler = async () => {
    try {
      if (!confirm('Are you sure you want to logout ?')) return;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/logout`, {
        withCredentials: true,
      });

      if (response && response.data && response.data.success) {
        dispatch(setAdmin(false));
        toast.message(`Admin Logged Out Successfully`)

      } else {
        console.warn('Unexpected logout response:', response);
      }
    } catch (error) {
      console.error('Logout failed:', error.response?.data?.message || error.message);
    }
  };

  return (
    <aside
      className={`${isOpen ? "w-72" : "w-20"} fixed left-0 top-0 h-screen
    bg-gradient-to-b from-blue-900 to-blue-950 text-white
    transition-all duration-300 z-40 shadow-2xl overflow-hidden`}
    >
      {/* Decorative Accent Line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-yellow-600"></div>

      {/* Header Section with Logo */}
      <div className="relative flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Admin Avatar/Logo */}
          <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform duration-300`}>
            <span className="text-blue-900 font-bold text-xl">A</span>
          </div>

          {/* Title with animation */}
          <div className={`transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
            <h1 className="text-lg font-bold leading-tight">Admin Panel</h1>
            <p className="text-xs text-blue-300/80">v2.1.0 • IRCTC</p>
          </div>
        </div>

        {/* Toggle Button with improved design */}
        <button
          onClick={onToggle}
          className={`p-2.5 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-200 group ${!isOpen && 'mx-auto'
            }`}
          aria-label="Toggle sidebar"
        >
          <FaBars size={20} className={`${!isOpen ? 'rotate-180' : ''} transition-transform duration-300 group-hover:scale-110`} />
        </button>
      </div>

      {/* User Profile Section (Collapsible) */}
      <div className={`px-4 py-4 border-b border-white/10 ${!isOpen && 'flex justify-center'}`}>
        <div className={`flex items-center ${!isOpen ? 'flex-col' : 'gap-3'}`}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {adminInitials || 'AD'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-blue-900"></div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p className="font-semibold truncate">{adminName || 'Admin User'}</p>
                <p className="text-xs text-blue-300/80 truncate">Super Administrator</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Bar - Collapsible */}
      <div className={`px-4 py-3 ${!isOpen && 'flex justify-center'}`}>
        {isOpen ? (
          <div className="relative group">
            <input
              type="text"
              placeholder="Search menu..."
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 group-focus-within:text-yellow-400 transition-colors" size={14} />
          </div>
        ) : (
          <button className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            <FaSearch size={16} className="text-white/70" />
          </button>
        )}
      </div>

      {/* Main Menu with Categories */}
      <nav className="mt-2 px-3 overflow-y-auto max-h-[calc(100vh-300px)] scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Primary Menu Items */}
        <div className="space-y-1">
          <p className={`text-xs font-semibold text-blue-300/70 uppercase tracking-wider px-3 mb-2 ${!isOpen && 'text-center'}`}>
            {isOpen ? 'Main' : '•••'}
          </p>
          {menuItems.slice(0, 4).map((item, index) => (
            <Link
              key={item.path}
              href={item.path}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 ${pathname === item.path ? 'bg-white/15 text-yellow-400' : 'text-white/80 hover:text-white'
                }`}
            >
              <span className={`text-xl shrink-0 transition-transform duration-200 group-hover:scale-110 ${pathname === item.path ? 'text-yellow-400' : ''
                }`}>
                {item.icon}
              </span>
              {isOpen && (
                <span className="truncate font-medium text-sm">{item.name}</span>
              )}

              {/* Active Indicator */}
              {pathname === item.path && isOpen && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 bg-yellow-400 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-white/10"></div>

        {/* Secondary Menu Items */}
        <div className="space-y-1">
          <p className={`text-xs font-semibold text-blue-300/70 uppercase tracking-wider px-3 mb-2 ${!isOpen && 'text-center'}`}>
            {isOpen ? 'Management' : '•••'}
          </p>
          {menuItems.slice(4).map((item, index) => (
            <Link
              key={item.path}
              href={item.path}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 ${pathname === item.path ? 'bg-white/15 text-yellow-400' : 'text-white/80 hover:text-white'
                }`}
            >
              <span className={`text-xl shrink-0 transition-transform duration-200 group-hover:scale-110 ${pathname === item.path ? 'text-yellow-400' : ''
                }`}>
                {item.icon}
              </span>
              {isOpen && (
                <span className="truncate font-medium text-sm">{item.name}</span>
              )}

              {/* Badge for notifications */}
              {item.badge && isOpen && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-white/10"></div>

        {/* System Menu */}
        <div className="space-y-1 pb-4">
          <p className={`text-xs font-semibold text-blue-300/70 uppercase tracking-wider px-3 mb-2 ${!isOpen && 'text-center'}`}>
            {isOpen ? 'System' : '•••'}
          </p>

          {/* Settings */}
          <Link
            href="/admin/settings"
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
          >
            <FaCog className="text-xl shrink-0 group-hover:rotate-90 transition-transform duration-500" />
            {isOpen && <span className="truncate font-medium text-sm">Settings</span>}
          </Link>

          {/* Logout Button with improved styling */}
          <button
            onClick={logoutHandler}
            className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/20 transition-all duration-200 text-white/80 hover:text-red-400"
          >
            <LogOut className="text-xl shrink-0 group-hover:translate-x-1 transition-transform" />
            {isOpen && (
              <span className="truncate font-medium text-sm">Logout</span>
            )}
          </button>
        </div>
      </nav>

      {/* System Status Footer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-blue-950/80 backdrop-blur-sm border-t border-white/10"
          >
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300/80">System Online</span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <div className="flex items-center gap-1">
                <FaDatabase className="text-blue-300/60" size={12} />
                <span className="text-blue-300/80">98%</span>
              </div>
            </div>

            {/* Storage Bar */}
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Mode Tooltips */}
      {!isOpen && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none whitespace-nowrap">
          {/* Tooltips will appear on hover - implemented via CSS */}
        </div>
      )}
    </aside>
  );
}
