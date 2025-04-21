import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Avatar, Button, Input, Tabs, Empty, List, Tag, Tooltip, Dropdown, Menu, Progress, Row, Col, DatePicker } from "antd";
import { FaUserPlus, FaSearch, FaEllipsisH, FaUserMinus, FaEnvelope, FaUserCheck, FaUserClock, FaHandshake } from "react-icons/fa";
import { IoSchoolOutline, IoPeopleCircle } from "react-icons/io5";
import { RiGraduationCapFill } from "react-icons/ri";
import { DownloadOutlined, ReloadOutlined, FilterOutlined } from "@ant-design/icons";
import { faker } from "@faker-js/faker";

const { TabPane } = Tabs;
const { Search } = Input;
const { RangePicker } = DatePicker;

// Enhanced connection card with analytics
const ConnectionCard = ({ item, role, onAction }) => (
  <motion.div 
    whileHover={{ y: -5 }} 
    className="h-full"
  >
    <Card
      className="h-full shadow-sm hover:shadow-lg transition-all duration-300 border-none bg-violet-50"
      actions={[
        <Button 
          type="primary" 
          icon={<FaEnvelope />}
          className="bg-violet-500 hover:bg-violet-600 border-none"
        >
          Message
        </Button>,
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view-profile">View Full Profile</Menu.Item>
              <Menu.Item key="remove">Remove Connection</Menu.Item>
              {role === 'student' && (
                <Menu.Item key="academic">Academic History</Menu.Item>
              )}
            </Menu>
          }
        >
          <Button icon={<FaEllipsisH />} />
        </Dropdown>
      ]}
    >
      <div className="flex flex-col items-center text-center">
        <Avatar src={item.avatar} size={80} className="mb-4" />
        <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
        <p className="text-gray-600">{item.title}</p>
        
        {/* Connection Strength Indicator */}
        <div className="w-full mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Connection Strength</span>
            <span>{faker.number.int({ min: 60, max: 100 })}%</span>
          </div>
          <Progress 
            percent={faker.number.int({ min: 60, max: 100 })} 
            showInfo={false}
            strokeColor="#8B5CF6"
            className="text-violet-400"
          />
        </div>

        {/* Mutual Interests/Skills */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {['React', 'Node.js', 'UI/UX'].map(skill => (
            <Tag key={skill} color="violet">{skill}</Tag>
          ))}
        </div>

        {/* Student-specific Badges */}
        {role === 'student' && (
          <div className="mt-4 space-y-1">
            <Tag icon={<IoSchoolOutline />} color="blue">
              {faker.helpers.arrayElement(['CS Student', 'TalentRise Scholar'])}
            </Tag>
            <Tag icon={<IoPeopleCircle />} color="green">
              {faker.number.int({ min: 2, max: 5 })} Shared Courses
            </Tag>
          </div>
        )}
      </div>
    </Card>
  </motion.div>
);

