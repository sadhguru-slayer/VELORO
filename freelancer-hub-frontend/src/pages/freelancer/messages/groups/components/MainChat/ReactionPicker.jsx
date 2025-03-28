import React from 'react';
import { motion } from 'framer-motion';

const commonEmojis = ['👍', '❤️', '😊', '😂', '😮', '😢', '👏', '🎉'];

const ReactionPicker = ({ onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-2">
      <div className="flex flex-wrap gap-1 max-w-[240px]">
        {commonEmojis.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(emoji)}
            className="p-2 hover:bg-gray-100 rounded-lg text-xl transition-colors"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ReactionPicker; 