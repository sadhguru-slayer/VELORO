import React, { useState, useEffect } from 'react';
import { useGroupChat } from './hooks/useGroupChat';
import MainChat from './components/MainChat';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import CreateGroupModal from './components/modals/CreateGroupModal';
import AddMemberModal from './components/modals/AddMemberModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

const FGroupChats = () => {
  const [pinnedMessagesMap, setPinnedMessagesMap] = useState({});
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const {
    selectedGroup,
    messages,
    showCreateGroupModal,
    showAddMemberModal,
    handleGroupSelect,
    handleCreateGroup,
    setShowCreateGroupModal,
    setShowAddMemberModal,
    getPinnedMessages,
    isMessagePinned,
    pinnedMessages: currentPinnedMessages,
    handlePinMessage,
    handleUnpinMessage,
    handleReactionAdd,
    handleReactionRemove,
    handleSendMessage,
    upcomingMeeting
  } = useGroupChat();

  // Add this useEffect to debug group selection
  useEffect(() => {
    console.log('Selected Group:', selectedGroup);
    console.log('Messages:', messages);
  }, [selectedGroup, messages]);

  // Renamed to handlePinMessageLocal to avoid conflict
  const handlePinMessageLocal = (message, groupId) => {
    if (!groupId) return;
    
    // Check if message is already pinned
    const isAlreadyPinned = (pinnedMessagesMap[groupId] || [])
      .some(pin => pin.id === message.id);

    if (isAlreadyPinned) {
      // If already pinned, unpin it
      setPinnedMessagesMap(prev => ({
        ...prev,
        [groupId]: prev[groupId].filter(msg => msg.id !== message.id)
      }));
    } else {
      // If not pinned, pin it
      setPinnedMessagesMap(prev => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), { ...message, groupId }]
      }));
    }
  };

  const handleUnpinMessageLocal = (messageId, groupId) => {
    if (!groupId) return;
    
    setPinnedMessagesMap(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter(msg => msg.id !== messageId)
    }));
  };

  const handleAddMember = (selectedUserIds) => {
    // Implement your add member logic here
    console.log('Adding members:', selectedUserIds);
    setShowAddMemberModal(false);
  };

  console.log(selectedGroup)

  return (
    <AnimatePresence>
      <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 relative z-0 overflow-hidden">
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
            isOpen={leftSidebarOpen}
            selectedGroupId={selectedGroup?.id}
            selectedGroup={selectedGroup}
            onGroupSelect={handleGroupSelect}
            onClose={() => setLeftSidebarOpen(false)}
            isMobile={isMobile}
            onCreateGroup={handleCreateGroup}
            onArchiveGroup={(groupId) => console.log('Archive group:', groupId)}
          />
        </motion.div>

        {/* Main Chat Area */}
        <motion.div
          className="flex-1 flex flex-col bg-white rounded-l-2xl shadow-xl relative"
          animate={{
            marginLeft: leftSidebarOpen && !isMobile ? "0" : "0",
            width: "100%",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {selectedGroup ? (
            <MainChat
              chat={selectedGroup}
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
              isMessagePinned={isMessagePinned}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
                <div className="text-6xl mb-6 bg-violet-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  👥
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                  Select a group
                </h3>
                <p className="text-gray-600">
                  Choose a group from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Sidebar */}
        <AnimatePresence>
          {selectedGroup && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{
                x: rightSidebarOpen ? 0 : 320,
                width: rightSidebarOpen ? (isMobile ? "320px" : "320px") : "0px",
              }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed right-0 top-0 h-full bg-white border-l border-slate-200 shadow-lg z-10"
            >
              <RightSidebar
                isOpen={rightSidebarOpen}
                group={selectedGroup}
                onClose={() => setRightSidebarOpen(!rightSidebarOpen)}
                onAddMember={handleAddMember}
                pinnedMessages={getPinnedMessages(selectedGroup.id)}
                upcomingMeeting={upcomingMeeting}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <CreateGroupModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          onCreateGroup={handleCreateGroup}
        />

        <AddMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          onAddMembers={handleAddMember}
          currentMembers={selectedGroup?.members?.map(member => member.id) || []}
          tier="starter"
        />
      </div>
    </AnimatePresence>
  );
};

export default FGroupChats;
