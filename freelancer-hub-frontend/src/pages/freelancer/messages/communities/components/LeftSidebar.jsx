import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaPlusCircle, FaHashtag } from 'react-icons/fa';
import CreateCommunityModal from './modals/CreateCommunityModal';

const LeftSidebar = ({ isOpen, setIsOpen, userId }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('joined');

  const communities = {
    joined: [
      { id: 1, name: 'Design Hub', icon: '🎨', members: 1200, tags: ['UI/UX', 'Graphic Design'] },
      { id: 2, name: 'Dev Corner', icon: '💻', members: 2500, tags: ['React', 'Node.js'] },
    ],
    discover: [
      { id: 3, name: 'Marketing Pro', icon: '📢', members: 800, tags: ['Digital', 'SEO'] },
      { id: 4, name: 'Freelance Hub', icon: '🌐', members: 5000, tags: ['Remote', 'Jobs'] },
    ]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="w-80 border-r border-gray-200 bg-white flex flex-col"
        >
          {/* Search and Create */}
          <div className="p-4 space-y-3 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search communities..."
                className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500 border-none"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              <FaPlusCircle />
              <span>Create Community</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('joined')}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'joined'
                  ? 'text-teal-600 border-b-2 border-teal-500'
                  : 'text-gray-500'
              }`}
            >
              Joined
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'discover'
                  ? 'text-teal-600 border-b-2 border-teal-500'
                  : 'text-gray-500'
              }`}
            >
              Discover
            </button>
          </div>

          {/* Communities List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {communities[activeTab].map(community => (
              <div
                key={community.id}
                className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{community.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{community.name}</h3>
                    <p className="text-sm text-gray-500">{community.members} members</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {community.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <CreateCommunityModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeftSidebar; 