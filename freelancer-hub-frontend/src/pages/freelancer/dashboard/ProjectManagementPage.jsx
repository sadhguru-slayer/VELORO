import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Select, Tabs, Tag,Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { FaEye, FaBriefcase, FaClock, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import '../../../assets/css/ProjectManagementPage.css';

const { Option } = Select;

const tabItems = [
  {
    label: (
      <span className="flex items-center gap-2">
        <FaClock className="text-violet-500" />
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
        <FaBriefcase className="text-violet-500" />
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
        <UserOutlined className="text-violet-500" />
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

const ProjectManagementPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const mockProjects = [
      { id: 1, name: 'Website Redesign', deadline: '2024-12-31', status: 'Ongoing', client: 'ABC Corp', description: 'Complete website overhaul with modern design' },
      { id: 2, name: 'App Development', deadline: '2024-12-20', status: 'Pending', client: 'XYZ Ltd', description: 'Native mobile app for iOS and Android' },
      { id: 3, name: 'SEO Optimization', deadline: '2024-12-25', status: 'Completed', client: 'Tech Solutions', description: 'Improve search engine rankings' },
      { id: 4, name: 'Mobile App Development', deadline: '2024-11-15', status: 'Ongoing', client: 'AppWorks', description: 'Cross-platform mobile application' },
      { id: 5, name: 'E-commerce Platform', deadline: '2025-01-05', status: 'Pending', client: 'RetailPro', description: 'Full-featured online store' },
    ];
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

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
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-900">{text}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date) => (
        <div className="flex items-center gap-2 text-gray-600">
          <CalendarOutlined className="text-violet-500" />
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
          <Tag color={color} className={`${bg} ${text} border-0 px-3 py-1`}>
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
            icon={<FaEye className="mr-2" />}
            onClick={() => openDetails(record)}
            className="flex items-center text-violet-600 border-violet-200 hover:border-violet-300 hover:text-violet-700"
          >
            Preview
          </Button>
          <Button
            onClick={() => handleViewDetails(record.id, record)}
            className="flex items-center bg-violet-600 text-white hover:bg-violet-700 border-none"
          >
            View Details
          </Button>
        </div>
      ),
    },
  ];

  const handleFilter = (value) => {
    setStatusFilter(value);
    const filtered = projects.filter((project) => {
      return (
        (project.status.toLowerCase().includes(value.toLowerCase()) || value === '') &&
        (project.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
        (project.name.toLowerCase().includes(value.toLowerCase()))
      );
    });
    setFilteredProjects(filtered);
  };

  const openDetails = (project) => {
    setSelectedProject(project);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedProject(null);
    setShowDetails(false);
  };

  const handleViewDetails = (id, project) => {
    navigate(`/freelancer/dashboard/projects/${id}`, { state: { project } });
  };

  const paginatedData = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const ProjectCard = ({ project }) => {
    const { color, bg, text } = getStatusColor(project.status);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4 border border-violet-100"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-violet-900">{project.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{project.description}</p>
          </div>
          <Tag color={color} className={`${bg} ${text} border-0 px-3 py-1`}>
            {project.status}
          </Tag>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <CalendarOutlined className="mr-2 text-violet-500" />
            <span>{project.deadline}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <UserOutlined className="mr-2 text-violet-500" />
            <span>{project.client}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            icon={<FaEye className="mr-2" />}
            onClick={() => openDetails(project)}
            className="flex items-center text-violet-600 border-violet-200 hover:border-violet-300 hover:text-violet-700"
          >
            Preview
          </Button>
          <Button
            onClick={() => handleViewDetails(project.id, project)}
            className="flex items-center bg-violet-600 text-white hover:bg-violet-700 border-none"
          >
            View Details
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500/90 to-indigo-500/90 p-8">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full 
              filter blur-3xl mix-blend-overlay -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full 
              filter blur-3xl mix-blend-overlay translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-white/90 mb-2">Project Management</h1>
              <p className="text-white/70">Manage and track your ongoing projects</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearch}
                prefix={<SearchOutlined className="text-white/50" />}
                className="project-search-input w-full md:w-72"
              />
              <Select
                value={statusFilter}
                onChange={handleFilter}
                placeholder="Filter by Status"
                className="project-status-select w-full md:w-48"
              >
                <Option value="">All Statuses</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Ongoing">Ongoing</Option>
                <Option value="Completed">Completed</Option>
              </Select>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm">
        <div className="hidden md:block">
          <Table
            dataSource={paginatedData}
            columns={columns}
            pagination={false}
            rowKey="id"
            className="project-table"
            rowClassName="hover:bg-violet-50/50 transition-colors duration-200"
          />
        </div>

        <AnimatePresence>
          <div className="block md:hidden space-y-4">
            {paginatedData.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredProjects.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          className="custom-pagination"
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-700">
                {selectedProject?.name}
              </h3>
              {selectedProject && (
                <Tag
                  color={getStatusColor(selectedProject.status).color}
                  className={`mt-2 ${getStatusColor(selectedProject.status).bg} 
                    ${getStatusColor(selectedProject.status).text} border-0`}
                >
                  {selectedProject.status}
                </Tag>
              )}
            </div>
          </div>
        }
        open={showDetails}
        onCancel={closeDetails}
        footer={null}
        width={800}
        className="project-modal"
      >
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 py-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <UserOutlined className="text-violet-400" />
                  <h4 className="text-sm font-medium text-gray-600">Client</h4>
                </div>
                <p className="text-lg text-gray-700">{selectedProject.client}</p>
              </div>

              <div className="p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarOutlined className="text-violet-400" />
                  <h4 className="text-sm font-medium text-gray-600">Deadline</h4>
                </div>
                <p className="text-lg text-gray-700">{selectedProject.deadline}</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50/50 rounded-xl border border-gray-100">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Project Description</h4>
              <p className="text-gray-600 leading-relaxed">{selectedProject.description}</p>
            </div>

            <Tabs items={tabItems} className="project-tabs" />
          </motion.div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectManagementPage;
