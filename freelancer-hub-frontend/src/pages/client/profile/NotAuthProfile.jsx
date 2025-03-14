import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from'axios';
import { Button, Pagination,Table, Modal, Tag, Progress, Avatar } from "antd";
import {  FaLock, FaUserPlus } from 'react-icons/fa';
import { ProjectOutlined, StarOutlined, CalendarOutlined } from '@ant-design/icons';

import { motion } from "framer-motion";

const LoginModal = ({ isVisible, onClose, onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username,
        password
      });
      const { access, refresh, role } = response.data;
      
      // Store tokens
      Cookies.set("accessToken", access, { secure: true, sameSite: 'Strict' });
      Cookies.set("refreshToken", refresh, { secure: true, sameSite: 'Strict' });
      Cookies.set("role", role, { secure: true, sameSite: 'Strict' });
      
      onSuccess(role, location.pathname);
    } catch (error) {
      setErrors({ api: error.response?.data?.error || "Login failed." });
    }
  };

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to re-enable scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed  inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-[8px]"
        onClick={onClose}
      />

      {/* Modal wrapper for centering */}
      <div className="fixed min-h-fit h-screen  inset-0 flex items-center justify-center p-4">
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-[400px] bg-white rounded-lg shadow-2xl z-[10000]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors z-[10001]"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r rounded-t-lg from-teal-600 to-teal-500 p-6">
            <h2 className="text-2xl font-bold text-white text-center">Welcome Back</h2>
            <p className="text-teal-100 text-center mt-2">Sign in to connect with professionals</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {errors.api && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm text-center">{errors.api}</p>
                </motion.div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg font-medium 
                         hover:from-teal-500 hover:to-teal-400 transition-all duration-300 shadow-sm"
              >
                Sign In
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                New to our platform?{' '}
                <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};



// Add dummy data
const DUMMY_PROJECTS = [
  { id: 1, title: "E-commerce Platform Development", status: "completed", deadline: "2024-05-01" },
  { id: 2, title: "Mobile App UI/UX Design", status: "ongoing", deadline: "2024-06-15" },
  { id: 3, title: "Website Optimization Project", status: "ongoing", deadline: "2024-07-01" },
  { id: 4, title: "Custom CRM Development", status: "completed", deadline: "2024-04-20" },
  { id: 5, title: "Digital Marketing Dashboard", status: "ongoing", deadline: "2024-08-10" }
];

const DUMMY_REVIEWS = [
  { id: 1, from_freelancer_username: "JohnDev", rating: 5, feedback: "Excellent client to work with! Clear requirements and timely payments.", created_at: "2024-03-15" },
  { id: 2, from_freelancer_username: "DesignPro", rating: 4, feedback: "Great communication throughout the project.", created_at: "2024-03-10" },
  { id: 3, from_freelancer_username: "WebMaster", rating: 5, feedback: "One of the best clients I've worked with. Looking forward to future projects!", created_at: "2024-03-05" }
];

