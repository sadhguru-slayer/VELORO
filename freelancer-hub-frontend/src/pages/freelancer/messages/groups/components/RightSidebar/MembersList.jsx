import React from 'react';
import { FaShieldAlt, FaWrench } from 'react-icons/fa';

const MembersList = ({ members = [] }) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-sm font-semibold mb-3">
        Members ({members.length})
      </h3>
      <div className="space-y-2">
        {members.map(member => (
          <div
            key={member.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full"
                />
                {member.isOnline && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <span className="text-sm text-gray-700">{member.name}</span>
            </div>
            {member.role === 'admin' && (
              <FaShieldAlt className="w-4 h-4 text-teal-500" />
            )}
            {member.role === 'moderator' && (
              <FaWrench className="w-4 h-4 text-blue-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersList; 