const predefinedReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const generateMessage = (sender, content, isCurrentUser = false) => ({
  id: crypto.randomUUID(),
  sender,
  content,
  timestamp: new Date().toISOString(),
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(sender)}`,
  reactions: [],
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

const generateGroup = (id, name, initialMessages = []) => {
  const participants = [name, 'You'];
  
  const messagesWithReactions = initialMessages.map(message => {
    const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
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

  // Create members array based on participants
  const members = participants.map((participant, index) => ({
    id: index + 1,
    name: participant,
    avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
    isOnline: Math.random() > 0.5,
    role: index === 0 ? 'admin' : 'member'
  }));

  return {
    id,
    name,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
    isOnline: Math.random() > 0.5,
    lastMessage: initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].content : '',
    timestamp: new Date().toISOString(),
    isArchived: false,
    messages: messagesWithReactions,
    sharedFiles: [],
    members, // Add members array
    resources: [
      {
        id: 1,
        name: 'Project Plan',
        type: 'file'
      }
    ]
  };
};

const dummyGroups = [
  generateGroup(1, 'Project Alpha Team', [
    generateMessage('John Doe', 'Hey team! I\'ve just pushed the latest updates to the documentation.'),
    generateMessage('You', 'Great work! I\'ll review it this afternoon.', true),
    generateMessage('Alice Smith', 'I\'ll help with the testing.'),
    generateMessage('You', 'Thanks Alice! Let me know if you find any issues.', true)
  ]),
  generateGroup(2, 'Design Team', [
    generateMessage('Emily Davis', 'Here are the updated wireframes for the homepage design.'),
    generateMessage('You', 'These look great! I\'ll start working on the implementation.', true),
    generateMessage('Tom Green', 'I\'ll handle the mobile version.'),
    generateMessage('You', 'Perfect! Let\'s sync up tomorrow morning.', true)
  ]),
  generateGroup(3, 'Marketing Team', [
    generateMessage('George King', 'The new marketing campaign strategy draft is ready for review.'),
    generateMessage('You', 'I\'ll review it and provide feedback by tomorrow.', true),
    generateMessage('Nancy Adams', 'I\'ll prepare the social media assets.'),
    generateMessage('You', 'Great! Let me know if you need any help with that.', true)
  ])
];

// Message Management
export const deleteMessage = (groupId, messageId, currentUserId) => {
  const group = dummyGroups.find(group => group.id === groupId);
  if (!group) return null;

  const messageIndex = group.messages.findIndex(msg => msg.id === messageId);
  if (messageIndex === -1) return null;

  const message = group.messages[messageIndex];
  
  if (message.isCurrentUser) {
    const deletedMessage = group.messages.splice(messageIndex, 1)[0];
    if (group.messages.length > 0) {
      group.lastMessage = group.messages[group.messages.length - 1].content;
      group.timestamp = group.messages[group.messages.length - 1].timestamp;
    } else {
      group.lastMessage = '';
      group.timestamp = new Date().toISOString();
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
    originalGroupId: dummyGroups.find(group => 
      group.messages.some(msg => msg.id === message.id)
    )?.id
  });
};

export const restoreMessage = (messageId) => {
  const messageIndex = recycleBin.findIndex(msg => msg.id === messageId);
  if (messageIndex === -1) return false;

  const message = recycleBin[messageIndex];
  const group = dummyGroups.find(group => group.id === message.originalGroupId);
  
  if (group) {
    group.messages.push(message);
    group.lastMessage = message.content;
    group.timestamp = message.timestamp;
    recycleBin.splice(messageIndex, 1);
    return true;
  }
  
  return false;
};

// Group Utilities
export const addMessageToGroup = (groupId, message) => {
  const group = dummyGroups.find(group => group.id === groupId);
  if (group) {
    group.messages.push(message);
    group.lastMessage = message.content;
    group.timestamp = message.timestamp;
  }
};

export const markMessageAsRead = (groupId, messageId, userId) => {
  const group = dummyGroups.find(group => group.id === groupId);
  if (!group) return;

  const message = group.messages.find(msg => msg.id === messageId);
  if (message && !message.metadata.readBy.includes(userId)) {
    message.metadata.readBy.push(userId);
    if (!message.metadata.readAt) {
      message.metadata.readAt = new Date().toISOString();
    }
  }
};

export {
  dummyGroups,
  generateMessage,
  generateGroup,
};

export default dummyGroups;