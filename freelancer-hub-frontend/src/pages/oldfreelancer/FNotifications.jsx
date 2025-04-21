import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Empty, Tooltip, Spin } from 'antd';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import axios from 'axios';
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

const FNotifications = ({ userId, role, isAuthenticated, isEditable }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [activeProfileComponent, setActiveProfileComponent] = useState('');
  const [activeComponent, setActiveComponent] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const token = Cookies.get('accessToken');
  const isMobile = useMediaQuery({ maxWidth: 767 });

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
    if (location.pathname !== '/freelancer/dashboard') {
      navigate('/freelancer/dashboard', { state: { component } });
    } else {
      setActiveComponent(component);
    }
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/freelancer/profile') {
      navigate(`/freelancer/profile/${userId}`, { state: { profileComponent } });
    } else {
      setActiveProfileComponent(profileComponent);
    }
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  // Fetch notifications
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
  }, [token]);

  // WebSocket connection
  useEffect(() => {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/?token=${token}`);
    
    socket.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        if (Array.isArray(notification)) return;

        if (notification && typeof notification === "object") {
          setNotifications(prevNotifications => {
            if (!prevNotifications.some(existing => existing.id === notification.notification_id)) {
              return [{
                id: notification.notification_id,
                notification_text: notification.notification_text,
                created_at: notification.created_at,
                related_model_id: notification.related_model_id,
                type: notification.type,
                is_read: false,
              }, ...prevNotifications];
            }
            return prevNotifications;
          });
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    return () => socket.close();
  }, [token]);

  // Mark notification as read
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

  // Delete notification
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

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' ? true : notification.type === filter
  );

  // Helper functions for connection requests
  const isConnectionRequest = (notification) => {
    return notification.type === 'Connections' && 
      notification.notification_text.toLowerCase().includes('received a connection request');
  };

  const hasUnreadConnectionRequests = notifications.some(
    notif => isConnectionRequest(notif) && !notif.is_read
  );

  // Mark all connection requests as read
  const markAllConnectionRequestsAsRead = async () => {
    try {
      const connectionRequestIds = notifications
        .filter(notif => isConnectionRequest(notif) && !notif.is_read)
        .map(notif => notif.id);

      await Promise.all(
        connectionRequestIds.map(id =>
          axios.patch(
            `http://127.0.0.1:8000/api/notifications/${id}/mark-as-read/`,
            {},
            { headers: { Authorization: `Bearer ${token}` }}
          )
        )
      );

      setNotifications(prev =>
        prev.map(notif =>
          connectionRequestIds.includes(notif.id)
            ? { ...notif, is_read: true }
            : notif
        )
      );

      navigate('/freelancer/connections_requests');
    } catch (error) {
      console.error('Error marking connection requests as read:', error);
    }
  };

  return (
    <div className={`flex h-screen bg-gradient-to-br from-gray-50 to-gray-100`}>
      <FSider 
        userId={userId}
        role={role}
        isAuthenticated={isAuthenticated}
        isEditable={isEditable}
        dropdown={true} 
        collapsed={true}
        handleMenuClick={handleMenuClick}
        abcds={activeComponent}
        handleProfileMenu={handleProfileMenu}
        activeProfileComponent={activeProfileComponent}
      />

      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'ml-0' : 'ml-14'}`}>
        <FHeader 
          userId={userId}
          role={role}
          isAuthenticated={isAuthenticated}
          isEditable={isEditable}
        />

        <div className={`flex-1 overflow-auto bg-gray-50 ${isMobile ? 'p-2' : 'p-4'}`}>
          <div className="w-full min-w-[320px] max-w-[1200px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${isMobile ? 'text-sm' : 'text-base'}`}
            >
              {/* Header Section */}
              <div className={`bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-4 ${isMobile ? 'text-sm' : 'p-6'}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'} text-indigo-900`}>
                      Notifications
                    </h1>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 
                                transition-all duration-300 ${isMobile ? 'text-sm' : ''}`}
                  onClick={() => setFilter('all')}
                    >
                      Clear All
                    </motion.button>
                  </div>

                  {/* Connection Requests Button */}
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
                        className="w-full p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 
                                  text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 
                                  transition-all duration-300 flex items-center justify-center gap-3 shadow-sm"
                      >
                        <TeamOutlined className="text-xl" />
                        <span className="font-medium">View All Connection Requests</span>
                        <Badge 
                          count={notifications.filter(notif => 
                            isConnectionRequest(notif) && !notif.is_read
                          ).length}
                          className="ml-2"
                        />
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Filter Buttons */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {filterCategories.map((category) => (
                      <motion.button
                        key={category.key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilter(category.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap 
                                  transition-all duration-300 ${filter === category.key 
                                    ? 'bg-indigo-500 text-white shadow-md' 
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-500 hover:text-indigo-500'
                                  } ${isMobile ? 'text-sm' : ''}`}
                      >
                        {category.icon}
                        <span>{category.label}</span>
                      </motion.button>
                    ))}
                  </div>
              </div>
            </div>

            {/* Notifications List */}
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
                          : 'bg-indigo-50 border-indigo-100'
                      } hover:shadow-md transition-all duration-300`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className={`p-3 rounded-full ${
                          notification.is_read ? 'bg-gray-50' : 'bg-indigo-100'
                        }`}>
                          {filterCategories.find(cat => cat.key === notification.type)?.icon}
                        </div>

                    <div className="flex-1">
                          <h3 className={`font-semibold mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                            {notification.title}
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
                            
                            <div className="flex gap-2">
                              {isConnectionRequest(notification) && !notification.is_read && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={async () => {
                                    await markAsRead(notification.id);
                                    navigate('/freelancer/connections_requests');
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white 
                                           rounded-lg hover:bg-indigo-600 transition-all duration-300 text-sm"
                                >
                                  <TeamOutlined />
                                  View Request
                                </motion.button>
                              )}
                    </div>
                  </div>
                </div>

                        <div className="flex flex-col gap-2">
                          {!notification.is_read && (
                            <Tooltip title="Mark as Read">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
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

export default FNotifications;