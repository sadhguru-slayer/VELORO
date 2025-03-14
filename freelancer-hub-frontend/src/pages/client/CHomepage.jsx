import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Card, Button, Statistic, Timeline, Progress, Row, Col, Avatar, message, Empty, Tag } from 'antd';
import { Line } from 'react-chartjs-2';
import CHeader from "../../components/client/CHeader";
import CSider from "../../components/client/CSider";
import {
  ProjectOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  RocketOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registering required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Dummy data for features not in DashboardOverview
const dummyTrendingSkills = [
  { name: 'React.js', demand: 85 },
  { name: 'Python', demand: 78 },
  { name: 'UI/UX Design', demand: 72 },
  { name: 'Node.js', demand: 68 },
  { name: 'Machine Learning', demand: 65 }
];

const dummyTopFreelancers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    specialization: 'Full Stack Developer',
    rating: 4.9,
    reviews: 124,
    avatar: `https://ui-avatars.com/api/?name=Sarah+Johnson&background=random`
  },
  {
    id: 2,
    name: 'Michael Chen',
    specialization: 'UI/UX Designer',
    rating: 4.8,
    reviews: 98,
    avatar: `https://ui-avatars.com/api/?name=Michael+Chen&background=random`
  },
  {
    id: 3,
    name: 'Emma Wilson',
    specialization: 'Mobile Developer',
    rating: 4.9,
    reviews: 156,
    avatar: `https://ui-avatars.com/api/?name=Emma+Wilson&background=random`
  },
  {
    id: 4,
    name: 'Alex Kumar',
    specialization: 'DevOps Engineer',
    rating: 4.7,
    reviews: 89,
    avatar: `https://ui-avatars.com/api/?name=Alex+Kumar&background=random`
  }
];

const recentSuccess = [
  {
    id: 1,
    title: 'E-commerce Platform Redesign',
    description: 'Complete overhaul of UI/UX with 40% increase in conversion rate',
    freelancer: 'Sarah Johnson',
    budget: '45,000'
  },
  {
    id: 2,
    title: 'Custom CRM Development',
    description: 'Scalable solution with advanced reporting features',
    freelancer: 'Michael Chen',
    budget: '75,000'
  },
  {
    id: 3,
    title: 'Mobile App Development',
    description: 'Cross-platform app with 100k+ downloads',
    freelancer: 'Emma Wilson',
    budget: '60,000'
  }
];

