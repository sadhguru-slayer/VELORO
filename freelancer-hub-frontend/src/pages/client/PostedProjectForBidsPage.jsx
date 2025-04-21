import React, { useState, useEffect } from 'react';
import { 
  Modal, Button, Input, Card, Pagination, Tooltip, Progress, 
  Statistic, Empty, Spin, Tag, Rate, Select, Avatar, Timeline,
  Collapse, Badge, Alert
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
  EnvironmentOutlined, AimOutlined, InfoCircleOutlined,
  UpOutlined, DownOutlined, EditOutlined
} from '@ant-design/icons';
import CSider from '../../components/client/CSider';
import CHeader from '../../components/client/CHeader';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useMediaQuery } from 'react-responsive';
import moment from 'moment';

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
        console.log(response.data);
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

  // Add new component for Milestone Display
  const MilestoneCard = ({ milestone }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 border-l-4"
      style={{
        borderLeftColor: milestone.milestone_type === 'progress' ? '#10b981' : 
                        milestone.milestone_type === 'payment' ? '#6366f1' : '#8b5cf6'
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">{milestone.title}</h4>
          <div className="flex items-center gap-2 mt-2">
            <Tag color={
              milestone.milestone_type === 'progress' ? 'success' :
              milestone.milestone_type === 'payment' ? 'blue' : 'purple'
            } className="rounded-full">
              {milestone.milestone_type === 'hybrid' ? 'Progress & Payment' :
               `${milestone.milestone_type.charAt(0).toUpperCase()}${milestone.milestone_type.slice(1)} Only`}
            </Tag>
            <span className="text-sm text-gray-500">
              Due: {moment(milestone.due_date).format('MMM D, YYYY')}
            </span>
          </div>
        </div>
        {milestone.amount > 0 && (
          <div className="text-right">
            <div className="text-xl font-semibold text-teal-600">₹{milestone.amount}</div>
            {milestone.status === 'paid' && (
              <Tag color="success" className="mt-1">Paid</Tag>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <Progress 
          percent={milestone.status === 'paid' ? 100 : 
                  milestone.status === 'approved' ? 75 : 
                  milestone.status === 'pending' ? 25 : 0}
          status={milestone.status === 'paid' ? 'success' : 'active'}
          strokeColor={{
            '0%': '#14B8A6',
            '100%': '#0F766E',
          }}
        />
      </div>
    </motion.div>
  );

  // Add new component for Task Display with Milestones
  const TaskCard = ({ task }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {task.tags.map((tag, index) => (
              <Tag key={index} className="rounded-full bg-teal-50 text-teal-700 border-teal-200">
                {tag}
              </Tag>
            ))}
          </div>
        </div>
        <Tag color={
          task.status === 'completed' ? 'success' :
          task.status === 'ongoing' ? 'processing' :
          task.status === 'review' ? 'warning' : 'default'
        } className="rounded-full">
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </Tag>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Avatar src={task.assignedTo.avatar} size="small" />
          <span className="text-sm text-gray-600">{task.assignedTo.name}</span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <CalendarOutlined className="text-teal-500" />
          <span className="text-sm text-gray-600">{moment(task.deadline).format('MMM D, YYYY')}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-500">Progress</span>
          <span className="text-sm font-medium text-teal-600">{task.progress}%</span>
        </div>
        <Progress 
          percent={task.progress} 
          size="small" 
          strokeColor={{
            '0%': '#14B8A6',
            '100%': '#0F766E',
          }}
          showInfo={false}
        />
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <Tooltip title="Estimated Hours">
            <span className="text-sm text-gray-500">
              <ClockCircleOutlined className="mr-1" />
              {task.estimatedHours}h
            </span>
          </Tooltip>
          <Tooltip title="Logged Hours">
            <span className="text-sm text-gray-500">
              <FieldTimeOutlined className="mr-1" />
              {task.loggedHours}h
            </span>
          </Tooltip>
        </div>
        <div className="flex gap-2">
          <Button 
            type="text" 
            size="small" 
            icon={<EditOutlined />}
            className="text-teal-500 hover:text-teal-600"
          />
          {task.status !== 'completed' && (
            <Button
              type="primary"
              size="small"
              icon={<ClockCircleOutlined />}
              className="bg-teal-500 hover:bg-teal-600"
              onClick={() => startTimeTracking(task.id)}
            >
              Track
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Update ProjectOverview component
  const ProjectOverview = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Project Summary Card */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Project Details */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-4 text-teal-700">
              About This Project
            </h3>
            <div className="prose max-w-none text-gray-600 mb-6">
              <div dangerouslySetInnerHTML={{ __html: project?.description }} />
            </div>
            
            {/* Skills Required */}
            <div className="bg-teal-50 p-4 rounded-lg">
              <h4 className="font-medium text-teal-700 mb-2">Skills Required</h4>
              <div className="flex flex-wrap gap-2">
                {project?.skills_required?.map((skill, index) => (
                  <Tag key={index} className="bg-teal-100 text-teal-700 border-none px-3 py-1">
                    {skill.name}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Key Project Stats */}
          <div className="lg:w-1/3 space-y-4">
            <Card className="border-teal-100 shadow-sm">
              <Statistic
                title={<span className="text-teal-700">Project Budget</span>}
                value={project?.budget}
                prefix="₹"
                precision={2}
                className="text-teal-700"
              />
              <div className="mt-4">
                <Progress
                  percent={((project?.total_spent || 0) / project?.budget) * 100}
                  status="active"
                  strokeColor={{
                    '0%': '#14B8A6',
                    '100%': '#0F766E',
                  }}
                />
                <div className="text-sm text-teal-600 mt-1">
                  Spent: ₹{project?.total_spent || 0}
                </div>
              </div>
            </Card>

            <Card className="border-teal-100 shadow-sm">
              <Statistic
                title={<span className="text-teal-700">Time Remaining</span>}
                value={Math.ceil((new Date(project?.deadline) - new Date()) / (1000 * 60 * 60 * 24))}
                suffix="days"
                prefix={<CalendarOutlined className="text-teal-600" />}
              />
              <div className="text-sm text-teal-600 mt-2">
                Deadline: {new Date(project?.deadline).toLocaleDateString()}
              </div>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: "Tasks",
            value: `${project?.tasks?.filter(t => t.status === 'completed').length || 0}/${project?.tasks?.length || 0}`,
            icon: <ProjectOutlined />,
            color: "bg-teal-600",
            subtext: "Completed"
          },
          {
            title: "Progress",
            value: `${Math.round(project?.get_progress || 0)}%`,
            icon: <CheckCircleOutlined />,
            color: "bg-teal-700",
            subtext: "Overall Completion"
          },
          {
            title: "Milestones",
            value: (project?.milestones?.filter(m => m.status === 'completed').length || 0) + 
                   '/' + (project?.milestones?.length || 0),
            icon: <SafetyOutlined />,
            color: "bg-teal-800",
            subtext: "Completed"
          },
          {
            title: "Payment Status",
            value: project?.payment_status === 'completed' ? 'Paid' : 'In Progress',
            icon: <DollarOutlined />,
            color: "bg-teal-900",
            subtext: `${((project?.total_spent || 0) / project?.budget * 100).toFixed(0)}% Released`
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
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.title}</div>
                <div className="text-xs opacity-70">{stat.subtext}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tasks and Milestones Overview */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
        {/* Project Level Milestones */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-teal-600 rounded-full"></div>
            <h3 className="text-xl font-semibold text-teal-700">Project Milestones</h3>
        </div>
          
          <div className="bg-teal-50/50 rounded-lg p-4 mb-4">
            <p className="text-teal-700">
              <InfoCircleOutlined className="mr-2" />
              Project milestones are high-level goals that track overall project progress
            </p>
          </div>

          {project?.milestones?.length > 0 ? (
            <div className="space-y-4">
              {project.milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className="border border-teal-100 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
          <div>
                      <h4 className="font-medium text-teal-700">{milestone.title}</h4>
                      <Tag color={milestone.milestone_type === 'progress' ? 'blue' : 'cyan'}>
                        {milestone.milestone_type === 'hybrid' ? 'Progress & Payment' :
                         `${milestone.milestone_type.charAt(0).toUpperCase()}${milestone.milestone_type.slice(1)} Only`}
                </Tag>
                    </div>
                    {(milestone.milestone_type === 'payment' || milestone.milestone_type === 'hybrid') && (
                      <div className="text-right">
                        <div className="text-lg font-semibold text-teal-700">₹{milestone.amount}</div>
                      </div>
                    )}
                  </div>
                  <Progress 
                    percent={milestone.status === 'completed' ? 100 : 
                            milestone.status === 'in_progress' ? 50 : 25}
                    strokeColor={{
                      '0%': '#14B8A6',
                      '100%': '#0F766E',
                    }}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          ) : (
            <Alert
              message="No Project-Level Milestones"
              description="This project uses task-based milestone tracking"
              type="info"
              className="border-teal-100"
            />
          )}
          </div>

        {/* Task Level Milestones */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="text-xl font-semibold text-blue-700">Tasks & Their Milestones</h3>
          </div>

          <div className="bg-blue-50/50 rounded-lg p-4 mb-4">
            <p className="text-blue-700">
              <InfoCircleOutlined className="mr-2" />
              Tasks are individual work items, each with their own set of milestones
            </p>
          </div>

          <div className="space-y-6">
              {project?.tasks?.map((task, index) => (
              <div key={index} className="border border-blue-100 rounded-lg overflow-hidden">
                {/* Task Header */}
                <div className="bg-blue-50/50 p-4 border-b border-blue-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-blue-700 text-lg">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Tag color={task.status === 'completed' ? 'success' : 'processing'}>
                          {formatText(task.status)}
                        </Tag>
                        <span className="text-blue-600">
                          Budget: ₹{task.budget}
                        </span>
                      </div>
                    </div>
                    <Button 
                      type="text"
                      icon={task.expanded ? <UpOutlined /> : <DownOutlined />}
                      onClick={() => toggleTask(index)}
                      className="text-blue-600"
                    />
                  </div>
                </div>

                {/* Task Milestones */}
                <div className="p-4">
                  <div className="space-y-3">
                    {task.milestones?.map((milestone, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            milestone.status === 'completed' ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          <div>
                            <div className="font-medium text-blue-700">{milestone.title}</div>
                            <div className="text-sm text-blue-600">
                              Due: {new Date(milestone.due_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {milestone.milestone_type !== 'progress' && (
                            <div className="text-sm font-medium text-blue-700">
                              ₹{milestone.amount}
                            </div>
                          )}
                          <Tag color={
                            milestone.status === 'completed' ? 'success' : 
                            milestone.status === 'in_progress' ? 'processing' : 
                            'default'
                          }>
                            {formatText(milestone.status)}
                          </Tag>
                        </div>
                      </div>
                    ))}
                    {!task.milestones?.length && (
                      <div className="text-center p-4 text-gray-500">
                        No milestones set for this task
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Strategy Info */}
        <div className="mt-8 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg">
          <h4 className="font-medium text-teal-700 mb-2">Payment Structure</h4>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="font-medium text-blue-700 mb-1">
                {project?.milestones?.some(m => m.milestone_type !== 'progress') ?
                  "Project-based Payments" :
                  project?.tasks?.some(task => task.milestones?.length > 0) ?
                  "Task-based Payments" :
                  "Task Completion Payments"}
              </div>
              <p className="text-gray-600 text-sm">
                {project?.milestones?.some(m => m.milestone_type !== 'progress') ?
                  "Payments are tied to project milestone completion" :
                  project?.tasks?.some(task => task.milestones?.length > 0) ?
                  "Payments are released as task milestones are achieved" :
                  "Payments are made automatically when tasks are completed"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Budget</div>
              <div className="text-xl font-semibold text-teal-700">₹{project?.budget}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  // Bids Section
  const BidsSection = () => {
    const [currentPage, setCurrentPage] = useState(1);
    
    const handlePageChange = (page) => {
      setCurrentPage(page);
      // You would typically fetch bids for the specific page here
    };

    return (
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

        {/* Fixed Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination
            current={currentPage}
            onChange={handlePageChange}
          total={50}
          pageSize={5}
          showSizeChanger={false}
          className="shadow-lg rounded-full bg-white px-4 py-2"
        />
      </div>
    </motion.div>
  );
  };

  // Determine available tabs based on project status
  const getAvailableTabs = () => {
    if (project?.status === 'ongoing' || project?.status === 'completed') {
      return ['overview', 'analytics'];
    }
    return ['overview', 'bids', 'analytics'];
  };

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
        collapsed={true} 
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
                    <Tag color={
                      project?.status === 'pending' ? 'blue' :
                      project?.status === 'ongoing' ? 'teal' : 
                      'green'
                    }>
                      {formatText(project?.status)}
                    </Tag>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">
                      Started {moment(project?.startDate).format('MMM D, YYYY')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    icon={<DownloadOutlined />}
                    className="border-teal-500 text-teal-500 hover:text-teal-600 hover:border-teal-600"
                  >
                    Export
                  </Button>
                  <Button 
                    type="primary" 
                    className="bg-teal-500 hover:bg-teal-600"
                    icon={<EditOutlined />}
                  >
                    Edit Project
                  </Button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-lg p-2">
              <div className="flex overflow-x-auto">
                {['overview', 'tasks', 'milestones', 'files'].map((tab) => (
                  <Button 
                    key={tab}
                    type={activeTab === tab ? 'primary' : 'text'}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-lg ${
                      activeTab === tab 
                        ? 'bg-teal-500 text-white' 
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
                {activeTab === 'tasks' && <TasksSection />}
                {activeTab === 'milestones' && <MilestonesSection />}
                {activeTab === 'files' && <FilesSection />}
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

// Update the ProjectAnalytics component to accept project as a prop
const ProjectAnalytics = ({ project }) => {
  const [timeframe, setTimeframe] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const analyticsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const analyticsItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  useEffect(() => {
    // This would fetch real analytics data in production
    setIsLoading(true);
    setTimeout(() => {
      setAnalyticsData({
        budget: {
          allocated: project?.budget || 0,
          spent: project?.total_spent || 0,
          remaining: (project?.budget || 0) - (project?.total_spent || 0)
        },
        tasks: {
          total: project?.tasks?.length || 0,
          completed: project?.tasks?.filter(t => t.status === 'completed').length || 0,
          in_progress: project?.tasks?.filter(t => t.status !== 'completed').length || 0
        },
        milestones: {
          project: project?.milestones?.length || 0,
          task: project?.tasks?.reduce((acc, task) => acc + (task.milestones?.length || 0), 0),
          completed: (
            (project?.milestones?.filter(m => m.status === 'paid').length || 0) +
            project?.tasks?.reduce((acc, task) => 
              acc + (task.milestones?.filter(m => m.status === 'paid').length || 0), 0)
          )
        },
        timeline: {
          total_days: Math.ceil((new Date(project?.deadline) - new Date(project?.created_at)) / (1000 * 60 * 60 * 24)),
          days_elapsed: Math.ceil((new Date() - new Date(project?.created_at)) / (1000 * 60 * 60 * 24)),
          days_remaining: Math.ceil((new Date(project?.deadline) - new Date()) / (1000 * 60 * 60 * 24))
        }
      });
      setIsLoading(false);
    }, 1000);
  }, [timeframe]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // You would normally fetch data for the specific page here
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <motion.div
      variants={analyticsContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Analytics Controls */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Project Analytics</h3>
          <Select 
            value={timeframe} 
            onChange={setTimeframe}
            className="w-32"
          >
            <Option value="week">Last Week</Option>
            <Option value="month">Last Month</Option>
            <Option value="all">All Time</Option>
          </Select>
        </div>
      </div>

      {/* Budget Analysis */}
      <motion.div variants={analyticsItemVariants} className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-medium text-teal-700 mb-4">Budget Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card className="border-teal-100">
            <Statistic
              title="Total Budget"
              value={analyticsData?.budget.allocated}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#0F766E' }}
            />
          </Card>
          <Card className="border-teal-100">
            <Statistic
              title="Total Spent"
              value={analyticsData?.budget.spent}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#0F766E' }}
            />
          </Card>
          <Card className="border-teal-100">
            <Statistic
              title="Remaining Budget"
              value={analyticsData?.budget.remaining}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#0F766E' }}
            />
          </Card>
        </div>
        <Progress 
          percent={Math.round((analyticsData?.budget.spent / analyticsData?.budget.allocated) * 100) || 0}
          strokeColor={{
            '0%': '#14B8A6',
            '100%': '#0F766E',
          }}
          format={percent => `${percent}% utilized`}
        />
      </motion.div>

      {/* Task Progress Analytics */}
      <motion.div variants={analyticsItemVariants} className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-medium text-teal-700 mb-4">Task Progress</h4>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="border-blue-100">
                <Statistic
                  title="Total Tasks"
                  value={analyticsData?.tasks.total}
                  valueStyle={{ color: '#0369A1' }}
                />
              </Card>
              <Card className="border-blue-100">
                <Statistic
                  title="Completed Tasks"
                  value={analyticsData?.tasks.completed}
                  valueStyle={{ color: '#0369A1' }}
                />
              </Card>
              <Card className="border-blue-100">
                <Statistic
                  title="Completion Rate"
                  value={analyticsData?.tasks.total ? 
                    Math.round((analyticsData.tasks.completed / analyticsData.tasks.total) * 100) : 0}
                  suffix="%"
                  valueStyle={{ color: '#0369A1' }}
                />
              </Card>
            </div>
            <Progress 
              percent={analyticsData?.tasks.total ? 
                Math.round((analyticsData.tasks.completed / analyticsData.tasks.total) * 100) : 0}
              strokeColor={{
                '0%': '#60A5FA',
                '100%': '#2563EB',
              }}
            />
          </div>
          <div className="md:w-1/3">
            {/* Task Status Pie Chart */}
            <div className="bg-white rounded-lg p-4 h-full flex items-center justify-center">
              <div className="w-full h-48 relative">
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-4xl font-bold text-blue-600">
                    {analyticsData?.tasks.completed}
                  </div>
                  <div className="text-sm text-gray-500">of {analyticsData?.tasks.total}</div>
                </div>
                <div className="w-full h-full" style={{
                  background: `conic-gradient(
                    #2563EB ${analyticsData?.tasks.completed / analyticsData?.tasks.total * 100}%, 
                    #E5E7EB ${analyticsData?.tasks.completed / analyticsData?.tasks.total * 100}% 100%
                  )`,
                  borderRadius: '9999px'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Milestone Progress */}
      <motion.div variants={analyticsItemVariants} className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-medium text-teal-700 mb-4">Milestone Analysis</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-teal-100">
            <Statistic
              title="Project Milestones"
              value={analyticsData?.milestones.project}
              valueStyle={{ color: '#0F766E' }}
            />
          </Card>
          <Card className="border-blue-100">
            <Statistic
              title="Task Milestones"
              value={analyticsData?.milestones.task}
              valueStyle={{ color: '#0369A1' }}
            />
          </Card>
          <Card className="border-green-100">
            <Statistic
              title="Completed Milestones"
              value={analyticsData?.milestones.completed}
              valueStyle={{ color: '#047857' }}
            />
          </Card>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-700 mb-2">Milestone Completion Timeline</h5>
          <div className="h-60 relative">
            {/* This would be a real chart in production - using placeholder for now */}
            <div className="absolute inset-0 flex items-center justify-center">
              {project?.milestones?.length === 0 && project?.tasks?.every(t => !t.milestones?.length) ? (
                <Empty description="No milestones to analyze" />
              ) : (
                <div className="w-full h-full p-4">
                  {/* Timeline visualization - simplified version */}
                  <div className="w-full h-2 bg-gray-200 rounded-full relative">
                    {/* Project start */}
                    <div className="absolute -top-6 left-0 text-xs text-gray-500">
                      Start
                    </div>
                    <div className="absolute bottom-full left-0 w-1 h-4 bg-teal-500"></div>
                    
                    {/* Project deadline */}
                    <div className="absolute -top-6 right-0 text-xs text-gray-500">
                      Deadline
                    </div>
                    <div className="absolute bottom-full right-0 w-1 h-4 bg-teal-500"></div>
                    
                    {/* Today marker */}
                    <div className="absolute bottom-full" style={{
                      left: `${(analyticsData?.timeline.days_elapsed / analyticsData?.timeline.total_days) * 100}%`
                    }}>
                      <div className="w-1 h-4 bg-orange-500"></div>
                      <div className="absolute -top-6 -translate-x-1/2 text-xs text-gray-500">Today</div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="absolute top-0 left-0 h-full bg-teal-500 rounded-full" style={{
                      width: `${Math.min(100, (project?.get_progress || 0))}%`
                    }}></div>
                  </div>
                  
                  {/* Milestone markers would go here in a real implementation */}
                  <div className="mt-12">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Project Start: {project?.created_at}</span>
                      <span>Project Deadline: {project?.deadline}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Time Analysis */}
      <motion.div variants={analyticsItemVariants} className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-medium text-teal-700 mb-4">Time Analysis</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-teal-100">
            <Statistic
              title="Total Project Days"
              value={analyticsData?.timeline.total_days}
              suffix="days"
              valueStyle={{ color: '#0F766E' }}
            />
          </Card>
          <Card className="border-teal-100">
            <Statistic
              title="Days Elapsed"
              value={analyticsData?.timeline.days_elapsed}
              suffix="days"
              valueStyle={{ color: '#0F766E' }}
            />
          </Card>
          <Card className="border-teal-100">
            <Statistic
              title="Days Remaining"
              value={analyticsData?.timeline.days_remaining}
              suffix="days"
              valueStyle={{ color: '#0F766E' }}
            />
          </Card>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-700 mb-2">Time vs. Progress</h5>
          <Progress 
            percent={Math.round((analyticsData?.timeline.days_elapsed / analyticsData?.timeline.total_days) * 100)}
            status="active"
            strokeColor={{
              '0%': '#14B8A6',
              '100%': '#0F766E',
            }}
            format={percent => `${percent}% of time elapsed`}
          />
          <div className="h-4"></div>
          <Progress 
            percent={Math.round(project?.get_progress || 0)}
            status="active"
            strokeColor={{
              '0%': '#60A5FA',
              '100%': '#2563EB',
            }}
            format={percent => `${percent}% of project completed`}
          />
          
          <div className="mt-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Time efficiency:</span>
              <span className="font-medium text-teal-700">
                {analyticsData?.timeline.days_elapsed > 0 
                  ? Math.round(((project?.get_progress || 0) / 
                      (analyticsData.timeline.days_elapsed / analyticsData.timeline.total_days * 100)) * 100)
                  : 0}%
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {(project?.get_progress || 0) > 
              (analyticsData?.timeline.days_elapsed / analyticsData?.timeline.total_days * 100)
                ? "Project is ahead of schedule"
                : "Project is behind schedule"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Example of fixed pagination warning */}
      {analyticsData?.milestones?.project > 5 && (
        <div className="flex justify-center mt-6">
          <Pagination
            current={currentPage}
            onChange={handlePageChange}
            total={analyticsData.milestones.project}
            pageSize={5}
            showSizeChanger={false}
            className="shadow-lg rounded-full bg-white px-4 py-2"
          />
        </div>
      )}
    </motion.div>
  );
};

export default PostedProjectForBidsPage;
