import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaThumbtack, FaTimes, FaChevronDown } from 'react-icons/fa';

const PinnedMessages = ({ 
  messages = [], 
  onUnpin = () => {}, 
  onJumpTo = () => {},
  selectedChatId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!messages || messages.length === 0) return null;

  const handleUnpin = (messageId) => {
    onUnpin(messageId, selectedChatId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-gray-50 border-b border-gray-200"
    >
      <div className="p-2 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-sm text-gray-600"
        >
          <FaThumbtack className="w-4 h-4 text-teal-500" />
          <span>{messages.length} pinned {messages.length === 1 ? 'message' : 'messages'}</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FaChevronDown className="w-3 h-3" />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200"
          >
            {messages.map(message => (
              <div
                key={message.id}
                className="p-3 hover:bg-gray-100 flex items-start space-x-3"
              >
                <img
                  src={message.avatar}
                  alt={message.sender}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{message.sender}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleUnpin(message.id)}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <FaTimes className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{message.content}</p>
                  <button
                    onClick={() => onJumpTo(`message-${message.id}`)}
                    className="mt-2 text-xs text-teal-600 hover:text-teal-700 flex items-center space-x-1 group"
                  >
                    <span>Jump to message</span>
                    <motion.svg 
                      className="w-3 h-3" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ x: [0, 2, 0] }}
                      transition={{ 
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </motion.svg>
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PinnedMessages; 