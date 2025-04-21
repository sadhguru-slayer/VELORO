import { useState } from 'react';
import { dummyChats } from '../individual';

const useDirectChat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setMessages(chat?.messages || []);
  };

  const handleSendMessage = (newMessage) => {
    if (!selectedChat) return;
    
    const chat = dummyChats.find(chat => chat.id === selectedChat.id);
    if (chat) {
      chat.messages.push(newMessage);
      chat.lastMessage = newMessage.content;
      chat.timestamp = newMessage.timestamp;
      setMessages([...chat.messages]);
    }
  };

  const handleReactionAdd = (messageId, reaction) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const existingReactions = msg.reactions || [];
          const existingReactionIndex = existingReactions.findIndex(
            r => r.emoji === reaction.emoji
          );

          let updatedReactions;
          if (existingReactionIndex >= 0) {
            // Update existing reaction
            updatedReactions = existingReactions.map((r, i) => 
              i === existingReactionIndex ? reaction : r
            );
          } else {
            // Add new reaction
            updatedReactions = [...existingReactions, reaction];
          }

          return {
            ...msg,
            reactions: updatedReactions
          };
        }
        return msg;
      })
    );
  };

  const handleReactionRemove = (messageId, emoji) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const updatedReactions = (msg.reactions || [])
            .map(reaction => {
              if (reaction.emoji === emoji) {
                const newUsers = reaction.users.filter(user => user !== 'You');
                return {
                  ...reaction,
                  count: newUsers.length,
                  users: newUsers
                };
              }
              return reaction;
            })
            .filter(reaction => reaction.users.length > 0);
  
          return {
            ...msg,
            reactions: updatedReactions
          };
        }
        return msg;
      })
    );
  };

  return {
    selectedChat,
    messages,
    handleChatSelect,
    handleSendMessage,
    handleReactionAdd,
    handleReactionRemove,
  };
};

export default useDirectChat; 