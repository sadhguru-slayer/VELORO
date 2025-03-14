import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, notification, Checkbox, Card, Pagination, Tooltip, Progress, Statistic, Empty, Spin, Tag, Rate,Select,Avatar } from 'antd';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ProjectOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  UserOutlined,
  StarOutlined,
  MessageOutlined,
  CalendarOutlined,
  GlobalOutlined,
  LikeOutlined,
  DislikeOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import CSider from '../../components/client/CSider';
import CHeader from '../../components/client/CHeader';
import axios from 'axios';
import Cookies from 'js-cookie';

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project || !project.tasks) {
    return <div>No project details available.</div>;
  }

  const handleFilterChange = (key, value) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <CSider
        userId={userId}
        role={role}
        dropdown={true}
        collapsed={true}
        handleMenuClick={handleMenuClick}
        abcds={activeComponent}
        handleProfileMenu={handleProfileMenu}
        activeProfileComponent={activeProfileComponent}
      />
      <div className="flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-16 md:ml-16 lg:ml-22">
        <CHeader userId={userId} />

        <div className="flex-1 overflow-auto p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Project Overview Card */}
            <Card 
              className="shadow-lg rounded-xl border-none"
              title={
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-800">{project?.title}</h1>
                  <Tag color="teal" className="text-sm">
                    {formatText(project?.status) || 'Active'}
                  </Tag>
                </div>
              }
            >
              {/* Project Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    title: "Total Bids",
                    value: projectStats.totalBids,
                    icon: <TeamOutlined />,
                    color: "#0d9488"
                  },
                  {
                    title: "Average Bid",
                    value: `₹${projectStats.averageBid}`,
                    icon: <DollarOutlined />,
                    color: "#0ea5e9"
                  },
                  {
                    title: "Time Left",
                    value: "5 days",
                    icon: <ClockCircleOutlined />,
                    color: "#f59e0b"
                  },
                  {
                    title: "Completion Rate",
                    value: "75%",
                    icon: <CheckCircleOutlined />,
                    color: "#22c55e"
                  }
                ].map((stat, index) => (
                  <Card key={index} className="shadow-sm hover:shadow-md transition-all">
                    <Statistic 
                      title={
                        <span className="text-gray-600 font-medium flex items-center gap-2">
                          {stat.icon}
                          {stat.title}
                        </span>
                      }
                      value={stat.value}
                      valueStyle={{ color: stat.color }}
                    />
                  </Card>
                ))}
              </div>

              {/* Project Details */}
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Description</h3>
                  <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: project?.description }} />
                </div>

                {/* Tasks Accordion */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Project Tasks</h3>
                  {project?.tasks.map((task, index) => (
                    <motion.div
                      key={index}
                      initial={false}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-md font-medium text-gray-700">{task.title}</h4>
                          <Tag color="blue">₹{task.budget}</Tag>
                        </div>
                        <div className="text-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: task.description }} />
                        <div className="mt-3 flex flex-wrap gap-2">
                          {task.skills_required_for_task.map((skill, idx) => (
                            <Tag key={idx} color="cyan">{skill.name}</Tag>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Bids Section */}
            <Card 
              className="shadow-lg rounded-xl border-none"
              title={
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Project Bids</h2>
                  <div className="flex gap-3">
                    <Button 
                      icon={<FilterOutlined />}
                      onClick={() => setShowFilters(!showFilters)}
                      className="border-teal-500 text-teal-500"
                    >
                      Filters
                    </Button>
                    <Select
                      defaultValue="recent"
                      onChange={(value) => setSortBy(value)}
                      className="w-32"
                    >
                      <Option value="recent">Most Recent</Option>
                      <Option value="rating">Highest Rated</Option>
                      <Option value="lowest">Lowest Bid</Option>
                      <Option value="highest">Highest Bid</Option>
                    </Select>
                  </div>
                </div>
              }
            >
              {/* Bids List */}
              <div className="space-y-4">
                {enhancedBidsData.map((bid, index) => (
                  <motion.div
                    key={bid.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar size={64} src={bid.freelancer.avatar} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">{bid.freelancer.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <GlobalOutlined />
                              {bid.freelancer.country}
                              <span className="text-gray-300">|</span>
                              <Rate disabled defaultValue={bid.freelancer.rating} className="text-yellow-400" />
                              <span className="text-gray-300">|</span>
                              <CheckCircleOutlined className="text-green-500" />
                              {bid.completionRate}% Completion Rate
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-teal-600">₹{bid.bidAmount}</div>
                            <div className="text-sm text-gray-500">{bid.duration}</div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{bid.proposal}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {bid.skills.map((skill, idx) => (
                            <Tag key={idx} color="blue">{skill}</Tag>
                          ))}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex gap-3">
                            <Button 
                              type="primary"
                              className="bg-teal-500 hover:bg-teal-600"
                              onClick={() => setSelectedBid(bid)}
                            >
                              View Details
                            </Button>
                            <Button 
                              icon={<MessageOutlined />}
                              className="border-teal-500 text-teal-500"
                            >
                              Message
                            </Button>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <Tooltip title="Response Time">
                              <span><ClockCircleOutlined className="mr-1" />{bid.responseTime}</span>
                            </Tooltip>
                            <Tooltip title="Completed Projects">
                              <span><CheckCircleOutlined className="mr-1" />{bid.freelancer.completedProjects} Projects</span>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <Pagination
                  current={1}
                  total={50}
                  pageSize={5}
                  showSizeChanger={false}
                />
              </div>
            </Card>
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
