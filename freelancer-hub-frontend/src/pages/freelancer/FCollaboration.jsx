import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, Badge } from 'antd';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import ChatThread from '../../components/chat/ChatThread';
import FileUpload from '../../components/chat/FileUpload';
import SearchMessages from '../../components/chat/SearchMessages';
import GroupMembers from '../../components/chat/GroupMembers';

const FCollaboration = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([
    { id: 1, name: "E-commerce Website Team", lastMessage: "Great progress on the UI!", isOnline: true },
    { id: 2, name: "Mobile App Project", lastMessage: "When can we schedule the next meeting?", isOnline: false },
    { id: 3, name: "Logo Design Client", lastMessage: "The final version looks perfect!", isOnline: true }
  ]);
  const [searchVisible, setSearchVisible] = useState(false);
  const chatContainerRef = useRef(null);

  // Animated container variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <FSider />
      <div className="flex-1 flex flex-col overflow-hidden">
        <FHeader />
        
        <motion.div 
          className="flex-1 p-4 overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Main Chat Interface */}
          <div className="h-full rounded-2xl bg-white shadow-lg border border-violet-100 overflow-hidden
            backdrop-blur-xl">
            <div className="grid grid-cols-12 h-full">
              {/* Chat List */}
              <div className="col-span-3 border-r border-violet-100">
                <div className="p-4 border-b border-violet-100">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 
                    bg-clip-text text-transparent">Collaborations</h2>
                </div>
                <div className="overflow-y-auto h-[calc(100%-4rem)]">
                  {chats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 cursor-pointer transition-all duration-300 ${
                        activeChat?.id === chat.id
                          ? 'bg-violet-50 border-l-4 border-violet-500'
                          : 'hover:bg-violet-50/50'
                      }`}
                      onClick={() => setActiveChat(chat)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 
                            flex items-center justify-center text-white font-medium">
                            {chat.name.charAt(0)}
                          </div>
                          <Badge 
                            status={chat.isOnline ? "success" : "default"} 
                            className="absolute -bottom-0.5 -right-0.5 border-2 border-white"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{chat.name}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {chat.lastMessage}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="col-span-9 flex flex-col">
                {activeChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-violet-100 bg-white/80 backdrop-blur-xl">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <h2 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 
                            bg-clip-text text-transparent">
                            {activeChat.name}
                          </h2>
                          <GroupMembers chatId={activeChat.id} />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Tooltip title="Search Messages">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSearchVisible(true)}
                              className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </motion.button>
                          </Tooltip>
                          <FileUpload chatId={activeChat.id} />
                        </div>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
                      <ChatThread chatId={activeChat.id} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-violet-100 bg-white/80 backdrop-blur-xl">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 rounded-xl border border-violet-200 
                            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                            bg-white/50 backdrop-blur-sm"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 
                            text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/25 
                            transition-all duration-300 font-medium"
                        >
                          Send
                        </motion.button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 mx-auto rounded-full bg-violet-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 
                        bg-clip-text text-transparent">Start Collaborating</h3>
                      <p className="text-gray-500">Select a chat from the list to begin your collaboration</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Modal */}
        <AnimatePresence>
          {searchVisible && (
            <SearchMessages
              chatId={activeChat?.id}
              onClose={() => setSearchVisible(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FCollaboration;