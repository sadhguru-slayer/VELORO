import React from 'react';
import { motion } from 'framer-motion';
import { FaBars, FaChartLine, FaEllipsisV, FaShieldAlt } from 'react-icons/fa';

export const ChatHeader = ({ 
  chat:group, 
  onMenuClick, 
  onInfoClick, 
  tier = 'starter', 
  onToggleProgressPanel,
  isMobile
}) => {
  const getTierBadge = () => {
    switch (tier) {
      case 'starter':
        return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Starter</span>;
      // Add cases for other tiers
      default:
        return null;
    }
  };

  return (
    <div className={`h-14 md:h-16 flex items-center justify-between px-2 ${isMobile ? 'px-1' : 'px-4'} border-b border-gray-200 bg-white sticky top-0`}>
      <div className="flex items-center space-x-2">
        <motion.button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaBars className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />
        </motion.button>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <img
              src={group?.avatar}
              alt={group?.name}
              className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full`}
            />
            <FaShieldAlt className={`absolute -bottom-1 -right-1 text-teal-500 bg-white rounded-full ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
          </div>
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-semibold text-gray-900 truncate`}>
              {group?.name}
            </h2>
            <div className="flex items-center space-x-1">
              <p className={`${isMobile ? 'text-xxs' : 'text-xs'} text-gray-500`}>
                {group?.totalMembers} members • {group?.membersOnline} online
              </p>
              {getTierBadge()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={onToggleProgressPanel}
          className="p-1 hover:bg-gray-100 rounded-lg"
          title="Project Progress"
        >
          <FaChartLine className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />
        </button>
        <button
          onClick={onInfoClick}
          className="p-1 hover:bg-gray-100 rounded-lg"
        >
          <FaEllipsisV className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader; 