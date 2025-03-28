// ReactionPicker Component
import React from 'react';

const ReactionPicker = ({ onAddReaction, show }) => {
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  if (!show) return null;

  const handleEmojiClick = (emoji) => {
    onAddReaction(emoji); // Pass the clicked emoji back to the parent component
  };

  return (
    <div className="reaction-picker">
      <div className="flex space-x-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className="text-xl"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReactionPicker;
