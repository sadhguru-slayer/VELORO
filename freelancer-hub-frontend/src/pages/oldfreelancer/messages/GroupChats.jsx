import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useOutletContext } from 'react-router-dom';
import { 
  FaBars, FaEllipsisV, FaPaperclip, FaSmile, FaTimes,
  FaUsers, FaArchive, FaPlusCircle, FaShieldAlt, FaWrench,
  FaThumbtack, FaUserPlus, FaEdit, FaCog, FaLink,
  FaGoogle, FaFigma, FaCalendarAlt, FaLock, FaUnlock,
  FaReply, FaEllipsisH, FaCopy, FaTrash, FaFlag, FaSearch,
  FaCheck, FaPlus, FaChevronDown
} from 'react-icons/fa';

import dummyGroups from './groups';

// Extended dummy data with more messages and members


// Add this new component above the GroupChats component
const CreateGroupModal = ({ isOpen, onClose, currentProject }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupType, setGroupType] = useState('project'); // 'project' or 'custom'
  const [groupVisibility, setGroupVisibility] = useState('private'); // 'private' or 'public'
  const [groupDescription, setGroupDescription] = useState('');

  const handleCreateGroup = () => {
    // Validate inputs
    if (!groupName.trim() || selectedMembers.length === 0) {
      // Show error toast or message
      return;
    }

    // Create group logic here
    console.log({
      name: groupName,
      members: selectedMembers,
      type: groupType,
      visibility: groupVisibility,
      description: groupDescription,
      projectId: currentProject?.id
    });

    // Reset form and close modal
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setGroupName('');
    setSearchQuery('');
    setSelectedMembers([]);
    setGroupType('project');
    setGroupVisibility('private');
    setGroupDescription('');
  };

  const removeMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter(member => member.id !== memberId));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center"
          style={{ top: '64px', height: 'calc(100vh - 64px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Group</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Group Type Selection */}
              <div className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                <button
                  onClick={() => setGroupType('project')}
                  className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                    groupType === 'project' 
                      ? 'bg-white shadow-sm border border-gray-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaUsers className="w-4 h-4" />
                  <span>Project Group</span>
                </button>
                <button
                  onClick={() => setGroupType('custom')}
                  className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                    groupType === 'custom' 
                      ? 'bg-white shadow-sm border border-gray-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaPlusCircle className="w-4 h-4" />
                  <span>Custom Group</span>
                </button>
              </div>

              {/* Group Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder={groupType === 'project' ? currentProject?.name + ' Team' : 'Enter group name'}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Add a group description..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Visibility Options */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setGroupVisibility('private')}
                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                      groupVisibility === 'private' 
                        ? 'bg-teal-50 text-teal-600 border border-teal-200' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FaLock className="w-4 h-4" />
                    <span>Private Group</span>
                  </button>
                  <button
                    onClick={() => setGroupVisibility('public')}
                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                      groupVisibility === 'public' 
                        ? 'bg-teal-50 text-teal-600 border border-teal-200' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FaUnlock className="w-4 h-4" />
                    <span>Public Group</span>
                  </button>
                </div>

                {/* Member Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Members
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search members..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500"
                    />
                    <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>

                  {/* Selected Members */}
                  {selectedMembers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedMembers.map(member => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-1 bg-gray-100 rounded-full px-3 py-1"
                        >
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-sm text-gray-700">{member.name}</span>
                          <button
                            onClick={() => removeMember(member.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedMembers.length === 0}
                  className="flex-1 px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Group
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add this new component for pinned messages
const PinnedMessage = ({ message, onUnpin }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-teal-50 border-l-4 border-teal-500 p-3 flex items-center justify-between"
    >
      <div className="flex items-center space-x-3">
        <FaThumbtack className="w-4 h-4 text-teal-500 rotate-45" />
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-teal-600">Pinned message</span>
            <span className="text-xs text-gray-500">by {message.pinnedBy}</span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-1">{message.content}</p>
        </div>
      </div>
      <button
        onClick={() => onUnpin(message.id)}
        className="p-1.5 hover:bg-teal-100 rounded-full"
      >
        <FaTimes className="w-3 h-3 text-teal-500" />
      </button>
    </motion.div>
  );
};

// Add this new component for the add member modal
const AddMemberModal = ({ isOpen, onClose, groupId, currentMembers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Dummy available users - replace with API call
  const availableUsers = [
    { id: 4, name: "Emma Thompson", avatar: "https://ui-avatars.com/api/?name=Emma+Thompson&background=F59E0B&color=fff", role: "member" },
    { id: 5, name: "David Brown", avatar: "https://ui-avatars.com/api/?name=David+Brown&background=10B981&color=fff", role: "member" },
    // Add more users
  ];

  const filteredUsers = availableUsers.filter(user => 
    !currentMembers.some(member => member.id === user.id) &&
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMembers = () => {
    // Add members logic here
    console.log('Adding members:', selectedUsers);
    onClose();
    setSelectedUsers([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center"
          style={{ top: '64px', height: 'calc(100vh - 64px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add Members</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500"
                />
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm text-gray-700">{user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedUsers.some(u => u.id === user.id)) {
                          setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
                        } else {
                          setSelectedUsers([...selectedUsers, user]);
                        }
                      }}
                      className={`p-2 rounded-lg ${
                        selectedUsers.some(u => u.id === user.id)
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedUsers.some(u => u.id === user.id) ? (
                        <FaCheck className="w-4 h-4" />
                      ) : (
                        <FaPlus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMembers}
                  disabled={selectedUsers.length === 0}
                  className="flex-1 px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Selected
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Update the Message component to include its own state
const Message = ({ message, onReactionAdd, onPin, isPinned }) => {
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(null);
  
  // Add ref for reaction details modal
  const reactionDetailsRef = useRef(null);
  
  // Add click outside handler for reaction details
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (reactionDetailsRef.current && !reactionDetailsRef.current.contains(e.target)) {
        setShowReactionDetails(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReactionClick = (e) => {
    e.stopPropagation();
    setShowReactionModal(!showReactionModal);
    setShowReactionDetails(null);
    setShowMoreActions(false);
  };

  const handleReactionDetailsClick = (e, reaction) => {
    e.stopPropagation();
    setShowReactionDetails(showReactionDetails?.emoji === reaction.emoji ? null : reaction);
    setShowReactionModal(false);
    setShowMoreActions(false);
  };

  const handleMoreActions = (e) => {
    e.stopPropagation();
    setShowMoreActions(!showMoreActions);
    setShowReactionModal(false);
    setShowReactionDetails(null);
  };

  // Add common emoji reactions
  const commonReactions = ["👍", "❤️", "😂", "😮", "😢", "👏"];

  return (
    <div className="group relative flex items-start space-x-2 md:space-x-3 p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="relative flex-shrink-0">
        <img 
          src={message.avatar} 
          alt={message.sender} 
          className="w-8 h-8 md:w-10 md:h-10 rounded-full ring-2 ring-white shadow-sm"
        />
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5 md:mb-1">
          <div className="flex items-center space-x-1 md:space-x-2">
            <span className="font-semibold text-xs md:text-sm text-gray-900">{message.sender}</span>
            <span className="text-[10px] md:text-xs text-gray-500">
              {format(new Date(message.timestamp), 'HH:mm')}
            </span>
          </div>
          
          <div className="flex items-center space-x-0.5 md:space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleReactionClick}
              className="p-1 md:p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
              title="Add reaction"
            >
              <FaSmile className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleMoreActions}
              className="p-1 md:p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
              title="More actions"
            >
              <FaEllipsisH className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </motion.button>
          </div>
        </div>
        
        <div className="text-xs md:text-sm text-gray-800 leading-relaxed">
          {message.content}
        </div>
        
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-1 md:mt-2">
            {message.reactions.map((reaction, index) => (
              <motion.button
                key={`${message.id}-${reaction.emoji}-${index}`}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleReactionDetailsClick(e, reaction)}
                className="flex items-center space-x-0.5 md:space-x-1 bg-white border border-gray-200 rounded-full px-1.5 md:px-2 py-0.5 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <span className="text-sm md:text-base">{reaction.emoji}</span>
                <span className="text-[10px] md:text-xs text-gray-600 font-medium">{reaction.count}</span>
              </motion.button>
            ))}
          </div>
        )}
        
        {/* Reaction Modal */}
        <AnimatePresence>
          {showReactionModal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="reaction-modal absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-1 px-2">
                {commonReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReactionAdd(message.id, emoji);
                      setShowReactionModal(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-xl">{emoji}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Reaction Details Modal */}
        <AnimatePresence>
          {showReactionDetails && (
            <motion.div
              ref={reactionDetailsRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[160px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-100">
                {showReactionDetails.users.length} {showReactionDetails.users.length === 1 ? 'person' : 'people'}
              </div>
              {showReactionDetails.users.map((user, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {user}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* More Actions Modal */}
        <AnimatePresence>
          {showMoreActions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="reaction-modal absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[160px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  navigator.clipboard.writeText(message.content);
                  setShowMoreActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <FaCopy className="w-4 h-4" />
                <span>Copy message</span>
              </button>
              
              <button
                onClick={() => {
                  onPin(message);
                  setShowMoreActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <FaThumbtack className={`w-4 h-4 ${isPinned ? 'text-teal-500' : ''}`} />
                <span>{isPinned ? 'Unpin from chat' : 'Pin to chat'}</span>
              </button>
              
              {message.sender === "You" && (
                <>
                  <button
                    onClick={() => {
                      console.log('Edit message');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span>Edit message</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('Delete message');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <FaTrash className="w-4 h-4" />
                    <span>Delete message</span>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  console.log('Report message');
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <FaFlag className="w-4 h-4" />
                <span>Report message</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Show pin indicator if message is pinned */}
        {isPinned && (
          <div className="absolute -top-1 -right-1">
            <FaThumbtack className="w-3 h-3 text-teal-500 rotate-45" />
          </div>
        )}
      </div>
    </div>
  );
};

// Add this new component for the pinned messages section
const PinnedMessagesSection = ({ pinnedMessages, onUnpin, onScrollToMessage }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (pinnedMessages.length === 0) return null;

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
          <span>{pinnedMessages.length} pinned {pinnedMessages.length === 1 ? 'message' : 'messages'}</span>
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
            {pinnedMessages.map(message => (
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
                        {format(new Date(message.timestamp), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <button
                      onClick={() => onUnpin(message.id)}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <FaTimes className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{message.content}</p>
                  <button
                    onClick={() => onScrollToMessage(message.id)}
                    className="mt-1 text-xs text-teal-600 hover:text-teal-700"
                  >
                    Jump to message
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

const GroupChats = () => {
  const { userId, role,isMobile } = useOutletContext();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(dummyGroups[0]);
  const [newMessage, setNewMessage] = useState("");
  const [activeReactionModal, setActiveReactionModal] = useState(null);
  const [activeReactionDetails, setActiveReactionDetails] = useState(null);
  const [activeMoreActions, setActiveMoreActions] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const messagesEndRef = useRef(null);
  const [selectedGroupId, setSelectedGroupId] = useState(dummyGroups[0]?.id);
  

  // Update click handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.reaction-modal')) {
        setActiveReactionModal(null);
        setActiveReactionDetails(null);
        setActiveMoreActions(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle group selection
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedGroupId(group.id);
    if (window.innerWidth < 768) {
      setLeftSidebarOpen(false);
    }
  };

  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "You",
      content: newMessage,
      timestamp: new Date().toISOString(),
      avatar: "https://ui-avatars.com/api/?name=You&background=4F46E5&color=fff",
    };

    setSelectedGroup(prev => ({
      ...prev,
      messages: [...prev.messages, newMsg],
      lastMessage: newMessage,
      timestamp: new Date().toISOString()
    }));

    setNewMessage("");
  };

  const handleReactionAdd = (messageId, emoji) => {
    setSelectedGroup(prev => ({
      ...prev,
      messages: prev.messages.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find(r => r.emoji === emoji);
          if (existingReaction) {
            // If user already reacted, remove their reaction
            if (existingReaction.users.includes("You")) {
              return {
                ...msg,
                reactions: msg.reactions.map(r => 
                  r.emoji === emoji 
                    ? { 
                        ...r, 
                        count: r.count - 1,
                        users: r.users.filter(u => u !== "You")
                      }
                    : r
                ).filter(r => r.count > 0)
              };
            }
            // Add user's reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, users: [...r.users, "You"] }
                  : r
              )
            };
          }
          // Create new reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1, users: ["You"] }]
          };
        }
        return msg;
      })
    }));
  };

  const handlePinMessage = (message) => {
    const isPinned = pinnedMessages.some(m => m.id === message.id);
    if (isPinned) {
      setPinnedMessages(pinnedMessages.filter(m => m.id !== message.id));
    } else {
      setPinnedMessages([...pinnedMessages, {
        ...message,
        pinnedAt: new Date().toISOString(),
        pinnedBy: "You"
      }]);
    }
  };

  const handleScrollToMessage = (messageId) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add highlight animation
      element.classList.add('bg-teal-50');
      setTimeout(() => element.classList.remove('bg-teal-50'), 2000);
    }
  };

  return (
    <div className="flex overflow-hidden bg-gray-50 max-h-[calc(100vh-64px)] w-full">
      {/* Left Sidebar */}
      <AnimatePresence>
        {leftSidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 border-r border-gray-200 bg-white flex flex-col fixed h-[calc(100vh-64px)] z-10"
          >
            {/* Fixed Top Section */}
            <div className="sticky top-0 bg-white z-20 border-b border-gray-200">
              <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search groups..."
                    className="w-full px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500 border-none text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full flex items-center justify-center space-x-1 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
                >
                  <FaPlusCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>Create New Group</span>
                </button>
              </div>
            </div>

            {/* Groups List */}
            <div className="flex-1 overflow-y-auto pb-16">
              {dummyGroups
                .filter(group => group.isArchived === showArchived)
                .map(group => (
                  <motion.div
                    key={group.id}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                    className={`p-4 cursor-pointer border-b border-gray-100 transition-colors ${
                      selectedGroupId === group.id ? 'bg-teal-50' : ''
                    }`}
                    onClick={() => handleGroupSelect(group)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-shrink-0">
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
                          <span className="text-xs text-gray-500 flex-shrink-0">
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
                  </motion.div>
                ))}
            </div>

            {/* Fixed Bottom Section - Archive Button */}
            <div className={`h-16 md:h-20 border-t border-gray-200 bg-white sticky bottom-0 left-0 right-0 ${
              isMobile ? 'mb-16' : ''
            } ${showArchived ? 'bg-teal-500' : ''}`}>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="w-full h-full flex items-center justify-center space-x-2 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <FaArchive className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">
                  {showArchived ? "Show Active Groups" : "Show Archived"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <motion.div
        animate={{ 
          marginLeft: leftSidebarOpen ? 320 : 0,
          width: `calc(100% - ${leftSidebarOpen ? 320 : 0}px - ${rightSidebarOpen ? 320 : 0}px)`
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col h-[calc(100vh-64px)] relative"
      >
        {/* Header - Fixed */}
        <div className="h-14 md:h-16 flex items-center justify-between px-2 md:px-4 border-b border-gray-200 bg-white sticky top-0 z-20">
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Toggle button for mobile */}
            <motion.button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: leftSidebarOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaBars className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              </motion.div>
            </motion.button>

            {/* Group info */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="relative">
                <img
                  src={selectedGroup?.avatar}
                  alt={selectedGroup?.name}
                  className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                />
                <FaShieldAlt className="absolute -bottom-1 -right-1 text-teal-500 bg-white rounded-full text-xs md:text-sm" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 truncate max-w-[150px] md:max-w-none">
                  {selectedGroup?.name}
                </h2>
                <p className="text-[10px] md:text-xs text-gray-500">
                  {selectedGroup?.totalMembers} members • {selectedGroup?.membersOnline} online
                </p>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-1 md:space-x-2">
            <button className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg">
              <FaThumbtack className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            </button>
            <button 
              onClick={() => setShowAddMemberModal(true)}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaUserPlus className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            </button>
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaEllipsisV className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages Container - Fixed Height */}
        <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 64px - 56px - 64px)' }}>
          <div className="h-full px-4 py-6">
            {/* Pinned Messages Section */}
            <AnimatePresence>
              <PinnedMessagesSection
                pinnedMessages={pinnedMessages}
                onUnpin={(messageId) => setPinnedMessages(prev => prev.filter(m => m.id !== messageId))}
                onScrollToMessage={handleScrollToMessage}
              />
            </AnimatePresence>

            {/* Messages List */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto space-y-4 min-h-[calc(100vh-64px-56px-64px-48px)]"
            >
              {selectedGroup?.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages yet
                </div>
              ) : (
                selectedGroup?.messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    id={`message-${message.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.2 }}
                  >
                    <Message
                      message={message}
                      onReactionAdd={handleReactionAdd}
                      onPin={handlePinMessage}
                      isPinned={pinnedMessages.some(m => m.id === message.id)}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Message Input - Fixed at Bottom */}
        <div className={`h-16 md:h-20 border-t border-gray-200 bg-white sticky bottom-0 left-0 right-0 ${
          isMobile ? 'mb-16' : ''
        }`}>
          <form onSubmit={handleSendMessage} className="h-full p-2 md:p-4 flex items-center space-x-2 md:space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500 border-none pr-16 md:pr-24 text-sm md:text-base"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 md:space-x-1">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1 md:p-1.5 hover:bg-gray-200 rounded-full text-gray-500"
                >
                  <FaPaperclip className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1 md:p-1.5 hover:bg-gray-200 rounded-full text-gray-500"
                >
                  <FaSmile className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </motion.button>
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={!newMessage.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 md:px-6 py-2 md:py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm text-sm md:text-base"
            >
              Send
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Right Sidebar */}
      <AnimatePresence>
        {rightSidebarOpen && selectedGroup && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 fixed right-0 z-20 h-[calc(100vh-64px)] border-l border-gray-200 bg-white flex flex-col"
          >
            {/* Header - Fixed */}
            <div className="h-16 flex-shrink-0 border-b border-gray-200">
              <div className="flex items-center justify-between p-2">
                <h3 className="text-lg font-semibold">{selectedGroup.name}</h3>
                <button
                  onClick={() => setRightSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* Members Section */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold mb-3">
                  Members ({selectedGroup.members.length})
                </h3>
                <div className="space-y-2">
                  {selectedGroup.members.map(member => (
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

              {/* Resources Section */}
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-3">Shared Resources</h3>
                <div className="space-y-2">
                  {selectedGroup.resources.map(resource => (
                    <div
                      key={resource.id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center space-x-3"
                    >
                      {resource.icon === 'google' && (
                        <FaGoogle className="w-5 h-5 text-red-500" />
                      )}
                      {resource.icon === 'figma' && (
                        <FaFigma className="w-5 h-5 text-purple-500" />
                      )}
                      <span className="text-sm text-gray-700 flex-1 truncate">
                        {resource.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateGroupModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentProject={{
          id: 1,
          name: "Freelancer Hub",
          // Add other project details as needed
        }}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        groupId={selectedGroup?.id}
        currentMembers={selectedGroup?.members || []}
      />
    </div>
  );
};

export default GroupChats; 