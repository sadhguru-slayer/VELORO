import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  Card, Row, Col, Progress, Table, Badge, 
  Tooltip, Button, Calendar, Statistic, Tag, Select, List, Alert
} from 'antd';
import { 
  InfoCircleOutlined, ProjectOutlined, ClockCircleOutlined, 
  CheckCircleOutlined, WarningOutlined, DollarCircleOutlined, 
  TeamOutlined, FileProtectOutlined, ArrowUpOutlined, 
  ArrowDownOutlined, BellOutlined, ScheduleOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import { useMediaQuery } from 'react-responsive';
import { RiBarChartFill, RiPieChartFill, RiCalendarEventFill } from 'react-icons/ri';
import { BsGraphUp, BsPeopleFill } from 'react-icons/bs';
import { AiFillProject, AiOutlineAreaChart } from 'react-icons/ai';

// Dummy data for new features
const projectMetrics = {
  projectHealth: {
    onTrack: 12,
    atRisk: 3,
    delayed: 2,
    completed: 8
  },
  resourceAllocation: {
    development: 45,
    design: 25,
    testing: 20,
    planning: 10
  },
  budgetMetrics: {
    totalBudget: 250000,
    spent: 150000,
    committed: 50000,
    remaining: 50000
  },
  milestones: [
    { name: 'Design Phase', progress: 100, status: 'completed' },
    { name: 'Development', progress: 65, status: 'in_progress' },
    { name: 'Testing', progress: 20, status: 'in_progress' },
    { name: 'Deployment', progress: 0, status: 'upcoming' }
  ],
  recentActivities: [
    { id: 1, description: 'Project "Alpha" milestone completed', timestamp: '2 hours ago' },
    { id: 2, description: 'New task assigned to John Doe', timestamp: '5 hours ago' },
    { id: 3, description: 'Budget for "Beta" project updated', timestamp: '1 day ago' },
    { id: 4, description: 'Team meeting scheduled for Friday', timestamp: '2 days ago' }
  ],

  teamPerformance: {
    completedTasks: 120,
    pendingTasks: 30,
    productivityTrend: 'up' // 'up' or 'down'
  }
};

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // New state for additional features
  const [activeProjects, setActiveProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [financialOverview, setFinancialOverview] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const response = await axios.get('http://127.0.0.1:8000/api/client/dashboard_overview', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setDashboardData(response.data);
        setUpcomingDeadlines(response.data.nearest_deadlines);
        console.log(response.data.nearest_deadlines);
        // console.log(response.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch additional data
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const [projectsRes, teamRes, financeRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/client/active_projects', {
            headers: { Authorization: `Bearer ${accessToken}` }
          }),
          axios.get('http://127.0.0.1:8000/api/client/team_members', {
            headers: { Authorization: `Bearer ${accessToken}` }
          }),
          axios.get('http://127.0.0.1:8000/api/client/financial_overview', {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
        ]);
        
        setActiveProjects(projectsRes.data);
        setTeamMembers(teamRes.data);
        setFinancialOverview(financeRes.data);
      } catch (error) {
        console.error('Error fetching additional data:', error);
      }
    };

    fetchAdditionalData();
  }, []);

  // Project Health Distribution Chart Config
  const projectHealthConfig = {
    data: [
      { type: 'On Track', value: projectMetrics.projectHealth.onTrack },
      { type: 'At Risk', value: projectMetrics.projectHealth.atRisk },
      { type: 'Delayed', value: projectMetrics.projectHealth.delayed },
      { type: 'Completed', value: projectMetrics.projectHealth.completed }
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    color: ['#10B981', '#F59E0B', '#EF4444', '#6366F1'],
    label: {
      type: 'outer',
      content: '{percentage}'
    },
    interactions: [{ type: 'element-active' }]
  };

  const notifyFreelancer = async (objectId,type) => {
    const accessToken = Cookies.get('accessToken');
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/notify-freelancer/${objectId}&${type}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Notification sent successfully!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error notifying freelancer:', error);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
            <p className="text-gray-600">Welcome back! Here's what's happening with your projects</p>
          </div>
          <Button 
            type="primary" 
            icon={<BellOutlined />}
            className="flex items-center"
          >
            Notifications
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <Row gutter={[16, 16]}>
        {[
          {
            title: 'Active Projects',
            value: activeProjects.length,
            icon: <AiFillProject className="text-3xl" />,
            color: '#6366f1',
            trend: 'up'
          },
          {
            title: 'Team Members',
            value: teamMembers.length,
            icon: <BsPeopleFill className="text-3xl" />,
            color: '#10b981',
            trend: 'stable'
          },
          {
            title: 'Total Revenue',
            value: `₹${financialOverview.totalRevenue.toLocaleString()}`,
            icon: <BsGraphUp className="text-3xl" />,
            color: '#3b82f6',
            trend: 'up'
          },
          {
            title: 'Net Profit',
            value: `₹${financialOverview.netProfit.toLocaleString()}`,
            icon: <RiBarChartFill className="text-3xl" />,
            color: '#22c55e',
            trend: 'up'
          }
        ].map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="shadow-sm rounded-xl h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">{stat.title}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                  <div 
                    className={`p-3 rounded-lg`}
                    style={{ backgroundColor: `${stat.color}10` }}
                  >
                    {React.cloneElement(stat.icon, { className: `text-${stat.color}` })}
                  </div>
                </div>
                <div className="mt-3">
                  <Progress 
                    percent={75} 
                    showInfo={false}
                    strokeColor={stat.color}
                    trailColor={`${stat.color}20`}
                  />
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Main Content Area */}
      <Row gutter={[16, 16]}>
        {/* Project Overview */}
        <Col xs={24} lg={16}>
          <Card className="shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Project Overview</h2>
              <Select 
                defaultValue="thisMonth" 
                style={{ width: 120 }}
                options={[
                  { value: 'thisMonth', label: 'This Month' },
                  { value: 'lastMonth', label: 'Last Month' },
                  { value: 'thisQuarter', label: 'This Quarter' }
                ]}
              />
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Pie {...projectHealthConfig} />
              </Col>
              <Col xs={24} lg={12}>
                <div className="space-y-4">
                  {Object.entries(projectMetrics.projectHealth).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="capitalize font-medium">{key}</span>
                        <span className="text-lg font-semibold">{value}</span>
                      </div>
                      <Progress 
                        percent={Math.round((value / 25) * 100)} 
                        showInfo={false}
                        strokeColor={
                          key === 'onTrack' ? '#10B981' :
                          key === 'atRisk' ? '#F59E0B' :
                          key === 'delayed' ? '#EF4444' : '#6366F1'
                        }
                      />
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Team Performance */}
        <Col xs={24} lg={8}>
          <Card className="shadow-sm rounded-xl h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Team Performance</h2>
              <Tooltip title="Team performance metrics">
                <InfoCircleOutlined className="text-gray-400" />
              </Tooltip>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Productivity', value: 85, color: '#10B981' },
                { title: 'Engagement', value: 78, color: '#3B82F6' },
                { title: 'Satisfaction', value: 92, color: '#6366F1' }
              ].map((metric, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{metric.title}</span>
                    <span className="text-lg font-semibold">{metric.value}%</span>
                  </div>
                  <Progress 
                    percent={metric.value} 
                    showInfo={false}
                    strokeColor={metric.color}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>


      {/* Milestone Progress */}
      <Card className="shadow-sm rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Project Milestones</h2>
          <Button type="primary" onClick={() => navigate('/client/dashboard/milestones')}>
            View All
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {projectMetrics.milestones.map((milestone, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium">{milestone.name}</h3>
                  <Tag color={
                    milestone.status === 'completed' ? 'success' :
                    milestone.status === 'in_progress' ? 'processing' :
                    'default'
                  }>
                    {milestone.status.replace('_', ' ')}
                  </Tag>
                </div>
                <Progress 
                  percent={milestone.progress} 
                  size="small"
                  strokeColor={
                    milestone.status === 'completed' ? '#10B981' :
                    milestone.status === 'in_progress' ? '#3B82F6' :
                    '#9CA3AF'
                  }
                />
              </div>
            </Col>
          ))}
        </Row>
      </Card>


      {/* Additional Sections */}
      <Row gutter={[16, 16]}>
        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card className="shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <Button type="link" onClick={() => navigate('/client/activity')}>
                View All
              </Button>
            </div>
            <List
              dataSource={projectMetrics.recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <BellOutlined className="text-gray-500" />
                      </div>
                      <span>{item.description}</span>
                    </div>
                    <span className="text-gray-500 text-sm">{item.timestamp}</span>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        

        {/* Upcoming Deadlines */}
        <Col xs={24} lg={12}>
          <Card className="shadow-sm rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Upcoming Deadlines</h2>
              <ScheduleOutlined className="text-gray-400" />
            </div>
            <List
              dataSource={upcomingDeadlines}
              renderItem={(item) => (
                <List.Item>
                  <div className="flex justify-between w-full">
                    <span>{item.title}</span>
                    <span className="text-gray-500">{item.deadline}</span>
                    {item.notified ? (
                      <button className="ml-4 bg-gray-300 text-white rounded px-2 py-1" disabled>
                        Notified
                      </button>
                    ) : (
                      <button 
                        onClick={() => notifyFreelancer(item.id,item.type)} 
                        className="ml-4 bg-blue-500 text-white rounded px-2 py-1"
                      >
                        Notify
                      </button>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      
     

   
    </div>
  );
};

export default DashboardOverview;