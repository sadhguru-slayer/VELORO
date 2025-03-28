import React, { useState } from 'react';
import { FaBars, FaEllipsisV, FaThumbtack, FaBell } from 'react-icons/fa';

const MainContent = ({ toggleLeftSidebar, toggleRightSidebar }) => {
  const [activeChannel, setActiveChannel] = useState('#general');

  const channels = [
    { id: 'general', name: 'General', unread: 0 },
    { id: 'announcements', name: 'Announcements', unread: 3 },
    { id: 'resources', name: 'Resources', unread: 1 },
  ];

  const rules = [
    "Be respectful and professional at all times",
    "No spam or self-promotion without permission",
    "Respect different timezones and response times",
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLeftSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaBars className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Design Hub</h2>
        </div>
        <button
          onClick={toggleRightSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FaEllipsisV className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Channel List and Content */}
      <div className="flex-1 flex">
        {/* Channels Sidebar */}
        <div className="w-60 border-r border-gray-200 bg-gray-50">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Channels
            </h3>
            <div className="space-y-1">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(`#${channel.id}`)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
                    activeChannel === `#${channel.id}`
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>#</span>
                    <span>{channel.name}</span>
                  </span>
                  {channel.unread > 0 && (
                    <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                      {channel.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Pinned Rules */}
          <div className="bg-yellow-50 p-4 border-b border-yellow-100">
            <div className="flex items-center space-x-2 mb-2">
              <FaThumbtack className="text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Community Rules</h4>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {rules.map((rule, index) => (
                <li key={index} className="text-sm text-yellow-700">
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Chat messages would go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent; 