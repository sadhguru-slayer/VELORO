import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import useDirectChat from './hooks/useDirectChat';
import LeftSidebar from './components/LeftSidebar';
import MainChat from './components/MainChat';
import RightSidebar from './components/RightSidebar';
import { useMediaQuery } from 'react-responsive';
import { useLocation } from 'react-router-dom';

const DirectMessages = () => {
  const [pinnedMessagesMap, setPinnedMessagesMap] = useState({});
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    selectedChat,
    messages,
    handleChatSelect: selectChat,
    handleReactionAdd,
    handleReactionRemove,
    handleSendMessage
  } = useDirectChat();

  // Basic mobile detection
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const { userId: chatUserId } = useLocation().state || {};

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePinMessage = (message, chatId) => {
    if (!chatId) return;
    
    const isAlreadyPinned = (pinnedMessagesMap[chatId] || [])
      .some(pin => pin.id === message.id);

    setPinnedMessagesMap(prev => ({
      ...prev,
      [chatId]: isAlreadyPinned
        ? prev[chatId].filter(msg => msg.id !== message.id)
        : [...(prev[chatId] || []), { ...message, chatId }]
    }));
  };

  const handleUnpinMessage = (messageId, chatId) => {
    if (!chatId) return;
    setPinnedMessagesMap(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || []).filter(msg => msg.id !== messageId)
    }));
  };

  const currentPinnedMessages = selectedChat 
    ? pinnedMessagesMap[selectedChat.id] || []
    : [];

  const onChatSelected = (chat) => {
    selectChat(chat);
    console.log(chat)
    if (isMobile) {
      setLeftSidebarOpen(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 relative z-0 overflow-hidden">
        {/* Loading overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-50 flex items-center justify-center"
          >
            <div className="animate-pulse space-y-2 text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-600">Loading chat...</p>
            </div>
          </motion.div>
        )}

        {/* Left Sidebar */}
        <motion.div
          initial={false}
          animate={{
            width: leftSidebarOpen ? (isMobile ? "100%" : "") : "0px",
            opacity: leftSidebarOpen ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="border-r border-slate-200 bg-white shadow-lg h-full"
        >
          <LeftSidebar
            selectedChatId={selectedChat?.id}
            onChatSelect={onChatSelected}
            onClose={() => setLeftSidebarOpen(false)}
            isMobile={isMobile}
          />
        </motion.div>

        {/* Main Chat Area */}
        <motion.div
          className="flex-1 flex flex-col bg-pink-700 rounded-l-2xl shadow-xl relative"
          animate={{
            marginLeft: leftSidebarOpen && !isMobile ? "0" : "0",
            width: "100%",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <MainChat
            chat={selectedChat}
            messages={messages}
            pinnedMessages={currentPinnedMessages}
            leftSidebarOpen={leftSidebarOpen}
            rightSidebarOpen={rightSidebarOpen}
            setLeftSidebarOpen={setLeftSidebarOpen}
            setRightSidebarOpen={setRightSidebarOpen}
            onPinMessage={handlePinMessage}
            onUnpinMessage={handleUnpinMessage}
            onReactionAdd={handleReactionAdd}
            onReactionRemove={handleReactionRemove}
            onSendMessage={handleSendMessage}
            isMobile={isMobile}
          />
        </motion.div>

        {/* Right Sidebar */}
        <AnimatePresence>
          {selectedChat && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{
                x: rightSidebarOpen ? 0 : "100%",
                width: rightSidebarOpen ? (isMobile ? "100%" : "320px") : "0px",
              }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed right-0 top-0 h-full bg-white border-l border-slate-200 shadow-lg z-10"
            >
              <RightSidebar
                isOpen={rightSidebarOpen}
                chat={selectedChat}
                onClose={() => setRightSidebarOpen(!rightSidebarOpen)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default DirectMessages;