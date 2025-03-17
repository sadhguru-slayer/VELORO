import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import { Link } from 'react-router-dom';
import { SearchOutlined, FilterOutlined, StarFilled, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Tabs, Select, Tag, Button, Input, Card, Avatar } from 'antd';
import { useMediaQuery } from 'react-responsive';

const { TabPane } = Tabs;
const { Search } = Input;

const allProjects = [
  {
    id: 1,
    title: 'Build a Website',
    payment: '500-1000',
    duration: '1-2 weeks',
    collaboration: 'Solo',
    description: 'Build a responsive portfolio website for a client.',
    client: {
      name: 'John Doe',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    rating: 4.8,
    reviews: 12,
  },
  {
    id: 2,
    title: 'Design a Logo',
    payment: '100-300',
    duration: '3-5 days',
    collaboration: 'Solo',
    description: 'Design a creative logo for a startup business.',
    client: {
      name: 'Jane Smith',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    rating: 4.5,
    reviews: 8,
  },
  {
    id: 3,
    title: 'App Development',
    payment: '2000-5000',
    duration: '1 month',
    collaboration: 'Team',
    description: 'Develop a mobile app for a client in the e-commerce space.',
    client: {
      name: 'Michael Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
    rating: 4.9,
    reviews: 15,
  },
  {
    id: 4,
    title: 'Social Media Marketing',
    payment: '300-800',
    duration: '1 month',
    collaboration: 'Team',
    description: 'Create a social media marketing strategy for a brand.',
    client: {
      name: 'Emily Davis',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    },
    rating: 4.7,
    reviews: 10,
  },
];

const BrowseProjectsPage = ({ userId, role, isAuthenticated, isEditable }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    payment: '',
    duration: '',
    collaboration: '',
    domains: [],
    skills: [],
    rating: null,
    projectStatus: 'all',
  });

  const domainsList = ['Web Development', 'Mobile Apps', 'Graphic Design', 'Digital Marketing', 'Content Writing'];
  const skillsList = ['React', 'Node.js', 'UI/UX', 'SEO', 'Copywriting', 'Project Management'];
  
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters = (
      (!filters.payment || project.payment.includes(filters.payment)) &&
      (!filters.duration || project.duration.includes(filters.duration)) &&
      (!filters.collaboration || project.collaboration === filters.collaboration) &&
      (filters.domains.length === 0 || filters.domains.some(domain => project.domains?.includes(domain))) &&
      (filters.skills.length === 0 || filters.skills.some(skill => project.requiredSkills?.includes(skill)))
    );
    return matchesSearch && matchesFilters;
  });

  const handleMenuClick = (component) => {
    if (location.pathname !== "/freelancer/dashboard") {
      navigate("/freelancer/dashboard", { state: { component } });
    }
  };
  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== "/freelancer/profile") {
      navigate("/freelancer/profile", { state: { profileComponent } });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
    <FSider 
    userId={userId}
    role={role}
    isAuthenticated={isAuthenticated}
    isEditable={isEditable}
    dropdown={true} 
    collapsed={true}
  />      
      <div className={`flex-1 flex flex-col overflow-x-hidden ${
        isMobile ? 'ml-0 pb-16' : 'ml-14 sm:ml-14 md:ml-14 lg:ml-14'
      }`}><FHeader />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-auto p-6"
        >
          <div className="max-w-7xl mx-auto">
            {/* Search Header */}
            <div className="bg-gradient-to-r from-violet-50 to-violet-100 p-6 rounded-2xl shadow-lg mb-8">
              <h1 className="text-3xl font-extrabold text-violet-900 mb-4">
                Find Your Next Opportunity
              </h1>
              
              <div className="flex gap-4 mb-6">
                <Search
                  placeholder="Search projects, clients, skills..."
                  enterButton={
                    <Button 
                      className="bg-violet-600 hover:bg-violet-700 h-10 px-6 rounded-xl text-white border-0"
                      icon={<SearchOutlined className="text-white" />}
                    >
                      Search
                    </Button>
                  }
                  size="large"
                  onSearch={handleSearch}
                  className="flex-1 rounded-xl [&_.ant-input]:border-violet-200 [&_.ant-input]:focus:ring-violet-300"
                />
              </div>

              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                className="border-b-0"
                tabBarStyle={{ 
                  marginBottom: 0,
                  color: '#6D28D9', // Violet-700
                }}
                indicatorColor="#8B5CF6" // Violet-500
              >
                <TabPane 
                  tab={
                    <span className="flex items-center gap-2 text-violet-700 hover:text-violet-900">
                      <i className="ri-briefcase-line" style={{ color: activeTab === 'projects' ? '#6D28D9' : '#4C1D95' }} /> 
                      Projects
                    </span>
                  } 
                  key="projects"
                />
                <TabPane 
                  tab={
                    <span className="flex items-center gap-2 text-violet-700 hover:text-violet-900">
                      <UserOutlined style={{ color: activeTab === 'clients' ? '#6D28D9' : '#4C1D95' }} /> 
                      Clients
                    </span>
                  } 
                  key="clients"
                />
                <TabPane 
                  tab={
                    <span className="flex items-center gap-2 text-violet-700 hover:text-violet-900">
                      <TeamOutlined style={{ color: activeTab === 'connections' ? '#6D28D9' : '#4C1D95' }} /> 
                      Connections
                    </span>
                  } 
                  key="connections"
                />
              </Tabs>
            </div>

            {/* Filters Section */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Select
                  placeholder="Payment Range"
                  options={[
                    { value: '500-1000', label: '$500 - $1000' },
                    { value: '100-300', label: '$100 - $300' },
                    { value: '2000-5000', label: '$2000 - $5000' },
                  ]}
                  onChange={val => handleFilterChange('payment', val)}
                  className="w-full [&_.ant-select-selector]:border-violet-200 [&_.ant-select-selector]:focus:ring-violet-300"
                />
                <Select
                  mode="multiple"
                  placeholder="Required Skills"
                  options={skillsList.map(skill => ({ value: skill, label: skill }))}
                  onChange={val => handleFilterChange('skills', val)}
                  tagRender={props => (
                    <Tag {...props} className="bg-violet-100 text-violet-700 rounded-lg">
                      {props.label}
                    </Tag>
                  )}
                />
                <Select
                  mode="multiple"
                  placeholder="Project Domains"
                  options={domainsList.map(domain => ({ value: domain, label: domain }))}
                  onChange={val => handleFilterChange('domains', val)}
                  className="w-full"
                />
                <Select
                  placeholder="Collaboration Type"
                  options={[
                    { value: 'Solo', label: 'Solo Project' },
                    { value: 'Team', label: 'Team Collaboration' },
                  ]}
                  onChange={val => handleFilterChange('collaboration', val)}
                  className="w-full"
                />
              </div>
            </motion.div>

            {/* Projects Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              {filteredProjects.map(project => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-violet-900">{project.title}</h3>
                      <Tag color={project.collaboration === 'Team' ? 'violet' : 'violet-inverse'} >
                        {project.collaboration}
                      </Tag>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <i className="ri-time-line" />
                        <span>{project.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <i className="ri-money-dollar-circle-line" />
                        <span>{project.payment}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6">{project.description}</p>

                    <div className="flex items-center justify-between">
                      <Button
                        onClick={() => handleViewProject(project)}
                        className="bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg"
                      >
                        View Details
                      </Button>
                      <div className="flex items-center gap-1">
                        <StarFilled className="text-yellow-400" />
                        <span className="text-gray-600">4.8 (12 reviews)</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BrowseProjectsPage;
