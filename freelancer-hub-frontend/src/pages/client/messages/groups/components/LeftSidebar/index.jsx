import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaArchive, FaTimes } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';
import SearchBar from './SearchBar';
import GroupList from './GroupList';
import { dummyGroups } from '../../groups';
import { Modal } from 'antd';
import  AddMemberModal  from '../modals/AddMemberModal';
import CreateGroupModal from '../modals/CreateGroupModal';

const LeftSidebar = ({ 
  isOpen,
  onGroupSelect,
  selectedGroupId,
  selectedGroup,
  isMobile,
  onClose,
  onCreateGroup,
  onArchiveGroup
}) => {
  const isTablet = useMediaQuery({ query: '(max-width: 1024px)' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim());
      setNewGroupName('');
      setShowCreateModal(false);
    }
  };

  const filteredGroups = dummyGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${
        isMobile ? 'w-80' : isTablet ? 'w-64' : 'w-80'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <span className="bg-teal-500 w-2 h-2 rounded-full mr-2"></span>
          Groups
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaPlus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowArchiveModal(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArchive className="w-5 h-5" />
          </button>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 sticky top-16 bg-white/80 backdrop-blur-md z-10">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search groups..."
        />
      </div>

      {/* Group List */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence>
          <GroupList
            groups={filteredGroups}
            selectedGroupId={selectedGroupId}
            onGroupSelect={(groupId) => {
              onGroupSelect(groupId);
              if (isMobile) onClose();
            }}
          />
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAddMembers={(members) => {
          // Handle adding members
          setShowAddMemberModal(false);
        }}
        currentMembers={selectedGroup?.members || []}
        tier="starter"
      />

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateGroup={(groupData) => {
          // Handle group creation
          setShowCreateModal(false);
        }}
        tier="starter"
      />

      {/* Archive Modal */}
      <Modal
        title="Archived Groups"
        open={showArchiveModal}
        onCancel={() => setShowArchiveModal(false)}
        footer={null}
      >
        <div className="max-h-96 overflow-y-auto">
          {dummyGroups.filter(group => group.isArchived).map(group => (
            <div
              key={group.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
            >
              <span className="text-gray-700">{group.name}</span>
              <button
                onClick={() => onArchiveGroup(group.id, false)}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                Unarchive
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </motion.div>
  );
};

export default LeftSidebar; 