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
        <div className="relative bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-violet-100">
          <div className="flex items-center">
            <div className="bg-violet-100 p-4 rounded-xl mr-4">
              <FaHandshake className="text-violet-600 text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-violet-800 mb-1">Collaboration Hub</h1>
              <p className="text-violet-600">Manage your active projects and partnership opportunities</p>
            </div>
          </div>
        </div>

        <Card className="shadow-sm border-0">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="[&_.ant-tabs-tab]:text-violet-600 [&_.ant-tabs-ink-bar]:bg-violet-500"
            tabBarExtraContent={
              <Button 
                icon={<FaHandshake className="mr-2" />} 
                className="bg-violet-500 text-white hover:bg-violet-600"
              >
                New Proposal
              </Button>
            }
          >
            <TabPane 
              tab={
                <span className="flex items-center">
                  Active Projects
                  <Tag color="blue" className="ml-2 bg-blue-100 text-blue-600">
                    {collaborationsData.active.length}
                  </Tag>
                </span>
              } 
              key="active"
            >
              {collaborationsData.active.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={collaborationsData.active}
                  renderItem={item => (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <List.Item
                        className="hover:bg-violet-50 rounded-lg p-4 transition-all"
                        actions={[
                          <Button 
                            type="primary" 
                            icon={<FaEye />} 
                            className="bg-violet-500 hover:bg-violet-600 border-none"
                          >
                            Project Dashboard
                          </Button>,
                          <Button 
                            icon={<FaCommentAlt />} 
                            className="text-violet-600 border-violet-200 hover:bg-violet-100"
                          >
                            Client Chat
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={item.clientAvatar} size={64} className="border-2 border-violet-200" />}
                          title={
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-semibold text-violet-800">{item.projectName}</span>
                              <Tag className="bg-blue-100 text-blue-600 border-0">{item.status}</Tag>
                            </div>
                          }
                          description={
                            <div className="space-y-2">
                              <div className="flex items-center text-violet-600">
                                <span className="font-medium">Client:</span>
                                <span className="ml-2">{item.clientName}</span>
                              </div>
                              <div className="flex items-center text-violet-600">
                                <span className="font-medium">Role:</span>
                                <span className="ml-2">{item.role}</span>
                              </div>
                              <div className="flex items-center text-violet-600">
                                <span className="font-medium">Timeline:</span>
                                <span className="ml-2">
                                  {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          }
                        />
                        <div className="mt-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-violet-600">Project Progress</span>
                            <span className="text-sm text-violet-600">{item.progress}%</span>
                          </div>
                          <div className="w-full bg-violet-100 rounded-full h-3">
                            <motion.div 
                              className="bg-violet-500 h-3 rounded-full" 
                              style={{ width: `${item.progress}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <div className="flex justify-between mt-3">
                            <Tooltip title="Days remaining">
                              <span className="text-xs text-violet-500">
                                ⏳ {Math.ceil((new Date(item.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                              </span>
                            </Tooltip>
                            <span className="text-xs text-violet-500">
                              Last updated: {new Date(item.lastActivity).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </List.Item>
                    </motion.div>
                  )}
                />
              ) : (
                <Empty 
                  description={
                    <span className="text-violet-600">
                      No active projects - start a new collaboration!
                    </span>
                  } 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </TabPane>
            
            <TabPane 
              tab={
                <span className="flex items-center">
                  Completed Work
                  <Tag color="green" className="ml-2 bg-green-100 text-green-600">
                    {collaborationsData.completed.length}
                  </Tag>
                </span>
              } 
              key="completed"
            >
              {collaborationsData.completed.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={collaborationsData.completed}
                  renderItem={item => (
                    <div className="hover:bg-violet-50 rounded-lg p-4 transition-all">
                      <List.Item
                        actions={[
                          <Button 
                            icon={<FaEye />} 
                            className="text-violet-600 border-violet-200 hover:bg-violet-100"
                          >
                            View Case Study
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={item.clientAvatar} size={64} className="border-2 border-violet-200" />}
                          title={
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-semibold text-violet-800">{item.projectName}</span>
                              <div className="flex items-center">
                                <div className="flex items-center mr-4 bg-yellow-100 px-3 py-1 rounded-full">
                                  {[...Array(5)].map((_, i) => (
                                    <span 
                                      key={i} 
                                      className={`text-lg ${i < Math.round(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                  <span className="ml-2 text-yellow-700 font-medium">{item.rating}</span>
                                </div>
                                <Tag className="bg-green-100 text-green-600 border-0">{item.status}</Tag>
                              </div>
                            </div>
                          }
                          description={
                            <div className="space-y-2 text-violet-600">
                              <p><span className="font-medium">Client:</span> {item.clientName}</p>
                              <p><span className="font-medium">Role:</span> {item.role}</p>
                              <p><span className="font-medium">Duration:</span> {Math.ceil((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24))} days</p>
                            </div>
                          }
                        />
                      </List.Item>
                    </div>
                  )}
                />
              ) : (
                <Empty 
                  description={
                    <span className="text-violet-600">
                      Your completed projects will appear here
                    </span>
                  } 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </TabPane>
            
            <TabPane 
              tab={
                <span className="flex items-center">
                  New Opportunities
                  <Tag color="orange" className="ml-2 bg-orange-100 text-orange-600">
                    {collaborationsData.invitations.length}
                  </Tag>
                </span>
              } 
              key="invitations"
            >
              {collaborationsData.invitations.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={collaborationsData.invitations}
                  renderItem={item => (
                    <div className="hover:bg-violet-50 rounded-lg p-4 transition-all border-2 border-dashed border-violet-200">
                      <List.Item
                        actions={[
                          <Button 
                            type="primary" 
                            icon={<FaCheckCircle />} 
                            className="bg-green-500 hover:bg-green-600 border-none"
                          >
                            Accept
                          </Button>,
                          <Button 
                            danger 
                            icon={<FaTimesCircle />}
                            className="hover:border-red-500"
                          >
                            Decline
                          </Button>,
                          <Button 
                            icon={<FaEye />} 
                            className="text-violet-600 border-violet-200 hover:bg-violet-100"
                          >
                            Details
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={item.clientAvatar} size={64} className="border-2 border-violet-200" />}
                          title={
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-semibold text-violet-800">{item.projectName}</span>
                              <Tag className="bg-orange-100 text-orange-600 border-0">New Invitation</Tag>
                            </div>
                          }
                          description={
                            <div className="space-y-2 text-violet-600">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p><span className="font-medium">Client:</span> {item.clientName}</p>
                                  <p><span className="font-medium">Role:</span> {item.role}</p>
                                </div>
                                <div>
                                  <p><span className="font-medium">Budget:</span> {item.budget}</p>
                                  <p><span className="font-medium">Duration:</span> {item.duration}</p>
                                </div>
                              </div>
                              <div className="flex justify-between mt-2">
                                <span className="text-sm bg-violet-100 px-2 py-1 rounded">
                                  ⏳ Expires in {Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                                </span>
                                <span className="text-sm">
                                  Invited: {new Date(item.invitedDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    </div>
                  )}
                />
              ) : (
                <Empty 
                  description={
                    <span className="text-violet-600">
                      No current invitations - check back soon!
                    </span>
                  } 
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