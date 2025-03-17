import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  FaBars, FaEllipsisV, FaPaperclip, FaSmile, FaTimes,
  FaArchive, FaBell, FaImage, FaFile, FaLink, FaPlusCircle,
  FaHeart, FaThumbsUp, FaReply, FaExternalLinkAlt
} from 'react-icons/fa';
import { useOutletContext } from 'react-router-dom';

// Dummy data for demonstration
const dummyChats = [
  {
    id: 1,
    name: "Sarah Wilson",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Wilson&background=0D8ABC&color=fff",
    lastMessage: "The project proposal looks great! Let's discuss...",
    timestamp: "2024-01-20T10:30:00",
    unread: 3,
    online: true
  },
  // ... add more dummy chats
];

const dummyMessages = [
  {
    id: 1,
    sender: "Sarah Wilson",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Wilson&background=0D8ABC&color=fff",
    content: "Hi! I've reviewed the project requirements.",
    timestamp: "2024-01-20T10:30:00",
    reactions: ["❤️", "👍"],
    replies: 2
  },
  // ... add more dummy messages
];

const DirectMessages = () => {
  const context = useOutletContext();
  const { userId, role } = context;


  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!userId) {
      console.error("No userId available in DirectMessages");
      return;
    }
    console.log("DirectMessages mounted with userId:", userId);
  }, [userId]);

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
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500 border-none"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {dummyChats.map(chat => (
                <div
                  key={chat.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full"
                      />
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {format(new Date(chat.timestamp), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                    {chat.unread > 0 && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-teal-500 text-white text-xs">
                          {chat.unread}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* New Chat Button */}
            <div className="p-4 border-t border-gray-200">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                <FaPlusCircle />
                <span>New Chat</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaBars className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center space-x-3">
              <img
                src={dummyChats[0].avatar}
                alt={dummyChats[0].name}
                className="w-8 h-8 rounded-full"
              />
              <h2 className="text-lg font-semibold text-gray-900">
                {dummyChats[0].name}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaEllipsisV className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {dummyMessages.map(message => (
            <div key={message.id} className="flex space-x-3">
              <img
                src={message.avatar}
                alt={message.sender}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {message.sender}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(message.timestamp), 'HH:mm')}
                  </span>
                </div>
                <div className="mt-1 bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-gray-800">{message.content}</p>
                </div>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    {message.reactions.map((reaction, index) => (
                      <span key={index} className="text-sm">{reaction}</span>
                    ))}
                  </div>
                  <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center space-x-1">
                    <FaReply className="w-4 h-4" />
                    <span>{message.replies} replies</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
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
            className="w-80 border-l border-gray-200 bg-white"
          >
            {/* Profile Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="text-center">
                <img
                  src={dummyChats[0].avatar}
                  alt={dummyChats[0].name}
                  className="w-20 h-20 rounded-full mx-auto"
                />
                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                  {dummyChats[0].name}
                </h3>
                <p className="text-sm text-gray-500">Frontend Developer</p>
                <p className="text-sm text-gray-500">$45/hr</p>
              </div>
            </div>

            {/* Shared Files */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Shared Files
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <FaImage className="w-6 h-6 text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <FaFile className="w-6 h-6 text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <FaLink className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Pinned Messages */}
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Pinned Messages
              </h4>
              <div className="space-y-2">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Meeting scheduled for tomorrow at 10 AM
                  </p>
                  <span className="text-xs text-gray-400">
                    Pinned by Sarah • 2h ago
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DirectMessages; 