import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUserPlus, FaImage, FaUsers, FaLock } from 'react-icons/fa';

export const CreateGroupModal = ({ isOpen, onClose, onCreateGroup, tier = 'starter' }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [groupType, setGroupType] = useState('public');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateGroup({
      name: groupName,
      description,
      image: selectedImage,
      type: groupType,
      tags
    });
    // Reset form
    setGroupName('');
    setDescription('');
    setSelectedImage(null);
    setGroupType('public');
    setTags([]);
    setNewTag('');
  };

  const handleAddTag = () => {
    if (newTag.trim() && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg w-full max-w-md"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Create New Group</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Enter group description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGroupType('public')}
                    className={`flex items-center justify-center p-3 rounded-lg border ${
                      groupType === 'public' 
                        ? 'border-violet-500 bg-violet-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <FaUsers className="w-5 h-5 mr-2" />
                    <span>Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupType('private')}
                    className={`flex items-center justify-center p-3 rounded-lg border ${
                      groupType === 'private' 
                        ? 'border-violet-500 bg-violet-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <FaLock className="w-5 h-5 mr-2" />
                    <span>Private</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (max 5)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span 
                      key={tag}
                      className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter(t => t !== tag))}
                        className="ml-1 hover:text-red-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    disabled={tags.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!newTag.trim() || tags.length >= 5}
                    className="ml-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Image
                </label>
                <div className="flex items-center space-x-4">
                  {selectedImage && (
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Group"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <label className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-gray-300 cursor-pointer hover:border-violet-500">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setSelectedImage(e.target.files[0])}
                    />
                    <FaImage className="w-6 h-6 text-gray-400" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 rounded-lg flex items-center space-x-2"
                >
                  <FaUserPlus className="w-4 h-4" />
                  <span>Create Group</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal; 