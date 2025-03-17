import React, { useState, useEffect } from 'react';
import { Empty, Spin, Avatar, Tooltip, Tag } from 'antd';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserOutlined, 
  StarFilled,
  ProjectOutlined,
  ClockCircleOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

const FConnections = ({ userId, role, isAuthenticated, isEditable }) => {
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);

  // Dummy data
  const dummyConnections = [
    {
      id: 1,
      name: "John Smith",
      role: "client",
      bio: "Tech startup founder looking for talented developers",
      company: "Tech Innovations Inc.",
      industry: "Technology",
      projectCount: 15,
      rating: 4.8,
      date: "2024-03-15T10:30:00Z"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "client",
      bio: "Digital marketing agency owner",
      company: "Digital Solutions",
      industry: "Marketing",
      projectCount: 8,
      rating: 4.5,
      date: "2024-03-14T15:20:00Z"
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "client",
      bio: "E-commerce business owner seeking web developers",
      company: "Global E-commerce",
      industry: "Retail",
      projectCount: 12,
      rating: 4.9,
      date: "2024-03-13T09:15:00Z"
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setConnections(dummyConnections);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <FSider 
    userId={userId}
    role={role}
    isAuthenticated={isAuthenticated}
    isEditable={isEditable}
    dropdown={true}
    collapsed={true}
    
    />

    <div className={`
        flex-1 flex flex-col overflow-hidden
        ${isMobile ? 'ml-0 pb-16' : 'ml-14 sm:ml-14 md:ml-14 lg:ml-14'}
      `}>
        <FHeader />

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
                    <h1 className="text-2xl font-bold text-indigo-900">Your Connections</h1>
                    <p className="text-gray-600 mt-1">Manage your client network</p>
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
                            key={connection.id}
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
                                icon={<UserOutlined />}
                                className="bg-gradient-to-br from-indigo-500 to-blue-600"
                              />

                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-indigo-600">
                                  {connection.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">{connection.bio}</p>

                                <div className="flex flex-wrap gap-2 mt-3">
                                  <Tag color="blue" className="px-2 py-1">
                                    {connection.company}
                                  </Tag>
                                  <Tag color="cyan" className="px-2 py-1">
                                    {connection.industry}
                                  </Tag>
                                  <Tag icon={<ProjectOutlined />} color="green" className="px-2 py-1">
                                    {connection.projectCount} Projects
                                  </Tag>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <ClockCircleOutlined />
                                      {formatDate(connection.date)}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-yellow-500">
                                      <StarFilled />
                                      <span>{connection.rating}</span>
                                    </div>
                                  </div>
                                  <Tooltip title="Send Message">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="p-2 rounded-full bg-indigo-100 text-indigo-600 
                                               hover:bg-indigo-200 transition-all duration-300"
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

export default FConnections;
