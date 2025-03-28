import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaEllipsisV, FaPaperclip, FaSmile, FaUserPlus } from 'react-icons/fa';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import PinnedMessages from './PinnedMessages';
import ReactionPicker from './ReactionPicker';
import { deleteMessage, addToRecycleBin } from '../../individual';
import { useMediaQuery } from 'react-responsive';
import { dummyChats } from '../../individual';
import Message from './Message';

const MainChat = ({ 
  chat: selectedChat,
  messages = [],
  pinnedMessages = [],
  leftSidebarOpen,
  rightSidebarOpen,
  setLeftSidebarOpen,
  setRightSidebarOpen,
  onPinMessage,
  onUnpinMessage,
  onReactionAdd,
  onReactionRemove,
  onSendMessage,
  onAddMember,
  isMobile = false,
  currentUserId,
}) => {
  const isTablet = useMediaQuery({ query: '(max-width: 1024px)' });
  const [newMessage, setNewMessage] = useState('');
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleSendMessageLocal = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handlePinMessageLocal = (message) => {
    if (!selectedChat) return;
    
    const isPinned = pinnedMessages.some(pin => pin.id === message.id);
    if (isPinned) {
      onUnpinMessage(message.id, selectedChat.id);
    } else {
      onPinMessage(message, selectedChat.id);
    }
  };

  const handleScrollToMessage = (messageId) => {
    const messagesContainer = messagesContainerRef.current;
    const element = document.getElementById(messageId);
    
    if (element && messagesContainer) {
      const elementRect = element.getBoundingClientRect();
      const containerRect = messagesContainer.getBoundingClientRect();
      const relativeTop = elementRect.top - containerRect.top;
      const scrollPosition = messagesContainer.scrollTop + relativeTop - (containerRect.height / 2);

      messagesContainer.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });

      element.classList.add('bg-teal-50', 'transition-colors', 'duration-1000');
      setTimeout(() => {
        element.classList.remove('bg-teal-50', 'transition-colors', 'duration-1000');
      }, 2000);
    }
  };

  const handleDeleteForMe = (messageId) => {
    // Logic to delete the message for the current user
    console.log('Delete for me:', messageId);
    const deletedMessage = deleteMessage(selectedChat.id, messageId, currentUserId);
    if (deletedMessage) {
      addToRecycleBin(deletedMessage);
    }
  };

  const handleDeleteForAll = (messageId) => {
    // Logic to delete the message for all users
    console.log('Delete for all:', messageId);
    const deletedMessage = deleteMessage(selectedChat.id, messageId, currentUserId);
    if (deletedMessage) {
      addToRecycleBin(deletedMessage);
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4"
        >
          <div className="text-6xl mb-6 bg-violet-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            💬
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            Select a conversation
          </h3>
          <p className="text-gray-600">
            Choose a chat from the sidebar to start messaging
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={`flex-1 w-full flex flex-col min-h-full items-center px-3 bg-gradient-to-br from-gray-50 to-gray-100 ${
        isMobile ? 'ml-0' : isTablet ? '' : ''
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex-1 h-full
        ${
        isMobile?"mb-20":""
        }
        flex flex-col bg-white rounded-xl shadow-lg mx-4 my-2 overflow-hidden w-full`}>
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-100">
          <ChatHeader
            chat={selectedChat}
            onMenuClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            onInfoClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            isMobile={isMobile}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Pinned Messages */}
          <AnimatePresence>
            {pinnedMessages.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-teal-50 border-b border-teal-100"
              >
                <PinnedMessages
                  messages={pinnedMessages}
                  onUnpin={onUnpinMessage}
                  onJumpTo={handleScrollToMessage}
                  selectedChatId={selectedChat?.id}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages Container */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl mx-auto space-y-2 relative"
            >
              <MessageList 
                messages={messages}
                onReactionAdd={onReactionAdd}
                onReactionRemove={onReactionRemove}
                onPin={handlePinMessageLocal}
                pinnedMessages={pinnedMessages}
                containerDimensions={containerDimensions}
                onDeleteForMe={handleDeleteForMe}
                onDeleteForAll={handleDeleteForAll}
              />
            </motion.div>
          </div>
        </div>
        {/* Message Input */}
        <div className="relative border-t border-gray-100 bg-white">
          <div className="h-16 flex items-center"> {/* Fixed height container */}
            <MessageInput
              onSendMessage={(content, attachments) => {
                const newMessage = {
                  id: crypto.randomUUID(),
                  content,
                  sender: 'You',
                  timestamp: new Date().toISOString(),
                  isCurrentUser: true,
                  attachments: attachments || [],
                  reactions: [],
                  metadata: {
                    readBy: ['You'],
                    deliveredAt: new Date().toISOString(),
                    readAt: new Date().toISOString()
                  }
                };
                onSendMessage(newMessage);
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MainChat; 