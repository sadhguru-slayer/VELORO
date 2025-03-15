import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Empty, Tooltip, Spin } from 'antd';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import axios from 'axios'; // Import axios to make API requests
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import {
  BellOutlined,
  MessageOutlined,
  DollarOutlined,
  ProjectOutlined,
  TeamOutlined,
  SettingOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const CNotifications = ({ userId, role }) => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [activeProfileComponent, setActiveProfileComponent] = useState('');
  const [activeComponent, setActiveComponent] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const token = Cookies.get('accessToken'); 
  const isMobile = useMediaQuery({ maxWidth: 767 });
  
  // Filter categories with icons
  const filterCategories = [
    { key: 'all', label: 'All', icon: <BellOutlined /> },
    { key: 'Messages', label: 'Messages', icon: <MessageOutlined /> },
    { key: 'Payments', label: 'Payments', icon: <DollarOutlined /> },
    { key: 'Projects', label: 'Projects', icon: <ProjectOutlined /> },
    { key: 'Connections', label: 'Connections', icon: <TeamOutlined /> },
    { key: 'System', label: 'System', icon: <SettingOutlined /> },
    { key: 'Events', label: 'Events', icon: <CalendarOutlined /> },
    { key: 'Collaborations', label: 'Collaborations', icon: <UsergroupAddOutlined /> }
  ];

  const handleMenuClick = (component) => {
    
    if (location.pathname !== '/client/dashboard') {
      navigate('/client/dashboard', { state: { component } });
    } else {
      setActiveComponent(component);
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleProfileMenu = (profileComponent) => {
    
    if (location.pathname !== '/client/profile') {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
    }
    else {
      setActiveProfileComponent(profileComponent);
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/notifications/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(response.data)) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]); // Fetch on component mount

  // WebSocket to handle new notifications
  useEffect(() => {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/?token=${token}`);
  
    socket.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
  
        console.log(notification); // Check what data comes in
        
        if (Array.isArray(notification)) {
          return; // If it's an array, just return as we're expecting a single notification
        }
  
        // Check if the notification has the expected format
        if (
          notification &&
          typeof notification === "object" &&
          "notification_id" in notification &&
          "notification_text" in notification &&
          "created_at" in notification &&
          "related_model_id" in notification &&
          "type" in notification
        ) {
          // Update notifications state by adding new ones, preventing duplicates
          setNotifications(prevNotifications => {
            // Check if the notification already exists by its id
            if (!prevNotifications.some(existingNotification => existingNotification.id === notification.notification_id)) {
              // Add the new notification to the front of the list (most recent first)
              return [{
                id: notification.notification_id,
                notification_text: notification.notification_text,
                created_at: notification.created_at,
                related_model_id: notification.related_model_id,
                type: notification.type,
                is_read: false, // Assuming new notifications are unread by default
              }, ...prevNotifications];
            }
            return prevNotifications;
          });
          
        } else {
          console.warn("Invalid notification format:", notification);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };
  
    return () => {
      socket.close(); // Cleanup on unmount
    };
  }, [token]); // Re-run effect when token changes
  

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/notifications/${id}/mark-as-read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setNotifications(prev =>
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/notifications/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle clicking on an event notification title
  const handleEventClick = (eventId) => {
    // Navigate to the dashboard with the event component state
    console.log(eventId)
    navigate("/client/dashboard/", { state: { component: "upcoming-events" } });
  };

  // Filter notifications by type
  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' ? true : notification.type === filter
  );

  // Add this helper function to check if notification is a connection request
  const isConnectionRequest = (notification) => {
    return notification.type === 'Connections' && 
      notification.notification_text.toLowerCase().includes('received a connection request');
  };

  // Add this helper function to check for unread connection requests
  const hasUnreadConnectionRequests = notifications.some(
    notif => notif.type === 'Connections' && 
    !notif.is_read && 
    notif.notification_text.toLowerCase().includes('received a connection request')
  );

  // Add function to mark all connection request notifications as read
  const markAllConnectionRequestsAsRead = async () => {
    try {
      const connectionRequestIds = notifications
        .filter(notif => 
          notif.type === 'Connections' && 
          !notif.is_read && 
          notif.notification_text.toLowerCase().includes('received a connection request')
        )
        .map(notif => notif.id);

      // Mark all relevant notifications as read
      await Promise.all(
        connectionRequestIds.map(id =>
          axios.patch(
            `http://127.0.0.1:8000/api/notifications/${id}/mark-as-read/`,
            {},
            { headers: { Authorization: `Bearer ${token}` }}
          )
        )
      );

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          connectionRequestIds.includes(notif.id)
            ? { ...notif, is_read: true }
            : notif
        )
      );

      // Navigate to connection requests page
      navigate('/client/connections_requests');
    } catch (error) {
      console.error('Error marking connection requests as read:', error);
    }
  };

  return (
    <div className={`flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 `}>
      {/* Sidebar */}
      <CSider 
        userId={userId} 
        role={role} 
        dropdown={true} 
        collapsed={true} 
        handleMenuClick={handleMenuClick} 
        abcds={activeComponent} 
        handleProfileMenu={handleProfileMenu} 
        activeProfileComponent={activeProfileComponent}
      />
    
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'ml-0' : 'ml-14'}`}>  {/* Header */}
        <CHeader userId={userId}/>

        {/* Notifications Content */}
        <div className={`flex-1 overflow-auto bg-gray-50 ${isMobile ? 'p-2' : 'p-4'}`}>
          <div className="w-full min-w-[320px] max-w-[1200px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${isMobile ? 'text-sm' : 'text-base'}`}
            >
              {/* Enhanced Header Section */}
              <div className={`bg-gradient-to-r from-teal-500/10 to-charcolBlue/10 p-4 ${isMobile ? 'text-sm' : 'p-6'}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'} text-charcolBlue`}>Notifications</h1>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300 ${isMobile ? 'text-sm' : ''}`}
                      onClick={() => setFilter('all')}
                    >
                      Clear All
                    </motion.button>
                  </div>

                  {/* Connection Requests Button - Only show if there are unread connection requests */}
                  {hasUnreadConnectionRequests && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full"
                    >
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={markAllConnectionRequestsAsRead}
                        className="w-full p-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl 
                                  hover:from-teal-600 hover:to-teal-700 transition-all duration-300 
                                  flex items-center justify-center gap-3 shadow-sm"
                      >
                        <TeamOutlined className="text-xl" />
                        <span className="font-medium">View All Connection Requests</span>
                        <Badge 
                          count={notifications.filter(
                            notif => notif.type === 'Connections' && 
                            !notif.is_read && 
                            notif.notification_text.toLowerCase().includes('received a connection request')
                          ).length}
                          className="ml-2"
                        />
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Enhanced Filter Buttons */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {filterCategories.map((category) => (
                      <motion.button
                        key={category.key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilter(category.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300
                          ${filter === category.key 
                            ? 'bg-teal-500 text-white shadow-md' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-500 hover:text-teal-500'
                          } ${isMobile ? 'text-sm' : ''}`}
                      >
                        {category.icon}
                        <span>{category.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notifications List with Enhanced Styling */}
              <div className={`p-4 space-y-4 ${isMobile ? 'text-sm' : 'p-6'}`}>
                <AnimatePresence>
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border ${
                        notification.is_read 
                          ? 'bg-white border-gray-100' 
                          : 'bg-teal-50 border-teal-100'
                      } hover:shadow-md transition-all duration-300`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        {/* Notification Icon */}
                        <div className={`p-3 rounded-full ${
                          notification.is_read ? 'bg-gray-50' : 'bg-teal-100'
                        }`}>
                          {filterCategories.find(cat => cat.key === notification.type)?.icon}
                        </div>

                        {/* Notification Content */}
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                            {notification.type === 'Events' ? (
                              <span
                                className="cursor-pointer hover:text-teal-600 transition-colors"
                                onClick={() => handleEventClick(notification.related_model_id)}
                              >
                                {notification.title}
                              </span>
                            ) : (
                              notification.title
                            )}
                          </h3>
                          <div
                            className="text-gray-600"
                            dangerouslySetInnerHTML={{
                              __html: notification.notification_text,
                            }}
                          />
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <CalendarOutlined />
                              {new Date(notification.created_at).toLocaleString()}
                            </div>
                            
                            {/* Specialized Action Buttons Based on Notification Type */}
                            <div className="flex gap-2">
                              {isConnectionRequest(notification) && !notification.is_read && (
                                <motion.button
                                  initial={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={async () => {
                                    try {
                                      // Mark this specific notification as read
                                      await markAsRead(notification.id);
                                      // Then navigate to the connections requests page
                                      navigate('/client/connections_requests');
                                    } catch (error) {
                                      console.error('Error handling notification:', error);
                                    }
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300 text-sm"
                                >
                                  <TeamOutlined />
                                  View Request
                                </motion.button>
                              )}
                              {notification.type === 'Connections' && !isConnectionRequest(notification) && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => navigate('/client/connections')}
                                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300 text-sm"
                                >
                                  <TeamOutlined />
                                  View Connections
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          {!notification.is_read && (
                            <Tooltip title="Mark as Read">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200"
                              >
                                <CheckCircleOutlined />
                              </motion.button>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                            >
                              <DeleteOutlined />
                            </motion.button>
                          </Tooltip>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty State */}
                {filteredNotifications.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span className="text-gray-500">No notifications found</span>
                      }
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CNotifications;