const Connections = () => {
  const { userId, isEditable, role } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("connections");
  
  // Dummy data for connections
  const connectionsData = [
    {
      id: 1,
      name: "Emma Wilson",
      title: "UX Designer",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      connected: true,
    },
    {
      id: 2,
      name: "James Rodriguez",
      title: "Frontend Developer",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
      connected: true,
    },
    {
      id: 3,
      name: "Sophia Chen",
      title: "Project Manager",
      avatar: "https://randomuser.me/api/portraits/women/23.jpg",
      connected: true,
    },
    {
      id: 4,
      name: "David Kim",
      title: "Mobile Developer",
      avatar: "https://randomuser.me/api/portraits/men/56.jpg",
      connected: true,
    },
  ];
  
  // Dummy data for pending requests
  const pendingData = [
    {
      id: 5,
      name: "Olivia Taylor",
      title: "Content Strategist",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      pending: true,
      sentByMe: false,
    },
    {
      id: 6,
      name: "Noah Martinez",
      title: "Backend Developer",
      avatar: "https://randomuser.me/api/portraits/men/33.jpg",
      pending: true,
      sentByMe: true,
    },
  ];
  
  // Dummy data for suggested connections
  const suggestedData = [
    {
      id: 7,
      name: "Ava Johnson",
      title: "UI Designer",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      mutualConnections: 3,
    },
    {
      id: 8,
      name: "Liam Thompson",
      title: "DevOps Engineer",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      mutualConnections: 2,
    },
    {
      id: 9,
      name: "Isabella Garcia",
      title: "Data Scientist",
      avatar: "https://randomuser.me/api/portraits/women/17.jpg",
      mutualConnections: 5,
    },
    {
      id: 10,
      name: "Mason Lee",
      title: "Full Stack Developer",
      avatar: "https://randomuser.me/api/portraits/men/91.jpg",
      mutualConnections: 1,
    },
  ];

  // Add student-specific dummy data
  const universityNetworkData = role === 'student' ? [
    {
      id: 11,
      name: "Professor Smith",
      title: "Computer Science Dept.",
      avatar: "https://randomuser.me/api/portraits/men/65.jpg",
      type: "faculty",
      courses: ["Machine Learning", "Algorithms"]
    },
    {
      id: 12,
      name: "Classmate Sarah",
      title: "Computer Science Student",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      type: "student",
      mutualCourses: 3
    }
  ] : [];

  const [connections, setConnections] = useState(connectionsData);
  const [pendingRequests, setPendingRequests] = useState(pendingData);
  const [suggestedConnections, setSuggestedConnections] = useState(suggestedData);

  useEffect(() => {
    // In a real app, you would fetch the connections data here
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [userId]);

  const handleSearch = (value) => {
    setSearchText(value);
    
    // Filter connections based on search text
    if (value) {
      const filteredConnections = connectionsData.filter(
        conn => conn.name.toLowerCase().includes(value.toLowerCase()) || 
                conn.title.toLowerCase().includes(value.toLowerCase())
      );
      setConnections(filteredConnections);
      
      const filteredPending = pendingData.filter(
        conn => conn.name.toLowerCase().includes(value.toLowerCase()) || 
                conn.title.toLowerCase().includes(value.toLowerCase())
      );
      setPendingRequests(filteredPending);
      
      const filteredSuggested = suggestedData.filter(
        conn => conn.name.toLowerCase().includes(value.toLowerCase()) || 
                conn.title.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestedConnections(filteredSuggested);
    } else {
      // Reset to original data
      setConnections(connectionsData);
      setPendingRequests(pendingData);
      setSuggestedConnections(suggestedData);
    }
  };

  const handleConnect = (id) => {
    // In a real app, you would send a connection request to the backend
    const newSuggested = suggestedConnections.filter(conn => conn.id !== id);
    setSuggestedConnections(newSuggested);
    
    const connToAdd = suggestedData.find(conn => conn.id === id);
    if (connToAdd) {
      setPendingRequests([
        ...pendingRequests,
        {
          ...connToAdd,
          pending: true,
          sentByMe: true
        }
      ]);
    }
  };

  const handleAccept = (id) => {
    // In a real app, you would accept the connection request via the backend
    const connToAccept = pendingRequests.find(conn => conn.id === id);
    if (connToAccept) {
      setConnections([
        ...connections,
        {
          ...connToAccept,
          connected: true,
          pending: false
        }
      ]);
      
      setPendingRequests(pendingRequests.filter(conn => conn.id !== id));
    }
  };

  const handleReject = (id) => {
    // In a real app, you would reject the connection request via the backend
    setPendingRequests(pendingRequests.filter(conn => conn.id !== id));
  };

  const handleRemoveConnection = (id) => {
    // In a real app, you would remove the connection via the backend
    setConnections(connections.filter(conn => conn.id !== id));
  };

  const handleCancelRequest = (id) => {
    // In a real app, you would cancel the connection request via the backend
    setPendingRequests(pendingRequests.filter(conn => conn.id !== id));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Update header gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-100 to-indigo-100 p-8 shadow-lg mb-8 border border-violet-200">
          <div className="relative z-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-violet-800 mb-2">Professional Network</h1>
                <p className="text-violet-600 text-lg">
                  {role === 'student' ? 'Academic and Professional Connections' : 'Manage your professional relationships'}
                </p>
              </div>
              <div className="flex gap-4">
                <RangePicker className="border-violet-200" />
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  className="bg-violet-500 text-white hover:bg-violet-600"
                >
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Update search bar styling */}
        <div className="mb-6">
          <Search
            placeholder="Search connections..."
            allowClear
            enterButton={<FaSearch className="text-violet-600" />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            className="[&_.ant-input]:border-violet-200 [&_.ant-input]:rounded-lg"
          />
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="font-medium [&_.ant-tabs-tab]:text-violet-600 [&_.ant-tabs-ink-bar]:bg-violet-500"
        >
          <TabPane 
            tab={
              <span className="flex items-center">
                Connections
                <Tag color="blue" className="ml-2">{connections.length}</Tag>
              </span>
            } 
            key="connections"
          >
            {connections.length > 0 ? (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                dataSource={connections}
                renderItem={item => (
                  <List.Item>
                    <Card 
                      className="shadow-sm hover:shadow-md transition-shadow duration-300 bg-violet-50"
                      actions={[
                        <Button 
                          type="primary" 
                          icon={<FaEnvelope className="mr-2" />}
                          className="bg-violet-500 hover:bg-violet-600 border-none"
                        >
                          Message
                        </Button>,
                        <Dropdown
                          overlay={
                            <Menu>
                              <Menu.Item key="message" icon={<FaEnvelope />}>
                                Message
                              </Menu.Item>
                              <Menu.Item 
                                key="remove" 
                                icon={<FaUserMinus />}
                                onClick={() => handleRemoveConnection(item.id)}
                                danger
                              >
                                Remove Connection
                              </Menu.Item>
                            </Menu>
                          }
                          trigger={['click']}
                        >
                          <Button type="text" icon={<FaEllipsisH />} />
                        </Dropdown>
                      ]}
                    >
                      <div className="flex flex-col items-center text-center">
                        <Avatar src={item.avatar} size={80} className="mb-4" />
                        <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                        <p className="text-gray-600">{item.title}</p>
                        <div className="mt-2">
                          {item.type === 'student' && (
                            <Tag icon={<IoSchoolOutline />} color="blue" className="mb-1">
                              Student Member
                            </Tag>
                          )}
                          <Tag color={item.connected ? "green" : "orange"}>
                            {item.connected ? "Connected" : "Pending"}
                          </Tag>
                        </div>
                        {role === 'student' && item.academicInfo && (
                          <div className="mt-2 text-sm text-gray-500">
                            <p>📚 {item.academicInfo.major}</p>
                            <p>🏫 {item.academicInfo.university}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="No connections found" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            )}
          </TabPane>
          
          <TabPane 
            tab={
              <span className="flex items-center">
                Pending
                <Tag color="orange" className="ml-2">{pendingRequests.length}</Tag>
              </span>
            } 
            key="pending"
          >
            {pendingRequests.length > 0 ? (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                dataSource={pendingRequests}
                renderItem={item => (
                  <List.Item>
                    <Card 
                      className="shadow-sm hover:shadow-md transition-shadow duration-300 bg-violet-50"
                      actions={
                        item.sentByMe ? [
                          <Button 
                            danger
                            onClick={() => handleCancelRequest(item.id)}
                          >
                            Cancel Request
                          </Button>
                        ] : [
                          <Button 
                            type="primary" 
                            icon={<FaUserCheck className="mr-2" />}
                            onClick={() => handleAccept(item.id)}
                            className="bg-green-600 hover:bg-green-700 border-none"
                          >
                            Accept
                          </Button>,
                          <Button 
                            danger
                            onClick={() => handleReject(item.id)}
                          >
                            Decline
                          </Button>
                        ]
                      }
                    >
                      <div className="flex flex-col items-center text-center">
                        <Avatar src={item.avatar} size={80} className="mb-4" />
                        <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                        <p className="text-gray-600">{item.title}</p>
                        <Tag color="orange" className="mt-2">
                          {item.sentByMe ? "Request Sent" : "Request Received"}
                        </Tag>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="No pending requests" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            )}
          </TabPane>
          
          <TabPane 
            tab={
              <span className="flex items-center">
                Suggestions
                <Tag color="purple" className="ml-2">{suggestedConnections.length}</Tag>
              </span>
            } 
            key="suggestions"
          >
            {suggestedConnections.length > 0 ? (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                dataSource={suggestedConnections}
                renderItem={item => (
                  <List.Item>
                    <Card 
                      className="shadow-sm hover:shadow-md transition-shadow duration-300 bg-violet-50"
                      actions={[
                        <Button 
                          type="primary" 
                          icon={<FaUserPlus className="mr-2" />}
                          onClick={() => handleConnect(item.id)}
                          className="bg-violet-500 hover:bg-violet-600 border-none"
                        >
                          Connect
                        </Button>
                      ]}
                    >
                      <div className="flex flex-col items-center text-center">
                        <Avatar src={item.avatar} size={80} className="mb-4" />
                        <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                        <p className="text-gray-600">{item.title}</p>
                        <p className="text-violet-600 text-sm mt-2">
                          {item.mutualConnections} mutual connection{item.mutualConnections !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="No suggestions found" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            )}
          </TabPane>
          
          {role === 'student' && (
            <TabPane 
              tab={
                <span className="flex items-center">
                  <IoSchoolOutline className="mr-2" />
                  University Network
                  <Tag color="purple" className="ml-2">{universityNetworkData.length}</Tag>
                </span>
              } 
              key="university"
            >
              {universityNetworkData.length > 0 ? (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                  dataSource={universityNetworkData}
                  renderItem={item => (
                    <List.Item>
                      <Card 
                        className="shadow-sm hover:shadow-md transition-shadow duration-300 bg-violet-50"
                        actions={[
                          <Button 
                            type="primary" 
                            icon={<FaEnvelope className="mr-2" />}
                            className="bg-violet-500 hover:bg-violet-600 border-none"
                          >
                            Message
                          </Button>,
                          <Button 
                            icon={<FaUserPlus className="mr-2" />}
                            className="border-violet-300 text-violet-600 hover:bg-violet-100"
                          >
                            Connect
                          </Button>
                        ]}
                      >
                        <div className="flex flex-col items-center text-center">
                          <Avatar src={item.avatar} size={80} className="mb-4" />
                          <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                          <p className="text-gray-600">{item.title}</p>
                          <div className="mt-2 space-y-1">
                            {item.type === 'faculty' ? (
                              <Tag icon={<RiGraduationCapFill />} color="blue">
                                Teaches {item.courses.join(', ')}
                              </Tag>
                            ) : (
                              <Tag icon={<IoPeopleCircle />} color="green">
                                {item.mutualCourses} Shared Courses
                              </Tag>
                            )}
                            {role === 'student' && (
                              <Tag color="geekblue" className="mt-1">
                                <IoSchoolOutline className="mr-1" />
                                TalentRise Scholar
                              </Tag>
                            )}
                          </div>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description="No university connections found" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                />
              )}
            </TabPane>
          )}
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Connections;
