import { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  dummyGroups,
  addMessageToGroup,
  deleteMessage,
  markMessageAsRead,
  generateMessage
} from '../groups';

export const useGroupChat = () => {
  const { isMobile } = useOutletContext();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pinnedMessagesMap, setPinnedMessagesMap] = useState({});
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  const handleGroupSelect = (groupId) => {
    const group = dummyGroups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setMessages(group.messages || []);
    } else {
      setSelectedGroup(null);
      setMessages([]);
    }
  };

  const handleSendMessage = useCallback((messageContent) => {
    if (!selectedGroup) return;
    
    const newMessage = generateMessage('You', messageContent, true);
    addMessageToGroup(selectedGroup.id, newMessage);
    setMessages(prev => [...prev, newMessage]);
  }, [selectedGroup]);

  const handleReactionAdd = useCallback((messageId, reaction) => {
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
  }, []);

  const handleReactionRemove = useCallback((messageId, emoji) => {
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
  }, []);

  const handlePinMessage = useCallback((message, groupId) => {
    if (!groupId) return;

    setPinnedMessagesMap(prev => {
      const groupPins = prev[groupId] || [];
      const isPinned = groupPins.some(pin => pin.id === message.id);

      if (isPinned) {
        // Unpin the message
        return {
          ...prev,
          [groupId]: groupPins.filter(pin => pin.id !== message.id)
        };
      } else {
        // Pin the message
        return {
          ...prev,
          [groupId]: [...groupPins, { ...message, groupId }]
        };
      }
    });
  }, []);

  const handleUnpinMessage = useCallback((messageId) => {
    if (!selectedGroup) return;

    setPinnedMessagesMap(prev => ({
      ...prev,
      [selectedGroup.id]: prev[selectedGroup.id]?.filter(
        msg => msg.id !== messageId
      ) || []
    }));
  }, [selectedGroup]);

  const handleScrollToMessage = (messageId) => {
    // Implementation
  };

  const handleCreateGroup = useCallback((groupData) => {
    // Implement group creation logic
    setShowCreateModal(false);
  }, []);

  const handleAddMember = useCallback((members) => {
    // Implement add member logic
    setShowAddMemberModal(false);
  }, []);

  const getPinnedMessages = useCallback((groupId) => {
    return pinnedMessagesMap[groupId] || [];
  }, [pinnedMessagesMap]);

  const isMessagePinned = useCallback((messageId, groupId) => {
    return (pinnedMessagesMap[groupId] || []).some(pin => pin.id === messageId);
  }, [pinnedMessagesMap]);

  return {
    leftSidebarOpen,
    rightSidebarOpen,
    showCreateModal,
    showAddMemberModal,
    selectedGroup,
    messages,
    pinnedMessages: selectedGroup ? pinnedMessagesMap[selectedGroup.id] || [] : [],
    showLeftSidebar,
    showRightSidebar,
    showCreateGroupModal,
    handleGroupSelect,
    handleSendMessage,
    handleReactionAdd,
    handleReactionRemove,
    handlePinMessage,
    handleUnpinMessage,
    handleScrollToMessage,
    handleCreateGroup,
    handleAddMember,
    setShowCreateModal,
    setShowAddMemberModal,
    setRightSidebarOpen,
    setLeftSidebarOpen,
    setShowLeftSidebar,
    setShowRightSidebar,
    setShowCreateGroupModal,
    setShowAddMemberModal,
    getPinnedMessages,
    isMessagePinned
  };
};

export default useGroupChat; 