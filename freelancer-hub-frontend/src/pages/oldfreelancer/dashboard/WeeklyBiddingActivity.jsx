import React, { useState, useEffect, useRef } from "react";
import { Card, Col, Row, Statistic, Table, Tooltip, Pagination, Progress, Badge, Timeline, Tag } from "antd";
import { Chart as ChartJS } from 'chart.js/auto';
import { Line, Radar } from "react-chartjs-2";
import { SearchOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { faker } from "@faker-js/faker";
import { motion } from "framer-motion";

const WeeklyBiddingActivity = () => {
  const lineChartRef = useRef(null);
  const radarChartRef = useRef(null);

  // Enhanced random data generation
  const generateRandomData = () => {
    let data = [];
    for (let i = 0; i < 7; i++) {
      data.push({
        date: `Day ${i + 1}`,
        bidsPlaced: faker.number.int({ min: 1, max: 15 }),
        bidsAccepted: faker.number.int({ min: 1, max: 10 }),
        bidsRejected: faker.number.int({ min: 0, max: 5 }),
        averageBidAmount: faker.number.int({ min: 15000, max: 50000 }),
        disputesRaised: faker.number.int({ min: 0, max: 2 }),
        clientSatisfaction: faker.number.int({ min: 70, max: 100 })
      });
    }
    return data;
  };

  const activityData = generateRandomData();

  // Enhanced chart data
  const weeklyOverviewData = {
    labels: activityData.map(item => item.date),
    datasets: [
      {
        label: "Bids Placed",
        data: activityData.map(item => item.bidsPlaced),
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        fill: true,
      },
      {
        label: "Bids Accepted",
        data: activityData.map(item => item.bidsAccepted),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        fill: true,
      },
      {
        label: "Client Satisfaction",
        data: activityData.map(item => item.clientSatisfaction),
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        fill: true,
      }
    ]
  };

  // Radar chart data for skills performance
  const skillsPerformanceData = {
    labels: ["Technical Skills", "Communication", "Delivery Time", "Quality", "Problem Solving", "Collaboration"],
    datasets: [{
      label: "Your Performance",
      data: [85, 90, 78, 88, 82, 95],
      backgroundColor: "rgba(139, 92, 246, 0.2)",
      borderColor: "#8B5CF6",
      pointBackgroundColor: "#8B5CF6",
    }]
  };

  // Enhanced stats
  const performanceMetrics = {
    weeklyStats: {
      totalBids: activityData.reduce((sum, day) => sum + day.bidsPlaced, 0),
      acceptanceRate: "68%",
      averageResponse: "4.2 hours",
      disputeResolutionRate: "95%"
    },
    riskMetrics: {
      activeDisputes: 2,
      pendingResolutions: 1,
      averageResolutionTime: "48 hours",
      riskLevel: "Low"
    },
    revenueInsights: {
      weeklyEarnings: "₹125,000",
      growth: "+12%",
      projectedEarnings: "₹500,000",
      topEarningSkills: ["React", "Node.js", "AWS"]
    }
  };

  // Dispute tracking
  const disputes = [
    {
      id: 1,
      project: "E-commerce Platform",
      issue: "Delivery Delay",
      status: "Resolved",
      resolution: "Timeline extended with mutual agreement",
      date: "2024-03-15"
    },
    {
      id: 2,
      project: "Mobile App Development",
      issue: "Scope Change",
      status: "In Progress",
      resolution: "Under negotiation",
      date: "2024-03-14"
    }
  ];

  useEffect(() => {
    // Cleanup function to destroy charts when component unmounts
    return () => {
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
      }
      if (radarChartRef.current) {
        radarChartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-violet-900 mb-2">Weekly Activity Analytics</h2>
        <p className="text-gray-600">Comprehensive insights into your bidding performance and client interactions</p>
      </motion.div>

      {/* Performance Overview Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <motion.div whileHover={{ scale: 1.02 }} className="h-full">
            <Card className="h-full bg-gradient-to-br from-violet-50 to-white border-violet-100">
              <Statistic
                title="Weekly Bids"
                value={performanceMetrics.weeklyStats.totalBids}
                prefix={<Badge status="processing" />}
                valueStyle={{ color: "#8B5CF6" }}
              />
              <p className="text-sm text-violet-600 mt-2">
                Acceptance Rate: {performanceMetrics.weeklyStats.acceptanceRate}
              </p>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div whileHover={{ scale: 1.02 }} className="h-full">
            <Card className="h-full bg-gradient-to-br from-green-50 to-white border-green-100">
              <Statistic
                title="Revenue Growth"
                value={performanceMetrics.revenueInsights.growth}
                valueStyle={{ color: "#10B981" }}
                prefix={<CheckCircleOutlined />}
              />
              <p className="text-sm text-green-600 mt-2">
                Weekly: {performanceMetrics.revenueInsights.weeklyEarnings}
              </p>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div whileHover={{ scale: 1.02 }} className="h-full">
            <Card className="h-full bg-gradient-to-br from-yellow-50 to-white border-yellow-100">
              <Statistic
                title="Response Time"
                value={performanceMetrics.weeklyStats.averageResponse}
                valueStyle={{ color: "#F59E0B" }}
                prefix={<ClockCircleOutlined />}
              />
              <p className="text-sm text-yellow-600 mt-2">
                Industry Avg: 6.5 hours
              </p>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div whileHover={{ scale: 1.02 }} className="h-full">
            <Card className="h-full bg-gradient-to-br from-red-50 to-white border-red-100">
              <Statistic
                title="Active Disputes"
                value={performanceMetrics.riskMetrics.activeDisputes}
                valueStyle={{ color: performanceMetrics.riskMetrics.activeDisputes > 3 ? "#EF4444" : "#8B5CF6" }}
                prefix={<ExclamationCircleOutlined />}
              />
              <p className="text-sm text-violet-600 mt-2">
                Resolution Rate: {performanceMetrics.weeklyStats.disputeResolutionRate}
              </p>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Main Analytics Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Weekly Performance Trends" className="mb-6">
            <div className="h-80">
              <Line
                ref={lineChartRef}
                id="weeklyPerformanceChart"
                data={weeklyOverviewData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top"
                    },
                    tooltip: {
                      mode: "index",
                      intersect: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.05)"
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Skills Performance" className="mb-6">
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

      {/* Dispute Tracking */}
      <Card title="Dispute Resolution Center" className="mb-6">
        <Timeline mode="left">
          {disputes.map(dispute => (
            <Timeline.Item
              key={dispute.id}
              color={dispute.status === "Resolved" ? "green" : "blue"}
              label={dispute.date}
            >
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-violet-900">{dispute.project}</h4>
                <p className="text-gray-600 text-sm">{dispute.issue}</p>
                <div className="mt-2">
                  <Tag color={dispute.status === "Resolved" ? "success" : "processing"}>
                    {dispute.status}
                  </Tag>
                </div>
                <p className="text-sm text-gray-500 mt-2">{dispute.resolution}</p>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* Risk Analysis */}
      <Card title="Risk Analysis & Recommendations" className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="p-4 bg-violet-50 rounded-lg">
              <h4 className="text-violet-900 font-medium mb-2">Current Risk Level</h4>
              <Progress
                type="circle"
                percent={75}
                format={() => performanceMetrics.riskMetrics.riskLevel}
                strokeColor={{
                  "0%": "#8B5CF6",
                  "100%": "#10B981"
                }}
              />
            </div>
          </Col>
          <Col xs={24} md={16}>
            <div className="space-y-4">
              <div className="p-4 bg-violet-50 rounded-lg">
                <h4 className="text-violet-900 font-medium mb-2">Recommendations</h4>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Maintain response time below industry average</li>
                  <li>Document project milestones clearly</li>
                  <li>Regular progress updates to prevent disputes</li>
                </ul>
              </div>
              <div className="p-4 bg-violet-50 rounded-lg">
                <h4 className="text-violet-900 font-medium mb-2">Top Earning Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {performanceMetrics.revenueInsights.topEarningSkills.map(skill => (
                    <Tag key={skill} color="violet">{skill}</Tag>
                  ))}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default WeeklyBiddingActivity;
