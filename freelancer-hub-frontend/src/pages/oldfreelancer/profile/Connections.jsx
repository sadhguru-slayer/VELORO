import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Avatar, Button, Input, Tabs, Empty, List, Tag, Tooltip, Dropdown, Menu } from "antd";
import { FaUserPlus, FaSearch, FaEllipsisH, FaUserMinus, FaEnvelope, FaUserCheck, FaUserClock, FaHandshake } from "react-icons/fa";

const { TabPane } = Tabs;
const { Search } = Input;

const Connections = () => {
  const { userId, isEditable } = useOutletContext();
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

  const renderConnectionActions = (connection) => {
    return (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="message" icon={<FaEnvelope />}>
              Message
            </Menu.Item>
            <Menu.Item 
              key="remove" 
              icon={<FaUserMinus />}
              onClick={() => handleRemoveConnection(connection.id)}
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
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <FaHandshake className="text-violet-600 text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">My Connections</h1>
        </div>

        <div className="mb-6">
          <Search
            placeholder="Search connections..."
            allowClear
            enterButton={<FaSearch />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="font-medium"
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
                      className="shadow-sm hover:shadow-md transition-shadow duration-300"
                      actions={[
                        <Button 
                          type="primary" 
                          icon={<FaEnvelope className="mr-2" />}
                          className="bg-violet-600 hover:bg-violet-700 border-none"
                        >
                          Message
                        </Button>,
                        renderConnectionActions(item)
                      ]}
                    >
                      <div className="flex flex-col items-center text-center">
                        <Avatar src={item.avatar} size={80} className="mb-4" />
                        <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                        <p className="text-gray-600">{item.title}</p>
                        <Tag color="green" className="mt-2">Connected</Tag>
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
                      className="shadow-sm hover:shadow-md transition-shadow duration-300"
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
                      className="shadow-sm hover:shadow-md transition-shadow duration-300"
                      actions={[
                        <Button 
                          type="primary" 
                          icon={<FaUserPlus className="mr-2" />}
                          onClick={() => handleConnect(item.id)}
                          className="bg-violet-600 hover:bg-violet-700 border-none"
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
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Connections;