const CHomepage = ({ userId, role }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState({
    username: '',
    activeProjects: 0,
    totalSpent: 0,
    pendingTasks: 0
  });
  const [spendingTrend, setSpendingTrend] = useState({
    labels: [],
    datasets: [{
      label: 'Project Investment Trend',
      data: [],
      borderColor: '#14b8a6',
      backgroundColor: 'rgba(20, 184, 166, 0.1)',
      fill: true
    }]
  });

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const fetchUser = async () => {
      setUserLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        });
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
        message.error('Failed to load user data');
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        
        // Fetch dashboard overview data from existing endpoint
        const dashboardResponse = await axios.get('http://127.0.0.1:8000/api/client/dashboard_overview', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        // Fetch spending data from existing endpoint
        const spendingResponse = await axios.get('http://127.0.0.1:8000/api/client/spending_data/', {
          params: { time_frame: 'monthly' },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        setClientData({
          username: dashboardResponse.data.client_username.username,
          activeProjects: dashboardResponse.data.active_projects,
          totalSpent: dashboardResponse.data.total_spent,
          pendingTasks: dashboardResponse.data.pending_tasks
        });

        setSpendingTrend(spendingResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
        message.error('Failed to load homepage data');
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  const handleProfileMenu = (profileComponent) => {
    
    if (location.pathname !== '/client/profile') {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
    }
  };
  const handleMenuClick = (component) => {
    if (location.pathname !== "/client/dashboard") {
      navigate("/client/dashboard", { state: { component } });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <CSider 
        userId={userId} 
        role={role} 
        dropdown={true} 
        collapsed={true} 
        handleMenuClick={handleMenuClick} 
        handleProfileMenu={handleProfileMenu}
      />
    
      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${isMobile ? 'ml-0 pb-16' : 'ml-14 sm:ml-14 md:ml-14 lg:ml-16'}
      `}>
        <CHeader user={user} />
        <div className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
          {/* Hero Section - Made responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 p-6 md:p-12 shadow-xl mb-6 md:mb-8"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-5 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="w-full md:max-w-2xl">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">
                  Welcome back, {clientData.username}! 👋
              </h1>
                <p className="text-base md:text-xl text-teal-50 mb-6 md:mb-8 leading-relaxed">
                  Your workspace is ready. Start exploring talented freelancers and bring your ideas to life.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/client/post-project')}
                    className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-teal-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <RocketOutlined />
                    Post a Project
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/client/dashboard')}
                    className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-teal-700/30 text-white rounded-xl font-semibold hover:bg-teal-700/40 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <TeamOutlined />
                    Find Talent
                  </motion.button>
              </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                {userLoading ? (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 animate-pulse" />
                ) : (
                  user && user.profile_picture && (
                    <motion.img
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      src={`http://localhost:8000${user.profile_picture}`}
                      alt="Profile Photo"
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white/30"
                    />
                  )
                )}
            </div>
          </div>
          </motion.div>

          {/* Stats Grid - Made responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {[
              {
                title: "Active Projects",
                value: clientData.activeProjects,
                icon: "📊",
                desc: "Ongoing projects",
                color: "from-blue-500 to-blue-600",
                onClick: () => navigate('/client/dashboard', { state: { component: 'projects' } })
              },
              {
                title: "Pending Tasks",
                value: `${clientData.pendingTasks}`,
                icon: "✓",
                desc: "Tasks to complete",
                color: "from-teal-500 to-teal-600"
              },
              {
                title: "Total Investment",
                value: `₹${clientData.totalSpent}`,
                icon: "💰",
                desc: "Total spent",
                color: "from-purple-500 to-purple-600"
              },
              {
                title: "Response Rate",
                value: "2.5h",
                icon: "⚡",
                desc: "Average response time",
                color: "from-orange-500 to-orange-600"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={stat.onClick}
                className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ${
                  stat.onClick ? 'cursor-pointer' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                    <p className="text-sm text-gray-400 mt-1">{stat.desc}</p>
                  </div>
                  <div className={`text-3xl p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                    {stat.icon}
            </div>
          </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-400 opacity-50"></div>
              </motion.div>
            ))}
              </div>

          {/* Market Insights & Trending Skills - Made responsive */}
          <Row gutter={[16, 16]} className="mb-6 md:mb-8">
            <Col xs={24} lg={16}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <TrophyOutlined className="text-teal-500" />
                    <span>Investment Analytics</span>
              </div>
                }
                className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 h-[400px] md:h-full"
                extra={
                  <Button type="link" onClick={() => navigate('/client/dashboard')}>
                    View Details
                  </Button>
                }
              >
                <div className="h-[300px] md:h-[400px]">
                  <Line
                    data={spendingTrend}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          titleFont: { 
                            size: 14, 
                            weight: 'bold',
                            family: "'Inter', sans-serif"
                          },
                          bodyFont: { 
                            size: 13,
                            family: "'Inter', sans-serif"
                          },
                          callbacks: {
                            label: function(context) {
                              return `₹ ${context.parsed.y}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { 
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                          },
                          border: {
                            display: false
                          },
                          ticks: {
                            padding: 8,
                            color: '#64748b',
                            font: {
                              size: window.innerWidth < 768 ? 10 : 12,
                              family: "'Inter', sans-serif"
                            },
                            callback: function(value) {
                              return '₹ ' + value;
                            }
                          },
                          title: {
                            display: true,
                            text: 'Investment (₹)',
                            color: '#64748b',
                            font: {
                              size: 13,
                              family: "'Inter', sans-serif",
                              weight: '500'
                            },
                            padding: { bottom: 10 }
                          }
                        },
                        x: {
                          grid: { display: false },
                          border: {
                            display: false
                          },
                          ticks: {
                            padding: 8,
                            color: '#64748b',
                            font: {
                              size: window.innerWidth < 768 ? 10 : 12,
                              family: "'Inter', sans-serif"
                            }
                          },
                          title: {
                            display: true,
                            text: 'Timeline',
                            color: '#64748b',
                            font: {
                              size: 13,
                              family: "'Inter', sans-serif",
                              weight: '500'
                            },
                            padding: { top: 10 }
                          }
                        }
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index'
                      },
                      animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                      }
                    }}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <ThunderboltOutlined className="text-yellow-500" />
                    <span>Trending Skills</span>
              </div>
                }
                className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                bodyStyle={{ 
                  height: '350px',
                  overflow: 'hidden',
                  padding: '16px 8px'
                }}
              >
                <div className="h-full overflow-y-auto pr-2 skills-container">
                  {dummyTrendingSkills.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <Empty 
                        description="No trending skills available" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
                  ) : (
                    <div className="space-y-3">
                      {dummyTrendingSkills.map((skill, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-all duration-300"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-700 text-sm">
                              {skill.name}
                            </span>
                            <Tag 
                              color={skill.demand > 75 ? 'teal' : skill.demand > 50 ? 'blue' : 'default'}
                              className="min-w-[70px] text-center text-xs"
                            >
                              {skill.demand}% demand
                            </Tag>
              </div>
                          <Progress 
                            percent={skill.demand} 
                            showInfo={false}
                            strokeColor={{
                              '0%': '#14b8a6',
                              '100%': '#0d9488',
                            }}
                            trailColor="#e2e8f0"
                            strokeWidth={6}
                            className="custom-progress"
                          />
                        </motion.div>
                      ))}
            </div>
                  )}
          </div>
              </Card>
            </Col>
          </Row>

          {/* Featured Freelancers - Made responsive */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <StarOutlined className="text-yellow-500" />
                <span className="text-base">Top Rated Freelancers</span>
              </div>
            }
            extra={
              <Button type="link" size="small" onClick={() => navigate('/client/search-freelancers')}>
                View All
              </Button>
            }
            className="mb-6 md:mb-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Row gutter={[12, 12]}>
              {dummyTopFreelancers.map((freelancer, index) => (
                <Col xs={12} sm={12} lg={6} key={freelancer.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-3 sm:p-4 rounded-lg border border-gray-100 hover:border-teal-500 transition-all duration-300"
                  >
                    <div className="flex flex-col items-center text-center">
                      <Avatar 
                        size={window.innerWidth < 640 ? 50 : 80}
                        src={freelancer.avatar}
                        className="mb-2 sm:mb-4 ring-2 ring-teal-500 ring-offset-2"
                      />
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                        {freelancer.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                        {freelancer.specialization}
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2 bg-teal-50 px-2 sm:px-3 py-1 rounded-full">
                        <StarOutlined className="text-yellow-500 text-xs sm:text-sm" />
                        <span className="text-teal-700 font-medium text-xs sm:text-sm">
                          {freelancer.rating}
                        </span>
                        <span className="text-gray-400 text-xs">
                          ({freelancer.reviews})
                        </span>
            </div>
          </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Success Stories - Made responsive */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500" />
                <span>Recent Success Stories</span>
              </div>
            }
            className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Timeline mode={window.innerWidth < 768 ? "left" : "alternate"}>
              {recentSuccess.map((story, index) => (
                <Timeline.Item 
                  key={story.id}
                  color="green"
                  dot={<CheckCircleOutlined className="text-teal-500" />}
                >
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-sm"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{story.title}</h4>
                    <p className="text-gray-600 mb-3">{story.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-teal-600 font-medium">
                        By {story.freelancer}
                      </span>
                      <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
                        ₹{story.budget}
                      </span>
                    </div>
                  </motion.div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-progress .ant-progress-inner {
          background-color: #e2e8f0;
        }
        
        .custom-progress .ant-progress-bg {
          height: 8px !important;
        }

        @media (max-width: 767px) {
          .main-content {
            padding-bottom: 4rem !important;
          }
          
          /* Ensure bottom content is visible above nav */
          .ant-card:last-child,
          .timeline-section {
            margin-bottom: 5rem;
          }
        }
      `}</style>
      <style jsx>{`
        .custom-progress .ant-progress-inner {
          border-radius: 999px;
        }
        
        .ant-card-body {
          height: calc(100% - 58px); /* Subtracting card header height */
          display: flex;
          flex-direction: column;
        }
        
        .ant-card-body > div {
          flex: 1;
        }

        .skills-container {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 transparent;
          -webkit-overflow-scrolling: touch;
        }

        .skills-container::-webkit-scrollbar {
          width: 4px;
        }

        .skills-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .skills-container::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 20px;
        }

        .skills-container::-webkit-scrollbar-thumb:hover {
          background-color: #94A3B8;
        }

        @media (max-width: 640px) {
          .ant-card-body {
            padding: 12px 8px;
          }
          
          .ant-card-head-title {
            font-size: 14px;
          }
          
          .ant-card-extra {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default CHomepage;
