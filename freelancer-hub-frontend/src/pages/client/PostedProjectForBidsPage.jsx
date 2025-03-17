import React, { useState, useEffect } from 'react';
import { 
  Modal, Button, Input, Card, Pagination, Tooltip, Progress, 
  Statistic, Empty, Spin, Tag, Rate, Select, Avatar, Timeline,
  Collapse, Badge
} from 'antd';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ProjectOutlined, ClockCircleOutlined, DollarOutlined,
  TeamOutlined, CheckCircleOutlined, FilterOutlined,
  UserOutlined, StarOutlined, MessageOutlined,
  CalendarOutlined, GlobalOutlined, LikeOutlined,
  DislikeOutlined, DownloadOutlined, FileTextOutlined,
  BulbOutlined, TrophyOutlined, SafetyOutlined,
  EnvironmentOutlined, AimOutlined
} from '@ant-design/icons';
import CSider from '../../components/client/CSider';
import CHeader from '../../components/client/CHeader';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useMediaQuery } from 'react-responsive';

const { Panel } = Collapse;
const { Option } = Select;

const formatText = (text) => {
  if (!text) return '';
  return text.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
};

const PostedProjectForBidsPage = ({ userId, role }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { record } = location.state || {}; // Getting the project details passed via navigation
  const [activeComponent, setActiveComponent] = useState('');

  const [selectedFilters, setSelectedFilters] = useState({
    tasks: [],
    skills: [],
    duration: '',
    bidAmount: '',
  });

  const pathnames = location.pathname.split('/').filter((x) => x);

  const handleMenuClick = (component) => {
    if (component !== 'projects') {
      navigate('/client/dashboard', { state: { component } });
    }
  };

  const [activeProfileComponent, setActiveProfileComponent] = useState('');

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/client/profile') {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
    }
  };

  const { id: projectId } = useParams();
  const bidsData = [
    {
      task: 'Data Collection',
      skills: ['Python', 'Pandas'],
      duration: '2 weeks',
      bidAmount: 1400, // Ensure it's a number
      freelancer: 'John Doe',
    },
    {
      task: 'Model Development',
      skills: ['TensorFlow', 'Machine Learning'],
      duration: '3 weeks',
      bidAmount: 2800, // Ensure it's a number
      freelancer: 'Jane Smith',
    },
    {
      task: 'Model Evaluation',
      skills: ['Python', 'Data Analysis'],
      duration: '1 week',
      bidAmount: 1900, // Ensure it's a number
      freelancer: 'Tom Brown',
    },
  ];

  // New state variables for enhanced features
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [projectStats, setProjectStats] = useState({
    totalBids: 0,
    averageBid: 0,
    lowestBid: 0,
    highestBid: 0,
  });

  // Enhanced dummy data with more details
  const enhancedBidsData = [
    {
      id: 1,
      freelancer: {
        name: 'John Doe',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        rating: 4.8,
        completedProjects: 45,
        country: 'United States',
      },
      proposal: "I have extensive experience in similar projects and can deliver high-quality results within the specified timeframe.",
      task: 'Data Collection',
      skills: ['Python', 'Pandas', 'Data Mining'],
      duration: '2 weeks',
      bidAmount: 1400,
      experience: '5 years',
      completionRate: 98,
      responseTime: '2 hours',
    },
    // ... more enhanced bid data ...
  ];

  // New state for enhanced features
  const [activeTab, setActiveTab] = useState('overview');
  const [milestones, setMilestones] = useState([]);
  const [projectAnalytics, setProjectAnalytics] = useState({
    viewCount: 245,
    bidEngagement: 68,
    averageRating: 4.2,
    completionEstimate: 85
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  // Responsive layout hooks
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/client/get_project/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('accessToken')}`,
            },
          }
        );
        const isCollaborative = response.data.is_collaborative;
        setProject(response.data);
        console.log(response.data.tasks);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBidsDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/client/get_bids_on_project/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('accessToken')}`,
            },
          }
        );
        const bids = response.data;
        console.log(bids);
        setLoading(false);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBidsDetails();
    fetchProjectDetails();
  }, [projectId]);

  const handleFilterChange = (key, value) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  // Project Overview Section
  const ProjectOverview = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Project Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: "Total Bids",
            value: projectStats.totalBids,
            icon: <TeamOutlined />,
            color: "bg-violet-500"
          },
          {
            title: "Average Bid",
            value: `₹${projectStats.averageBid}`,
            icon: <DollarOutlined />,
            color: "bg-teal-500"
          },
          {
            title: "Time Left",
            value: "5 days",
            icon: <ClockCircleOutlined />,
            color: "bg-amber-500"
          },
          {
            title: "Success Rate",
            value: "75%",
            icon: <TrophyOutlined />,
            color: "bg-emerald-500"
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={`${stat.color} rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div className="text-3xl opacity-80">{stat.icon}</div>
              <div className="text-right">
                <div className="text-sm opacity-80">{stat.title}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Description Card */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileTextOutlined className="text-violet-500" />
          Project Description
        </h3>
        <div className="prose max-w-none text-gray-600">
          <div dangerouslySetInnerHTML={{ __html: project?.description }} />
        </div>
      </motion.div>

      {/* Project Requirements */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BulbOutlined className="text-amber-500" />
          Project Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-3">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {project?.skills?.map((skill, index) => (
                <Tag key={index} color="blue" className="px-3 py-1 rounded-full">
                  {skill}
                </Tag>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-3">Project Scope</h4>
            <Timeline>
              {project?.tasks?.map((task, index) => (
                <Timeline.Item 
                  key={index}
                  color="blue"
                  dot={<AimOutlined style={{ fontSize: '16px' }} />}
                >
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-500">{task.description}</div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  // Bids Section
  const BidsSection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-lg">
        <div className="flex gap-3 flex-wrap">
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange('status', value)}
          >
            <Option value="all">All Bids</Option>
            <Option value="pending">Pending</Option>
            <Option value="shortlisted">Shortlisted</Option>
          </Select>
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange('budget', value)}
          >
            <Option value="all">All Budgets</Option>
            <Option value="low">Under ₹1000</Option>
            <Option value="medium">₹1000-₹5000</Option>
            <Option value="high">Above ₹5000</Option>
          </Select>
        </div>
        <Select
          defaultValue="recent"
          style={{ width: 150 }}
          onChange={(value) => setSortBy(value)}
        >
          <Option value="recent">Most Recent</Option>
          <Option value="rating">Highest Rated</Option>
          <Option value="budget">Lowest Budget</Option>
        </Select>
      </div>

      {/* Bids List */}
      <AnimatePresence>
        {enhancedBidsData.map((bid, index) => (
          <motion.div
            key={bid.id}
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Freelancer Info */}
              <div className="md:w-1/4">
                <div className="flex flex-col items-center text-center">
                  <Avatar 
                    size={80} 
                    src={bid.freelancer.avatar}
                    className="ring-2 ring-violet-500 ring-offset-2"
                  />
                  <h4 className="mt-2 font-semibold text-lg">
                    {bid.freelancer.name}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <GlobalOutlined />
                    {bid.freelancer.country}
                  </div>
                  <Rate 
                    disabled 
                    defaultValue={bid.freelancer.rating} 
                    className="text-amber-400"
                  />
                  <div className="mt-2">
                    <Tag color="green">
                      {bid.completionRate}% Success Rate
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Bid Details */}
              <div className="md:w-3/4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      ₹{bid.bidAmount}
                    </h3>
                    <div className="text-sm text-gray-500">
                      Delivery in {bid.duration}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="primary"
                      className="bg-violet-500 hover:bg-violet-600"
                      onClick={() => setSelectedBid(bid)}
                    >
                      View Details
                    </Button>
                    <Button
                      icon={<MessageOutlined />}
                      className="border-violet-500 text-violet-500"
                    >
                      Message
                    </Button>
                  </div>
                </div>

                <Collapse 
                  ghost 
                  className="border-none"
                  expandIcon={({ isActive }) => (
                    <motion.div
                      animate={{ rotate: isActive ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▶
                    </motion.div>
                  )}
                >
                  <Panel header="View Proposal" key="1">
                    <div className="text-gray-600">
                      {bid.proposal}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {bid.skills.map((skill, idx) => (
                        <Tag key={idx} color="cyan">{skill}</Tag>
                      ))}
                    </div>
                  </Panel>
                </Collapse>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination
          current={1}
          total={50}
          pageSize={5}
          showSizeChanger={false}
          className="shadow-lg rounded-full bg-white px-4 py-2"
        />
      </div>
    </motion.div>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project || !project.tasks) {
    return <div>No project details available.</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CSider
        userId={userId}
        role={role}
        dropdown={true}
        collapsed={isMobile || isTablet}
        handleMenuClick={handleMenuClick}
        activeComponent={activeComponent}
        handleProfileMenu={handleProfileMenu}
        activeProfileComponent={activeProfileComponent}
      />

      <div className={`flex-1 flex flex-col overflow-hidden ${
        isMobile ? 'ml-0' : isTablet || isDesktop ? 'ml-14' : 'ml-64'
      }`}>
        <CHeader userId={userId} />

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Project Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {project?.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Tag color="violet">{formatText(project?.status)}</Tag>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">
                      Posted {project?.created_at}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="default" icon={<DownloadOutlined />}>
                    Export
                  </Button>
                  <Button 
                    type="primary" 
                    className="bg-violet-500 hover:bg-violet-600"
                  >
                    Edit Project
                  </Button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-lg p-2">
              <div className="flex overflow-x-auto">
                {['overview', 'bids', 'analytics'].map((tab) => (
                  <Button
                    key={tab}
                    type={activeTab === tab ? 'primary' : 'text'}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-lg ${
                      activeTab === tab 
                        ? 'bg-violet-500 text-white' 
                        : 'text-gray-600'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && <ProjectOverview />}
                {activeTab === 'bids' && <BidsSection />}
                {activeTab === 'analytics' && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-6">
                      Project Analytics
                    </h3>
                    {/* Add analytics content here */}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Bid Details Modal */}
      <Modal
        visible={!!selectedBid}
        onCancel={() => setSelectedBid(null)}
        footer={null}
        width={800}
        className="bid-details-modal"
        title={
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-xl font-semibold text-gray-800">Bid Details</h3>
            <Tag color={
              selectedBid?.status === 'accepted' ? 'success' :
              selectedBid?.status === 'rejected' ? 'error' : 
              'processing'
            }>
              {formatText(selectedBid?.status) || 'Pending'}
            </Tag>
          </div>
        }
      >
        {selectedBid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 py-4"
          >
            {/* Freelancer Info Section */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <Avatar size={80} src={selectedBid.freelancer.avatar} />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {selectedBid.freelancer.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <GlobalOutlined />
                      {selectedBid.freelancer.country}
                      <span>•</span>
                      <Rate disabled defaultValue={selectedBid.freelancer.rating} className="text-yellow-400" />
                      <span>({selectedBid.freelancer.rating})</span>
                    </div>
                  </div>
                  <Button
                    icon={<MessageOutlined />}
                    type="primary"
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    Contact Freelancer
                  </Button>
                </div>
              </div>
            </div>

            {/* Bid Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <Card className="shadow-sm">
                  <h5 className="text-base font-medium mb-3">Budget Information</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Budget Type:</span>
                      <Tag color="blue">{formatText(selectedBid?.budget_type) || 'Individual'}</Tag>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Bid Amount:</span>
                      <span className="text-xl font-semibold text-teal-600">
                        ₹{selectedBid.bidAmount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estimated Duration:</span>
                      <span className="font-medium">{selectedBid.duration}</span>
                    </div>
                  </div>
                </Card>

                <Card className="shadow-sm">
                  <h5 className="text-base font-medium mb-3">Communication</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Preferred Channel:</span>
                      <Tag color="purple">
                        {formatText(selectedBid?.communication_channels) || 'Chat'}
                      </Tag>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Response Time:</span>
                      <span>{selectedBid.responseTime}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Card className="shadow-sm">
                  <h5 className="text-base font-medium mb-3">Experience & Skills</h5>
                  <div className="space-y-3">
                    <div>
                      <div className="text-gray-600 mb-2">Relevant Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedBid.skills.map((skill, idx) => (
                          <Tag key={idx} color="cyan">{skill}</Tag>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Experience Level:</span>
                      <span>{selectedBid.experience}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completed Projects:</span>
                      <span>{selectedBid.freelancer.completedProjects}</span>
                    </div>
                  </div>
                </Card>

                <Card className="shadow-sm">
                  <h5 className="text-base font-medium mb-3">Additional Information</h5>
                  {selectedBid.link && (
                    <div className="mb-3">
                      <div className="text-gray-600 mb-1">Portfolio Link:</div>
                      <a 
                        href={selectedBid.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-teal-500 hover:text-teal-600"
                      >
                        View Portfolio
                      </a>
                    </div>
                  )}
                  {selectedBid.media_files && (
                    <div>
                      <div className="text-gray-600 mb-1">Attached Files:</div>
                      <Button icon={<DownloadOutlined />} size="small">
                        Download Files
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Proposal Section */}
            <Card className="shadow-sm">
              <h5 className="text-base font-medium mb-3">Proposal</h5>
              <div className="text-gray-600 whitespace-pre-line">
                {selectedBid.proposal}
              </div>
            </Card>

            {/* Task-specific Budgets */}
            {selectedBid.budget_type === 'individual' && (
              <Card className="shadow-sm">
                <h5 className="text-base font-medium mb-3">Task-specific Budgets</h5>
                <div className="space-y-3">
                  {project?.tasks.map((task, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">{task.title}</span>
                      <Tag color="blue">₹{selectedBid.task_budgets?.[task.id] || 0}</Tag>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button danger onClick={() => setSelectedBid(null)}>
                Close
              </Button>
              <Button 
                type="primary" 
                className="bg-teal-500 hover:bg-teal-600"
                onClick={() => {/* Handle bid acceptance */}}
              >
                Accept Bid
              </Button>
            </div>
          </motion.div>
        )}
      </Modal>

      <style jsx>{`
        .bid-details-modal .ant-modal-content {
          border-radius: 1rem;
          overflow: hidden;
        }
        .bid-details-modal .ant-modal-header {
          border-bottom: none;
          padding: 1.5rem;
        }
        .bid-details-modal .ant-modal-body {
          padding: 0 1.5rem 1.5rem;
        }
        .bid-details-modal .ant-card {
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default PostedProjectForBidsPage;
