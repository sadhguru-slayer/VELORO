import React, { useState, useEffect, useRef } from "react";
import { Card, Col, Row, Statistic, Table, Tooltip, Pagination, Progress, Badge, Timeline, Select, Button, Tag, DatePicker, Spin } from "antd";
import { Chart as ChartJS } from 'chart.js/auto';
import { Line, Doughnut, Bar, Radar } from "react-chartjs-2";
import { 
  SearchOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  DollarOutlined, UserOutlined, ThunderboltOutlined, ExclamationCircleOutlined,
  StarOutlined, TrophyOutlined, DownloadOutlined, ReloadOutlined 
} from "@ant-design/icons";
import { faker } from "@faker-js/faker";
import { motion, AnimatePresence } from "framer-motion";

const FreelancerAnalyticsPage = () => {
  
  const [timeRange, setTimeRange] = useState("week");
  const [selectedMetric, setSelectedMetric] = useState("bids");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [activityData, setActivityData] = useState([]);
  const lineChartRef = useRef(null);
  const radarChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const { RangePicker } = DatePicker;

  // Enhanced random data generation with date range support
  const generateRandomData = (range = timeRange) => {
    let data = [];
    const days = range === "week" ? 7 : range === "month" ? 30 : 90;
    
    for (let i = 0; i < days; i++) {
      data.push({
        date: `Day ${i + 1}`,
        bidsPlaced: faker.number.int({ min: 1, max: 15 }),
        bidsAccepted: faker.number.int({ min: 1, max: 10 }),
        bidsRejected: faker.number.int({ min: 0, max: 5 }),
        averageBidAmount: faker.number.int({ min: 15000, max: 50000 }),
        projectsCompleted: faker.number.int({ min: 1, max: 5 }),
        clientRatings: faker.number.float({ min: 4, max: 5, precision: 0.1 }),
        hoursWorked: faker.number.int({ min: 20, max: 50 }),
        earnings: faker.number.int({ min: 25000, max: 75000 }),
        clientSatisfaction: faker.number.int({ min: 70, max: 100 }),
        disputesRaised: faker.number.int({ min: 0, max: 2 })
      });
    }
    return data;
  };

  useEffect(() => {
    setActivityData(generateRandomData());
  }, [timeRange, dateRange]);

  // Enhanced analytics data
  const analyticsData = {
    earnings: {
      total: "₹850,000",
      trend: "+15%",
      breakdown: {
        completed: "₹650,000",
        ongoing: "₹150,000",
        disputed: "₹50,000"
      },
      hourlyRate: "₹2,500",
      pendingPayments: "₹125,000",
      projectedEarnings: "₹500,000"
    },
    projectMetrics: {
      totalProjects: 25,
      completionRate: 92,
      avgRating: 4.8,
      disputeRate: 3,
      activeProjects: 5,
      upcomingDeadlines: 3
    },
    bidding: {
      successRate: 75,
      avgResponseTime: "4.2 hours",
      competitivenessScore: 8.5,
      totalBids: activityData.reduce((sum, day) => sum + day.bidsPlaced, 0),
      acceptanceRate: "68%"
    },
    quality: {
      codeQuality: "95%",
      bugRate: "0.5%",
      testCoverage: "88%",
      documentationScore: "92%"
    },
    disputes: {
      total: 2,
      resolved: 1,
      pending: 1,
      avgResolutionTime: "48 hours",
      resolutionRate: "95%",
      riskLevel: "Low",
      commonReasons: [
        { reason: "Deadline issues", count: 3 },
        { reason: "Scope changes", count: 2 },
        { reason: "Communication gaps", count: 1 }
      ]
    },
    skills: {
      topEarning: ["React", "Node.js", "AWS"],
      performance: {
        technical: 85,
        communication: 90,
        deliveryTime: 78,
        quality: 88,
        problemSolving: 82,
        collaboration: 95
      }
    }
  };

  // Weekly activity data with enhanced styling
  const generateActivityData = () => ({
    labels: activityData.map(item => item.date),
    datasets: [
      {
        label: "Bids Placed",
        data: activityData.map(item => item.bidsPlaced),
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        fill: true,
        tension: 0.4
      },
      {
        label: "Bids Accepted",
        data: activityData.map(item => item.bidsAccepted),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        fill: true,
        tension: 0.4
      },
      {
        label: "Client Satisfaction",
        data: activityData.map(item => item.clientSatisfaction),
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        fill: true,
        tension: 0.4
      }
    ]
  });

  // Enhanced skills radar data with violet theme
  const skillsPerformanceData = {
    labels: ["Technical Skills", "Communication", "Delivery Time", "Quality", "Problem Solving", "Collaboration"],
    datasets: [{
      label: "Your Performance",
      data: Object.values(analyticsData.skills.performance),
      backgroundColor: "rgba(139, 92, 246, 0.2)",
      borderColor: "#8B5CF6",
      pointBackgroundColor: "#8B5CF6",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "#8B5CF6"
    }]
  };

  // Project distribution data with violet theme
  const projectDistributionData = {
    labels: ["Completed", "In Progress", "Disputed"],
    datasets: [{
      data: [75, 20, 5],
      backgroundColor: [
        "rgba(139, 92, 246, 0.8)",
        "rgba(139, 92, 246, 0.5)",
        "rgba(139, 92, 246, 0.2)"
      ],
      borderColor: [
        "#8B5CF6",
        "#8B5CF6",
        "#8B5CF6"
      ],
      borderWidth: 1
    }]
  };

  // Dispute timeline
  const disputeTimeline = [
    {
      color: "red",
      children: (
        <div className="flex flex-col">
          <span className="font-medium">Scope Change Dispute</span>
          <span className="text-sm text-gray-500">Client requested additional features</span>
          <span className="text-xs text-red-500">2 days ago - Pending</span>
        </div>
      )
    },
    {
      color: "green",
      children: (
        <div className="flex flex-col">
          <span className="font-medium">Payment Dispute Resolved</span>
          <span className="text-sm text-gray-500">Milestone payment cleared</span>
          <span className="text-xs text-green-500">5 days ago - Resolved</span>
        </div>
      )
    }
  ];

  useEffect(() => {
    return () => {
      if (lineChartRef.current) lineChartRef.current.destroy();
      if (radarChartRef.current) radarChartRef.current.destroy();
      if (doughnutChartRef.current) doughnutChartRef.current.destroy();
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-violet-900 mb-2">Analytics Dashboard</h2>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-violet-50 p-6 rounded-xl shadow-lg gap-6">
          <div className="flex flex-col md:w-1/2">
            <h1 className="text-3xl font-extrabold text-violet-900 mb-2">Freelancer Analytics</h1>
            <p className="text-gray-600 text-lg">Comprehensive insights into your performance, earnings, and growth</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-6 md:mt-0 w-full md:w-auto">
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full md:w-72 border-violet-300 rounded-xl p-2 focus:ring-violet-400 transition-all duration-300"
            />
            <Select
              value={timeRange}
              onChange={setTimeRange}
              className="w-full md:w-32 border-violet-300 rounded-xl focus:ring-violet-400 transition-all duration-300"
              options={[
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
                { value: "quarter", label: "This Quarter" }
              ]}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              className="bg-violet-600 hover:bg-violet-700 text-white w-full md:w-auto rounded-xl shadow-md transform hover:scale-105 transition-all duration-300"
            >
              Download Report
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1000);
              }}
              className="w-full md:w-auto rounded-xl border-violet-600 border-2 hover:border-violet-700 text-violet-600 hover:text-violet-700 transition-all duration-300"
            >
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>
      <Spin spinning={loading}>
        {/* Key Metrics */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ scale: 1.02 }} className="h-full">
              <Card className="h-full bg-gradient-to-br from-violet-50 to-white shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title={<span className="text-violet-700 font-medium">Total Earnings</span>}
                  value={analyticsData.earnings.total}
                  prefix={<DollarOutlined className="text-violet-600" />}
                  suffix={
                    <Tooltip title="Growth from last period">
                      <span className="text-green-500 text-sm">
                        {analyticsData.earnings.trend}
                      </span>
                    </Tooltip>
                  }
                />
                <p className="text-sm text-violet-600 mt-2">
                  Hourly Rate: {analyticsData.earnings.hourlyRate}
                </p>
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ scale: 1.02 }} className="h-full">
              <Card className="h-full bg-gradient-to-br from-violet-50 to-white shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title={<span className="text-violet-700 font-medium">Project Success Rate</span>}
                  value={analyticsData.projectMetrics.completionRate}
                  suffix="%"
                  prefix={<CheckCircleOutlined className="text-violet-600" />}
                />
                <p className="text-sm text-violet-600 mt-2">
                  Active Projects: {analyticsData.projectMetrics.activeProjects}
                </p>
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ scale: 1.02 }} className="h-full">
              <Card className="h-full bg-gradient-to-br from-violet-50 to-white shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title={<span className="text-violet-700 font-medium">Bid Success Rate</span>}
                  value={analyticsData.bidding.successRate}
                  suffix="%"
                  prefix={<ThunderboltOutlined className="text-violet-600" />}
                />
                <p className="text-sm text-violet-600 mt-2">
                  Response Time: {analyticsData.bidding.avgResponseTime}
                </p>
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ scale: 1.02 }} className="h-full">
              <Card className="h-full bg-gradient-to-br from-violet-50 to-white shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title={<span className="text-violet-700 font-medium">Dispute Rate</span>}
                  value={analyticsData.projectMetrics.disputeRate}
                  suffix="%"
                  prefix={<WarningOutlined className="text-violet-600" />}
                />
                <p className="text-sm text-violet-600 mt-2">
                  Resolution Rate: {analyticsData.disputes.resolutionRate}
                </p>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={16}>
            <Card title="Weekly Performance Trends" className="h-full shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-end mb-4">
                <Select
                  defaultValue="bids"
                  className="w-40"
                  options={[
                    { value: "bids", label: "Bidding Activity" },
                    { value: "earnings", label: "Earnings" },
                    { value: "satisfaction", label: "Client Satisfaction" }
                  ]}
                  onChange={(value) => setSelectedMetric(value)}
                />
              </div>
              <div className="h-80">
                <Line
                  ref={lineChartRef}
                  data={generateActivityData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          usePointStyle: true,
                          font: {
                            family: "'Inter', sans-serif"
                          }
                        }
                      },
                      tooltip: {
                        mode: "index",
                        intersect: false,
                        backgroundColor: "rgba(139, 92, 246, 0.8)",
                        titleFont: {
                          family: "'Inter', sans-serif",
                          size: 14
                        },
                        bodyFont: {
                          family: "'Inter', sans-serif",
                          size: 12
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: "rgba(139, 92, 246, 0.1)"
                        },
                        ticks: {
                          font: {
                            family: "'Inter', sans-serif"
                          }
                        }
                      },
                      x: {
                        grid: {
                          color: "rgba(139, 92, 246, 0.1)"
                        },
                        ticks: {
                          font: {
                            family: "'Inter', sans-serif"
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Skills Performance" className="h-full">
              <div className="h-80">
                <Radar
                  ref={radarChartRef}
                  id="skillsPerformanceChart"
                  data={skillsPerformanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Project and Quality Metrics */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={12}>
            <Card title="Project Distribution" className="h-full">
              <div className="h-80">
                <Doughnut
                  ref={doughnutChartRef}
                  id="projectDistribution"
                  data={projectDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom"
                      }
                    }
                  }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Quality Metrics" className="h-full">
              {Object.entries(analyticsData.quality).map(([key, value]) => (
                <div key={key} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-violet-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-green-600">{value}</span>
                  </div>
                  <Progress
                    percent={parseInt(value)}
                    strokeColor="#8B5CF6"
                    showInfo={false}
                  />
                </div>
              ))}
            </Card>
          </Col>
        </Row>

        {/* Dispute Management and Risk Analysis */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div className="flex items-center">
                  <WarningOutlined className="text-red-500 mr-2" />
                  <span>Dispute Management</span>
                </div>
              }
              className="h-full"
            >
              <Timeline items={disputeTimeline} />
              <div className="mt-4">
                <h4 className="font-medium mb-2">Common Dispute Reasons</h4>
                {analyticsData.disputes.commonReasons.map((reason, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between text-sm">
                      <span>{reason.reason}</span>
                      <span className="text-violet-600">{reason.count} cases</span>
                    </div>
                    <Progress 
                      percent={reason.count * 20} 
                      showInfo={false}
                      strokeColor="#8B5CF6"
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div className="flex items-center">
                  <ThunderboltOutlined className="text-violet-500 mr-2" />
                  <span>Risk Analysis & Recommendations</span>
                </div>
              }
              className="h-full"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div className="p-4 bg-violet-50 rounded-xl">
                    <h4 className="text-violet-900 font-medium mb-2">Risk Level</h4>
                    <Progress
                      type="circle"
                      percent={75}
                      format={() => analyticsData.disputes.riskLevel}
                      strokeColor={{
                        "0%": "#8B5CF6",
                        "100%": "#10B981"
                      }}
                    />
                  </div>
                </Col>
                <Col xs={24} md={16}>
                  <div className="space-y-4">
                    <div className="p-4 bg-violet-50 rounded-xl">
                      <h4 className="text-violet-900 font-medium mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside text-gray-600">
                        <li>Maintain response time below industry average</li>
                        <li>Document project milestones clearly</li>
                        <li>Regular progress updates to prevent disputes</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-violet-50 rounded-xl">
                      <h4 className="text-violet-900 font-medium mb-2">Top Earning Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {analyticsData.skills.topEarning.map(skill => (
                          <Tag key={skill} color="violet">{skill}</Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default FreelancerAnalyticsPage;
