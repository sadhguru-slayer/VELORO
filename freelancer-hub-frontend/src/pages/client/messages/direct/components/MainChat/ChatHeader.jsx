import React from 'react';
import { motion } from 'framer-motion';
import { FaBars, FaEllipsisV } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';
const ChatHeader = ({ chat, onMenuClick, onInfoClick, isMobile }) => {
  return (
    <div className="p-4 h-16 flex items-center w-full border-b border-gray-100 bg-white rounded-t-xl">
      <div className="flex items-center justify-between w-full p-2">
        <div className="flex items-center space-x-4">
          {isMobile && (
            <motion.button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBars className="w-5 h-5 text-gray-500" />
            </motion.button>
          )}

          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-10 h-10 rounded-full ring-2 ring-violet-500 ring-offset-2"
              />
              {chat.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {chat.name}
              </h2>
              <p className="text-sm text-gray-500 flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${chat.online ? 'bg-teal-500' : 'bg-gray-400'}`} />
                <span>{chat.online ? 'Online' : 'Offline'}</span>
              </p>
            </div>
          </div>
        </div>

        <motion.button
          onClick={onInfoClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaEllipsisV className="w-5 h-5 text-gray-500" />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatHeader; 