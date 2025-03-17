import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useOutletContext } from 'react-router-dom';
import { 
  FaBars, FaEllipsisV, FaPaperclip, FaSmile, FaTimes,
  FaUsers, FaArchive, FaPlusCircle, FaShieldAlt, FaWrench,
  FaThumbtack, FaUserPlus, FaEdit, FaCog, FaLink,
  FaGoogle, FaFigma, FaCalendarAlt, FaLock, FaUnlock
} from 'react-icons/fa';

// Dummy data for demonstration
const dummyGroups = [
  {
    id: 1,
    name: "Project Alpha Team",
    avatar: "https://ui-avatars.com/api/?name=Alpha+Team&background=6366F1&color=fff",
    lastMessage: "New task added: Update documentation",
    timestamp: "2024-01-20T10:30:00",
    unread: 5,
    membersOnline: 5,
    totalMembers: 8,
    isArchived: false
  },
  // Add more dummy groups
];

const dummyMembers = [
  {
    id: 1,
    name: "John Doe",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=4F46E5&color=fff",
    role: "admin",
    isOnline: true
  },
  // Add more dummy members
];

const GroupChats = () => {
  const { userId, role } = useOutletContext();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Create Group Modal
  const CreateGroupModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={() => setShowCreateModal(false)}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Group Name"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500"
          />
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500"
            />
            {/* Selected members chips would go here */}
          </div>
          <button className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600">
            Create Group
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="h-full flex overflow-hidden bg-gray-50">
      {/* Left Sidebar */}
      <AnimatePresence>
        {leftSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-80 border-r border-gray-200 bg-white flex flex-col"
          >
            {/* Search and Create Group */}
            <div className="p-4 space-y-3 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search groups..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500 border-none"
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <FaPlusCircle />
                <span>Create New Group</span>
              </button>
            </div>

            {/* Groups List */}
            <div className="flex-1 overflow-y-auto">
              {dummyGroups
                .filter(group => group.isArchived === showArchived)
                .map(group => (
                  <div
                    key={group.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={group.avatar}
                          alt={group.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white text-xs px-1.5 rounded-full">
                          {group.membersOnline}/{group.totalMembers}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {group.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {format(new Date(group.timestamp), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {group.lastMessage}
                        </p>
                      </div>
                      {group.unread > 0 && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-teal-500 text-white text-xs">
                            {group.unread}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Archive Toggle */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="p-4 border-t border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center space-x-2"
            >
              <FaArchive />
              <span>{showArchived ? "Show Active Groups" : "Show Archived"}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Group Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaBars className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={dummyGroups[0]?.avatar}
                  alt={dummyGroups[0]?.name}
                  className="w-8 h-8 rounded-full"
                />
                <FaShieldAlt className="absolute -bottom-1 -right-1 text-teal-500 bg-white rounded-full" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {dummyGroups[0]?.name}
                </h2>
                <p className="text-xs text-gray-500">
                  {dummyGroups[0]?.totalMembers} members
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <FaThumbtack className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <FaUserPlus className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaEllipsisV className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Task Mention Example */}
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 text-yellow-700">
              <FaCalendarAlt className="w-4 h-4" />
              <span className="font-medium">@task-BugFix</span>
              <span>due tomorrow</span>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500 border-none"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <FaPaperclip className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <FaSmile className="w-5 h-5 text-gray-500" />
            </button>
            <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <AnimatePresence>
        {rightSidebarOpen && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="w-80 border-l border-gray-200 bg-white flex flex-col"
          >
            {/* Members Section */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Members
              </h3>
              <div className="space-y-2">
                {dummyMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full"
                        />
                        {member.isOnline && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{member.name}</span>
                    </div>
                    {member.role === 'admin' && (
                      <FaShieldAlt className="w-4 h-4 text-teal-500" />
                    )}
                    {member.role === 'moderator' && (
                      <FaWrench className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Shared Resources */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Shared Resources
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg flex items-center space-x-3">
                  <FaGoogle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-700 flex-1 truncate">
                    Project Documentation
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center space-x-3">
                  <FaFigma className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-700 flex-1 truncate">
                    UI Design Files
                  </span>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Permissions
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Allow File Uploads</span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <FaLock className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">New Members</span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <FaUnlock className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && <CreateGroupModal />}
      </AnimatePresence>
    </div>
  );
};

export default GroupChats; 