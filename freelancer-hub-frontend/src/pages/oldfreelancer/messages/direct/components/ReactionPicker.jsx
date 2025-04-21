const ReactionPicker = ({ onSelect }) => {
  const reactions = ['👍', '👎', '❤️', '😂', '😮', '😢']; // Example reactions

  return (
    <div className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-lg border border-gray-100">
      {reactions.map((emoji, index) => (
        <button
          key={index}
          onClick={() => onSelect(emoji)}
          className="text-2xl hover:scale-110 transition-transform duration-200"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker; 