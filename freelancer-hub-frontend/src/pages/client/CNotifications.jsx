import React, { useState, useEffect } from 'react';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import axios from 'axios'; // Import axios to make API requests
import Cookies from 'js-cookie';

const CNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  // Fetch notifications from the backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/notifications/', {
          headers: {
            Authorization: `Bearer ${Cookies.get('accessToken')}`
          }
        });
        console.log(response.data);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/notifications/${id}/mark-as-read/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('accessToken')}`
          }
        }
      );
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/notifications/${id}/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('accessToken')}`
        }
      });
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Filter notifications by type
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
            <div className="flex flex-col justify-between items-center mb-6 overflow-hidden gap-2">
              <h1 className="text-2xl font-bold text-teal-600">Notifications</h1>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`p-2 py-1 text-xs sm:p-3 sm:py-1 sm:text-sm md:p-3 md:py-2 md:text-base rounded-full ${filter === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('Messages')}
                  className={`p-2 py-1 text-xs sm:p-3 sm:py-1 sm:text-sm md:p-3 md:py-2 md:text-base rounded-lg ${filter === 'Messages' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setFilter('Payments')}
                  className={`p-2 py-1 text-xs sm:p-3 sm:py-1 sm:text-sm md:p-3 md:py-2 md:text-base rounded-lg ${filter === 'Payments' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Payments
                </button>
                <button
                  onClick={() => setFilter('Projects')}
                  className={`p-2 py-1 text-xs sm:p-3 sm:py-1 sm:text-sm md:p-3 md:py-2 md:text-base rounded-lg ${filter === 'Projects' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setFilter('Connections')}
                  className={`p-2 py-1 text-xs sm:p-3 sm:py-1 sm:text-sm md:p-3 md:py-2 md:text-base rounded-lg ${filter === 'Connections' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Connections
                </button>
                <button
                  onClick={() => setFilter('System')}
                  className={`p-2 py-1 text-xs sm:p-3 sm:py-1 sm:text-sm md:p-3 md:py-2 md:text-base rounded-lg ${filter === 'System' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  System
                </button>
                <button
                  onClick={() => setFilter('Collaborations')}
                  className={`p-2 py-1 text-xs sm:p-3 sm:py-1 sm:text-sm md:p-3 md:py-2 md:text-base rounded-lg ${filter === 'Collaborations' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Collaborations
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className={`p-4 rounded-lg ${notification.is_read ? 'bg-gray-50' : 'bg-teal-50'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-teal-600">{notification.title}</h3>
                      <p className="text-sm text-gray-600">{notification.notification_text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.is_read && (
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
