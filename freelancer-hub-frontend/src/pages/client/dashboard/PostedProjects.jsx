import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Select, Pagination, Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchOutlined } from "@ant-design/icons";
import { FaEye } from 'react-icons/fa';
import axios from 'axios';
import Cookies from 'js-cookie';


const { Option } = Select;

const tabItems = [
  { label: 'Milestones', key: '1', children: <p>Milestone tracking will go here.</p> },
  { label: 'Shared Files', key: '2', children: <p>File sharing and uploads will go here.</p> },
  { label: 'Messages', key: '3', children: <p>Messaging and collaboration tools will go here.</p> },
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

  const columns = [
    { title: 'Project Name', dataIndex: 'title', key: 'title' },
    { title: 'Deadline', dataIndex: 'deadline', key: 'deadline' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: (text) => {
        const capitalizedStatus = 
        
        text? text.charAt(0).toUpperCase() + text.slice(1) :''

        ;
        let statusClass = '';
        if (capitalizedStatus === 'Pending') {
          statusClass = 'text-red-500';
        } else if (capitalizedStatus === 'Ongoing') {
          statusClass = 'text-blue-500';
        } else if (capitalizedStatus === 'Completed') {
          statusClass = 'text-green-500';
        }
        return <span className={`status ${statusClass}`}>{capitalizedStatus}</span>;
      }
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_, record) => (
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
            onClick={() => navigate(`/client/view-bids/posted-project/${record.id}`, { state: { record } })}
          >
            View Details
          </Button>
        </div>
      ) 
    }
  ];

  return (
    <div className="p-3 bg-gray-100 rounded-lg shadow-sm hover:shadow-md">
      <h2 className="text-xl font-semibold mb-4">Projects</h2>

      <div className="flex mb-6 space-x-4">
        <Input
          placeholder="Search by project name"
          value={searchTerm}
          onChange={handleSearch}
          prefix={<SearchOutlined />}
          className="w-72"
        />
        <Select
          value={statusFilter}
          onChange={handleFilter}
          className="w-48"
          placeholder="Filter by Status"
        >
          <Option value="">All Statuses</Option>
          <Option value="Pending">Pending</Option>
          <Option value="Ongoing">Ongoing</Option>
          <Option value="Completed">Completed</Option>
        </Select>
      </div>

      <div className="hidden md:block">
        <Table
          dataSource={paginatedData}
          columns={columns}
          pagination={false}
          rowKey="id"
        />
      </div>

      <div className="block md:hidden">
        {paginatedData.map((record, index) => (
          <div key={record.id} className="mb-4 border border-gray-200 rounded-md">
            <button
              onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
              className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none"
            >
              {record.title}
            </button>
            {openDropdown === index && (
              <div className="p-3 bg-white flex flex-wrap justify-center">
                <p><strong>Deadline:</strong> {record.deadline}</p>
                <p><strong>Status:</strong> {record.status}</p>
                <div className="flex space-x-2 mt-2">
                  <Button
                    className="text-charcolBlue"
                    icon={<FaEye />}
                    onClick={() => openDetails(record)}
                  >
                    Preview
                  </Button>
                  <Button
                    className="bg-charcolBlue text-teal-400 hover:text-teal-500"
                    onClick={() => navigate(`/client/view-bids/posted-project/${record.id}`, { state: { record } })}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredProjects.length}
          onChange={handlePaginationChange}
          showSizeChanger={false}
        />
      </div>

      <Modal
      title="Project Details"
      open={showDetails}
      onCancel={closeDetails}
      footer={[<Button key="close" onClick={closeDetails} type="primary">Close</Button>]}
      width={800}
    >
      {selectedProject && (
        <div>
          <h3>{selectedProject.title}</h3>
          <p><strong>Deadline:</strong> {selectedProject.deadline}</p>
          <p><strong>Status:</strong> {selectedProject.status}</p>
          <p><strong className='cursor-pointer' onClick={()=>navigate(`/client/profile/${selectedProject.client?.id}`)} >Client:</strong> {selectedProject.client?.username}</p>
          <Tabs defaultActiveKey='1' items={tabItems} />
        </div>
      )}
    </Modal>
    
    </div>
  );
};

export default PostedProjects;
