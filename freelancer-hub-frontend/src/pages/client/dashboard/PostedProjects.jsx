import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Select, Pagination, Tabs, Tag } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { FaEye, FaBriefcase, FaClock, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useMediaQuery } from 'react-responsive';

const { Option } = Select;

const tabItems = [
  {
    label: (
      <span className="flex items-center gap-2">
        <FaClock className="text-teal-500" />
        Milestones
      </span>
    ),
    key: '1',
    children: (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Milestone tracking will go here.</p>
      </div>
    ),
  },
  {
    label: (
      <span className="flex items-center gap-2">
        <FaBriefcase className="text-teal-500" />
        Shared Files
      </span>
    ),
    key: '2',
    children: (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">File sharing and uploads will go here.</p>
      </div>
    ),
  },
  {
    label: (
      <span className="flex items-center gap-2">
        <UserOutlined className="text-teal-500" />
        Messages
      </span>
    ),
    key: '3',
    children: (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Messaging and collaboration tools will go here.</p>
      </div>
    ),
  },
];

const PostedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const fetchTheProjects = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/client/posted_projects/', {
        headers: getAuthHeaders(),
      });
      
      const mockProjects = response.data;
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
      
    } catch (error) {
      console.log(error);
    }
  };

  const getAuthHeaders = () => {
    const accessToken = Cookies.get("accessToken");
    return { Authorization: `Bearer ${accessToken}` };
  };

  const handleFilter = (statusValue) => {
    setStatusFilter(statusValue);
    
    const filtered = projects.filter((project) => {
      return (
        (project.status.toLowerCase().includes(statusValue.toLowerCase()) || statusValue === '') &&
        (project.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
    setFilteredProjects(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = projects.filter((project) => {
      return (
        (project.status.toLowerCase().includes(statusFilter.toLowerCase()) || statusFilter === '') &&
        (project.title.toLowerCase().includes(value.toLowerCase()))
      );
    });
    setFilteredProjects(filtered);
  };

  const openDetails = (project) => {
    console.log(project)
    setSelectedProject(project);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedProject(null);
    setShowDetails(false);
  };

  const paginatedData = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchTheProjects();
  }, []);

  useEffect(() => {
    const status = location.state?.status;
    if (status) {
      handleFilter(status);
    }
  }, [location.state, projects]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          color: 'orange',
          bg: 'bg-orange-50',
          text: 'text-orange-600'
        };
      case 'ongoing':
        return {
          color: 'blue',
          bg: 'bg-blue-50',
          text: 'text-blue-600'
        };
      case 'completed':
        return {
          color: 'green',
          bg: 'bg-green-50',
          text: 'text-green-600'
        };
      default:
        return {
          color: 'gray',
          bg: 'bg-gray-50',
          text: 'text-gray-600'
        };
    }
  };

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <div className="font-medium text-gray-900">{text}</div>
      ),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date) => (
        <div className="flex items-center gap-2 text-gray-600">
          <CalendarOutlined className="text-teal-500" />
          {date}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const { color, bg, text } = getStatusColor(status);
        return (
          <Tag color={color} className={`${bg} ${text} border-0 font-medium`}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            type="text"
            className="flex items-center gap-2 text-gray-600 hover:text-teal-600"
            icon={<FaEye />}
            onClick={() => openDetails(record)}
          >
            Preview
          </Button>
          <Button
            type="primary"
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600"
            onClick={() => navigate(`/client/view-bids/posted-project/${record.id}`, { state: { record } })}
          >
            View Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white rounded-xl shadow-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Posted Projects</h2>
        <Button
          type="primary"
          className="bg-teal-500 hover:bg-teal-600"
          onClick={() => navigate('/client/post-project')}
        >
          Post New Project
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by project name"
          value={searchTerm}
          onChange={handleSearch}
          prefix={<SearchOutlined className="text-gray-400" />}
          className="w-full md:w-72 rounded-lg"
        />
        <Select
          value={statusFilter}
          onChange={handleFilter}
          className="w-full md:w-48"
          placeholder="Filter by Status"
        >
          <Option value="">All Statuses</Option>
          <Option value="Pending">Pending</Option>
          <Option value="Ongoing">Ongoing</Option>
          <Option value="Completed">Completed</Option>
        </Select>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <Table
          dataSource={paginatedData}
          columns={columns}
          pagination={false}
          rowKey="id"
          className="custom-table"
        />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden space-y-4">
        <AnimatePresence>
          {paginatedData.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">{record.title}</h3>
                  <Tag color={getStatusColor(record.status).color}>
                    {record.status}
                  </Tag>
                </div>
              </div>

              <AnimatePresence>
                {openDropdown === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarOutlined />
                        <span>{record.deadline}</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="text"
                          icon={<FaEye />}
                          onClick={() => openDetails(record)}
                        >
                          Preview
                        </Button>
                        <Button
                          type="primary"
                          className="bg-teal-500 hover:bg-teal-600"
                          onClick={() => navigate(`/client/view-bids/posted-project/${record.id}`, { state: { record } })}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex justify-end">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredProjects.length}
          onChange={handlePaginationChange}
          showSizeChanger={false}
        />
      </div>

      {/* Project Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-3 border-b">
            <FaBriefcase className="text-teal-500 text-xl" />
            <span className="text-xl font-semibold">Project Details</span>
          </div>
        }
        open={showDetails}
        onCancel={closeDetails}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={closeDetails}
            className="bg-teal-500 hover:bg-teal-600"
          >
            Close
          </Button>
        ]}
        width={800}
        className="custom-modal"
      >
        {selectedProject && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedProject.title}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarOutlined className="text-teal-500" />
                  <span>Deadline: {selectedProject.deadline}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-teal-500" />
                  <span>Status: </span>
                  <Tag color={getStatusColor(selectedProject.status).color}>
                    {selectedProject.status}
                  </Tag>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <UserOutlined className="text-teal-500" />
                <span>Client: </span>
                <button
                  onClick={() => navigate(`/client/profile/${selectedProject.client?.id}`)}
                  className="text-teal-500 hover:text-teal-600 font-medium"
                >
                  {selectedProject.client?.username}
                </button>
              </div>
            </div>

            <Tabs
              defaultActiveKey="1"
              items={tabItems}
              className="custom-tabs"
            />
          </div>
        )}
      </Modal>

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-table .ant-table {
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .custom-table .ant-table-thead > tr > th {
          background-color: #f8fafc;
          color: #64748b;
          font-weight: 600;
        }

        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f1f5f9;
        }

        .custom-modal .ant-modal-content {
          border-radius: 1rem;
          overflow: hidden;
        }

        .custom-tabs .ant-tabs-nav::before {
          border-bottom-color: #e2e8f0;
        }

        .custom-tabs .ant-tabs-tab {
          padding: 12px 0;
          margin: 0 16px;
        }

        .custom-tabs .ant-tabs-tab-active {
          font-weight: 600;
        }

        .custom-tabs .ant-tabs-ink-bar {
          background-color: #14b8a6;
        }
      `}</style>
    </motion.div>
  );
};

export default PostedProjects;
