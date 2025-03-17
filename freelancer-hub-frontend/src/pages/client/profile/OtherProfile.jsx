import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from'axios';
import { Button, message, Pagination,Table } from "antd";
import { FaEye } from 'react-icons/fa';
import { GrConnect } from "react-icons/gr";
import { BiSolidMessageRounded } from "react-icons/bi";
import { FaUserClock } from "react-icons/fa6";
import { FaTimes,FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import { FaUserPlus, FaRegBell, FaBell } from "react-icons/fa";
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  LinkOutlined,
  ProjectOutlined,
  StarOutlined,
  TeamOutlined,
  CalendarOutlined,
  MailOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { Tooltip, Progress, Tabs, Card, Statistic, Tag, Avatar } from "antd";
import { useMediaQuery } from 'react-responsive';
const { TabPane } = Tabs;

const OtherProfile = ({userId, role,editable}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [clientInfo, setClientInfo] = useState({});
    const [projects, setProjects] = useState([]);
    const [reviewsList, setReviewsList] = useState([]);
    const [connectionCount, setConnectionCount] = useState(0);  // To store connection count
    const [averageRating, setAverageRating] = useState(0);  // To store average rating  
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connection_id, seConnection_id] = useState(null);
    const [connection_status, setConnection_status] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const paginatedData = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [projectStats, setProjectStats] = useState({
      completed: 0,
      ongoing: 0,
      total: 0
    });
    const isMobile = useMediaQuery({ maxWidth: 767 });
  
    const handlePaginationChange = (page) => {
      setCurrentPage(page);
    };
    useEffect(() => {
      const fetchProfileDetails = async () => {
        const accessToken = Cookies.get('accessToken');
        if (!userId || !accessToken) {
            console.log("Waiting for userId or accessToken...");
            return; 
          }
          setLoading(true);
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/client/get_profile_data',
            {
                params: { userId: userId }, // Passing userId as query parameter
                headers: {
                  Authorization: `Bearer ${accessToken}`, // Passing the access token as Authorization header
                },
              });
          const data = response.data;
          
          seConnection_id(data.client_profile.connection_id)
          setConnection_status(data.connection_status);
          setIsConnected(data.is_connected);
          setClientInfo(data.client_profile);
          setProjects(data.projects);
          setReviewsList(data.reviews_and_ratings.reviews);
          setConnectionCount(data.connection_Count);
          setAverageRating(data.reviews_and_ratings.average_rating);
        } catch (error) {
          console.log(error);
        }finally {
            setLoading(false); // Stop loading after request is completed
          }

      };
      fetchProfileDetails();
    }, [userId]);

    useEffect(() => {
      if (projects.length > 0) {
        const stats = projects.reduce((acc, project) => {
          if (project.status === 'completed') acc.completed++;
          if (project.status === 'ongoing') acc.ongoing++;
          acc.total++;
          return acc;
        }, { completed: 0, ongoing: 0, total: 0 });
        setProjectStats(stats);
      }
    }, [projects]);

    const handleConnect = async (user_id)=>{
      try {
        const token = Cookies.get('accessToken');
        if (!token) {
          console.log('No access token available');
          return;
        }
        const response = await axios.post(
          `http://127.0.0.1:8000/api/client/connections/${user_id}/establish_connection/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`, // Correct token format
            },
          }
        );
        setConnection_status(response.data.status);
      } catch (error) {
        console.error('Error accepting connection:', error);
      }
    }

    const handleAccept = async (connectionId) => {
        try {
          const token = Cookies.get('accessToken');
          if (!token) {
            console.log('No access token available');
            return;
          }
          const response = await axios.post(
            `http://127.0.0.1:8000/api/client/connections/${connectionId}/accept_connection/`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`, // Correct token format
              },
            }
          );
          setConnection_status(response.data.status);
          setIsConnected(true)
        } catch (error) {
          console.error('Error accepting connection:', error);
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
          setConnection_status(response.data.status);


        } catch (error) {
          console.error('Error rejecting connection:', error);
        }
      };

    const handleFollow = async () => {
      try {
        const token = Cookies.get('accessToken');
        if (!token) return;
        
        setIsFollowing(!isFollowing);
        
        message.success(isFollowing ? 'Unfollowed successfully' : 'Following now');
      } catch (error) {
        console.error('Error following user:', error);
        setIsFollowing(!isFollowing);
        message.error('Failed to update follow status');
      }
    };

  return (
    <div className={`w-full min-h-fit max-w-[1200px] min-w-[320px] mx-auto p-6 space-y-4 ${isMobile ? 'ml-0' : 'ml-14'}min-h-full h-fit `}>
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        {/* Cover Photo */}
        <div className="h-40 bg-gradient-to-r from-charcolBlue to-teal-500 relative">
          <div className="absolute -bottom-12 left-6 flex items-end space-x-6">
            <img 
              src={clientInfo.profile_picture ? `http://127.0.0.1:8000${clientInfo.profile_picture}` : "https://www.w3schools.com/howto/img_avatar.png"} 
              alt="Profile" 
              className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 px-6 pb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="max-w-xl">
              <h1 className="text-xl font-semibold text-charcolBlue">{clientInfo.name}</h1>
              <div className="mt-2 space-y-2">
                <div className="flex items-center text-gray-600">
                  <MailOutlined className="mr-2 text-teal-500" />
                  {clientInfo.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <EnvironmentOutlined className="mr-2 text-teal-500" />
                  {clientInfo.location}
                </div>
                <div className="flex items-center text-gray-600 cursor-pointer hover:text-teal-500 transition-colors" 
                     onClick={() => navigate('/client/connections/')}>
                  <LinkOutlined className="mr-2 text-teal-500" />
                  {connectionCount} Connections
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Follow Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFollow}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                {isFollowing ? <FaBell className="text-teal-600" /> : <FaRegBell />}
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </motion.button>

              {/* Connection Buttons */}
              {!isConnected && connection_status === 'notset' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleConnect(userId)}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-all duration-300"
                >
                  <UserOutlined />
                  <span>Connect</span>
                </motion.button>
              )}

              {(connection_status === 'pending' || connection_status === 'rejected') && (
                <Tooltip title={
                  connection_status === 'rejected' 
                    ? 'You can send another request next week' 
                    : `Waiting for ${clientInfo.name} to accept your request`
                }>
                  <motion.button className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                    <FaUserClock />
                    <span>Pending</span>
                  </motion.button>
                </Tooltip>
              )}

              {connection_status === 'not_accepted' && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAccept(connection_id)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500"
                  >
                    <CheckCircleOutlined />
                    Accept
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReject(connection_id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <FaTimes />
                    Reject
                  </motion.button>
                </div>
              )}

              {isConnected && connection_status === 'accepted' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => message.success("Message feature coming soon")}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500"
                >
                  <BiSolidMessageRounded />
                  Message
                </motion.button>
              )}
            </div>
          </div>

          {clientInfo.bio && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="text-sm font-medium text-charcolBlue mb-2">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{clientInfo.bio}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Projects",
            value: projectStats.total,
            icon: <ProjectOutlined />,
            color: '#0d9488'
          },
          {
            title: "Average Rating",
            value: averageRating,
            icon: <StarOutlined />,
            suffix: "/5",
            color: '#eab308'
          },
          {
            title: "Connections",
            value: connectionCount,
            icon: <TeamOutlined />,
            color: '#3b82f6'
          },
          {
            title: "Success Rate",
            value: (projectStats.completed / projectStats.total * 100) || 0,
            icon: <CheckCircleOutlined />,
            suffix: "%",
            color: '#22c55e'
          }
        ].map((stat, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic 
              title={
                <span className="text-charcolBlue font-medium flex items-center gap-2">
                  {stat.icon}
                  {stat.title}
                </span>
              }
              value={stat.value}
              precision={stat.suffix === "/5" ? 1 : stat.suffix === "%" ? 1 : 0}
              suffix={stat.suffix}
              valueStyle={{ color: stat.color }}
            />
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Card className="rounded-lg shadow-md">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="custom-tabs"
        >
          {/* Projects Tab */}
          <TabPane 
            tab={<span><ProjectOutlined />Projects</span>} 
            key="1"
          >
            {/* Projects Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Projects</h3>
              </div>
              
              {/* Projects Table */}
              <div className="hidden md:block">
                <Table
                  dataSource={paginatedData}
                  columns={[
                    {
                      title: "Project Title",
                      dataIndex: "title",
                      key: "title",
                      render: (text) => (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{text}</span>
                        </div>
                      )
                    },
                    {
                      title: "Action",
                      key: "action",
                      render: (_, project) => (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={() => navigate(`/client/view-bids/posted-project/${project.id}`)}
                          className="text-teal-600 hover:text-teal-500 font-medium"
                        >
                          View Project
                        </motion.button>
                      )
                    }
                  ]}
                  pagination={false}
                  rowKey="id"
                />
              </div>

              {/* Mobile Projects List */}
              <div className="md:hidden space-y-4">
                {paginatedData.map((project) => (
                  <motion.div
                    key={project.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <h4 className="font-medium text-gray-900">{project.title}</h4>
                    <button
                      onClick={() => navigate(`/client/view-bids/posted-project/${project.id}`)}
                      className="mt-2 text-teal-600 hover:text-teal-500 font-medium"
                    >
                      View Project
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-4 flex justify-end">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={projects.length}
                  onChange={handlePaginationChange}
                  showSizeChanger={false}
                />
              </div>
            </div>
          </TabPane>

          {/* Reviews Tab */}
          <TabPane 
            tab={<span><StarOutlined />Reviews</span>} 
            key="2"
          >
            {/* Reviews Section */}
            <div className="bg-white p-6 rounded-lg shadow-md w-full">
              <h3 className="text-xl font-semibold mb-4 text-teal-600">Reviews & Ratings</h3>
              {reviewsList.length > 0 ? (
                <div className="space-y-4">
                  {reviewsList.map((review) => (
                    <div key={review.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">{review.from_freelancer_username}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{review.from_freelancer_username}</p>
                        <div className="flex items-center space-x-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <span key={i} className="text-yellow-500">★</span>
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm">{review.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full text-center text-gray-400 font-semibold p-4">
                  No reviews yet
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Call-to-Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between w-full space-y-4 sm:space-y-0">
        <Link to="/client/dashboard">
          <button className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-500 transition duration-300 w-full sm:w-auto">
            Go to Dashboard
          </button>
        </Link>
        <button className="bg-teal-500 text-white py-2 px-6 rounded-lg hover:bg-teal-600 transition duration-300 w-full sm:w-auto">
          Hire Freelancers
        </button>
      </div>

      {/* Add the same styles as AuthProfile */}
      <style jsx>{`
        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #0d9488;
        }
        
        .custom-tabs .ant-tabs-ink-bar {
          background: #0d9488;
        }

        .custom-table .ant-table-thead > tr > th {
          background-color: #f8fafc;
          color: #1e293b;
          font-weight: 500;
        }
        
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f1f5f9;
        }

        .ant-progress-bg {
          background-color: #0d9488;
        }

        .ant-btn-primary:hover {
          background-color: #0d9488 !important;
        }

        .ant-progress-success-bg {
          background-color: #22c55e;
        }
      `}</style>
    </div>
  )
}

export default OtherProfile;