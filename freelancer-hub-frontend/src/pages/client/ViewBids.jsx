import { useEffect, useState } from 'react';
import CSider from '../../components/client/CSider';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import CHeader from '../../components/client/CHeader';
import IndividualLoadingComponent from '../../components/IndividualLoadingComponent';
import { Modal, Button, Input, Select, Tabs, Pagination, Card } from 'antd';
import { FaEye } from 'react-icons/fa';

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

  useEffect(() => {
    // Mock data
    const mockProjects = [
      { 
        id: 1, 
        name: 'Website Redesign', 
        deadline: '2024-12-31', 
        status: 'Ongoing', 
        client: 'ABC Corp', 
        bids: [
          { freelancer: 'John Doe', price: 1200, days: 15, description: 'Redesign the website with modern UI/UX features.' },
          { freelancer: 'Jane Smith', price: 1000, days: 12, description: 'Revamp the site with a fresh look and feel.' },
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

  const handleFilter = (value) => {
    setStatusFilter(value);
    setFilteredProjects(
      projects.filter(project => 
        project.status.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilteredProjects(
      projects.filter(project => 
        project.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

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

      <div className="bg-gray-100 flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-16 md:ml-16 lg:ml-22">
        <CHeader />
        <div className="flex-1 overflow-auto bg-gray-200 p-3">
          {loading ? (
            <IndividualLoadingComponent />
          ) : (
            
            <Card>
            <h2 className="text-xl font-semibold mb-4">Projects</h2>
              <div className="filters mb-6 flex gap-4">
                <Search
                  placeholder="Search projects"
                  allowClear
                  onSearch={handleSearch}
                  className="w-72"
                />
                <Select
                  placeholder="Filter by status"
                  className="w-48"
                  value={statusFilter}
                  onChange={handleFilter}
                  allowClear
                >
                  <Option value="Ongoing">Ongoing</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Completed">Completed</Option>
                </Select>
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                <table className="w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {columns.map(column => (
                        <th key={column.key} className="p-3 text-left">
                          {column.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map(record => (
                      <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3">{record.name}</td>
                        <td className="p-3">{record.deadline}</td>
                        <td className="p-3">{record.status}</td>
                        <td className="p-3">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="block md:hidden">
                {paginatedData.map((record, index) => (
                  <div key={record.id} className="mb-4 border border-gray-200 rounded-md">
                    <button
                      onClick={() => toggleDropdown(index)}
                      className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-md flex justify-between items-center"
                    >
                      <span>{record.name}</span>
                      
                    </button>
                    {openDropdown === index && (
                      <div className="p-3 bg-white space-y-2">
                        <p><strong>Deadline:</strong> {record.deadline}</p>
                        <p><strong>Status:</strong> {record.status}</p>
                        <div className="flex gap-2 mt-2 justify-center flex-wrap">
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
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredProjects.length}
                onChange={page => setCurrentPage(page)}
                className="mt-4 flex justify-end"
              />

              <Modal
                title="Project Details"
                open={!!selectedProject}
                onCancel={() => setSelectedProject(null)}
                footer={[
                  <Button key="close" onClick={() => setSelectedProject(null)}>
                    Close
                  </Button>,
                ]}
                width={800}
              >
                {selectedProject && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">{selectedProject.name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <p><strong>Deadline:</strong> {selectedProject.deadline}</p>
                      <p><strong>Status:</strong> {selectedProject.status}</p>
                      <p><strong>Client:</strong> {selectedProject.client}</p>
                    </div>
                    <Tabs defaultActiveKey="1">
                      <TabPane tab="Bids" key="1">
                        <table className="w-full mt-4">
                          <thead className="bg-gray-100">
                            <tr>
                              {bidColumns.map(column => (
                                <th key={column.key} className="p-2 text-left">
                                  {column.title}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProject.bids.map(bid => (
                              <tr key={bid.freelancer} className="border-b">
                                <td className="p-2">{bid.freelancer}</td>
                                <td className="p-2">{bid.price}</td>
                                <td className="p-2">{bid.days}</td>
                                <td className="p-2">{bid.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </TabPane>
                    </Tabs>
                  </div>
                )}
              </Modal>
            
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewBids;