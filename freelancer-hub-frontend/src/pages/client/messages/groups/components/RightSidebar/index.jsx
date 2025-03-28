import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MembersList from './MembersList';
import ResourcesList from './ResourcesList';
import MeetingInfo from './MeetingInfo';
import { FaTimes, FaCalendarAlt, FaCalendarPlus, FaUserPlus } from 'react-icons/fa';
import { format } from 'date-fns';

const RightSidebar = ({ 
  isOpen, 
  group, 
  onClose, 
  upcomingMeeting,
  onAddMember,
  onScheduleMeeting,
  isMobile
}) => {
  const members = group?.members || [];
  const resources = group?.resources || [];

  return (
    <AnimatePresence>
      {isOpen && group && (
        <motion.div
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-80 fixed right-0 z-20 h-[calc(100vh-64px)] border-l border-gray-200 bg-white flex flex-col shadow-xl"
        >
          <div className="h-16 flex-shrink-0 border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{group.name}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
          
              <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={onScheduleMeeting}
                    className="p-2 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
                  >
                    <FaCalendarPlus className="w-5 h-5 text-gray-500" />
                    <span>Schedule Meeting</span>
                  </button>
                  <button 
                    onClick={onAddMember}
                    className="p-2 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
                   
                  >
                    <FaUserPlus className="w-5 h-5 text-gray-500" />
                    <span>Add Member</span>
                  </button>
                </div>
              </div>
            

            {upcomingMeeting && (
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold mb-3 flex items-center space-x-2">
                  <FaCalendarAlt className="w-4 h-4 text-teal-500" />
                  <span>Upcoming Meeting</span>
                </h3>
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg">
                  <h4 className="font-medium">{upcomingMeeting.title}</h4>
                  <p className="text-sm mt-1">
                    {format(new Date(upcomingMeeting.dateTime), 'MMM d, yyyy h:mm a')}
                  </p>
                  {upcomingMeeting.description && (
                    <p className="text-sm mt-2">{upcomingMeeting.description}</p>
                  )}
                </div>
              </div>
            )}
            <MembersList members={members} />
            <ResourcesList resources={resources} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RightSidebar; 