import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select, Modal, Pagination, Tag, Tooltip, Row, Col, Statistic, Progress } from "antd";
import { SearchOutlined, CalendarOutlined, DollarOutlined, RiseOutlined, FallOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaRegClock, FaChartLine, FaUserCheck, FaExclamationTriangle } from "react-icons/fa";

const { Option } = Select;

const BiddingOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBid, setSelectedBid] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredBids, setFilteredBids] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const navigate = useNavigate();

  // Enhanced sample data with more relevant fields
  const bids = [
    { 
      id: 1, 
      projectName: "E-commerce Website Development",
      bidAmount: "₹50000",
      status: "Pending",
      deadline: "2024-12-25",
      clientRating: 4.8,
      projectDuration: "3 months",
      competingBids: 8,
      description: "Modern e-commerce platform with payment integration",
      averageBid: "₹45000",
      bidPosition: 3,
      clientResponseTime: "2 days",
      skills: ["React", "Node.js", "MongoDB"]
    },
    { 
      id: 2, 
      projectName: "Mobile App",
      bidAmount: "₹30000",
      status: "Accepted",
      deadline: "2024-12-15",
      clientRating: 4.5,
      projectDuration: "2 months",
      competingBids: 5,
      description: "Mobile app for food delivery",
      averageBid: "₹35000",
      bidPosition: 2,
      clientResponseTime: "1 day",
      skills: ["React Native", "Flutter", "Java"]
    },
    { 
      id: 3, 
      projectName: "SEO Optimization",
      bidAmount: "₹15000",
      status: "Rejected",
      deadline: "2024-11-30",
      clientRating: 4.2,
      projectDuration: "1 month",
      competingBids: 3,
      description: "SEO optimization for e-commerce website",
      averageBid: "₹12000",
      bidPosition: 1,
      clientResponseTime: "3 days",
      skills: ["SEO", "Google Analytics", "Content Writing"]
    },
    { 
      id: 4, 
      projectName: "UI/UX Design",
      bidAmount: "₹25000",
      status: "Pending",
      deadline: "2024-12-20",
      clientRating: 4.6,
      projectDuration: "2 months",
      competingBids: 6,
      description: "UI/UX design for mobile app",
      averageBid: "₹28000",
      bidPosition: 4,
      clientResponseTime: "2 days",
      skills: ["Figma", "Sketch", "Adobe XD"]
    },
    { 
      id: 5, 
      projectName: "Backend Development",
      bidAmount: "₹40000",
      status: "Accepted",
      deadline: "2024-12-10",
      clientRating: 4.7,
      projectDuration: "3 months",
      competingBids: 7,
      description: "Backend development for e-commerce website",
      averageBid: "₹42000",
      bidPosition: 5,
      clientResponseTime: "1 day",
      skills: ["Node.js", "Express.js", "MongoDB"]
    },
  ];

  // Bid Statistics
  const bidStats = {
    totalBids: 25,
    acceptanceRate: 68,
    averageBidAmount: "₹32000",
    pendingBids: 8,
    acceptedBids: 12,
    rejectedBids: 5,
    averageCompetitors: 6,
    successfulProjects: 15,
    totalEarnings: "₹450000",
    recentWinRate: 75
  };

  // Monthly bid trend data
  const monthlyTrend = [
    { month: 'Jan', bids: 5, accepted: 3 },
    { month: 'Feb', bids: 8, accepted: 5 },
    { month: 'Mar', bids: 6, accepted: 4 }
  ];

  // New statistics
  const bidInsights = {
    competitivePosition: {
      averagePosition: 2.8,
      topPositionRate: 45,
      improvement: 12
    },
    bidOptimization: {
      suggestedRange: "₹35000 - ₹45000",
      successRate: 72,
      optimalDuration: "2-3 months"
    },
    marketAnalysis: {
      highDemandSkills: ["React", "Node.js", "AWS"],
      avgResponseTime: "1.5 days",
      competitorCount: 15
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "violet",
      Accepted: "green",
      Rejected: "red",
      "In Progress": "blue"
    };
    return colors[status] || "default";
  };

  useEffect(() => {
    const filtered = bids.filter((bid) => {
      const matchesSearchTerm = bid.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? bid.status.toLowerCase() === statusFilter.toLowerCase() : true;
      return matchesSearchTerm && matchesStatus;
    });
    setFilteredBids(filtered);
  }, [searchTerm, statusFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handlePreview = (bid) => {
    setSelectedBid(bid);
    setShowProposalModal(true);
  };

  const handleViewDetails = (id, project) => {
    navigate(`/freelancer/dashboard/projects/${id}`, { state: { project } });
  };

  const closeModal = () => {
    setShowProposalModal(false);
    setSelectedBid(null);
  };

  const paginatedData = filteredBids.length > 0 ? 
    filteredBids.slice((currentPage - 1) * pageSize, currentPage * pageSize) : 
    bids.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const StatCard = ({ title, value, icon, trend, trendValue, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-violet-100"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-violet-600">{icon}</span>
        {trend && (
          <div className={`flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <RiseOutlined /> : <FallOutlined />}
            <span className="ml-1">{trendValue}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm">{title}</h3>
      <p className={`text-xl font-semibold ${color || 'text-violet-900'}`}>{value}</p>
    </motion.div>
  );

  const BidProgressCard = ({ title, value, total, color }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-violet-100">
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <Progress
        percent={Math.round((value / total) * 100)}
        strokeColor={color}
        strokeWidth={8}
        format={(percent) => `${value}/${total}`}
      />
    </div>
  );

  const RecentBidCard = ({ bid }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-violet-100"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-violet-900">{bid.projectName}</h3>
          <p className="text-sm text-gray-500 mt-1">{bid.description}</p>
        </div>
        <Tag color={getStatusColor(bid.status)}>{bid.status}</Tag>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
        <div className="text-gray-600">
          <span className="block text-violet-600">Amount</span>
          {bid.bidAmount}
        </div>
        <div className="text-gray-600">
          <span className="block text-violet-600">Position</span>
          {bid.bidPosition} of {bid.competingBids}
        </div>
        <div className="text-gray-600">
          <span className="block text-violet-600">Response</span>
          {bid.clientResponseTime}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-4 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-violet-900 mb-2">Bidding Overview</h2>
        <p className="text-gray-600">Track and analyze your bidding performance</p>
      </motion.div>

      {/* Statistics Overview */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Bids"
            value={bidStats.totalBids}
            icon={<FaChartLine className="text-xl" />}
            trend="up"
            trendValue="12"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Acceptance Rate"
            value={`${bidStats.acceptanceRate}%`}
            icon={<FaUserCheck className="text-xl" />}
            trend="up"
            trendValue="8"
            color="text-green-600"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Average Bid"
            value={bidStats.averageBidAmount}
            icon={<DollarOutlined className="text-xl" />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Win Rate"
            value={`${bidStats.recentWinRate}%`}
            icon={<FaExclamationTriangle className="text-xl" />}
            trend="down"
            trendValue="5"
            color="text-orange-600"
          />
        </Col>
      </Row>

      {/* Competitive Analysis */}
      <Card title="Competitive Analysis" className="mb-8">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card className="bg-violet-50 border-violet-100">
              <Statistic
                title="Market Position"
                value={bidInsights.competitivePosition.averagePosition}
                suffix="/ 10"
                precision={1}
                valueStyle={{ color: '#8B5CF6' }}
              />
              <p className="text-sm text-violet-600 mt-2">
                Top {bidInsights.competitivePosition.topPositionRate}% of bids
                <span className="text-green-500 ml-2">
                  ↑{bidInsights.competitivePosition.improvement}%
                </span>
              </p>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="bg-violet-50 border-violet-100">
              <h4 className="text-violet-900 font-medium mb-2">Optimal Bid Range</h4>
              <p className="text-2xl font-semibold text-violet-900">
                {bidInsights.bidOptimization.suggestedRange}
              </p>
              <p className="text-sm text-violet-600 mt-2">
                {bidInsights.bidOptimization.successRate}% success rate in this range
              </p>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="bg-violet-50 border-violet-100">
              <h4 className="text-violet-900 font-medium mb-2">High Demand Skills</h4>
              <div className="flex flex-wrap gap-2">
                {bidInsights.marketAnalysis.highDemandSkills.map(skill => (
                  <Tag key={skill} color="violet">
                    {skill}
                  </Tag>
                ))}
              </div>
              <p className="text-sm text-violet-600 mt-2">
                {bidInsights.marketAnalysis.competitorCount} active competitors
              </p>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Bid Optimization Tips */}
      <Card title="Bid Optimization Tips" className="mb-8">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="p-4 bg-violet-50 rounded-lg">
              <h4 className="text-violet-900 font-medium mb-2">
                <FaChartLine className="inline-block mr-2" />
                Pricing Strategy
              </h4>
              <p className="text-sm text-gray-600">
                Your bids are most successful when priced {bidInsights.bidOptimization.suggestedRange}
                for similar projects.
              </p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="p-4 bg-violet-50 rounded-lg">
              <h4 className="text-violet-900 font-medium mb-2">
                <FaRegClock className="inline-block mr-2" />
                Response Time
              </h4>
              <p className="text-sm text-gray-600">
                Aim to respond within {bidInsights.marketAnalysis.avgResponseTime} to maximize acceptance rate.
              </p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="p-4 bg-violet-50 rounded-lg">
              <h4 className="text-violet-900 font-medium mb-2">
                <FaUserCheck className="inline-block mr-2" />
                Project Duration
              </h4>
              <p className="text-sm text-gray-600">
                Optimal project duration: {bidInsights.bidOptimization.optimalDuration} for higher success.
              </p>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Bid Progress Section */}
      <Card title="Bid Status Distribution" className="mb-8">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <BidProgressCard
              title="Pending Bids"
              value={bidStats.pendingBids}
              total={bidStats.totalBids}
              color="#8B5CF6"
            />
          </Col>
          <Col xs={24} md={8}>
            <BidProgressCard
              title="Accepted Bids"
              value={bidStats.acceptedBids}
              total={bidStats.totalBids}
              color="#10B981"
            />
          </Col>
          <Col xs={24} md={8}>
            <BidProgressCard
              title="Rejected Bids"
              value={bidStats.rejectedBids}
              total={bidStats.totalBids}
              color="#EF4444"
            />
          </Col>
        </Row>
      </Card>

      {/* Recent Bids Section */}
      <Card 
        title="Recent Bids"

        className="mb-8"
      >
         <div className="p-4 flex flex-col items-end sm:flex-row gap-4 sm:gap-6">
            <Input
              placeholder="Search bids..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined className="text-violet-400" />}
              className="w-48 border-violet-200"
            />
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              placeholder="Status"
              className="w-32"
            >
              <Option value="">All</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Accepted">Accepted</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
          </div>
        <div className="space-y-4">
          {paginatedData.map(bid => (
            <RecentBidCard key={bid.id} bid={bid} />
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredBids.length || bids.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            className="text-violet-600"
          />
        </div>
      </Card>

      {/* Proposal Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <span className="text-violet-900 text-lg">Bid Details</span>
            {selectedBid && (
              <Tag color={getStatusColor(selectedBid.status)}>{selectedBid.status}</Tag>
            )}
          </div>
        }
        open={showProposalModal}
        onCancel={() => setShowProposalModal(false)}
        width={700}
        footer={null}
      >
        {selectedBid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="p-4 bg-violet-50 rounded-lg">
                  <p className="text-sm text-violet-600">Your Bid</p>
                  <p className="text-xl font-semibold text-violet-900">{selectedBid.bidAmount}</p>
                  <p className="text-sm text-gray-500 mt-1">vs. avg {selectedBid.averageBid}</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="p-4 bg-violet-50 rounded-lg">
                  <p className="text-sm text-violet-600">Bid Position</p>
                  <p className="text-xl font-semibold text-violet-900">
                    #{selectedBid.bidPosition} of {selectedBid.competingBids}
                  </p>
                </div>
              </Col>
            </Row>

            <div className="bg-violet-50 p-4 rounded-lg">
              <p className="text-sm text-violet-600 mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {selectedBid.skills.map(skill => (
                  <Tag key={skill} className="bg-violet-100 text-violet-700 border-violet-200">
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-violet-600 mb-2">Your Proposal</p>
              <textarea
                className="w-full p-3 border border-violet-200 rounded-lg focus:border-violet-500 focus:ring focus:ring-violet-200 transition-all"
                rows="6"
                placeholder="Detail your approach, timeline, and why you're the best fit..."
              />
            </div>
          </motion.div>
        )}
      </Modal>
    </div>
  );
};

export default BiddingOverview;
