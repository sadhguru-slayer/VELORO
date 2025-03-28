import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Button, Pagination, Table, Tooltip, Progress, Tabs, Card, Statistic } from "antd";
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  LinkOutlined,
  EditOutlined,
  ProjectOutlined,
  StarOutlined,
  TeamOutlined,
  CalendarOutlined,
  MailOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  UserAddOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined,
  BankOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
  FileProtectOutlined,
  BuildOutlined,
  SolutionOutlined,
  ContactsOutlined,
  UpOutlined,
  DownOutlined,
  VerifiedOutlined,
  SecurityScanOutlined,
  AuditOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { Tag,Avatar } from 'antd'; 
import { Timeline } from 'antd';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';

import { Modal } from 'antd';
import { FaEye, FaCheckCircle, FaBriefcase } from 'react-icons/fa';

import { AnimatePresence } from 'framer-motion';
import { RiAwardLine, RiUserStarLine } from 'react-icons/ri';
import { IoSchoolOutline } from 'react-icons/io5';

const { TabPane } = Tabs;

const AuthProfile = () => {
  const { userId, isEditable, isAuthenticated, role, currentUserId } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [clientInfo, setClientInfo] = useState({});
  const [projects, setProjects] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [connectionCount, setConnectionCount] = useState(0);  // To store connection count
  const [averageRating, setAverageRating] = useState(0);  // To store average rating  
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const paginatedData = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [showDetails, setShowDetails] = useState(false); // To toggle the modal visibility
  const [selectedProject, setSelectedProject] = useState(null); // To store the selected project

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  const [loading, setLoading] = useState(true);

  // Add new states for enhanced features
  const [activeTab, setActiveTab] = useState('1');
  const [projectStats, setProjectStats] = useState({
    completed: 0,
    ongoing: 0,
    total: 0
  });

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileSuggestions, setProfileSuggestions] = useState([]);

  const [categoryScores, setCategoryScores] = useState({
    basic_info: { score: 0, total: 20 },
    business_info: { score: 0, total: 25 },
    verification: { score: 0, total: 30 },
    banking: { score: 0, total: 25 }
  });

  const [showCompletionDetails, setShowCompletionDetails] = useState(false);

  const categoryConfig = {
    basic_info: {
      title: "Basic Information",
      icon: <UserOutlined className="text-blue-500" />,
      color: 'blue',
      fields: ['profile_picture', 'bio', 'location', 'description']
    },
    business_info: {
      title: "Business Information",
      icon: <ShopOutlined className="text-purple-500" />,
      color: 'purple',
      fields: ['company_name', 'registration_number', 'gst_number', 'website', 'pan_number']
    },
    verification: {
      title: "Verification Documents",
      icon: <SecurityScanOutlined className="text-red-500" />,
      color: 'red',
      required: true,
      fields: ['id_proof', 'pan_card', 'company_registration', 'gst_certificate', 'identity_verified']
    },
    banking: {
      title: "Banking Details",
      icon: <BankOutlined className="text-green-500" />,
      color: 'green',
      required: true,
      fields: ['bank_details', 'bank_verification']
    }
  };

  const VerificationStatus = ({ clientInfo }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
        { type: 'email', verified: clientInfo.verification_status?.email_verified },
        { type: 'phone', verified: clientInfo.verification_status?.phone_verified },
        { type: 'identity', verified: clientInfo.verification_status?.identity_verified },
        { type: 'bank', verified: clientInfo.verification_status?.bank_verified }
      ].map(({ type, verified }) => (
        <div key={type} className={`p-3 rounded-lg border ${verified ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            {verified ? (
              <VerifiedOutlined className="text-green-500" />
            ) : (
              <AuditOutlined className="text-gray-400" />
            )}
            <span className={`text-sm font-medium ${verified ? 'text-green-700' : 'text-gray-500'}`}>
              {type.charAt(0).toUpperCase() + type.slice(1)} {verified ? 'Verified' : 'Pending'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    // This ensures that we wait for userId and accessToken to be available
    const fetchProfileDetails = async () => {
      const accessToken = Cookies.get("accessToken");

      if (!userId || !accessToken) {
        console.log("Waiting for userId or accessToken...");
        return; 
      }

      setLoading(true); // Start loading indicator

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/client/get_profile_data", {
          params: { userId: userId }, // Passing userId as query parameter
          headers: {
            Authorization: `Bearer ${accessToken}`, // Passing the access token as Authorization header
          },
        });

        // Assuming the response data structure is as expected
        const data = response.data;
        console.log(data)
        setClientInfo(data.profile);
        setProjects(data.projects);
        setReviewsList(data.reviews_and_ratings.reviews);
        setConnectionCount(data.connection_count);
        setAverageRating(data.reviews_and_ratings.average_rating);
        
        // Set profile completion data
        console.log(data.profile.profile_completion.total_score)
        if (data.profile.profile_completion) {
          setProfileCompletion(data.profile.profile_completion.total_score);
          setCategoryScores(data.profile.profile_completion.category_scores);
        }
      } catch (error) {
        console.log(error); // Handle any errors
      } finally {
        setLoading(false); // Stop loading after request is completed
      }
    };

    // Ensure that we wait for userId and accessToken before making the request
    if (userId && Cookies.get("accessToken")) {
      fetchProfileDetails();
    } else {
      console.log("Waiting for userId and accessToken...");
    }
  }, [userId]); 
  
  // Calculate project stats
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

  useEffect(() => {
    const analyzeProfile = () => {
      const suggestions = [];
      let completionScore = 0;
      const requiredFields = [
        // Basic Profile (20%)
        {
          category: 'Basic Profile',
          fields: [
            { name: 'profile_picture', value: clientInfo.profile_picture, weight: 5, message: 'Add a professional profile picture' },
            { name: 'bio', value: clientInfo.bio, weight: 5, message: 'Add a brief bio' },
            { name: 'location', value: clientInfo.location, weight: 5, message: 'Add your location' },
            { name: 'description', value: clientInfo.description, weight: 5, message: 'Add a detailed business description' }
          ]
        },
        // Business Information (25%)
        {
          category: 'Business Information',
          fields: [
            { name: 'company_name', value: clientInfo.company_name, weight: 5, message: 'Add your company name' },
            { name: 'company_website', value: clientInfo.company_website, weight: 5, message: 'Add your company website' },
            { name: 'company_registration_number', value: clientInfo.company_registration_number, weight: 5, message: 'Add company registration number' },
            { name: 'gst_number', value: clientInfo.gst_number, weight: 5, message: 'Add GST number' },
            { name: 'registered_address', value: clientInfo.registered_address, weight: 5, message: 'Add registered business address' }
          ]
        },
        // Verification Documents (30%)
        {
          category: 'Verification Documents',
          fields: [
            { name: 'id_proof', value: clientInfo.id_proof, weight: 6, message: 'Upload ID proof', required: true },
            { name: 'pan_card_image', value: clientInfo.pan_card_image, weight: 6, message: 'Upload PAN card', required: true },
            { name: 'company_incorporation_doc', value: clientInfo.company_incorporation_doc, weight: 6, message: 'Upload company incorporation document' },
            { name: 'tax_declaration_doc', value: clientInfo.tax_declaration_doc, weight: 6, message: 'Upload tax declaration document' },
            { name: 'id_verified', value: clientInfo.id_verified, weight: 6, message: 'Complete ID verification', required: true }
          ]
        },
        // Banking Details (25%)
        {
          category: 'Banking Details',
          fields: [
            { name: 'bank_name', value: clientInfo.bank_name, weight: 5, message: 'Add bank name', required: true },
            { name: 'bank_account_number', value: clientInfo.bank_account_number, weight: 5, message: 'Add bank account number', required: true },
            { name: 'bank_ifsc', value: clientInfo.bank_ifsc, weight: 5, message: 'Add IFSC code', required: true },
            { name: 'bank_verified', value: clientInfo.bank_verified, weight: 5, message: 'Complete bank verification', required: true },
            { name: 'terms_accepted', value: clientInfo.terms_accepted, weight: 5, message: 'Accept terms and conditions', required: true }
          ]
        }
      ];

      requiredFields.forEach(category => {
        category.fields.forEach(field => {
          if (!field.value) {
            suggestions.push({
              type: field.name,
              message: field.message,
              priority: field.required ? 1 : 2,
              category: category.category
            });
          } else {
            completionScore += field.weight;
          }
        });
      });

      setProfileCompletion(Math.round(completionScore));
      setProfileSuggestions(suggestions.sort((a, b) => a.priority - b.priority));
    };

    if (clientInfo && userId === currentUserId) {
      analyzeProfile();
    }
  }, [clientInfo, userId, currentUserId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'green', label: 'Completed' }; // Green for completed
      case 'ongoing':
        return { color: 'yellow', label: 'Ongoing' }; // Yellow for ongoing
      case 'pending':
        return { color: 'red', label: 'Pending' }; // Red for pending
      default:
        return { color: 'gray', label: 'Unknown' }; // Gray for undefined status
    }
  };
  
  const openDetails = (project) => {
    setSelectedProject(project);
    setShowDetails(true);
  };
  
  const closeDetails = () => {
    setShowDetails(false);
  };
  
  return (
    <div className={`w-full max-w-[1200px] min-w-[320px] min-h-full h-fit mx-auto p-3 space-y-6`}>
      {/* Profile Completion Section */}
      {userId && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          {/* Summary Alert - Always Visible */}
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-4 rounded-xl transition-colors"
            onClick={() => setShowCompletionDetails(!showCompletionDetails)}
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0">
                <Progress 
                  type="circle" 
                  percent={clientInfo?.profile_completion?.total_score || 0}
                  width={60}
                  strokeColor={{
                    '0%': '#0ea5e9',
                    '100%': '#0d9488',
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <SafetyCertificateOutlined className="text-yellow-500" />
                  Profile Completion Status
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {clientInfo?.profile_completion?.total_score || 0}% completed
                </p>
                {clientInfo?.profile_completion?.total_score < 100 && (
                  <div className="mt-2">
                    <p className="text-sm text-yellow-600">Priority items needed:</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {clientInfo?.profile_completion?.priority_items?.slice(0, 3).map((item, index) => (
                        <li 
                          key={index} 
                          className={`flex items-center gap-1 ${
                            item.priority === 'high' ? 'text-red-500' : 'text-orange-500'
                          }`}
                        >
                          <ExclamationCircleOutlined className={
                            item.priority === 'high' ? 'text-red-500' : 'text-orange-500'
                          } />
                          {item.item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button
                type="text"
                icon={showCompletionDetails ? <UpOutlined /> : <DownOutlined />}
                className="text-gray-500"
              />
            </div>
          </div>

          {/* Detailed Categories - Shown on Toggle */}
          <AnimatePresence>
            {showCompletionDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        title: "Basic Information",
                        icon: <UserOutlined className="text-blue-500" />,
                        data: clientInfo?.profile_completion?.category_scores?.basic_info,
                        section: 'basic_info',
                        color: 'blue'
                      },
                      {
                        title: "Business Information",
                        icon: <ShopOutlined className="text-purple-500" />,
                        data: clientInfo?.profile_completion?.category_scores?.business_info,
                        section: 'business_info',
                        color: 'purple'
                      },
                      {
                        title: "Verification Documents",
                        icon: <SecurityScanOutlined className="text-red-500" />,
                        data: clientInfo?.profile_completion?.category_scores?.verification,
                        section: 'verification',
                        color: 'red',
                        required: true
                      },
                      {
                        title: "Banking Details",
                        icon: <BankOutlined className="text-green-500" />,
                        data: clientInfo?.profile_completion?.category_scores?.banking,
                        section: 'banking',
                        color: 'green'
                      }
                    ].map((category, index) => {
                      const score = category.data?.score || 0;
                      const total = category.data?.total || 0;
                      const percentage = Math.round((score / total) * 100);
                      const remaining = total - score;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow"
                          onClick={() => navigate(`/client/profile/${userId}/edit_profile`, {
                            state: { section: category.section }
                          })}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {category.icon}
                              <h4 className="font-semibold text-gray-700">{category.title}</h4>
                            </div>
                            <Tag 
                              color={percentage === 100 ? 'success' : category.required && percentage < 50 ? 'error' : 'warning'}
                            >
                              {percentage}%
                            </Tag>
                          </div>

                          <Progress 
                            percent={percentage}
                            size="small"
                            strokeColor={
                              percentage === 100 
                                ? '#10b981' 
                                : category.required && percentage < 50 
                                  ? '#ef4444' 
                                  : '#f59e0b'
                            }
                          />

                          <div className="mt-3 text-sm">
                            <p className="text-gray-600">
                              {score} of {total} points completed
                            </p>
                            {remaining > 0 && (
                              <p className={`mt-1 ${category.required ? 'text-red-500' : 'text-orange-500'}`}>
                                {remaining} points remaining {category.required && '(Required)'}
                              </p>
                            )}
                          </div>

                          {/* Pending Items */}
                          {remaining > 0 && (
                            <div className="mt-3 space-y-1">
                              {category.data?.pending_items?.map((item, idx) => (
                                <p 
                                  key={idx} 
                                  className={`text-xs flex items-center gap-1 ${
                                    item.priority === 'high' ? 'text-red-500' : 'text-orange-500'
                                  }`}
                                >
                                  <ExclamationCircleOutlined /> {item.item}
                                </p>
                              ))}
                            </div>
                          )}

                          <Button 
                            type="link" 
                            size="small"
                            className="mt-2 p-0 text-blue-500 hover:text-blue-600"
                            onClick={() => navigate(`/client/profile/${userId}/edit_profile`, {
                              state: { section: category.section }
                            })}
                          >
                            Complete Now →
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Enhanced Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Improved Cover Photo with Dynamic Gradient */}
        <div className="h-48 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <img 
                src={clientInfo?.profile_picture ? `http://127.0.0.1:8000${clientInfo?.profile_picture}` : "https://www.w3schools.com/howto/img_avatar.png"} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg transition-transform group-hover:scale-105"
              />
              {isEditable && (
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="absolute bottom-0 right-0"
                >
                <Tooltip title="Edit Profile">
                  <Button 
                    icon={<EditOutlined />}
                      className="rounded-full bg-teal-500 text-white border-2 border-white hover:bg-teal-600 hover:text-white shadow-md"
                    onClick={() => navigate(`/client/profile/${userId}/edit_profile`, { state: { profileComponent: 'edit_profile' } })}
                  />
                </Tooltip>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Enhanced Profile Info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start flex-wrap gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold text-gray-800">{clientInfo?.name}</h1>
                <Tag color="blue" className="px-3 py-1 uppercase text-xs font-semibold">
                  {clientInfo?.role}
                </Tag>
              </div>

              {/* Contact Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MailOutlined className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium">{clientInfo?.email}</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl"
                >
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <EnvironmentOutlined className="text-teal-600 text-lg" />
                </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium">{clientInfo?.location}</p>
                </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl cursor-pointer"
                  onClick={() => navigate('/client/connections/')}
                >
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <TeamOutlined className="text-violet-600 text-lg" />
                </div>
                  <div>
                    <p className="text-sm text-gray-500">Network</p>
                    <p className="text-sm font-medium">{connectionCount} Connections</p>
              </div>
                </motion.div>
            </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
              <Button 
                onClick={() => navigate('/client/post-project')}
                  className="bg-teal-500 text-white hover:bg-teal-600 border-none flex items-center gap-2"
                  icon={<ProjectOutlined />}
              >
                Post New Project
              </Button>
                
              </div>
            </div>
          </div>

          {/* Enhanced Bio Section */}
          {clientInfo?.bio && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <RiUserStarLine className="text-teal-500" />
                About
              </h3>
              <p className="text-gray-600 leading-relaxed">{clientInfo?.bio}</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Projects",
            value: projectStats?.total,
            icon: <ProjectOutlined className="text-2xl" />,
            color: '#0d9488',
            bgColor: 'bg-teal-50'
          },
          {
            title: "Average Rating",
            value: averageRating,
            icon: <StarOutlined className="text-2xl" />,
            suffix: "/5",
            color: '#eab308',
            bgColor: 'bg-yellow-50'
          },
          {
            title: "Connections",
            value: connectionCount,
            icon: <TeamOutlined className="text-2xl" />,
            color: '#3b82f6',
            bgColor: 'bg-blue-50'
          },
          {
            title: "Success Rate",
            value: (projectStats.completed / projectStats.total * 100) || 0,
            icon: <CheckCircleOutlined className="text-2xl" />,
            suffix: "%",
            color: '#22c55e',
            bgColor: 'bg-green-50'
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`shadow-sm hover:shadow-lg transition-all duration-300 ${stat.bgColor}`}
              bordered={false}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-opacity-20`} style={{ backgroundColor: stat.color }}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-semibold mt-1" style={{ color: stat.color }}>
                    {stat.value}{stat.suffix}
                  </p>
                </div>
              </div>
          </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Card className="rounded-lg shadow-md">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="custom-tabs"
        >
          <TabPane 
            tab={<span><ProjectOutlined />Projects</span>} 
            key="1"
          >
            <div className="space-y-4">
              {/* Project Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-gray-50">
                  <h4 className="text-sm font-semibold mb-4">Project Status</h4>
                  <Progress
                    percent={Math.round((projectStats.completed / projectStats.total) * 100)}
                    success={{ percent: Math.round((projectStats.ongoing / projectStats.total) * 100) }}
                    format={() => `${projectStats.completed}/${projectStats.total}`}
                  />
                </Card>
                <Card className="bg-gray-50">
                  <h4 className="text-sm font-semibold mb-4">Recent Activity</h4>
                  <Timeline>
                    {projects.slice(0, 3).map(project => (
                      <Timeline.Item key={project.id}>
                        {project.title}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </div>

              {/* Projects Table */}
              {!isMobile && (
                <Table
                  dataSource={paginatedData}
                  columns={[
                    {
                      title: "Project Title",
                      dataIndex: "title",
                      key: "title",
                      render: (text, project) => (
                        <div className="flex items-center space-x-2">
                          <ProjectOutlined />
                          <span>{text}</span>
                        </div>
                      ),
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      render: (status) => (
                        <Tag color={getStatusColor(status).color}>{status}</Tag>
                      ),
                    },
                    {
                      title: "Action",
                      key: "action",
                      render: (_, project) => (
                        <Button 
                          type="link" 
                          onClick={() => navigate(`/client/view-bids/posted-project/${project.id}`)}
                          icon={<EyeOutlined />}
                        >
                          View Details
                        </Button>
                      ),
                    }
                  ]}
                  pagination={false}
                  rowKey="id"
                  className="custom-table"
                />
              )}
        
              {/* Card layout for small screens */}
              {isMobile && (
                <div className="block md:hidden space-y-4">
                <AnimatePresence>
                {paginatedData.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">{record.title}</h3>
                        <Tag color={getStatusColor(record.status).color}>
                          {getStatusColor(record.status).label}
                        </Tag>
                      </div>
                    </div>
        
                    <AnimatePresence>
                      {openDropdown === index && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="border-t border-gray-200 overflow-hidden"
                        >
                          <div className="p-4 space-y-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <CalendarOutlined />
                              <span>{record.deadline}</span>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="primary"
                                className="bg-teal-500 hover:bg-teal-600"
                                onClick={() => navigate(`/client/view-bids/posted-project/${record.id}`, { state: { record } })}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence> </div>
              )}



              
              <div className="flex justify-end mt-4">
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
          <style jsx>{`
            .custom-modal .ant-modal-header {
              background-color: #f1f5f9;
            }
          
            .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
              color: #0d9488;
            }
          
            .custom-tabs .ant-tabs-ink-bar {
              background: #0d9488;
            }
          
            .ant-progress-bg {
              background-color: #0d9488;
            }
          
            .ant-btn-primary:hover {
              background-color: #0d9488 !important;
            }
          `}</style>
          

          <TabPane 
            tab={<span><StarOutlined />Reviews</span>} 
            key="2"
          >
            <div className="space-y-6">
              {/* Rating Overview */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">{averageRating}</div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                </div>
                <div className="flex-1 max-w-sm mx-8">
                  {[5,4,3,2,1].map(rating => {
                    const count = reviewsList.filter(r => r.rating === rating).length;
                    const percentage = (count / reviewsList.length) * 100;
                    return (
                      <div key={rating} className="flex items-center space-x-2">
                        <span className="text-sm w-8">{rating}★</span>
                        <Progress percent={percentage} size="small" showInfo={false} />
                        <span className="text-sm w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <Avatar size={48}>
                        {review.from_freelancer_username ? review.from_freelancer_username[0] : '?'}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{review.from_freelancer_username || 'Anonymous'}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarOutlined 
                                key={i}
                                className={i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600">{review.feedback || 'No feedback provided'}</p>
                        <div className="mt-2 text-sm text-gray-400">
                          <CalendarOutlined className="mr-1" />
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Date not available'}
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Enhanced Quick Actions */}
      <div className="flex justify-between gap-4 flex-wrap mt-8">
        <motion.div whileHover={{ scale: 1.02 }}>
        <Button 
          type="primary" 
          icon={<DashboardOutlined />}
          onClick={() => navigate('/client/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none min-w-[150px] h-12"
        >
          Dashboard
        </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }}>
        <Button 
          type="primary" 
          icon={<UserAddOutlined />}
                            onClick={() => navigate('/client/find-talent')}

            className="bg-teal-500 hover:bg-teal-600 text-white border-none min-w-[150px] h-12"
        >
          Browse Freelancers
        </Button>
        </motion.div>
      </div>

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
  );
}

export default AuthProfile;