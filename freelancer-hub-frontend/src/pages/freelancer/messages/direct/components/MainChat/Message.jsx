import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FaEllipsisV, FaThumbtack, FaCopy, FaSmile, FaTimes, FaTrash } from 'react-icons/fa';
import useClickOutside from '../../../../messages/groups/hooks/useClickOutside';
import ReactionPicker from './ReactionPicker';
import { useMediaQuery } from 'react-responsive';
import { message as showMessage, Modal } from 'antd';
import { FileIcon, defaultStyles } from "react-file-icon";
import { FaMicrophone } from 'react-icons/fa';

// Helper function to get file type from MIME type
const getFileType = (mimeType) => {
  if (!mimeType) return 'file';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'doc';
  if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xls';
  if (mimeType === 'application/vnd.ms-powerpoint' || mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'ppt';
  if (mimeType === 'application/zip') return 'zip';
  return 'file'; // Default for unknown types
};

const Message = ({ 
  message, 
  onReactionAdd, 
  onReactionRemove,
  onPin,
  isPinned,
  onDeleteForMe,
  onDeleteForAll,
  onDelete,
  containerDimensions,
  id
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [isDeleteForMeModalVisible, setIsDeleteForMeModalVisible] = useState(false);
  const [isDeleteForAllModalVisible, setIsDeleteForAllModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({
    vertical: 'bottom', // 'top' or 'bottom'
    horizontal: 'center', // 'left', 'center', or 'right'
  });

  const messageRef = useRef(null);
  const actionsRef = useRef(null);
  const actionsButtonRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const reactionDetailsRef = useRef(null);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Calculate modal position based on message position in viewport
  const calculateModalPosition = useCallback(() => {
    if (!messageRef.current || !actionsButtonRef.current) return;
    
    // Get message and viewport dimensions
    const messageRect = messageRef.current.getBoundingClientRect();
    const buttonRect = actionsButtonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const viewportCenterY = viewportHeight / 2;
    const viewportCenterX = viewportWidth / 2;
    
    // Find message container for relative positioning
    const messageContainer = messageRef.current.closest('.message-container');
    const containerRect = messageContainer ? 
      messageContainer.getBoundingClientRect() : 
      { left: 0, right: viewportWidth, top: 0, bottom: viewportHeight };
    
    // Calculate vertical position
    const verticalPosition = messageRect.top < viewportCenterY ? 'bottom' : 'top';
    
    // Calculate horizontal position
    // For messages from current user (right-aligned)
    let horizontalPosition;
    if (message.isCurrentUser || message.sender === "You") {
      // Always show on the left for user's messages
      horizontalPosition = 'left';
    } else {
      // Always show on the right for others' messages
      horizontalPosition = 'right';
    }
    
    // Set modal position
    setModalPosition({
      vertical: verticalPosition,
      horizontal: horizontalPosition,
      originX: buttonRect.left + buttonRect.width / 2,
      originY: buttonRect.top + buttonRect.height / 2,
      buttonRect: buttonRect,
      messageRect: messageRect
    });
  }, [message.isCurrentUser, message.sender]);

  // Update modal position when actions menu is toggled
  useEffect(() => {
    if (showActions) {
      calculateModalPosition();
    }
  }, [showActions, calculateModalPosition]);

  // Update position when screen resizes
  useEffect(() => {
    window.addEventListener('resize', calculateModalPosition);
    return () => {
      window.removeEventListener('resize', calculateModalPosition);
    };
  }, [calculateModalPosition]);

  // Long press handler for mobile
  useEffect(() => {
    let pressTimer;

    const startPress = () => {
      pressTimer = setTimeout(() => {
        setIsLongPress(true);
        setShowActions(true);
      }, 500); // 500ms for long press
    };

    const endPress = () => {
      clearTimeout(pressTimer);
      setIsLongPress(false);
    };

    if (messageRef.current && isMobile) {
      messageRef.current.addEventListener('touchstart', startPress);
      messageRef.current.addEventListener('touchend', endPress);
      messageRef.current.addEventListener('touchcancel', endPress);
    }

    return () => {
      if (messageRef.current) {
        messageRef.current.removeEventListener('touchstart', startPress);
        messageRef.current.removeEventListener('touchend', endPress);
        messageRef.current.removeEventListener('touchcancel', endPress);
      }
    };
  }, [isMobile]);

  // Handle click outside for more actions menu
  useClickOutside(actionsRef, () => {
    if (!showReactionPicker) {
      setShowActions(false);
    }
  });

  // Handle click outside for reaction picker
  useClickOutside(reactionPickerRef, () => {
    setShowReactionPicker(false);
  });

  // Handle click outside for reaction details
  useClickOutside(reactionDetailsRef, () => {
    setShowReactionDetails(false);
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowActions(false);
    showMessage.success('Message copied to clipboard');
  };

  const handlePin = () => {
    if (onPin) {
      onPin(message);
      setShowActions(false);
      showMessage.success(isPinned ? 'Message unpinned' : 'Message pinned');
    }
  };

  const handleReactionClick = (reaction) => {
    setSelectedReaction(reaction);
    setShowReactionDetails(!showReactionDetails);
  };

  const handleAddReaction = (emoji) => {
    if (onReactionAdd) {
      // Check if the user has already reacted
      const existingUserReaction = message.reactions?.find(r => 
        r.users.includes('You')
      );

      // If user has already reacted, remove the previous reaction
      if (existingUserReaction) {
        onReactionRemove(message.id, existingUserReaction.emoji);
      }

      // Add the new reaction
      const existingReaction = message.reactions?.find(r => r.emoji === emoji);
      
      if (existingReaction) {
        // Increment the count if the reaction already exists
        onReactionAdd(message.id, {
          ...existingReaction,
          count: existingReaction.count + 1,
          users: [...existingReaction.users, 'You']
        });
      } else {
        // Add the reaction if it doesn't exist
        onReactionAdd(message.id, {
          emoji,
          count: 1,
          users: ['You']
        });
      }
    }
    setShowReactionPicker(false);
    setShowActions(false);
  };

  const handleRemoveReaction = (emoji) => {
    if (typeof onReactionRemove !== 'function') {
      console.error('onReactionRemove is not a function. Current value:', onReactionRemove);
      return;
    }

    const existingReaction = message.reactions?.find(r => r.emoji === emoji);
    if (existingReaction && existingReaction.users.includes('You')) {
      onReactionRemove(message.id, emoji);
    }
    setShowReactionDetails(false);
  };

  const handleDeleteForMe = () => {
    if (onDeleteForMe) {
      onDeleteForMe(message.id);
    }
    setIsDeleteForMeModalVisible(false);
    setShowActions(false);
  };

  const handleDeleteForAll = () => {
    if (onDeleteForAll) {
      onDeleteForAll(message.id);
    }
    setIsDeleteForAllModalVisible(false);
    setShowActions(false);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const handleActionsClick = (e) => {
    e.stopPropagation(); // Prevent click from bubbling up
    setShowActions(true); // Show the actions modal
    // Calculate position after a small delay to ensure button ref is available
    setTimeout(calculateModalPosition, 10);
  };

  const renderAttachmentPreview = (attachment) => {
    const fileType = getFileType(attachment.type);
    const isImage = fileType === 'image';
    const isVideo = fileType === 'video';
    const isAudio = fileType === 'audio';
    const isPDF = fileType === 'pdf';

    if (isImage) {
      return (
        <img
          src={attachment.url}
          alt={attachment.name}
          className="w-48 h-48 object-cover rounded-lg shadow-sm"
        />
      );
    } else if (isVideo) {
      return (
        <video
          src={attachment.url}
          controls
          className="w-48 h-48 object-cover rounded-lg shadow-sm"
        />
      );
    } else if (isAudio) {
      return (
        <div className="w-full p-3 bg-violet-50 rounded-lg flex flex-col space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg flex-shrink-0 w-10 h-10 flex justify-center items-center shadow-sm">
              <FaMicrophone className="w-5 h-5 text-violet-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(attachment.size)}
              </p>
            </div>
          </div>
          <audio
            src={attachment.url}
            controls
            className="w-full"
          />
        </div>
      );
    } else if (isPDF) {
      return (
        <div className="w-full p-3 bg-gray-100 rounded-lg flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg flex-shrink-0 w-10 h-10 flex justify-center items-center">
            <FileIcon
              extension="pdf"
              {...defaultStyles.pdf}
              className="w-6 h-6"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {attachment.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(attachment.size)}
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full p-3 bg-gray-100 rounded-lg flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg flex-shrink-0 w-10 h-10 flex justify-center items-center">
            <FileIcon
              extension={fileType}
              {...defaultStyles[fileType]}
              className="w-6 h-6"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {attachment.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(attachment.size)}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div 
      ref={messageRef}
      id={id || `message-${message.id}`}
      className={`group relative flex ${
        message.isCurrentUser || message.sender === "You" 
          ? 'justify-end' 
          : 'justify-start'
      } p-2`}
    >
      <div className={`relative max-w-[75%]`}>
        {/* Time and Pin Status */}
        <div className={`flex items-center space-x-2 mb-1 ${
          message.isCurrentUser || message.sender === "You" ? 'justify-end' : 'justify-start'
        }`}>
          <span className="text-xs text-gray-500">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
          {isPinned && (
            <span className="flex items-center space-x-1 text-xs text-violet-600">
              <FaThumbtack className="w-3 h-3" />
              <span>Pinned</span>
            </span>
          )}
        </div>

        <div className="relative group w-full">
          <div className={`inline-block w-full rounded-2xl px-4 py-2 shadow-sm ${
            isPinned 
              ? 'bg-violet-50 border border-violet-100' 
              : message.isCurrentUser || message.sender === "You"
                ? 'bg-violet-100' 
                : 'bg-gray-100'
          }`}>
            {/* Message Content */}
            {message.content && (
              <p className={`text-sm text-gray-900 whitespace-pre-wrap break-words ${
                message.isCurrentUser || message.sender === "You" ? 'text-right' : 'text-left'
              }`}>
                {message.content}
              </p>
            )}

            {/* File Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className={`mt-2 space-y-2 ${
                message.isCurrentUser || message.sender === "You" ? 'items-end' : 'items-start'
              }`}>
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="w-full">
                    {renderAttachmentPreview(attachment)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* More Actions Button */}
          <div 
            ref={actionsButtonRef}
            className={`absolute top-1/2 -translate-y-1/2 ${
              message.isCurrentUser || message.sender === "You" ? '-left-10' : '-right-10'
            } opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            <button
              onClick={handleActionsClick}
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
            >
              <FaEllipsisV className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          {/* More Actions Menu */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                ref={actionsRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  zIndex: 50,
                  ...(modalPosition.vertical === 'top' 
                    ? { bottom: '100%', marginBottom: '1px' } 
                    : { top: '100%', marginTop: '1px' }),
                  ...(modalPosition.horizontal === 'left' 
                    ? { right: '0' } 
                    : { left: '0' })
                }}
                className="bg-white rounded-xl shadow-xl py-2 min-w-[180px] max-w-[200px] border border-gray-100"
              >
                <button
                  onClick={handlePin}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-200"
                >
                  <FaThumbtack className={`w-4 h-4 ${
                    isPinned ? 'text-violet-500' : 'text-gray-500'
                  }`} />
                  <span className={isPinned ? 'text-violet-600' : 'text-gray-700'}>
                    {isPinned ? 'Unpin Message' : 'Pin Message'}
                  </span>
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-200"
                >
                  <FaCopy className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">Copy Message</span>
                </button>
                <button
                  onClick={() => setShowReactionPicker(true)}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-200"
                >
                  <FaSmile className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">Add Reaction</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => setIsDeleteForMeModalVisible(true)}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center space-x-2 transition-colors duration-200 text-red-500"
                >
                  <FaTrash className="w-4 h-4" />
                  <span>Delete for Me</span>
                </button>
                {message.isCurrentUser && (
                  <button
                    onClick={() => setIsDeleteForAllModalVisible(true)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center space-x-2 transition-colors duration-200 text-red-500"
                  >
                    <FaTrash className="w-4 h-4" />
                    <span>Delete for All</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reaction Picker */}
          <AnimatePresence>
            {showReactionPicker && (
              <motion.div
                ref={reactionPickerRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  zIndex: 50,
                  maxWidth: '20rem',
                  ...(modalPosition.vertical === 'top' 
                    ? { bottom: '100%', marginBottom: '8px' } 
                    : { top: '100%', marginTop: '8px' }),
                  ...(modalPosition.horizontal === 'left' 
                    ? { right: '0' } 
                    : { left: '0' })
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className='w-[20rem]'
              >
                <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-lg">
                  <div className="grid grid-cols-8 gap-1">
                    {['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏'].map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAddReaction(emoji)}
                        className="p-2 hover:bg-gray-50 rounded-xl transition-all duration-200 ease-out text-2xl"
                        style={{
                          transformOrigin: 'center bottom',
                          willChange: 'transform'
                        }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                  <div className={`absolute ${
                    modalPosition.vertical === 'top' ? 'bottom' : 'top'
                  }-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-${
                    modalPosition.vertical === 'top' ? 'b' : 't'
                  } border-${
                    modalPosition.vertical === 'top' ? 'r' : 'l'
                  } border-gray-100 transform ${
                    modalPosition.vertical === 'top' ? 'rotate-45' : '-rotate-135'
                  }`}></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reactions Display */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${
            message.isCurrentUser || message.sender === "You" ? 'justify-end' : 'justify-start'
          }`}>
            {message.reactions.map((reaction) => {
              const hasUserReacted = reaction.users.includes('You');
              return (
                <button
                  key={reaction.emoji}
                  onClick={() => handleReactionClick(reaction)}
                  className={`text-sm border rounded-full px-2 py-0.5 hover:bg-gray-50 transition-colors ${
                    showReactionDetails && selectedReaction?.emoji === reaction.emoji 
                      ? 'border-violet-500 bg-violet-50' 
                      : 'border-gray-200'
                  } ${
                    hasUserReacted ? 'bg-violet-100' : 'bg-white'
                  }`}
                >
                  {reaction.emoji} {reaction.count}
                </button>
              );
            })}
          </div>
        )}

        {/* Reaction Details Modal */}
        <AnimatePresence>
          {showReactionDetails && selectedReaction && (
            <motion.div
              ref={reactionDetailsRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'absolute',
                zIndex: 50,
                ...(modalPosition.vertical === 'top' 
                  ? { bottom: '100%', marginBottom: '8px' } 
                  : { top: '100%', marginTop: '8px' }),
                ...(modalPosition.horizontal === 'left' 
                  ? { right: '0' } 
                  : { left: '0' })
              }}
              className="bg-white rounded-lg shadow-lg min-w-[200px] max-w-[240px]"
            >
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center space-x-2">
                  <span>{selectedReaction.emoji}</span>
                  <span>{selectedReaction.count} reactions</span>
                </h3>
                <button
                  onClick={() => setShowReactionDetails(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes className="w-3 h-3 text-gray-500" />
                </button>
              </div>
              <div className="p-2 max-h-[200px] overflow-y-auto">
                {selectedReaction.users.map((user) => (
                  <div
                    key={user}
                    onClick={() => {
                      if (user === 'You') {
                        handleRemoveReaction(selectedReaction.emoji);
                        setTimeout(() => setShowReactionDetails(false), 200);
                      }
                    }}
                    className={`flex items-center space-x-2 p-2 ${
                      user === 'You' 
                        ? 'hover:bg-red-50 cursor-pointer' 
                        : 'hover:bg-gray-50 cursor-default'
                    } rounded-lg transition-colors`}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${user}&background=random`}
                      alt={user}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm">{user}</span>
                    {user === 'You' && (
                      <span className="text-xs text-red-500 ml-2">(Click to remove)</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom modals for deletion */}
      {(isDeleteForMeModalVisible || isDeleteForAllModalVisible) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-25" onClick={() => {
            setIsDeleteForMeModalVisible(false);
            setIsDeleteForAllModalVisible(false);
          }}></div>
          
          {isDeleteForMeModalVisible && (
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full z-[101]">
              <h3 className="text-lg font-medium mb-4">Delete for Me</h3>
              <p className="mb-6">Are you sure you want to delete this message for yourself?</p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setIsDeleteForMeModalVisible(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteForMe}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
          
          {isDeleteForAllModalVisible && (
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full z-[101]">
              <h3 className="text-lg font-medium mb-4">Delete for All</h3>
              <p className="mb-6">Are you sure you want to delete this message for everyone?</p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setIsDeleteForAllModalVisible(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteForAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Message;
