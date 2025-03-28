import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, notification, Checkbox, Empty, Spin, Avatar, Tooltip, Tag } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import Cookies from 'js-cookie'
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserOutlined, 
  GlobalOutlined, 
  StarFilled,
  ProjectOutlined,
  ClockCircleOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

const CConnections = ({ userId, role }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const location = useLocation();
  const [activeComponent, setActiveComponent] = useState('');

  const handleMenuClick = (component) => {
    if (component !== 'connections') {
      navigate('/client/dashboard', { state: { component } });
    }
    setActiveComponent(component);
  };

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/client/profile') {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
    }
  };

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/client/get_connections', {
          headers: {
            'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          },
        });
        setConnections(response.data);
      } catch (error) {
        console.error("Error fetching connections", error);
        notification.error({ 
          message: 'Error loading connections',
          description: 'Failed to load your connections. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const format_timeStamp = (date) => {
    const dateObject = new Date(date);
    return dateObject.toLocaleString();
  };
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <CSider 
        userId={userId} 
        role={role}
        dropdown={true} 
        collapsed={true} 
        handleMenuClick={handleMenuClick} 
        activeComponent={activeComponent} 
        handleProfileMenu={handleProfileMenu} 
      />

      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${isMobile ? 'ml-0 pb-16' : 'ml-14 sm:ml-14 md:ml-14 lg:ml-14'}
      `}>
      <CHeader userId={userId}/>

        <div className="flex-1 overflow-auto p-4">
        <div className="w-full min-w-[320px] max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Enhanced Header Section */}
              <div className="bg-gradient-to-r from-teal-500/10 to-charcolBlue/10 p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-charcolBlue">Your Connections</h1>
                    <p className="text-gray-600 mt-1">Manage your professional network</p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/client/connection-requests')}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 
                               transition-all duration-300 flex items-center gap-2"
                    >
                      <GlobalOutlined />
                      View Connection Requests
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {connections.length > 0 ? (
                        connections.map((connection, index) => (
                          <motion.div
                            key={connection.user_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl border border-gray-100 hover:shadow-md 
                                     transition-all duration-300 bg-white"
                          >
                            <div className="flex items-start gap-4">
                              <Avatar
                                size={64}
                                src={connection.profile_picture}
                                icon={<UserOutlined />}
                                className="bg-gradient-to-br from-teal-500 to-teal-600"
                              />

                              <div className="flex-1">
                                <h3 
                                  onClick={() => navigate(`/${connection.role}/profile/${connection.user_id}/view_profile`)}
                                  className="text-lg font-semibold text-teal-600 cursor-pointer hover:text-teal-700"
                                >
                                  {connection.user_name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">{connection.bio}</p>

                                <div className="flex flex-wrap gap-2 mt-3">
                                  <Tag color="teal" className="px-2 py-1">
                                    {connection.role}
                                  </Tag>
                                  {connection.skills?.map((skill, idx) => (
                                    <Tag key={idx} color="blue" className="px-2 py-1">
                                      {skill}
                                    </Tag>
                                  ))}
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <ClockCircleOutlined />
                                    {format_timeStamp(connection.created_at)}
                                  </div>
                              
                                  <Tooltip title="Send Message">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => navigate('/client/messages/direct', { state: { userId: connection.user_id }})}
                                      className="p-2 rounded-full bg-teal-100 text-teal-600 
                                               hover:bg-teal-200 transition-all duration-300"
                                    >
                                      <MessageOutlined />
                                    </motion.button>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="col-span-full flex flex-col items-center justify-center py-12"
                        >
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                              <div className="text-center">
                                <p className="text-gray-600 mb-4">You have no connections yet</p>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => navigate('/client/browse-freelancers')}
                                  className="px-4 py-2 bg-teal-500 text-white rounded-lg 
                                           hover:bg-teal-600 transition-all duration-300"
                                >
                                  Browse Freelancers
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

export default CConnections;
