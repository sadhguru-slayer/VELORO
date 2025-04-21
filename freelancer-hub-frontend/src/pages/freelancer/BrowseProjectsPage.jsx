import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import { Link } from 'react-router-dom';
import { SearchOutlined, FilterOutlined, StarFilled, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Tabs, Select, Tag, Button, Input, Card, Avatar } from 'antd';
import { useMediaQuery } from 'react-responsive';
import './BrowseProjectsPage.css';

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
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'ml-0 pb-16' : 'ml-14'}`}>
        <FHeader />
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 overflow-auto px-4 sm:px-6 py-6"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600
                opacity-95">
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-[30rem] h-[30rem] bg-white/20 rounded-full 
                    filter blur-3xl mix-blend-overlay -translate-x-1/2 -translate-y-1/2 animate-float-slow">
                  </div>
                </div>
              </div>

              {/* Search Content */}
              <div className="relative px-8 py-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-3xl mx-auto text-center space-y-6"
                >
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Find Your Next Project
                  </h1>
                  <p className="text-indigo-100 text-lg mb-8">
                    Browse through thousands of projects that match your skills and interests
                  </p>

                  {/* Enhanced Search Box */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl p-2
                    border border-white/20 shadow-lg">
                    <input
                      type="text"
                      placeholder="Search projects..."
                      className="w-full bg-white/90 rounded-lg px-4 py-3 text-gray-800
                        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 
                      text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                      <span>Search</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Filters Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-violet-100/50 p-4 sm:p-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Category Filter */}
                <div className="relative">
                  <select className="w-full appearance-none px-4 py-2.5 rounded-lg bg-gray-50/80
                    border border-violet-100 hover:border-violet-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                    text-gray-600 text-sm transition-all duration-200">
                    <option value="">All Categories</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile Development</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Budget Filter */}
                <div className="relative">
                  <select className="w-full appearance-none px-4 py-2.5 rounded-lg bg-gray-50/80
                    border border-violet-100 hover:border-violet-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                    text-gray-600 text-sm transition-all duration-200">
                    <option value="">Budget Range</option>
                    <option value="0-100">$0 - $100</option>
                    <option value="100-500">$100 - $500</option>
                    <option value="500-1000">$500 - $1000</option>
                    <option value="1000+">$1000+</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Skills Filter */}
                <div className="relative">
                  <select className="w-full appearance-none px-4 py-2.5 rounded-lg bg-gray-50/80
                    border border-violet-100 hover:border-violet-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                    text-gray-600 text-sm transition-all duration-200">
                    <option value="">Required Skills</option>
                    <option value="react">React</option>
                    <option value="node">Node.js</option>
                    <option value="python">Python</option>
                    <option value="design">UI/UX Design</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="relative">
                  <select className="w-full appearance-none px-4 py-2.5 rounded-lg bg-gray-50/80
                    border border-violet-100 hover:border-violet-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                    text-gray-600 text-sm transition-all duration-200">
                    <option value="recent">Most Recent</option>
                    <option value="budget">Highest Budget</option>
                    <option value="relevant">Most Relevant</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Project Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100
                  hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-6">
                  {/* Project Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        E-commerce Website Development
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Posted 2 hours ago
                        </span>
                        <span>•</span>
                        <span>14 proposals</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-sm font-medium">
                      $1000-2000
                    </span>
                  </div>

                  {/* Project Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    Looking for an experienced developer to build a modern e-commerce website
                    with React and Node.js. The website should include user authentication,
                    product management, and payment integration.
                  </p>

                  {/* Skills Required */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['React', 'Node.js', 'MongoDB'].map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full
                        text-sm hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Project Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <span className="text-sm text-gray-600">John Doe</span>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600
                      hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg
                      transition-all duration-200 flex items-center gap-2 text-sm font-medium">
                      Bid Now
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
              {/* Repeat Project Card for more projects */}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-2">
                <button className="p-2 rounded-lg border border-gray-200 text-gray-500
                  hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button key={page}
                    className={`px-4 py-2 rounded-lg ${
                      page === 1
                        ? 'bg-violet-600 text-white'
                        : 'text-gray-500 hover:bg-violet-50 hover:text-violet-600'
                    } transition-colors duration-200`}
                  >
                    {page}
                  </button>
                ))}
                <button className="p-2 rounded-lg border border-gray-200 text-gray-500
                  hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BrowseProjectsPage;
