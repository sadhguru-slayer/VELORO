import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Tabs, List, Avatar, Tag, Button, Empty, Tooltip } from "antd";
import { FaHandshake, FaCheckCircle, FaTimesCircle, FaEye, FaCommentAlt } from "react-icons/fa";

const { TabPane } = Tabs;

const Collaborations = () => {
  const { userId, isEditable } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  
  // Dummy data for collaborations
  const collaborationsData = {
    active: [
      {
        id: 1,
        projectName: "E-commerce Website Redesign",
        clientName: "Global Retail Solutions",
        clientAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        startDate: "2023-10-15",
        endDate: "2023-12-30",
        status: "In Progress",
        role: "UI/UX Designer",
        progress: 65,
        lastActivity: "2023-11-20",
      },
      {
        id: 2,
        projectName: "Mobile App Development",
        clientName: "Tech Innovations Inc.",
        clientAvatar: "https://randomuser.me/api/portraits/women/28.jpg",
        startDate: "2023-09-01",
        endDate: "2024-01-15",
        status: "In Progress",
        role: "Frontend Developer",
        progress: 40,
        lastActivity: "2023-11-18",
      },
    ],
    completed: [
      {
        id: 3,
        projectName: "Corporate Website Overhaul",
        clientName: "Finance Experts Ltd.",
        clientAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
        startDate: "2023-05-10",
        endDate: "2023-08-20",
        status: "Completed",
        role: "Full Stack Developer",
        progress: 100,
        lastActivity: "2023-08-20",
        rating: 4.8,
      },
      {
        id: 4,
        projectName: "Social Media Dashboard",
        clientName: "Marketing Wizards",
        clientAvatar: "https://randomuser.me/api/portraits/women/63.jpg",
        startDate: "2023-03-15",
        endDate: "2023-06-30",
        status: "Completed",
        role: "Frontend Developer",
        progress: 100,
        lastActivity: "2023-06-30",
        rating: 5.0,
      },
    ],
    invitations: [
      {
        id: 5,
        projectName: "Healthcare Portal Development",
        clientName: "MediCare Solutions",
        clientAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
        invitedDate: "2023-11-15",
        expiryDate: "2023-11-30",
        budget: "$5,000 - $8,000",
        duration: "3 months",
        role: "Backend Developer",
      },
    ],
  };

  useEffect(() => {
    // In a real app, you would fetch the collaborations data here
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [userId]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <FaHandshake className="text-violet-600 text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">My Collaborations</h1>
        </div>

        <Card className="shadow-sm mb-8">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="font-medium"
          >
            <TabPane 
              tab={
                <span className="flex items-center">
                  Active Collaborations
                  <Tag color="blue" className="ml-2">{collaborationsData.active.length}</Tag>
                </span>
              } 
              key="active"
            >
              {collaborationsData.active.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={collaborationsData.active}
                  renderItem={item => (
                    <List.Item
                      key={item.id}
                      actions={[
                        <Button type="primary" icon={<FaEye />} className="bg-violet-600 hover:bg-violet-700 border-none">
                          View Project
                        </Button>,
                        <Button icon={<FaCommentAlt />}>
                          Message Client
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar src={item.clientAvatar} size={48} />}
                        title={
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-medium">{item.projectName}</span>
                            <Tag color="blue">{item.status}</Tag>
                          </div>
                        }
                        description={
                          <div>
                            <p className="text-gray-600">Client: {item.clientName}</p>
                            <p className="text-gray-600">Role: {item.role}</p>
                            <p className="text-gray-600">
                              Timeline: {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        }
                      />
                      <div className="mt-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm text-violet-600">{item.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-violet-600 h-2 rounded-full" 
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Last activity: {new Date(item.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description="No active collaborations found" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                />
              )}
            </TabPane>
            
            <TabPane 
              tab={
                <span className="flex items-center">
                  Completed
                  <Tag color="green" className="ml-2">{collaborationsData.completed.length}</Tag>
                </span>
              } 
              key="completed"
            >
              {collaborationsData.completed.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={collaborationsData.completed}
                  renderItem={item => (
                    <List.Item
                      key={item.id}
                      actions={[
                        <Button type="default" icon={<FaEye />}>
                          View Details
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar src={item.clientAvatar} size={48} />}
                        title={
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-medium">{item.projectName}</span>
                            <div className="flex items-center">
                              <div className="flex items-center mr-3">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span 
                                    key={star} 
                                    className={`text-lg ${star <= Math.round(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                                <span className="ml-1 text-gray-600">{item.rating}</span>
                              </div>
                              <Tag color="green">{item.status}</Tag>
                            </div>
                          </div>
                        }
                        description={
                          <div>
                            <p className="text-gray-600">Client: {item.clientName}</p>
                            <p className="text-gray-600">Role: {item.role}</p>
                            <p className="text-gray-600">
                              Timeline: {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description="No completed collaborations found" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                />
              )}
            </TabPane>
            
            <TabPane 
              tab={
                <span className="flex items-center">
                  Invitations
                  <Tag color="orange" className="ml-2">{collaborationsData.invitations.length}</Tag>
                </span>
              } 
              key="invitations"
            >
              {collaborationsData.invitations.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={collaborationsData.invitations}
                  renderItem={item => (
                    <List.Item
                      key={item.id}
                      actions={[
                        <Button 
                          type="primary" 
                          icon={<FaCheckCircle />} 
                          className="bg-green-600 hover:bg-green-700 border-none"
                        >
                          Accept
                        </Button>,
                        <Button 
                          danger 
                          icon={<FaTimesCircle />}
                        >
                          Decline
                        </Button>,
                        <Button icon={<FaEye />}>
                          View Details
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar src={item.clientAvatar} size={48} />}
                        title={
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-medium">{item.projectName}</span>
                            <Tag color="orange">Invitation</Tag>
                          </div>
                        }
                        description={
                          <div>
                            <p className="text-gray-600">Client: {item.clientName}</p>
                            <p className="text-gray-600">Role: {item.role}</p>
                            <p className="text-gray-600">Budget: {item.budget}</p>
                            <p className="text-gray-600">Duration: {item.duration}</p>
                            <p className="text-gray-600">
                              Invited: {new Date(item.invitedDate).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600">
                              Expires: {new Date(item.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description="No invitations found" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                />
              )}
            </TabPane>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};

export default Collaborations; 