const NotAuthProfile = ({userId, role, editable}) => {
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
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  
    const handlePaginationChange = (page) => {
      setCurrentPage(page);
    };
  
    useEffect(() => {
      const fetchProfileDetails = async () => {

        try {
          const response = await axios.get('http://127.0.0.1:8000/api/client/get_unauth_profile_data',{
            params: { userId: userId },
          }
           
          );
          const data = response.data;
          setClientInfo(data.client_profile);
          setProjects(data.projects);
          setReviewsList(data.reviews_and_ratings.reviews);
          setConnectionCount(data.connection_count);
          setAverageRating(data.reviews_and_ratings.average_rating);
        } catch (error) {
          console.log(error);
        }

      };
      fetchProfileDetails();
    }, []);
    
  const handleLoginSuccess = (userRole) => {
    setIsLoginModalVisible(false);
    
    // Get the current URL path
    const currentPath = location.pathname;
    
    // Check if we're already on a profile page
    if (currentPath.includes('/profile/')) {
      // Refresh the current page to show authenticated view
      window.location.reload();
    } else {
      // Navigate based on role if not on a profile page
      if (userRole === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/freelancer/homepage');
      }
    }
  };

  return (
  <>
    <div className="min-w-[320px] max-w-[1600px] mx-auto p-4 space-y-6">
      {/* Profile Header with Gradient */}
      
       <LoginModal
        isVisible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
        onSuccess={handleLoginSuccess}
      />
      <div className="relative bg-gradient-to-r from-teal-600/10 to-teal-500/10 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm"></div>
        <div className="relative p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={clientInfo.profile_picture ? `http://127.0.0.1:8000${clientInfo.profile_picture}` : "https://www.w3schools.com/howto/img_avatar.png"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800">{clientInfo.name}</h2>
              <p className="text-gray-600">{clientInfo.email}</p>
              {clientInfo.bio && <p className="text-gray-700 mt-2">{clientInfo.bio}</p>}
              
              <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📍</span>
                  <span>{clientInfo.location}</span>
                    </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🔗</span>
                  <span>{connectionCount} Connections</span>
                  </div>
                </div>
              </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLoginModalVisible(true)}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-all duration-300"
            >
              <FaUserPlus />
              <span>Connect</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Projects Section with Blur Effect */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Projects</h3>
          </div>
        
        <div className="relative">
          {/* Blurred Projects Table */}
          <div className="filter blur-[4px] pointer-events-none">
                <Table
              dataSource={DUMMY_PROJECTS}
                  columns={[
                    {
                      title: "Project Title",
                      dataIndex: "title",
                      key: "title",
                  render: (text) => (
                    <div className="flex items-center space-x-2">
                      <ProjectOutlined />
                      <span>{text}</span>
                    </div>
                  )
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (status) => (
                    <Tag color={status === 'completed' ? 'success' : 'processing'}>
                      {status}
                    </Tag>
                  )
                },
                {
                  title: "Deadline",
                  dataIndex: "deadline",
                  key: "deadline"
                }
                  ]}
                  pagination={false}
                  rowKey="id"
                />
              </div>
        
          {/* Glass morphism overlay */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsLoginModalVisible(true)}
            className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm rounded-lg cursor-pointer"
          >
            <div className="text-center p-6 bg-white/80 rounded-lg shadow-lg">
              <FaLock className="text-4xl text-teal-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Premium Content</h4>
              <p className="text-gray-600">Sign in to view project details and connect with {clientInfo.name}</p>
                          <Button
                type="primary"
                icon={<FaUserPlus />}
                className="mt-4 bg-teal-600 hover:bg-teal-500"
                onClick={() => setIsLoginModalVisible(true)}
              >
                Sign In to Connect
                          </Button>
            </div>
          </motion.div>
                        </div>
                      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Reviews & Ratings</h3>
          <div className="flex items-center space-x-2">
            <StarOutlined className="text-yellow-400" />
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-gray-500">({reviewsList.length} reviews)</span>
                  </div>
              </div>
        
        {/* Rating Overview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{averageRating.toFixed(1)}</div>
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
              </div>

        {/* Reviews List */}
                <div className="space-y-4">
          {(reviewsList.length > 0 ? reviewsList : DUMMY_REVIEWS).map((review) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={review.id}
              className="flex gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Avatar size={48} className="bg-teal-100 text-teal-600">
                {review.from_freelancer_username[0].toUpperCase()}
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800">{review.from_freelancer_username}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarOutlined 
                        key={i}
                        className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                      />
                          ))}
                        </div>
                </div>
                <p className="text-gray-600 mt-2">{review.feedback}</p>
                <div className="mt-2 text-sm text-gray-400">
                  <CalendarOutlined className="mr-1" />
                  {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
            </motion.div>
                  ))}
                </div>
              </div>

      {/* Login Modal */}
      
            </div>
           
      </>
  )
}

export default NotAuthProfile;