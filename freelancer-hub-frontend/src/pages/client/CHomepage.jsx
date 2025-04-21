import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  Card, Button, Statistic, Timeline, Progress, Row, Col, Avatar, 
  message, Empty, Tag, Tooltip, Badge, Skeleton, Dropdown, Menu,
  Divider
} from 'antd';
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
  TrophyOutlined,
  UserOutlined,
  BellOutlined,
  FilterOutlined,
  EllipsisOutlined,
  ArrowRightOutlined,
  LineChartOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  SettingOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { FaStar, FaRegStar, FaStarHalfAlt, FaBriefcase, FaChartLine, FaUserTie } from "react-icons/fa";


// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

// Registering required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);


const CHomepage = ({ userId, role }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState({
    activeProjects: 0,
    totalSpent: 0,
    pendingTasks: 0,
    trendingSkills: [],
    topFreelancers: [],
    recentSuccess: []
  });
  const [spendingTrend, setSpendingTrend] = useState({
    labels: [],
    datasets: [{
      label: 'Project Investment Trend',
      data: [],
      borderColor: '#1B2B65',
      backgroundColor: 'rgba(27, 43, 101, 0.05)',
      fill: true,
      tension: 0.4,
      borderWidth: 2
    }]
  });

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

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
        
        // Fetch homepage data from the new endpoint
        const response = await axios.get('http://127.0.0.1:8000/api/client/homepage/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        // Fetch spending data for investment analysis
        const spendingResponse = await axios.get('http://127.0.0.1:8000/api/client/spending_data/', {
          params: { time_frame: 'monthly' },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        // Update clientData with new structure
        setClientData({
          activeProjects: response.data.active_projects,
          totalSpent: response.data.total_spent || 0, // Ensure it defaults to 0 if undefined
          pendingTasks: response.data.pending_tasks,
          trendingSkills: response.data.trending_skills || [],
          topFreelancers: response.data.top_freelancers || [],
          recentSuccess: response.data.success_stories.map(story => ({
            title: story.title,
            description: story.description, // Use dangerouslySetInnerHTML for HTML content
            budget: story.budget,
            freelancers: story.freelancers // Include freelancers in the success stories
          })) || []
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
  }, [user]);


  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/client/profile') {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
    }
  };

  // Options menu for card actions
  const moreMenu = (
    <Menu>
      <Menu.Item key="1" icon={<FilterOutlined />}>Filter Data</Menu.Item>
      <Menu.Item key="2" icon={<SettingOutlined />}>Settings</Menu.Item>
      <Menu.Item key="3" icon={<FileProtectOutlined />}>Export Report</Menu.Item>
    </Menu>
  );

  const renderStars = (rating) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= rating) {
          return <FaStar key={star} className="text-yellow-400" />;
        } else if (star - 0.5 <= rating) {
          return <FaStarHalfAlt key={star} className="text-yellow-400" />;
        }
        return <FaRegStar key={star} className="text-yellow-400" />;
      })}
    </div>
  );

  return (
    <div className="flex h-screen bg-client-bg-primary">
      <CSider 
        userId={userId} 
        role={role} 
        dropdown={true} 
        collapsed={true} 
        handleProfileMenu={handleProfileMenu}
      />
    
      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${isMobile ? 'ml-0 pb-16' : 'ml-14 sm:ml-14 md:ml-14 lg:ml-14'}
      `}>
        <CHeader userId={userId}/>
        
        <div className="flex-1 overflow-auto bg-[#F8FAFD] p-5 md:p-8">
          {/* Premium Breadcrumb Navigation */}
          <div className="flex items-center text-client-text-secondary text-sm mb-8">
            <span className="hover:text-client-primary cursor-pointer transition-colors duration-200">Dashboard</span>
            <span className="mx-2 text-client-secondary">›</span>
            <span className="text-client-primary font-medium">Home</span>
          </div>
          
          {/* Enhanced Welcome Section with Premium Gradient */}
          <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-client-bg-gradient-start via-client-bg-gradient-middle to-client-bg-gradient-end shadow-client-lg mb-8"
            >
              <div className="absolute inset-0 bg-[url('/patterns/subtle-dots.png')] opacity-5"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
              <div className="relative z-10 p-10 md:p-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    {userLoading ? (
                      <Skeleton.Avatar active size={96} className="flex-shrink-0" />
                    ) : (
                      user && user.profile_picture && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative"
                        >
                          <Avatar 
                            src={`http://localhost:8000${user.profile_picture}`}
                            alt="Profile Photo"
                            size={96}
                            className="border-4 border-white/20 shadow-2xl flex-shrink-0"
                          />
                          <Badge 
                            status="success" 
                            className="absolute bottom-1 right-1 w-4 h-4 border-2 border-[#2A4178]" 
                          />
                        </motion.div>
                      )
                    )}
                    <div>
                      <span className="text-[#A3B8F6] text-sm font-medium mb-2 block">Welcome back</span>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                        {user?.username || 'User'} 
              </h1>
                      <p className="text-[#CBD5E0] text-base md:text-lg font-light">
                        Manage your projects and connect with top talent
                </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/client/post-project')}
                      className="px-6 py-3 bg-white text-client-primary rounded-xl font-semibold shadow-client-button hover:shadow-client-button-hover transition-all duration-300 flex items-center gap-2 group"
                  >
                      <FaBriefcase className="text-sm transition-transform group-hover:scale-110" />
                      New Project
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/client/find-talent')}
                      className="px-6 py-3 bg-[#2A4178] text-white rounded-xl font-semibold hover:bg-[#395693] transition-all duration-300 flex items-center gap-2 group border border-white/10"
                  >
                      <FaUserTie className="text-sm transition-transform group-hover:scale-110" />
                    Find Talent
                  </motion.button>
              </div>
              </div>

                {/* Premium Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-client-border-light">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2A4178] to-[#395693] flex items-center justify-center text-white shadow-lg">
                      <ProjectOutlined className="text-xl" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">Active Projects</p>
                      <p className="text-white text-2xl font-bold">{clientData.activeProjects}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2A4178] to-[#395693] flex items-center justify-center text-white shadow-lg">
                      <CheckCircleOutlined className="text-xl" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">Pending Tasks</p>
                      <p className="text-white text-2xl font-bold">{clientData.pendingTasks}</p>
            </div>
          </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2A4178] to-[#395693] flex items-center justify-center text-white shadow-lg">
                      <DollarOutlined className="text-xl" />
                    </div>
                  <div>
                      <p className="text-white/70 text-sm font-medium">Total Investment</p>
                      <p className="text-white text-2xl font-bold">₹{clientData.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2A4178] to-[#395693] flex items-center justify-center text-white shadow-lg">
                      <ClockCircleOutlined className="text-xl" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">Response Time</p>
                      <p className="text-white text-2xl font-bold">2.5h</p>
                    </div>
            </div>
          </div>
              </div>
              </motion.div>
              </div>

          {/* Main Content - Made responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Investment Analytics Chart - 2 cols */}
            <div className="lg:col-span-2">
              <Card 
                title={
                  <div className="flex items-center gap-2 text-client-text-primary">
                    <LineChartOutlined className="text-client-primary" />
                    <span className="font-semibold">Investment Analytics</span>
              </div>
                }
                className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-0"
                extra={
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#666]">Total: ₹{clientData.totalSpent.toLocaleString()}</span>
                    <Dropdown overlay={moreMenu} trigger={['click']}>
                      <Button 
                        type="text" 
                        icon={<EllipsisOutlined />} 
                        className="flex items-center justify-center hover:bg-[#f0f2f5]"
                      />
                    </Dropdown>
                  </div>
                }
                bodyStyle={{ padding: '10px 0' }}
              >
                <div className="flex flex-col h-full">
                  <div className="px-6 pb-4">
                    <div className="flex items-center justify-between text-sm text-[#666] mb-2">
                      <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1">
                          <span className="inline-block w-3 h-3 bg-[#003366] rounded-full"></span>
                          Current Period
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block w-3 h-3 bg-[#C0C0C0] rounded-full"></span>
                          Previous Period
                        </span>
                      </div>
                      <div>
                        <select className="bg-[#f5f7fa] border border-[#e0e0e0] rounded-md px-2 py-1 text-sm">
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="h-[300px] md:h-[320px] px-4">
                  <Line
                    data={spendingTrend}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 51, 102, 0.8)',
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
                                return `₹ ${context.parsed.y.toLocaleString()}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { 
                              color: 'rgba(0, 0, 0, 0.04)',
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
                                return '₹ ' + value.toLocaleString();
                              }
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
                          }
                        }
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index'
                      },
                        elements: {
                          point: {
                            radius: 3,
                            hoverRadius: 5
                          },
                          line: {
                            tension: 0.4
                          }
                      },
                      animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                      }
                    }}
                  />
                  </div>
                  
                  <div className="mt-auto pt-4 px-6 flex justify-between items-center border-t border-[#f0f2f5]">
                    <div className="text-sm">
                      <span className="text-[#666]">Monthly Growth: </span>
                      <span className="font-medium text-green-600">+12.3%</span>
                    </div>
                    <Button 
                      type="link"
                      onClick={() => navigate('/client/dashboard')}
                      className="text-[#003366] hover:text-[#0055b3] font-medium flex items-center gap-1"
                    >
                      View Details <ArrowRightOutlined />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Trending Skills - 1 col */}
              <Card 
                title={
                <div className="flex items-center gap-2 text-client-text-primary">
                  <ThunderboltOutlined className="text-client-primary" />
                  <span className="font-semibold">Trending Skills</span>
              </div>
                }
              className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-0"
              extra={
                <Dropdown overlay={moreMenu} trigger={['click']}>
                  <Button 
                    type="text" 
                    icon={<EllipsisOutlined />} 
                    className="flex items-center justify-center hover:bg-[#f0f2f5]"
                  />
                </Dropdown>
              }
                bodyStyle={{ 
                  height: '350px',
                  overflow: 'hidden',
                padding: '0'
                }}
              >
              <div className="h-full overflow-y-auto pr-2 skills-container p-4">
                  {clientData.trendingSkills.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <Empty 
                        description="No trending skills available" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
                  ) : (
                  <div className="space-y-4">
                      {clientData?.trendingSkills.map((skill, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        className="bg-[#F9FAFB] p-4 rounded-lg hover:bg-[#F0F4F8] transition-all duration-300 border border-[#E5E7EB] hover:border-[#C0C0C0]"
                        >
                          <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-[#333333]">
                              {skill.name}
                            </span>
                            <Tag 
                            color={skill.demand > 75 ? '#003366' : skill.demand > 50 ? '#0055b3' : '#C0C0C0'}
                            className="min-w-[70px] text-center text-xs font-medium rounded-md"
                            >
                              {skill.demand}% demand
                            </Tag>
              </div>
                          <Progress 
                            percent={skill.demand} 
                            showInfo={false}
                            strokeColor={{
                            '0%': 'var(--client-primary)',
                            '100%': 'var(--client-primary-light)',
                            }}
                          trailColor="var(--client-secondary-light)"
                            strokeWidth={6}
                            className="custom-progress"
                          />
                        <div className="flex justify-between items-center mt-2 text-xs text-[#666]">
                          <span>Top matches: {Math.round(skill.demand / 10)}</span>
                          <span>Growth: +{Math.round(skill.demand / 5)}%</span>
                        </div>
                        </motion.div>
                      ))}
            </div>
                  )}
          </div>
              </Card>
          </div>

          {/* Top Rated Freelancers Section */}
          <Card 
            title={
              <div className="flex items-center gap-2 text-client-text-primary">
                <StarOutlined className="text-client-primary" />
                <span className="font-semibold">Top Rated Freelancers</span>
              </div>
            }
            extra={
              <Button 
                type="text" 
                className="text-client-primary hover:text-client-primary-light font-medium"
                onClick={() => navigate('/client/search-freelancers')}
              >
                View All
              </Button>
            }
            className="mb-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-0"
          >
            <Row gutter={[16, 16]}>
              {clientData.topFreelancers.map((freelancer, index) => (
                <Col xs={12} sm={12} md={8} lg={6} key={freelancer.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-4 rounded-lg border border-[#E5E7EB] hover:border-[#C0C0C0] hover:shadow-md transition-all duration-300"
                    onClick={() => navigate(`/client/freelancer/${freelancer.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="relative">
                      <Avatar 
                          size={80}
                          src={freelancer.avatar ? `http://localhost:8000${freelancer.avatar}` : null}
                          icon={!freelancer.avatar && <UserOutlined />}
                          className="mb-3 border-2 border-[#f0f2f5]"
                        />
                        {index < 3 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#003366] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-[#333333] mb-1">
                        {freelancer.name}
                      </h4>
                      <p className="text-sm text-[#666666] mb-2 line-clamp-1">
                        {freelancer.specialization}
                      </p>
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(freelancer.rating)}
                        <span className="text-[#003366] font-medium text-sm ml-1">
                          {freelancer.rating}
                        </span>
                      </div>
                      <div className="w-full flex justify-between items-center mt-2 pt-2 border-t border-[#f0f2f5] text-xs">
                        <span className="text-[#666]">₹{freelancer.hourlyRate || '800'}/hr</span>
                        <span className="text-[#666]">{freelancer.completedProjects || '12'} projects</span>
            </div>
          </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Success Stories Section */}
          <Card 
            title={
              <div className="flex items-center gap-2 text-client-text-primary">
                <TrophyOutlined className="text-client-primary" />
                <span className="font-semibold">Recent Success Stories</span>
              </div>
            }
            className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-0"
            extra={
              <Dropdown overlay={moreMenu} trigger={['click']}>
                <Button 
                  type="text" 
                  icon={<EllipsisOutlined />} 
                  className="flex items-center justify-center hover:bg-[#f0f2f5]"
                />
              </Dropdown>
            }
          >
            <Timeline mode={window.innerWidth < 768 ? "left" : "alternate"}>
              {clientData.recentSuccess.map((story, index) => (
                <Timeline.Item 
                  key={index}
                  color="#003366"
                  dot={<CheckCircleOutlined className="text-[#003366]" />}
                >
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-[#E5E7EB] hover:border-[#C0C0C0] hover:shadow-md transition-all duration-200"
                  >
                    <h4 className="font-semibold text-[#333333] mb-3">{story.title}</h4>
                    <p className="text-[#555555] mb-4 text-sm leading-relaxed line-clamp-3" 
                      dangerouslySetInnerHTML={{ __html: story.description }} 
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#003366] font-medium">
                        By {story.freelancers.map(freelancer => (
                          <Tooltip title={`View ${freelancer.username}'s profile`} key={freelancer.id}>
                          <Link 
                            to={`/client/profile/${freelancer.id}`} 
                            className="hover:underline"
                          >
                            {freelancer.username}
                          </Link>
                          </Tooltip>
                        )).reduce((prev, curr) => [prev, ', ', curr], [])}
                      </span>
                      <span className="bg-[#F0F4F8] text-[#003366] px-3 py-1 rounded-full font-medium">
                        ₹{story.budget.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx global>{`
        .ant-card {
          border-radius: 1rem;
          border: none;
          box-shadow: var(--shadow-client-sm);
          transition: all 0.3s ease;
        }

        .ant-card:hover {
          box-shadow: var(--shadow-client-md);
        }

        .ant-card-head {
          border-bottom: 1px solid rgba(27, 43, 101, 0.08);
          padding: 20px 24px;
        }

        .ant-card-head-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--client-text-primary);
        }

        .ant-progress-bg {
          background: linear-gradient(to right, var(--client-primary), var(--client-primary-light));
        }

        .ant-btn {
          border-radius: 0.75rem;
          height: 2.75rem;
          padding: 0 1.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .ant-btn-primary {
          background: linear-gradient(to right, var(--client-primary), var(--client-primary-light));
          border: none;
          box-shadow: var(--shadow-client-button);
        }

        .ant-btn-primary:hover {
          background: linear-gradient(to right, var(--client-primary-dark), var(--client-primary));
          transform: translateY(-1px);
          box-shadow: var(--shadow-client-button-hover);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F8FAFD;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E0;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A0AEC0;
        }
      `}</style>
    </div>
  );
};

export default CHomepage;
