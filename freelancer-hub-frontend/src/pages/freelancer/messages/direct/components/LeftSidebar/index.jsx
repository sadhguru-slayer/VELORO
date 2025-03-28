import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import SearchBar from './SearchBar';
import ChatList from './ChatList';
import { dummyChats } from '../../../direct/individual.js';
import { useMediaQuery } from 'react-responsive';

const LeftSidebar = ({ onChatSelect, selectedChatId, isMobile, onClose }) => {
  const isTablet = useMediaQuery({ query: '(max-width: 1024px)' });
  const [searchQuery, setSearchQuery] = useState('');

  // Format chats data to include required fields
  const formattedChats = dummyChats.map(chat => ({
    id: chat.id,
    name: chat.name,
    avatar: chat.avatar,
    lastMessage: chat.lastMessage,
    lastMessageTime: new Date(chat.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    isOnline: chat.online,
    unreadCount: chat.messages.filter(msg => !msg.metadata.readAt && !msg.isCurrentUser).length
  }));

  const handleChatClick = (c) => {
    const selectedChat = dummyChats.find(chat => chat.id === c.id);

    if (selectedChat) {
      onChatSelect(selectedChat);
      if (isMobile) {
        onClose?.();
      }
    }
  };

  const filteredChats = formattedChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${
        isMobile ? 'w-80' : isTablet ? 'w-64' : 'w-80'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <span className="bg-violet-500 w-2 h-2 rounded-full mr-2"></span>
          Messages
        </h2>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 sticky top-16 bg-white/80 backdrop-blur-md z-10">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search messages..."
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        <AnimatePresence>
          <ChatList
            chats={filteredChats}
            selectedChatId={selectedChatId}
            onChatSelect={handleChatClick}
          />
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LeftSidebar; 