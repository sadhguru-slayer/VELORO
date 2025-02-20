import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Select, Tabs, Row, Col, Pagination, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined } from "@ant-design/icons";
import { FaEye } from 'react-icons/fa';


const { Option } = Select;
const { TabPane } = Tabs;

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

  // Mock data or API call to fetch projects
  useEffect(() => {
    const mockProjects = [
      { id: 1, name: 'Website Redesign', deadline: '2024-12-31', status: 'Ongoing', client: 'ABC Corp' },
      { id: 2, name: 'App Development', deadline: '2024-12-20', status: 'Pending', client: 'XYZ Ltd' },
      { id: 3, name: 'SEO Optimization', deadline: '2024-12-25', status: 'Completed', client: 'Tech Solutions' },
      { id: 4, name: 'Mobile App Development', deadline: '2024-11-15', status: 'Ongoing', client: 'AppWorks' },
      { id: 5, name: 'E-commerce Platform', deadline: '2025-01-05', status: 'Pending', client: 'RetailPro' },
    ];
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  const handleFilter = (value) => {
    setStatusFilter(value);
    // Re-filter projects based on status and search term
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
    // Re-filter projects based on search term and status filter
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

  const handleViewDetails = (id,project) => {
    navigate(`/freelancer/dashboard/projects/${id}`,{state:{project}});
  };

  const columns = [
    { title: 'Project Name', dataIndex: 'name', key: 'name' },
    { title: 'Deadline', dataIndex: 'deadline', key: 'deadline' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Actions', key: 'actions', render: (_, record) => (
      <div className="flex space-x-2">
                            
                            <Button
                                              className="text-charcolBlue"
                                              icon={<FaEye />}
                                              onClick={() => openDetails(record)}
                                            >
                                              Preview
                                            </Button>
                                            <Button
                                              className="bg-charcolBlue text-teal-400 hover:text-teal-500"
                                              onClick={() => handleViewDetails(record.id,record)}
                                            >
                                              View Details
                                            </Button>
                            </div>
                            
      
    ) }
  ];

  // Pagination Handling
  const paginatedData = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div className="p-3 bg-gray-100 rounded-lg shadow-sm hover:shadow-md">
      {/* Header */}
      <h2 className="text-xl font-semibold mb-4">Projects</h2>

      {/* Search and Filter */}
      <div className="flex mb-6 space-x-4">
        <Input
          placeholder="Search by project name"
          value={searchTerm}
          onChange={handleSearch}
          prefix={<SearchOutlined />}
          className="w-72"
        />
        <Select
          defaultValue=""
          className="w-48"
          value={statusFilter}
          onChange={handleFilter}
          placeholder="Filter by Status"
        >
          <Option value="">All Statuses</Option>
          <Option value="Pending">Pending</Option>
          <Option value="Ongoing">Ongoing</Option>
          <Option value="Completed">Completed</Option>
        </Select>
      </div>

      {/* Desktop View - Table */}
      <Card title="Projects">
        <div className="hidden md:block">
          <Table
            dataSource={paginatedData}
            columns={columns}
            pagination={false}
            rowKey="id"
          />
        </div>

        {/* Mobile View - Dropdown */}
        <div className="block md:hidden">
          {paginatedData.map((row, index) => (
            <div key={row.id} className="mb-4 border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleDropdown(index)}
                className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none"
              >
                {row.name} {/* Use the first column as the dropdown title */}
              </button>
              {openDropdown === index && (
                <div className="p-3 bg-white">
                  <p><strong>Deadline:</strong> {row.deadline}</p>
                  <p><strong>Status:</strong> {row.status}</p>
                  <div className="flex space-x-2 mt-2">
                  <Button
                  className="text-charcolBlue"
                  icon={<FaEye />}
                  onClick={() => openDetails(row)}
                >
                  Preview
                </Button>
                <Button
                  className="bg-charcolBlue text-teal-400 hover:text-teal-500"
                  onClick={() => handleViewDetails(row.id,row)}
                >
                  View Details
                </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredProjects.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </Card>

      {/* Project Details Modal */}
      <Modal
        title="Project Details"
        visible={showDetails}
        onCancel={closeDetails}
        footer={[
          <Button key="close" onClick={closeDetails} type="primary">
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedProject && (
          <div>
            <h3>{selectedProject.name}</h3>
            <p><strong>Deadline:</strong> {selectedProject.deadline}</p>
            <p><strong>Status:</strong> {selectedProject.status}</p>
            <p><strong>Client:</strong> {selectedProject.client}</p>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Milestones" key="1">
                <p>Milestone tracking will go here.</p>
              </TabPane>
              <TabPane tab="Shared Files" key="2">
                <p>File sharing and uploads will go here.</p>
              </TabPane>
              <TabPane tab="Messages" key="3">
                <p>Messaging and collaboration tools will go here.</p>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectManagementPage;
