import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, notification, Checkbox } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import Cookies from 'js-cookie'
import axios from 'axios';
import { FaTimes,FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { Empty, Spin, Avatar, Tooltip } from 'antd';
import { UserOutlined, ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';


const CConnectionRequests = ({userId, role}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeComponent, setActiveComponent] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    skills: [],
    availability: '',
  });

  // Handle the navigation on menu item click
  const handleMenuClick = (component) => {
    if (component !== 'connections') {
      navigate('/client/dashboard', { state: { component } });
    }
  };

  const handleProfileMenu = (profileComponent) => {

    if (location.pathname !== '/client/profile') {
      navigate('/client/profile', { state: { profileComponent } });
    }
  };
  // Handle the filter change
  const handleFilterChange = (filterName, value) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  // Fetch connections data
  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/client/get_connection_requests',
          {
            headers: {
              'Authorization': `Bearer ${Cookies.get('accessToken')}`,
              },
              }
              );


        const connectionData = response.data;
        setConnections(connectionData);
      } catch (error) {
        console.error("Error fetching connections", error);
        notification.error({ message: 'Error loading connections.' });
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);


  const handleAccept = async (connectionId) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/client/connections/${connectionId}/accept_connection/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${Cookies.get('accessToken')}`, // Include auth token if necessary
          },
        }
      );
  
      // Check if connection is accepted
      if (response.data.status === 'accepted') {
        // Show success notification
        notification.success({ message: 'Connection Accepted!', description: `You have successfully accepted the connection.` });
        
        // Remove the accepted connection from the state
        setConnections((prevConnections) =>
          prevConnections.filter((connection) => connection.id !== connectionId)
        );
      } else {
        notification.error({ message: 'Failed to accept the connection.' });
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      notification.error({ message: 'Error accepting the connection.' });
    }
  };
  
  const handleReject = async (connectionId) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/client/connections/${connectionId}/reject_connection/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${Cookies.get('accessToken')}`, // Include auth token if necessary
          },
        }
      );
  
      // Check if connection is rejected
      if (response.data.status === 'rejected') {
        // Show success notification
        notification.success({ message: 'Connection Rejected!', description: `You have successfully rejected the connection.` });
  
        // Remove the rejected connection from the state
        setConnections((prevConnections) =>
          prevConnections.filter((connection) => connection.id !== connectionId)
        );
      } else {
        notification.error({ message: 'Failed to reject the connection.' });
      }
    } catch (error) {
      console.error('Error rejecting connection:', error);
      notification.error({ message: 'Error rejecting the connection.' });
    }
  };
  

  const format_timeStamp = (date)=>{
    const dateObject = new Date(date);
    return dateObject.toLocaleString();
  }

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <CSider 
        userId={userId} 
        role={role}
        dropdown={true} 
        collapsed={true} 
        handleMenuClick={handleMenuClick} 
        activeComponent={activeComponent} 
        handleProfileMenu={handleProfileMenu} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-14 md:ml-14">
        {/* Header */}
        <CHeader userId={userId}/>

        {/* Connections Content */}
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
                    <h1 className="text-2xl font-bold text-charcolBlue">Connection Requests</h1>
                    <p className="text-gray-600 mt-1">Manage your incoming connection requests</p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/client/connections')}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300 flex items-center gap-2"
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
                            className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 bg-white"
                          >
                            <div className="flex items-start gap-4">
                              {/* User Avatar */}
                              <Avatar
                                size={64}
                                icon={<UserOutlined />}
                                className="bg-gradient-to-br from-teal-500 to-teal-600"
                              />

                              {/* Connection Info */}
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-lg font-semibold text-charcolBlue">
                                      {connection.user_name}
                                    </h3>
                                    <p className="text-gray-600 mt-1">{connection.bio}</p>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                      <ClockCircleOutlined />
                                      {format_timeStamp(connection.created_at)}
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-3">
                                    <Tooltip title="Accept Request">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleAccept(connection.id)}
                                        className="p-3 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-all duration-300"
                                      >
                                        <FaCheck className="text-lg" />
                                      </motion.button>
                                    </Tooltip>
                                    <Tooltip title="Reject Request">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleReject(connection.id)}
                                        className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300"
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
                                  onClick={() => navigate('/client/browse-freelancers')}
                                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300"
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

export default CConnectionRequests;
