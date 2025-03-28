import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSearch, FaUserPlus, FaCheckCircle, FaUser } from 'react-icons/fa';
import { Modal, Spin, Empty } from 'antd';
import { useMediaQuery } from 'react-responsive';

const AddMemberModal = ({ 
  isOpen, 
  onClose, 
  onAddMembers, 
  currentMembers = [], 
  tier = 'starter',
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Example user data - replace with your actual data source
  const [allUsers, setAllUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Tier-based member limit
  const memberLimit = {
    starter: 10,
    pro: 25,
    elite: 100
  }[tier];

  // Fetch users on modal open
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Replace with your actual API call
      const users = await fetch('/api/users').then(res => res.json());
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Filter out current members and search users
  const availableUsers = allUsers
    .filter(user => !currentMembers.includes(user.id))
    .filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const handleToggleUser = (user) => {
    setSelectedUsers(prev => 
      prev.includes(user.id) 
        ? prev.filter(id => id !== user.id)
        : [...prev, user.id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddMembers(selectedUsers);
    setSelectedUsers([]);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <FaUserPlus className="text-violet-500" />
          <span>Add Members to Group</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={isMobile ? '90%' : '600px'}
      centered
      className="add-member-modal"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or skills..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>

        {/* User List */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoadingUsers ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : availableUsers.length > 0 ? (
            availableUsers.map(user => (
              <div
                key={user.id}
                onClick={() => handleToggleUser(user)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUsers.includes(user.id) 
                    ? 'bg-violet-50 border border-violet-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                      <FaUser className="text-violet-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                  {user.skills && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {selectedUsers.includes(user.id) && (
                  <FaCheckCircle className="w-5 h-5 text-violet-500 flex-shrink-0" />
                )}
              </div>
            ))
          ) : (
            <Empty
              description={
                <span className="text-gray-500">
                  No users found matching your search
                </span>
              }
              className="py-8"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-500">
            {selectedUsers.length} selected • {currentMembers.length}/{memberLimit} members
          </div>
          <div className="space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedUsers.length === 0 || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Spin size="small" />
              ) : (
                <>
                  <FaUserPlus className="w-4 h-4" />
                  <span>Add Members</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddMemberModal; 