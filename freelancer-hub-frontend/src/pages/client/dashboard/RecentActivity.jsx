import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select, Pagination, message, Tooltip, Badge, Tag } from "antd";
import { motion } from "framer-motion";
import { 
  SearchOutlined, 
  DollarCircleOutlined, 
  ProjectOutlined,
  BellOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined
} from "@ant-design/icons";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

const { Option } = Select;

const RecentActivity = () => {
  const navigate = useNavigate();
  const [paymentSearchTerm, setPaymentSearchTerm] = useState("");
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [statusPaymentFilter, setStatusPaymentFilter] = useState("");
  const [statusProjectFilter, setStatusProjectFilter] = useState("");
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [currentPaymentPage, setCurrentPaymentPage] = useState(1);
  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const [currentOtherActivitiesPage, setCurrentOtherActivitiesPage] = useState(1);
  const [openPaymentDropdown, setOpenPaymentDropdown] = useState(null);
  const [openProjectDropdown, setOpenProjectDropdown] = useState(null);
  const [openOtheractivitiesDropdown, setOpenOtheractivitiesDropdown] = useState(null); 
  const [paymentData, setPaymentData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [otherActivitiesData, setOtherActivitiesData] = useState([]); 
  const paymentPageSize = 4;
  const projectPageSize = 4;
  const otherPageSize =6;
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const fetchPaymentData = async () => {
      const accessTokens = Cookies.get("accessToken");
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/client/specified_recent_activity",
          {
            params: { activity_type: "payment" },
            headers: { Authorization: `Bearer ${accessTokens}` },
          }
        );
        
        setPaymentData(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    const fetcthProjectData = async () => {
      const accessTokens = Cookies.get("accessToken");
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/client/specified_recent_activity",
          {
            params: { activity_type: "project" },
            headers: { Authorization: `Bearer ${accessTokens}` },
          }
        );
        setProjectData(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchOtherActivities= async ()=>{
      const accessTokens = Cookies.get("accessToken");
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/client/other_recent_activity",
          {
            params: { activity_type: "other" },
            headers: { Authorization: `Bearer ${accessTokens}` },
            }
            );
            setOtherActivitiesData(response.data);
            } catch (error) {
              console.log(error);
              }
    }
    fetchPaymentData();
    fetcthProjectData();
    fetchOtherActivities();
  }, []);

  // Filter payment data based on search term and status
  useEffect(() => {
    const filtered = paymentData.filter((payment) => {
      const matchesSearchTerm = payment.description
        .toLowerCase()
        .includes(paymentSearchTerm.toLowerCase());
      const matchesStatus = statusPaymentFilter
        ? payment.activity_type.toLowerCase() ===
          statusPaymentFilter.toLowerCase()
        : true;
      return matchesSearchTerm && matchesStatus;
    });
    setFilteredPayments(filtered);
  }, [paymentData, paymentSearchTerm, statusPaymentFilter]);

  // Filter project data based on search term and status
  useEffect(() => {
    const filtered = projectData.filter((project) => {
      const matchesSearchTerm = project.description
        .toLowerCase()
        .includes(projectSearchTerm.toLowerCase());
      const matchesStatus = statusProjectFilter
        ? project.activity_type.toLowerCase() ===
          statusProjectFilter.toLowerCase()
        : true;
      return matchesSearchTerm && matchesStatus;
    });
    setFilteredProjects(filtered);
  }, [projectData, projectSearchTerm, statusProjectFilter]);

  // Paginated payment data
  const paginatedPaymentData =
    filteredPayments.length > 0
      ? filteredPayments.slice(
          (currentPaymentPage - 1) * paymentPageSize,
          currentPaymentPage * paymentPageSize
        )
      : paymentData.slice(
          (currentPaymentPage - 1) * paymentPageSize,
          currentPaymentPage * paymentPageSize
        );

  // Paginated project data
  const paginatedProjectData =
    filteredProjects.length > 0
      ? filteredProjects.slice(
          (currentProjectPage - 1) * projectPageSize,
          currentProjectPage * projectPageSize
        )
      : projectData.slice(
          (currentProjectPage - 1) * projectPageSize,
          currentProjectPage * projectPageSize
        );

  const paginatedOtherActivitiesData = 
        otherActivitiesData.length > 0
          ? otherActivitiesData.slice(
              (currentOtherActivitiesPage - 1) * otherPageSize,
              currentOtherActivitiesPage * otherPageSize
            )
          : [];
      
        

  // Toggle dropdown for mobile view
  const togglePaymentDropdown = (index) => {
    setOpenPaymentDropdown(openPaymentDropdown === index ? null : index);
  };

  const toggleProjectDropdown = (index) => {
    setOpenProjectDropdown(openProjectDropdown === index ? null : index);
  };
  const toggleOtherActivitiesDropdown = (index) => {
    setOpenOtheractivitiesDropdown(openOtheractivitiesDropdown === index ? null : index);
  };

  const format_activity_type = (activity_type) => {
    return activity_type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const format_timeStamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const showMessages = (msg,type)=>{
    if(type === 'error'){
      message.error(msg);
    }else{
      message.success(msg);
    }
  }

  const getActivityIcon = (type) => {
    switch (true) {
      case type.includes('payment'):
        return <DollarCircleOutlined className="text-emerald-500" />;
      case type.includes('project'):
        return <ProjectOutlined className="text-blue-500" />;
      default:
        return <BellOutlined className="text-purple-500" />;
    }
  };

  const getStatusTag = (type) => {
    const statusConfig = {
      payment_sent: { color: 'green', icon: <CheckCircleOutlined /> },
      payment_received: { color: 'blue', icon: <DollarCircleOutlined /> },
      payment_failed: { color: 'red', icon: <CloseCircleOutlined /> },
      project_created: { color: 'cyan', icon: <ProjectOutlined /> },
      project_updated: { color: 'orange', icon: <EditOutlined /> },
      project_deleted: { color: 'red', icon: <CloseCircleOutlined /> }
    };

    const config = statusConfig[type] || { color: 'default', icon: <ClockCircleOutlined /> };
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {format_activity_type(type)}
      </Tag>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Recent Activity</h2>
        <Select
          defaultValue="all"
          className="w-48"
          onChange={(value) => {/* Add filter logic */}}
        >
          <Option value="all">All Activities</Option>
          <Option value="payments">Payments</Option>
          <Option value="projects">Projects</Option>
          <Option value="other">Other</Option>
        </Select>
      </div>

      {/* Payment Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          title={
            <div className="flex items-center gap-2">
              <DollarCircleOutlined className="text-xl text-emerald-500" />
              <span className="text-lg font-semibold">Payment Activity</span>
            </div>
          }
          className="shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search payments..."
              value={paymentSearchTerm}
              onChange={(e) => setPaymentSearchTerm(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              className="md:w-72"
            />
            <Select
              defaultValue=""
              className="md:w-48"
              onChange={(value) => setStatusPaymentFilter(value)}
              placeholder="Filter by Status"
            >
              <Option value="">All Statuses</Option>
              <Option value="payment_sent">Sent</Option>
              <Option value="payment_received">Received</Option>
              <Option value="payment_failed">Failed</Option>
            </Select>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPaymentData.map((row) => (
                    <motion.tr
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                      whileHover={{ scale: 1.01 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getActivityIcon(row.activity_type)}
                          <span className="text-gray-900">{row.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {format_timeStamp(row.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusTag(row.activity_type)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {paginatedPaymentData.map((row) => (
                <motion.div
                  key={row.id}
                  className="p-4 border-b border-gray-200 last:border-b-0"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(row.activity_type)}
                      <span className="font-medium">{row.description}</span>
                    </div>
                    {getStatusTag(row.activity_type)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format_timeStamp(row.timestamp)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Pagination
              current={currentPaymentPage}
              pageSize={paymentPageSize}
              total={filteredPayments.length || paymentData.length}
              onChange={(page) => setCurrentPaymentPage(page)}
              showSizeChanger={false}
            />
          </div>
        </Card>
      </motion.div>

      {/* Project Activity Section - Similar structure as Payment Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card 
          title={
            <div className="flex items-center gap-2">
              <ProjectOutlined className="text-xl text-blue-500" />
              <span className="text-lg font-semibold">Project Activity</span>
            </div>
          }
          className="shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search projects..."
              value={projectSearchTerm}
              onChange={(e) => setProjectSearchTerm(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              className="md:w-72"
            />
            <Select
              defaultValue=""
              className="md:w-48"
              onChange={(value) => setStatusProjectFilter(value)}
              placeholder="Filter by Status"
            >
              <Option value="">All Statuses</Option>
              <Option value="project_created">Project Created</Option>
              <Option value="project_updated">Project Updated</Option>
              <Option value="project_deleted">Project Deleted</Option>
            </Select>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProjectData.map((row) => (
                    <motion.tr
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                      whileHover={{ scale: 1.01 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getActivityIcon(row.activity_type)}
                          <span className="text-gray-900">{row.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {format_timeStamp(row.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusTag(row.activity_type)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {paginatedProjectData.map((row) => (
                <motion.div
                  key={row.id}
                  className="p-4 border-b border-gray-200 last:border-b-0"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(row.activity_type)}
                      <span className="font-medium">{row.description}</span>
                    </div>
                    {getStatusTag(row.activity_type)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format_timeStamp(row.timestamp)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Pagination
              current={currentProjectPage}
              pageSize={projectPageSize}
              total={filteredProjects.length || projectData.length}
              onChange={(page) => setCurrentProjectPage(page)}
              showSizeChanger={false}
            />
          </div>
        </Card>
      </motion.div>

      {/* Other Activities Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card 
          title={
            <div className="flex items-center gap-2">
              <BellOutlined className="text-xl text-purple-500" />
              <span className="text-lg font-semibold">Other Activities</span>
            </div>
          }
          className="shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedOtherActivitiesData.map((row) => (
                    <motion.tr
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                      whileHover={{ scale: 1.01 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getActivityIcon(row.activity_type)}
                          <span className="text-gray-900">{row.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {format_timeStamp(row.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusTag(row.activity_type)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {paginatedOtherActivitiesData.map((row) => (
                <motion.div
                  key={row.id}
                  className="p-4 border-b border-gray-200 last:border-b-0"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(row.activity_type)}
                      <span className="font-medium">{row.description}</span>
                    </div>
                    {getStatusTag(row.activity_type)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format_timeStamp(row.timestamp)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Pagination
              current={currentOtherActivitiesPage}
              pageSize={otherPageSize}
              total={otherActivitiesData.length}
              onChange={(page) => setCurrentOtherActivitiesPage(page)}
              showSizeChanger={false}
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RecentActivity;
