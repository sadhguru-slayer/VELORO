import React from 'react';
import { motion } from 'framer-motion';
import Message from './Message';

const MessageList = ({ 
  messages = [], 
  onReactionAdd,
  onReactionRemove,
  onPin,
  pinnedMessages = [],
  containerDimensions,
  onDeleteForMe,
  onDeleteForAll
}) => {
  const isMessagePinned = (messageId) => {
    return pinnedMessages.some(pin => pin.id === messageId);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-2 message-container relative"
    >
      {!messages || messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-20">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Start the conversation
          </h3>
          <p className="text-gray-500">
            Send your first message to get started
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onReactionAdd={onReactionAdd}
            onReactionRemove={onReactionRemove}
            onPin={onPin}
            isPinned={isMessagePinned(message.id)}
            onDeleteForMe={onDeleteForMe}
            onDeleteForAll={onDeleteForAll}
            id={`message-${message.id}`}
            containerDimensions={containerDimensions}
          />
        ))
      )}
    </motion.div>
  );
};

export default MessageList; 