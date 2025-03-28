import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import ProfileInfo from './ProfileInfo';
import SharedFiles from './SharedFiles';

const RightSidebar = ({ isOpen, chat, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-80 fixed right-0 top-16 z-20 h-[calc(100vh-64px)] border-l border-gray-200 bg-white flex flex-col shadow-lg"
        >
          {/* Header */}
          <div className="h-16 flex-shrink-0 border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="flex items-center justify-between p-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="bg-teal-500 w-2 h-2 rounded-full mr-2"></span>
                Chat Details
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <ProfileInfo chat={chat} />
            <SharedFiles chat={chat} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RightSidebar; 