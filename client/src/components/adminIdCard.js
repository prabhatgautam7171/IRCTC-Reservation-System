'use client';
import { motion } from 'framer-motion';

const AdminIDCard = () => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-80 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">IRCTC Admin</h2>
        <div className="bg-white text-blue-700 px-3 py-1 text-xs font-bold rounded-full">
          DIGITAL ID
        </div>
      </div>

      {/* Photo + Basic Info */}
      <div className="flex items-center mb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white mr-4">
          {/* {admin.photoUrl ? (
            <img src={admin.photoUrl} alt="Admin" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-blue-700 font-bold text-2xl">
              {admin.name?.charAt(0) || 'A'}
            </div>
          )} */}
        </div>
        <div>
          <p className="font-bold text-lg"></p>
          <p className="text-sm opacity-90">ID: </p>
          <p className="text-sm opacity-90"></p>
        </div>
      </div>

      {/* Address */}
      <div className="mb-4">
        <p className="text-sm font-semibold mb-1">Address:</p>
        <p className="text-xs opacity-90"></p>
      </div>

      {/* Footer / QR */}
      <div className="flex justify-end">
        <div className="bg-white text-blue-700 w-16 h-16 rounded-lg flex items-center justify-center font-bold shadow-lg">
          QR
        </div>
      </div>
    </motion.div>
  );
};

export default AdminIDCard;
