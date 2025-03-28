import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaperclip, FaSmile } from 'react-icons/fa';

const MessageInput = ({ onSendMessage, tier = 'starter' }) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (tier === 'starter' && selectedFiles.length > 3) {
      alert('Starter tier allows max 3 files per message');
      return;
    }
    setFiles(selectedFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || files.length > 0) {
      onSendMessage(message, files);
      setMessage('');
      setFiles([]);
    }
  };

  return (
    <div className="h-16 md:h-20 border-t border-gray-200 bg-white sticky bottom-0">
      <form onSubmit={handleSubmit} className="h-full p-4 flex items-center space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500 border-none pr-24"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            <motion.label
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 cursor-pointer"
            >
              <FaPaperclip className="w-4 h-4" />
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={tier === 'starter' && files.length >= 3}
              />
            </motion.label>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500"
            >
              <FaSmile className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        <motion.button
          type="submit"
          disabled={!message.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
        >
          Send
        </motion.button>
      </form>
    </div>
  );
};

export default MessageInput; 