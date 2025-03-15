import { useEffect, useState, useCallback } from 'react';
import CSider from '../../components/client/CSider';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import CHeader from '../../components/client/CHeader';
import IndividualLoadingComponent from '../../components/IndividualLoadingComponent';
import { Modal, Button, Input, Select, Tabs, Pagination, Card, Tag, Tooltip } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEye, 
  FaCalendarAlt, 
  FaUserCircle, 
  FaClock,
  FaDollarSign,
  FaCheckCircle,
  FaSearch
} from 'react-icons/fa';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const ViewBids = ({userId, role}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const handleMenuClick = (component) => {
    if (location.pathname !== "/client/dashboard") {
      navigate("/client/dashboard", { state: { component } });
    }
  };

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { color: 'orange', bg: 'bg-orange-50', text: 'text-orange-600' };
      case 'ongoing':
        return { color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' };
      case 'completed':
        return { color: 'green', bg: 'bg-green-50', text: 'text-green-600' };
      default:
        return { color: 'gray', bg: 'bg-gray-50', text: 'text-gray-600' };
    }
  };

  useEffect(() => {
    const mockProjects = [
      { 
        id: 1, 
        name: 'Website Redesign', 
        deadline: '2024-12-31', 
        status: 'Ongoing',
        budget: 2000,
        totalBids: 5,
        description: 'Complete website redesign with modern UI/UX features',
        client: 'ABC Corp', 
        bids: [
          { 
            freelancer: 'John Doe',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe',
            rating: 4.8,
            price: 1200,
            days: 15,
            description: 'Redesign the website with modern UI/UX features.',
            completedProjects: 25
          },
          { 
            freelancer: 'Jane Smith',
            avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
            rating: 4.9,
            price: 1000,
            days: 12,
            description: 'Revamp the site with a fresh look and feel.',
            completedProjects: 32
          },
        ]
      },
      { 
        id: 2, 
        name: 'App Development', 
        deadline: '2024-12-20', 
        status: 'Pending', 
        client: 'XYZ Ltd', 
        bids: [
          { freelancer: 'Mark Lee', price: 3000, days: 30, description: 'Full-stack app development for the platform.' },
          { freelancer: 'Emily Ray', price: 2500, days: 25, description: 'Develop an app with a sleek interface and smooth performance.' },
        ]
      },
      { 
        id: 3, 
        name: 'SEO Optimization', 
        deadline: '2024-12-25', 
        status: 'Completed', 
        client: 'Tech Solutions', 
        bids: [
          { freelancer: 'Mike Johnson', price: 800, days: 10, description: 'SEO audit and on-page optimization.' },
          { freelancer: 'Anna Kim', price: 950, days: 12, description: 'Improve SEO ranking for major keywords.' },
        ]
      },
      { 
        id: 4, 
        name: 'SEO Optimization', 
        deadline: '2024-12-25', 
        status: 'Completed', 
        client: 'Tech Solutions', 
        bids: [
          { freelancer: 'Mike Johnson', price: 800, days: 10, description: 'SEO audit and on-page optimization.' },
          { freelancer: 'Anna Kim', price: 950, days: 12, description: 'Improve SEO ranking for major keywords.' },
        ]
      },
      { 
        id: 5, 
        name: 'SEO Optimization', 
        deadline: '2024-12-25', 
        status: 'Completed', 
        client: 'Tech Solutions', 
        bids: [
          { freelancer: 'Mike Johnson', price: 800, days: 10, description: 'SEO audit and on-page optimization.' },
          { freelancer: 'Anna Kim', price: 950, days: 12, description: 'Improve SEO ranking for major keywords.' },
        ]
      },
    ];
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  const handleFilter = useCallback((value) => {
    setStatusFilter(value);
    setFilteredProjects(
      projects.filter(project => 
        project.status.toLowerCase().includes(value.toLowerCase()) &&
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [projects, searchTerm]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setFilteredProjects(
      projects.filter(project => 
        project.name.toLowerCase().includes(value.toLowerCase()) &&
        project.status.toLowerCase().includes(statusFilter.toLowerCase())
      )
    );
  }, [projects, statusFilter]);

  const [activeProfileComponent, setActiveProfileComponent] = useState('');

  const handleProfileMenu = (profileComponent) => {
    
    if (location.pathname !== '/client/profile') {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
    }
  };


  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const paginatedData = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    { title: 'Project Name', dataIndex: 'name', key: 'name' },
    { title: 'Deadline', dataIndex: 'deadline', key: 'deadline' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button 
            className="text-charcolBlue" 
            icon={<FaEye />}
            onClick={() => setSelectedProject(record)}
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
      ),
    },
  ];

  const bidColumns = [
    { title: 'Freelancer', dataIndex: 'freelancer', key: 'freelancer' },
    { title: 'Price ($)', dataIndex: 'price', key: 'price' },
    { title: 'Days', dataIndex: 'days', key: 'days' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <CSider userId={userId} 
      role={role} dropdown={true} collapsed={true} handleMenuClick={handleMenuClick} handleProfileMenu={handleProfileMenu}/>

      <div className="bg-gray-100 flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-14 md:ml-14 lg:ml-22">
        <CHeader userId={userId}/>
        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          {loading ? (
            <IndividualLoadingComponent />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Project Bids</h2>
                <Button
                  type="primary"
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={() => navigate('/client/post-project')}
                >
                  Post New Project
                </Button>
              </div>

              <Card className="shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Search
                    placeholder="Search projects"
                    allowClear
                    prefix={<FaSearch className="text-gray-400" />}
                    onSearch={handleSearch}
                    className="w-full md:w-72"
                  />
                  <Select
                    placeholder="Filter by status"
                    className="w-full md:w-48"
                    value={statusFilter}
                    onChange={handleFilter}
                    allowClear
                  >
                    <Option value="Ongoing">Ongoing</Option>
                    <Option value="Pending">Pending</Option>
                    <Option value="Completed">Completed</Option>
                  </Select>
                </div>

                <AnimatePresence>
                  {paginatedData.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className="mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {project.name}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <FaCalendarAlt className="text-teal-500" />
                                <span>Deadline: {project.deadline}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaDollarSign className="text-teal-500" />
                                <span>Budget: ${project.budget}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaUserCircle className="text-teal-500" />
                                <span>Total Bids: {project.totalBids}</span>
                              </div>
                            </div>
                          </div>
                          <Tag 
                            color={getStatusColor(project.status).color}
                            className={`${getStatusColor(project.status).bg} ${getStatusColor(project.status).text} border-0 font-medium`}
                          >
                            {project.status}
                          </Tag>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4">
                          <Button
                            type="default"
                            icon={<FaEye />}
                            onClick={() => setSelectedProject(project)}
                            className="flex items-center gap-2"
                          >
                            Preview Bids
                          </Button>
                          <Button
                            type="primary"
                            className="bg-teal-500 hover:bg-teal-600 flex items-center gap-2"
                            onClick={() => navigate(`/client/view-bids/posted-project/${project.id}`, { state: { project } })}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="mt-6 flex justify-end">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredProjects.length}
                    onChange={page => setCurrentPage(page)}
                    className="text-center"
                  />
                </div>
              </Card>

              <Modal
                title={
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <FaCheckCircle className="text-teal-500 text-xl" />
                    <span className="text-xl font-semibold">Project Bids</span>
                  </div>
                }
                open={!!selectedProject}
                onCancel={() => setSelectedProject(null)}
                footer={null}
                width={800}
                className="custom-modal"
              >
                {selectedProject && (
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedProject.name}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaCalendarAlt className="text-teal-500" />
                          <span>Deadline: {selectedProject.deadline}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaDollarSign className="text-teal-500" />
                          <span>Budget: ${selectedProject.budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCheckCircle className="text-teal-500" />
                          <span>Status: </span>
                          <Tag color={getStatusColor(selectedProject.status).color}>
                            {selectedProject.status}
                          </Tag>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-4">Submitted Bids</h4>
                        <div className="space-y-4">
                          {selectedProject.bids.map((bid, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                  <img
                                    src={bid.avatar}
                                    alt={bid.freelancer}
                                    className="w-12 h-12 rounded-full"
                                  />
                                  <div>
                                    <h5 className="font-semibold">{bid.freelancer}</h5>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <span>⭐ {bid.rating}</span>
                                      <span>•</span>
                                      <span>{bid.completedProjects} projects completed</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-teal-600">${bid.price}</div>
                                  <div className="text-sm text-gray-600">{bid.days} days</div>
                                </div>
                              </div>
                              <p className="mt-3 text-gray-600">{bid.description}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Modal>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-modal .ant-modal-content {
          border-radius: 1rem;
          overflow: hidden;
        }
        .custom-modal .ant-modal-header {
          border-bottom: none;
        }
        .custom-modal .ant-modal-body {
          padding: 24px;
        }
      `}</style>
    </div>
  );
};

export default ViewBids;