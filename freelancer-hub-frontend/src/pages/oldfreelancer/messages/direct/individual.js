const predefinedReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];
const generateMessage = (sender, content, isCurrentUser = false) => ({
  id: crypto.randomUUID(),
  sender,
  content,
  timestamp: new Date().toISOString(),
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(sender)}`,
  reactions: [], // Start with no reactions
  isCurrentUser,
  isPinned: false,
  isEdited: false,
  attachments: [],
  metadata: {
    readBy: [],
    deliveredAt: new Date().toISOString(),
    readAt: null
  }
});

// Helper function to get chat participants
const getChatParticipants = (chatId) => {
  const chat = dummyChats.find(chat => chat.id === chatId);
  if (!chat) return [];
  return [chat.name, 'You']; // Assuming 'You' is always a participant
};



const generateChat = (id, name, initialMessages = []) => {
  const participants = [name, 'You'];
  
  const messagesWithReactions = initialMessages.map(message => {
    // Get a random participant for a single reaction
    const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
    
    // Only add one reaction per message, with 50% probability
    const reactions = Math.random() > 0.5 ? [{
      emoji: predefinedReactions[Math.floor(Math.random() * predefinedReactions.length)],
      count: 1,
      users: [randomParticipant]
    }] : [];
    
    return {
      ...message,
      reactions
    };
  });

  return {
    id,
    name,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
    online: Math.random() > 0.5,
    lastMessage: initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].content : '',
    timestamp: new Date().toISOString(),
    isArchived: false,
    messages: messagesWithReactions,
    sharedFiles: []
  };
};

// Chat Data
export const dummyChats = [
  generateChat(1, 'John Doe', [
    generateMessage('John Doe', 'Hi there!'),
    generateMessage('You', 'Hello John! How are you?', true),
    generateMessage('John Doe', 'I\'m good, thanks! How about you?'),
    generateMessage('You', 'I\'m doing great. Just working on the project.', true),
    generateMessage('John Doe', 'Sounds good! Let me know if you need any help.')
  ]),
  generateChat(2, 'Jane Smith', [
    generateMessage('Jane Smith', 'Can you send me the design files?'),
    generateMessage('You', 'Sure, I\'ll send them right away.', true),
    generateMessage('Jane Smith', 'Thanks! I\'ll review them and get back to you.'),
    generateMessage('You', 'No problem. Let me know if you need any changes.', true)
  ]),
  generateChat(3, 'Michael Brown', [
    generateMessage('Michael Brown', 'Let\'s schedule a meeting for next week.'),
    generateMessage('You', 'How about Tuesday at 10 AM?', true),
    generateMessage('Michael Brown', 'That works for me. See you then!'),
    generateMessage('You', 'Great! I\'ll send you a calendar invite.', true)
  ])
];

// Message Management
export const deleteMessage = (chatId, messageId, currentUserId) => {
  const chat = dummyChats.find(chat => chat.id === chatId);
  if (!chat) return null;

  const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
  if (messageIndex === -1) return null;

  const message = chat.messages[messageIndex];
  
  // Only allow deletion if the message belongs to the current user
  if (message.isCurrentUser) {
    const deletedMessage = chat.messages.splice(messageIndex, 1)[0];
    // Update last message if needed
    if (chat.messages.length > 0) {
      chat.lastMessage = chat.messages[chat.messages.length - 1].content;
      chat.timestamp = chat.messages[chat.messages.length - 1].timestamp;
    } else {
      chat.lastMessage = '';
      chat.timestamp = new Date().toISOString();
    }
    return deletedMessage;
  }
  return null;
};

// Recycle Bin Management
export const recycleBin = [];

export const addToRecycleBin = (message) => {
  recycleBin.push({ 
    ...message, 
    deletedAt: new Date().toISOString(),
    originalChatId: dummyChats.find(chat => 
      chat.messages.some(msg => msg.id === message.id)
    )?.id
  });
};

export const restoreMessage = (messageId) => {
  const messageIndex = recycleBin.findIndex(msg => msg.id === messageId);
  if (messageIndex === -1) return false;

  const message = recycleBin[messageIndex];
  const chat = dummyChats.find(chat => chat.id === message.originalChatId);
  
  if (chat) {
    chat.messages.push(message);
    chat.lastMessage = message.content;
    chat.timestamp = message.timestamp;
    recycleBin.splice(messageIndex, 1);
    return true;
  }
  
  return false;
};

// Chat Utilities
export const toggleRightSidebar = (isOpen, setIsOpen) => {
  setIsOpen(!isOpen);
};

export const addMessageToChat = (chatId, message) => {
  const chat = dummyChats.find(chat => chat.id === chatId);
  if (chat) {
    chat.messages.push(message);
    chat.lastMessage = message.content;
    chat.timestamp = message.timestamp;
  }
};

export const markMessageAsRead = (chatId, messageId, userId) => {
  const chat = dummyChats.find(chat => chat.id === chatId);
  if (!chat) return;

  const message = chat.messages.find(msg => msg.id === messageId);
  if (message && !message.metadata.readBy.includes(userId)) {
    message.metadata.readBy.push(userId);
    if (!message.metadata.readAt) {
      message.metadata.readAt = new Date().toISOString();
    }
  }
}; 