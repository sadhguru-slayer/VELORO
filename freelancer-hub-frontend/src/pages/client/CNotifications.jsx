import React, { useState } from 'react';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import { Link } from 'react-router-dom';

const CNotifications = () => {
  // Sample notifications data for the client
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'message',
      title: 'New Message from Freelancer A',
      description: 'You have a new message regarding your project.',
      timestamp: '1 hour ago',
      read: false,
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Confirmation',
      description: 'Payment of $1000 has been successfully processed.',
      timestamp: '2 hours ago',
      read: true,
    },
    {
      id: 3,
      type: 'project',
      title: 'Project Proposal Approved',
      description: 'Your project proposal for "E-commerce Site" has been approved.',
      timestamp: '1 day ago',
      read: false,
    },
    {
      id: 4,
      type: 'connection',
      title: 'New Connection Request',
      description: 'You have received a connection request from Freelancer B.',
      timestamp: '3 days ago',
      read: true,
    },
    {
      id: 5,
      type: 'system',
      title: 'Scheduled Maintenance',
      description: 'System maintenance is scheduled for tomorrow, 10 PM to 12 AM.',
      timestamp: '5 days ago',
      read: false,
    },
  ]);

  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Delete a notification
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  // Filter notifications by type
  const [filter, setFilter] = useState('all');
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <CSider dropdown={true} collapsed={true} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-16 md:ml-16 lg:ml-22">
        {/* Header */}
        <CHeader />

        {/* Notifications Content */}
        <div className="flex-1 overflow-auto bg-gray-200 p-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Notifications Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-teal-600">Notifications</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'all'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('message')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'message'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setFilter('payment')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'payment'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Payments
                </button>
                <button
                  onClick={() => setFilter('project')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'project'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setFilter('connection')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'connection'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Connections
                </button>
                <button
                  onClick={() => setFilter('system')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'system'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  System
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg ${
                    notification.read ? 'bg-gray-50' : 'bg-teal-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-teal-600">{notification.title}</h3>
                      <p className="text-sm text-gray-600">{notification.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-teal-600 hover:text-teal-700"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Notifications Message */}
            {filteredNotifications.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-600">No notifications found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CNotifications;
