import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, notification, Checkbox } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FaTimes, FaCheck, FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { Empty, Spin, Avatar, Tooltip, Tag } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  GlobalOutlined,
  StarFilled,
  DollarCircleOutlined,
  ProjectOutlined
} from '@ant-design/icons';

const FConnectionRequests = ({ userId, role, isAuthenticated, isEditable }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const location = useLocation();
  const [activeComponent, setActiveComponent] = useState('');
  const [activeProfileComponent, setActiveProfileComponent] = useState('');

  const handleMenuClick = (component) => {
    if (component !== 'connections') {
      navigate('/freelancer/dashboard', { state: { component } });
    }
    setActiveComponent(component);
  };

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/freelancer/profile') {
      navigate('/freelancer/profile', { state: { profileComponent } });
    }
    setActiveProfileComponent(profileComponent);
  };

  // Fetch connections data
  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/freelancer/get_connection_requests', {
          headers: {
            'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          },
        });
        setConnections(response.data);
      } catch (error) {
        console.error("Error fetching connections", error);
        notification.error({ 
          message: 'Error loading connections',
          description: 'Failed to load connection requests. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const handleAccept = async (connectionId) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/freelancer/connections/${connectionId}/accept_connection/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          },
        }
      );

      if (response.data.status === 'accepted') {
        notification.success({
          message: 'Connection Accepted!',
          description: 'You have successfully accepted the connection request.',
          placement: 'bottomRight'
        });
        
        setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to accept the connection request.',
        placement: 'bottomRight'
      });
    }
  };

  const handleReject = async (connectionId) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/freelancer/connections/${connectionId}/reject_connection/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          },
        }
      );

      if (response.data.status === 'rejected') {
        notification.success({
          message: 'Connection Rejected',
          description: 'You have rejected the connection request.',
          placement: 'bottomRight'
        });
        
        setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to reject the connection request.',
        placement: 'bottomRight'
      });
    }
  };

  const format_timeStamp = (date) => {
    const dateObject = new Date(date);
    return dateObject.toLocaleString();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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

      <div className="flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-14 md:ml-14">
        <FHeader 
          userId={userId}
          role={role}
          isAuthenticated={isAuthenticated}
          isEditable={isEditable}
        />

        <div className="flex-1 overflow-auto p-4">
          <div className="w-full min-w-[320px] max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Header Section */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-indigo-900">Connection Requests</h1>
                    <p className="text-gray-600 mt-1">Review and manage your incoming connection requests</p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/freelancer/connections')}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 
                               transition-all duration-300 flex items-center gap-2"
                    >
                      <GlobalOutlined />
                      View All Connections
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Connections List */}
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Spin size="large" />
                  </div>
                ) : (
                  <AnimatePresence>
                    <div className="space-y-4">
                      {connections.length > 0 ? (
                        connections.map((connection, index) => (
                          <motion.div
                            key={connection.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-xl border border-gray-100 hover:shadow-md 
                                     transition-all duration-300 bg-white"
                          >
                            <div className="flex items-start gap-4">
                              <Avatar
                                size={64}
                                src={connection.profile_image}
                                icon={<UserOutlined />}
                                className="bg-gradient-to-br from-indigo-500 to-blue-600"
                              />

                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-lg font-semibold text-indigo-900">
                                      {connection.user_name}
                                    </h3>
                                    <p className="text-gray-600 mt-1">{connection.bio}</p>
                                    
                                    {/* Additional Client Info */}
                                    <div className="flex flex-wrap gap-3 mt-3">
                                      {connection.company && (
                                        <Tag color="blue" className="px-3 py-1">
                                          {connection.company}
                                        </Tag>
                                      )}
                                      {connection.industry && (
                                        <Tag color="cyan" className="px-3 py-1">
                                          {connection.industry}
                                        </Tag>
                                      )}
                                      {connection.projects_count && (
                                        <Tag icon={<ProjectOutlined />} color="green" className="px-3 py-1">
                                          {connection.projects_count} Projects
                                        </Tag>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-4 mt-3">
                                      <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <ClockCircleOutlined />
                                        {format_timeStamp(connection.created_at)}
                                      </div>
                                      {connection.rating && (
                                        <div className="flex items-center gap-1 text-sm text-yellow-500">
                                          <StarFilled />
                                          <span>{connection.rating.toFixed(1)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex gap-3">
                                    <Tooltip title="Accept Request">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleAccept(connection.id)}
                                        className="p-3 rounded-full bg-indigo-100 text-indigo-600 
                                                 hover:bg-indigo-200 transition-all duration-300"
                                      >
                                        <FaCheck className="text-lg" />
                                      </motion.button>
                                    </Tooltip>
                                    <Tooltip title="Reject Request">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleReject(connection.id)}
                                        className="p-3 rounded-full bg-red-100 text-red-600 
                                                 hover:bg-red-200 transition-all duration-300"
                                      >
                                        <FaTimes className="text-lg" />
                                      </motion.button>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-12"
                        >
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                              <div className="text-center">
                                <p className="text-gray-600 mb-4">No pending connection requests</p>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => navigate('/freelancer/browse-clients')}
                                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg 
                                           hover:bg-indigo-600 transition-all duration-300"
                                >
                                  Browse Clients
                                </motion.button>
                              </div>
                            }
                          />
                        </motion.div>
                      )}
                    </div>
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FConnectionRequests; 