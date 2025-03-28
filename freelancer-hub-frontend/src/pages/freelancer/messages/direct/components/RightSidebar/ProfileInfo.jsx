import React from 'react';

const ProfileInfo = ({ chat }) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Profile Information</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-12 h-12 rounded-full ring-2 ring-violet-500 ring-offset-2"
            />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              chat.online ? 'bg-violet-500' : 'bg-gray-300'
            }`} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800">{chat.name}</h4>
            <p className="text-sm text-gray-500">
              {chat.online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded-lg">
              {chat.email || 'Not available'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Phone</p>
            <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded-lg">
              {chat.phone || 'Not available'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo; 