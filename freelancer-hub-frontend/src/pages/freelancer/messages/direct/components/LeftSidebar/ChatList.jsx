import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from 'antd';

const ChatList = ({ chats = [], onChatSelect }) => {
  const [clickedChatId, setClickedChatId] = useState(null);

  const handleChatClick = (chat) => {
    setClickedChatId(chat.id);
    onChatSelect(chat);
  };

  if (!chats.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
        <div className="text-6xl mb-4 bg-violet-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          💬
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">
          No messages yet
        </h3>
        <p className="text-gray-600 text-center">
          Start a conversation to see your chats here
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {chats.map((chat, index) => (
        <motion.div
          key={chat.id}
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
          onClick={() => handleChatClick(chat)}
          className={`flex items-center space-x-3 p-4 cursor-pointer transition-colors ${
            clickedChatId === chat.id 
              ? 'bg-violet-50 rounded-lg shadow-sm' 
              : 'hover:bg-gray-50 rounded-lg'
          }`}
        >
          {/* Avatar with Online Status */}
          <div className="relative">
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-10 h-10 rounded-full ring-2 ring-violet-500 ring-offset-2"
            />
            {chat.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-violet-500 rounded-full border-2 border-white" />
            )}
          </div>

          {/* Chat Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {chat.name}
              </h3>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {chat.lastMessageTime}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate mt-1">
              {chat.lastMessage}
            </p>
          </div>

          {/* Unread Badge */}
          {chat.unreadCount > 0 && (
            <div className="w-5 h-5 bg-violet-500 text-white rounded-full flex items-center justify-center text-xs">
              {chat.unreadCount}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ChatList;