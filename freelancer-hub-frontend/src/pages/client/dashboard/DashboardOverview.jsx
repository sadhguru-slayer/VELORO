import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  Card, Row, Col, Progress, Table, Badge, 
  Tooltip, Button, Calendar, Statistic, Tag, Select
} from 'antd'; // Import Select here
import { InfoCircleOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

import {
  ProjectOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  FileProtectOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';

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
  ]
};

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const response = await axios.get('http://127.0.0.1:8000/api/client/dashboard_overview', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  return (
    <div className="p-6 space-y-6">
      {/* Project Health Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Card className="shadow-sm rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Project Portfolio Health</h2>
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

        <Col xs={24} lg={6}>
          <Card className="shadow-sm rounded-xl">
            <Statistic
              title="Budget Utilization"
              value={projectMetrics.budgetMetrics.spent}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix="₹"
              suffix={
                <small className="text-gray-500">
                  /{projectMetrics.budgetMetrics.totalBudget}
                </small>
              }
            />
            <Progress
              percent={Math.round((projectMetrics.budgetMetrics.spent / projectMetrics.budgetMetrics.totalBudget) * 100)}
              strokeColor={{
                '0%': '#10B981',
                '100%': '#059669'
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Committed</span>
                <span className="font-medium">₹{projectMetrics.budgetMetrics.committed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Remaining</span>
                <span className="font-medium">₹{projectMetrics.budgetMetrics.remaining}</span>
              </div>
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

      {/* Resource Allocation */}
      <Card className="shadow-sm rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Resource Allocation</h2>
          <Tooltip title="Resource allocation across different project areas">
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        </div>
        <Row gutter={[16, 16]}>
          {Object.entries(projectMetrics.resourceAllocation).map(([key, value]) => (
            <Col xs={24} sm={12} lg={6} key={key}>
              <Card className="bg-gray-50 border-0">
                <Statistic
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={value}
                  suffix="%"
                  valueStyle={{ color: '#2563EB' }}
                />
                <Progress
                  percent={value}
                  showInfo={false}
                  strokeColor="#2563EB"
                  trailColor="#E5E7EB"
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        {[
          { title: 'Post New Project', icon: <ProjectOutlined />, path: '/client/post-project' },
          { title: 'View Active Projects', icon: <ClockCircleOutlined />, path: '/client/dashboard/projects' },
          { title: 'Manage Team', icon: <TeamOutlined />, path: '/client/dashboard/team' },
          { title: 'Financial Overview', icon: <DollarCircleOutlined />, path: '/client/dashboard/finance' }
        ].map((action, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="cursor-pointer"
            >
              <Card className="text-center hover:shadow-md transition-all duration-300">
                <div className="text-4xl text-teal-500 mb-3">{action.icon}</div>
                <h3 className="font-medium">{action.title}</h3>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DashboardOverview;
