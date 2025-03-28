import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from 'antd';
import { FaUser, FaEllipsisV } from 'react-icons/fa';

const GroupList = ({ groups = [], selectedGroupId, onGroupSelect }) => {
  const [clickedGroupId, setClickedGroupId] = useState(null);

  const handleGroupClick = (group) => {
    setClickedGroupId(group.id);
    onGroupSelect(group.id);
  };

  if (!groups.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
        <div className="text-6xl mb-4 bg-violet-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          👥
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">
          No groups yet
        </h3>
        <p className="text-gray-600 text-center">
          Create or join a group to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {groups.map((group, index) => (
        <motion.div
          key={group.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: index * 0.05
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGroupClick(group)}
          className={`flex items-center space-x-3 p-4 cursor-pointer transition-colors ${
            clickedGroupId === group.id || selectedGroupId === group.id
              ? 'bg-teal-50 rounded-lg shadow-sm' 
              : 'hover:bg-gray-50 rounded-lg'
          }`}
        >
          {/* Avatar with Online Status */}
          <div className="relative">
            <img
              src={group.avatar}
              alt={group.name}
              className="w-10 h-10 rounded-full ring-2 ring-violet-500 ring-offset-2"
            />
            {group.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white" />
            )}
          </div>

          {/* Group Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {group.name}
              </h3>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {new Date(group.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate mt-1">
              {group.lastMessage}
            </p>
          </div>

          {/* Unread Badge */}
          {group.unread > 0 && (
            <div className="w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs">
              {group.unread}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default GroupList; 