import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Pagination, Table, Tooltip, Progress, Tabs, Card, Statistic } from "antd";
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  LinkOutlined,
  EditOutlined,
  ProjectOutlined,
  StarOutlined,
  TeamOutlined,
  CalendarOutlined,
  MailOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  UserAddOutlined,
  DashboardOutlined,

} from '@ant-design/icons';
import { Tag,Avatar } from 'antd'; 
import { Timeline } from 'antd';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import axios from 'axios';

const { TabPane } = Tabs;

const AuthProfile = ({userId, role, editable}) => {  
    const navigate = useNavigate();
    const location = useLocation();
    const [clientInfo, setClientInfo] = useState({});
    const [projects, setProjects] = useState([]);
    const [reviewsList, setReviewsList] = useState([]);
    const [connectionCount, setConnectionCount] = useState(0);  // To store connection count
    const [averageRating, setAverageRating] = useState(0);  // To store average rating  
    const [openDropdown, setOpenDropdown] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const paginatedData = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
    const handlePaginationChange = (page) => {
      setCurrentPage(page);
    };
  
    const [loading, setLoading] = useState(true);

    // Add new states for enhanced features
    const [activeTab, setActiveTab] = useState('1');
    const [projectStats, setProjectStats] = useState({
      completed: 0,
      ongoing: 0,
      total: 0
    });

    useEffect(() => {
      // This ensures that we wait for userId and accessToken to be available
      const fetchProfileDetails = async () => {
        const accessToken = Cookies.get("accessToken");
  
        if (!userId || !accessToken) {
          console.log("Waiting for userId or accessToken...");
          return; 
        }
  
        setLoading(true); // Start loading indicator
  
        try {
          const response = await axios.get("http://127.0.0.1:8000/api/client/get_profile_data", {
            params: { userId: userId }, // Passing userId as query parameter
            headers: {
              Authorization: `Bearer ${accessToken}`, // Passing the access token as Authorization header
            },
          });
  
          // Assuming the response data structure is as expected
          const data = response.data;
          setClientInfo(data.client_profile);
          setProjects(data.projects);
          setReviewsList(data.reviews_and_ratings.reviews);
          setConnectionCount(data.connection_count);
          setAverageRating(data.reviews_and_ratings.average_rating);
        } catch (error) {
          console.log(error); // Handle any errors
        } finally {
          setLoading(false); // Stop loading after request is completed
        }
      };
  
      // Ensure that we wait for userId and accessToken before making the request
      if (userId && Cookies.get("accessToken")) {
        fetchProfileDetails();
      } else {
        console.log("Waiting for userId and accessToken...");
      }
    }, [userId]); 
    
    // Calculate project stats
    useEffect(() => {
      if (projects.length > 0) {
        const stats = projects.reduce((acc, project) => {
          if (project.status === 'completed') acc.completed++;
          if (project.status === 'ongoing') acc.ongoing++;
          acc.total++;
          return acc;
        }, { completed: 0, ongoing: 0, total: 0 });
        setProjectStats(stats);
      }
    }, [projects]);

  return (
    <div className="w-full min-h-fit max-w-[1200px] min-w-[320px] mx-auto p-4 space-y-4">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        {/* Cover Photo */}
        <div className="h-40 bg-gradient-to-r from-charcolBlue to-teal-500 relative">
          <div className="absolute -bottom-12 left-6 flex items-end space-x-6">
            <div className="relative">
              <img 
                src={clientInfo.profile_picture ? `http://127.0.0.1:8000${clientInfo.profile_picture}` : "https://www.w3schools.com/howto/img_avatar.png"} 
                alt="Profile" 
                className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
              />
              {editable && (
                <Tooltip title="Edit Profile">
                  <Button 
                    icon={<EditOutlined />}
                    className="absolute bottom-0 right-0 rounded-full bg-white hover:bg-gray-50"
                    onClick={() => navigate(`/client/profile/${userId}`, { state: { profileComponent: 'edit_profile' } })}
                  />
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 px-6 pb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="max-w-xl">
              <h1 className="text-xl font-semibold text-charcolBlue">{clientInfo.name}</h1>
              <div className="mt-2 space-y-2">
                <div className="flex items-center text-gray-600">
                  <MailOutlined className="mr-2 text-teal-500" />
                  {clientInfo.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <EnvironmentOutlined className="mr-2 text-teal-500" />
                  {clientInfo.location}
                </div>
                <div className="flex items-center text-gray-600 cursor-pointer hover:text-teal-500 transition-colors" 
                     onClick={() => navigate('/client/connections/')}>
                  <LinkOutlined className="mr-2 text-teal-500" />
                  {connectionCount} Connections
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              
              <Button 
                onClick={() => navigate('/client/post-project')}
                className="border-teal-500 text-teal-500 hover:text-teal-600 hover:border-teal-600"
              >
                Post New Project
              </Button>
            </div>
          </div>

          {clientInfo.bio && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="text-sm font-medium text-charcolBlue mb-2">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{clientInfo.bio}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Projects",
            value: projectStats.total,
            icon: <ProjectOutlined />,
            color: '#0d9488'
          },
          {
            title: "Average Rating",
            value: averageRating,
            icon: <StarOutlined />,
            suffix: "/5",
            color: '#eab308'
          },
          {
            title: "Connections",
            value: connectionCount,
            icon: <TeamOutlined />,
            color: '#3b82f6'
          },
          {
            title: "Success Rate",
            value: (projectStats.completed / projectStats.total * 100) || 0,
            icon: <CheckCircleOutlined />,
            suffix: "%",
            color: '#22c55e'
          }
        ].map((stat, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic 
              title={
                <span className="text-charcolBlue font-medium flex items-center gap-2">
                  {stat.icon}
                  {stat.title}
                </span>
              }
              value={stat.value}
              precision={stat.suffix === "/5" ? 1 : stat.suffix === "%" ? 1 : 0}
              suffix={stat.suffix}
              valueStyle={{ color: stat.color }}
            />
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Card className="rounded-lg shadow-md">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="custom-tabs"
        >
          <TabPane 
            tab={<span><ProjectOutlined />Projects</span>} 
            key="1"
          >
            <div className="space-y-4">
              {/* Project Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-gray-50">
                  <h4 className="text-sm font-semibold mb-4">Project Status</h4>
                  <Progress
                    percent={Math.round((projectStats.completed / projectStats.total) * 100)}
                    success={{ percent: Math.round((projectStats.ongoing / projectStats.total) * 100) }}
                    format={() => `${projectStats.completed}/${projectStats.total}`}
                  />
                </Card>
                <Card className="bg-gray-50">
                  <h4 className="text-sm font-semibold mb-4">Recent Activity</h4>
                  <Timeline>
                    {projects.slice(0, 3).map(project => (
                      <Timeline.Item key={project.id}>
                        {project.title}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </div>

              {/* Projects Table */}
              <Table
                dataSource={paginatedData}
                columns={[
                  {
                    title: "Project Title",
                    dataIndex: "title",
                    key: "title",
                    render: (text, project) => (
                      <div className="flex items-center space-x-2">
                        <ProjectOutlined />
                        <span>{text}</span>
                      </div>
                    )
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (status) => (
                      <Tag color={
                        status === 'completed' ? 'success' :
                        status === 'ongoing' ? 'processing' :
                        'default'
                      }>
                        {status}
                      </Tag>
                    )
                  },
                  {
                    title: "Action",
                    key: "action",
                    render: (_, project) => (
                      <Button 
                        type="link" 
                        onClick={() => navigate(`/client/view-bids/posted-project/${project.id}`)}
                        icon={<EyeOutlined />}
                      >
                        View Details
                      </Button>
                    )
                  }
                ]}
                pagination={false}
                rowKey="id"
                className="custom-table"
              />
              
              <div className="flex justify-end mt-4">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={projects.length}
                  onChange={handlePaginationChange}
                  showSizeChanger={false}
                />
              </div>
            </div>
          </TabPane>

          <TabPane 
            tab={<span><StarOutlined />Reviews</span>} 
            key="2"
          >
            <div className="space-y-6">
              {/* Rating Overview */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">{averageRating}</div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                </div>
                <div className="flex-1 max-w-sm mx-8">
                  {[5,4,3,2,1].map(rating => {
                    const count = reviewsList.filter(r => r.rating === rating).length;
                    const percentage = (count / reviewsList.length) * 100;
                    return (
                      <div key={rating} className="flex items-center space-x-2">
                        <span className="text-sm w-8">{rating}★</span>
                        <Progress percent={percentage} size="small" showInfo={false} />
                        <span className="text-sm w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <Avatar size={48}>
                        {review.from_freelancer_username ? review.from_freelancer_username[0] : '?'}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{review.from_freelancer_username || 'Anonymous'}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarOutlined 
                                key={i}
                                className={i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600">{review.feedback || 'No feedback provided'}</p>
                        <div className="mt-2 text-sm text-gray-400">
                          <CalendarOutlined className="mr-1" />
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Date not available'}
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-between gap-4 flex-wrap">
        <Button 
          type="primary" 
          icon={<DashboardOutlined />}
          onClick={() => navigate('/client/dashboard')}
          className="bg-charcolBlue hover:bg-charcolBlue/90 text-white border-none min-w-[150px]"
        >
          Dashboard
        </Button>
        <Button 
          type="primary" 
          icon={<UserAddOutlined />}
          onClick={() => navigate('/client/browse-freelancers')}
          className="bg-teal-500 hover:bg-teal-600 text-white border-none min-w-[150px]"
        >
          Browse Freelancers
        </Button>
      </div>

      <style jsx>{`
        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #0d9488;
        }
        
        .custom-tabs .ant-tabs-ink-bar {
          background: #0d9488;
        }

        .custom-table .ant-table-thead > tr > th {
          background-color: #f8fafc;
          color: #1e293b;
          font-weight: 500;
        }
        
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f1f5f9;
        }

        .ant-progress-bg {
          background-color: #0d9488;
        }

        .ant-btn-primary:hover {
          background-color: #0d9488 !important;
        }

        .ant-progress-success-bg {
          background-color: #22c55e;
        }
      `}</style>
    </div>
  );
}

export default AuthProfile;