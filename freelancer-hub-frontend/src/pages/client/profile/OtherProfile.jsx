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
import { FaUserPlus, FaRegBell, FaBell,FaGraduationCap  } from "react-icons/fa";
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
  BookOutlined,
  TrophyOutlined,
  ExperimentOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

import { Tooltip, Progress, Tabs, Card, Statistic, Tag, Avatar } from "antd";
import { useMediaQuery } from 'react-responsive';
const { TabPane } = Tabs;
import { useParams } from 'react-router-dom';

const OtherProfile = () => {
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
    const [showAllSkills, setShowAllSkills] = useState(false);

    const params = useParams();
    const userId = params.id;

  
    const handlePaginationChange = (page) => {
      setCurrentPage(page);
    };
    useEffect(() => {
      const fetchProfileDetails = async () => {
        const accessToken = Cookies.get('accessToken');
        if (!userId || !accessToken) return;
        setLoading(true);
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/client/get_profile_data',
            {
              params: { userId: userId },
              headers: { Authorization: `Bearer ${accessToken}` },
            });
          const data = response.data;
          console.log(data)
          seConnection_id(data.profile.connection_id);
          setConnection_status(data.connection_status);
          setIsConnected(data.is_connected);
          setClientInfo(data.profile);
          setProjects(data.projects);
          setReviewsList(data.reviews_and_ratings.reviews);
          setConnectionCount(data.connection_Count);
          setAverageRating(data.reviews_and_ratings.average_rating);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
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

    // Add new student-specific stats
    const getStudentStats = () => [
      {
        title: "Learning Progress",
        value: 75,
        icon: <BookOutlined />,
        color: '#0d9488',
        suffix: "%"
      },
      {
        title: "Skills Mastered",
        value: clientInfo.student_info?.skills?.length || 0,
        icon: <ExperimentOutlined />,
        color: '#6366f1'
      },
      {
        title: "Projects Completed",
        value: projectStats.completed,
        icon: <TrophyOutlined />,
        color: '#eab308'
      },
      {
        title: "Graduation Year",
        value: clientInfo.student_info?.academic_info.year_of_study || 'N/A',
        icon: <FaGraduationCap  />,
        color: '#ec4899'
      }
    ];

  return (
    <div className={`w-full min-h-fit max-w-[1200px] min-w-[320px] mx-auto space-y-6 ${isMobile ? 'ml-0' : 'ml-14'} min-h-full h-fit`}>
      {/* Enhanced Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Improved Cover Photo with Gradient */}
        <div className="h-48 bg-gradient-to-r from-violet-600 via-teal-500 to-emerald-400 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img 
                src={clientInfo.profile_picture ? `http://127.0.0.1:8000${clientInfo.profile_picture}` : "https://www.w3schools.com/howto/img_avatar.png"} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
            </motion.div>
          </div>
        </div>

        {/* Enhanced Profile Info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">{clientInfo.name}</h1>
                {clientInfo.role === 'student' && (
                  <Tag color="blue" icon={<FaGraduationCap />} className="px-3 py-1">
                    Student Developer
                  </Tag>
                )}
              </div>

              {/* Student-specific info */}
              {clientInfo.role === 'student' && clientInfo.student_info && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 space-y-2"
                >
                  <p className="text-gray-600 flex items-center gap-2">
                    <FaGraduationCap className="text-violet-500" />
                    {clientInfo?.student_info?.institution?.name} • {clientInfo?.student_info?.academic_info?.field_of_study}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(showAllSkills ? clientInfo?.student_info?.skills : clientInfo?.student_info?.skills?.slice(0, 3)).map((skill, index) => (
                      <Tag 
                        key={index}
                        className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                      >
                        {skill}
                      </Tag>
                    ))}
                    {clientInfo?.student_info?.skills?.length > 3 && (
                      <button
                        onClick={() => setShowAllSkills(!showAllSkills)}
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium px-2"
                      >
                        {showAllSkills ? 'Show less' : `+${clientInfo?.student_info?.skills?.length - 3} more`}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Existing contact info with improved styling */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <MailOutlined className="mr-2 text-violet-500" />
                  {clientInfo?.email}
                </div>
                <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <EnvironmentOutlined className="mr-2 text-violet-500" />
                  {clientInfo?.location}
                </div>
              </div>
            </div>

            {/* Action Buttons with improved styling */}
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

          {/* Enhanced Bio Section */}
          {clientInfo.bio && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed">{clientInfo.bio}</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Stats Cards with conditional rendering for student/freelancer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(clientInfo.role === 'student' ? getStudentStats() : [
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
        ]).map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
              <Statistic 
                title={
                  <span className="text-gray-700 font-medium flex items-center gap-2">
                    {stat.icon}
                    {stat.title}
                  </span>
                }
                value={stat.value}
                precision={stat.suffix === "%" ? 1 : 0}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Student Academic Details Section */}
      {clientInfo.role === 'student' && clientInfo.student_info && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mt-6"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FaGraduationCap className="text-teal-600" />
              Academic Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Institution Details */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <BookOutlined className="text-blue-600" />
                  Institution
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOutlined className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{clientInfo.student_info.institution.name}</p>
                      <p className="text-sm text-gray-600">{clientInfo.student_info.institution.location}</p>
                    </div>
                  </div>
                  {clientInfo.student_info.institution.website && (
                    <a 
                      href={clientInfo.student_info.institution.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm mt-2"
                    >
                      <LinkOutlined />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>

              {/* Academic Program Details */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <ProjectOutlined className="text-teal-600" />
                  Academic Program
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ProjectOutlined className="text-teal-600" />
                    <span className="font-medium">{clientInfo.student_info.academic_info.course}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOutlined className="text-violet-600" />
                    <span>{clientInfo.student_info.academic_info.field_of_study}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-orange-600" />
                    <span>{clientInfo.student_info.academic_info.year_of_study}</span>
                  </div>
                  <Tag color="blue" icon={<FaGraduationCap />} className="hover:scale-105 transition-transform">
                    Graduating {clientInfo.student_info.academic_info.graduation_year}
                  </Tag>
                </div>
              </div>

              {/* Skills & Availability */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <ExperimentOutlined className="text-teal-600" />
                  Skills & Availability
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Technical Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {clientInfo.student_info.skills.map((skill, index) => (
                        <Tag key={index} color="cyan" icon={<ExperimentOutlined />} className="hover:scale-105 transition-transform" >
                          {skill}
                        </Tag>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-teal-50 p-2 rounded-lg">
                    <ClockCircleOutlined className="text-teal-600" />
                    <span className="text-sm">
                      Available: {clientInfo.student_info.weekly_availability}
                    </span>
                  </div>
                </div>
              </div>

              {/* Academic Achievements */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Achievements</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrophyOutlined className="text-yellow-500" />
                    <span>{clientInfo.student_info.completed_gigs} Completed Gigs</span>
                  </div>
                  {clientInfo.student_info.academic_achievements && (
                    <div className="mt-2 text-gray-700">
                      <p className="text-sm font-medium mb-2">Academic Achievements:</p>
                      <p className="text-sm">{clientInfo.student_info.academic_achievements}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Certifications</h4>
                <div className="space-y-2">
                  {clientInfo?.student_info?.certifications?.length > 0 ? (
                    clientInfo?.student_info?.certifications?.map((cert, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100"
                      >
                        <SafetyCertificateOutlined className="text-teal-600" />
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No certifications added yet</p>
                  )}
                </div>
              </div>

              {/* Profile Status */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Profile Status</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Profile Completion</span>
                      <span className="text-sm font-medium">{clientInfo?.student_info?.profile_completion}%</span>
                    </div>
                    <Progress 
                      percent={clientInfo?.student_info?.profile_completion} 
                      strokeColor={{
                        '0%': '#0ea5e9',
                        '100%': '#0d9488',
                      }}
                      showInfo={false}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {clientInfo.student_info.is_verified ? (
                      <Tag icon={<CheckCircleOutlined />} color="success">
                        Verified Student
                      </Tag>
                    ) : (
                      <Tag icon={<ClockCircleOutlined />} color="warning">
                        Verification Pending
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

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