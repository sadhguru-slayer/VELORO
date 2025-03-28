import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Card, Button, Row, Col, Avatar, Input, Select, Tag, message, Divider, Tabs, Badge, Tooltip, Skeleton, Empty, Checkbox } from 'antd';
import { SearchOutlined, StarOutlined, DollarOutlined, FireOutlined, TeamOutlined, HistoryOutlined, BulbOutlined, ThunderboltOutlined, RiseOutlined, HeartOutlined, BookOutlined, ExperimentOutlined, RocketOutlined } from '@ant-design/icons';
import CHeader from "../../components/client/CHeader";
import CSider from "../../components/client/CSider";
import { useMediaQuery } from 'react-responsive';
import { FaStar, FaRegStar, FaStarHalfAlt, FaBrain, FaRobot, FaGraduationCap } from "react-icons/fa";

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// Dummy data for freelancers
const dummyFreelancers = [
  {
    id: 1,
    name: "Priya Sharma",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    specialization: "Full Stack Developer",
    rating: 4.9,
    hourly_rate: 35,
    skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
    completed_projects: 47,
    success_rate: 98,
    response_time: "1 hour",
    previously_worked: true,
    top_rated: true,
    isTalentRise: false
  },
  {
    id: 2,
    name: "Rahul Kapoor",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    specialization: "UI/UX Designer",
    rating: 4.7,
    hourly_rate: 30,
    skills: ["Figma", "Adobe XD", "Sketch", "User Research", "Wireframing"],
    completed_projects: 31,
    success_rate: 95,
    response_time: "2 hours",
    previously_worked: false,
    top_rated: true,
    isTalentRise: false
  },
  {
    id: 3,
    name: "Anika Patel",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    specialization: "Mobile App Developer",
    rating: 4.8,
    hourly_rate: 40,
    skills: ["Flutter", "React Native", "Firebase", "Swift", "Kotlin"],
    completed_projects: 23,
    success_rate: 100,
    response_time: "30 minutes",
    previously_worked: true,
    top_rated: false,
    isTalentRise: false
  },
  {
    id: 4,
    name: "Vikram Singh",
    avatar: "https://randomuser.me/api/portraits/men/91.jpg",
    specialization: "DevOps Engineer",
    rating: 4.6,
    hourly_rate: 45,
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform"],
    completed_projects: 18,
    success_rate: 94,
    response_time: "3 hours",
    previously_worked: false,
    top_rated: false,
    isTalentRise: false
  },
  {
    id: 5,
    name: "Meera Desai",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    specialization: "Blockchain Developer",
    rating: 4.9,
    hourly_rate: 55,
    skills: ["Solidity", "Web3.js", "Ethereum", "Smart Contracts", "DApps"],
    completed_projects: 12,
    success_rate: 100,
    response_time: "1 hour",
    previously_worked: false,
    top_rated: true,
    isTalentRise: false
  },
  {
    id: 6,
    name: "Arjun Mehta",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    specialization: "Data Scientist",
    rating: 4.8,
    hourly_rate: 50,
    skills: ["Python", "TensorFlow", "Pandas", "Data Visualization", "Machine Learning"],
    completed_projects: 27,
    success_rate: 96,
    response_time: "2 hours",
    previously_worked: true,
    top_rated: true,
    isTalentRise: false
  },
  {
    id: 7,
    name: "Zara Khan",
    avatar: "https://randomuser.me/api/portraits/women/57.jpg",
    specialization: "Content Writer",
    rating: 4.5,
    hourly_rate: 25,
    skills: ["SEO Writing", "Blog Posts", "Technical Writing", "Copywriting", "Editing"],
    completed_projects: 52,
    success_rate: 92,
    response_time: "45 minutes",
    previously_worked: false,
    top_rated: false,
    isTalentRise: false
  },
  {
    id: 8,
    name: "Rohan Joshi",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    specialization: "Graphic Designer",
    rating: 4.7,
    hourly_rate: 35,
    skills: ["Adobe Photoshop", "Illustrator", "Branding", "Logo Design", "Print Design"],
    completed_projects: 38,
    success_rate: 97,
    response_time: "1 hour",
    previously_worked: true,
    top_rated: true,
    isTalentRise: false
  },
  // TalentRise Student Freelancers
  {
    id: 9,
    name: "Aarav Gupta",
    avatar: "https://randomuser.me/api/portraits/men/25.jpg",
    specialization: "Computer Science Student",
    rating: 4.3,
    hourly_rate: 18,
    skills: ["Python", "Java", "Web Development", "Algorithms"],
    completed_projects: 5,
    success_rate: 92,
    response_time: "4 hours",
    previously_worked: false,
    top_rated: false,
    isTalentRise: true,
    university: "Indian Institute of Technology Delhi",
    availableHours: "15-20",
    academicProjects: [
      "AI-based Attendance System",
      "E-commerce Platform Prototype"
    ]
  },
  {
    id: 10,
    name: "Neha Sharma",
    avatar: "https://randomuser.me/api/portraits/women/30.jpg",
    specialization: "Design Student",
    rating: 4.5,
    hourly_rate: 20,
    skills: ["Figma", "UI/UX", "Adobe XD", "Wireframing"],
    completed_projects: 8,
    success_rate: 95,
    response_time: "3 hours",
    previously_worked: true,
    top_rated: false,
    isTalentRise: true,
    university: "National Institute of Design",
    availableHours: "10-15",
    academicProjects: [
      "Mobile App Design for Campus Events",
      "Accessibility-focused UI Kit"
    ]
  },
  {
    id: 11,
    name: "Rohan Mehta",
    avatar: "https://randomuser.me/api/portraits/men/35.jpg",
    specialization: "Engineering Student",
    rating: 4.2,
    hourly_rate: 15,
    skills: ["CAD", "3D Modeling", "Python", "Technical Writing"],
    completed_projects: 3,
    success_rate: 88,
    response_time: "6 hours",
    previously_worked: false,
    top_rated: false,
    isTalentRise: true,
    university: "Delhi Technological University",
    availableHours: "12-18",
    academicProjects: [
      "Smart Irrigation System Design",
      "CAD Modeling for Mechanical Parts"
    ]
  },
  {
    id: 12,
    name: "Priya Joshi",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    specialization: "Marketing Student",
    rating: 4.4,
    hourly_rate: 16,
    skills: ["Social Media", "Content Writing", "SEO", "Canva"],
    completed_projects: 6,
    success_rate: 90,
    response_time: "5 hours",
    previously_worked: true,
    top_rated: false,
    isTalentRise: true,
    university: "Symbiosis Institute of Media Studies",
    availableHours: "8-12",
    academicProjects: [
      "Social Media Campaign for NGO",
      "Market Research Analysis"
    ]
  }
];

// Dummy project for recommendations
const dummyProjects = [
  {
    id: 101,
    title: "E-commerce Website Development",
    skills: ["React", "Node.js", "MongoDB", "Payment Integration"]
  },
  {
    id: 102,
    title: "Mobile App Design",
    skills: ["UI/UX", "Figma", "Adobe XD", "App Design"]
  }
];

const FindTalent = ({ userId, role }) => {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState(dummyFreelancers);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    skills: [],
    minRating: 0,
    maxRate: null,
    category: 'all',
    freelancerType: 'all'
  });
  const [isStudentFriendly, setIsStudentFriendly] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Simulate loading effect
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setFreelancers(dummyFreelancers);
      setLoading(false);
      
      // Simulate AI suggestions loading
      setTimeout(() => {
        setAiSuggestions(
          dummyFreelancers
            .filter(f => f.skills.some(s => dummyProjects[0].skills.includes(s)))
            .slice(0, 3)
        );
      }, 1500);
    }, 1000);
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (!value) {
      setFreelancers(dummyFreelancers);
      return;
    }
    
    const filtered = dummyFreelancers.filter(freelancer => 
      freelancer.name.toLowerCase().includes(value.toLowerCase()) ||
      freelancer.specialization.toLowerCase().includes(value.toLowerCase()) ||
      freelancer.skills.some(skill => skill.toLowerCase().includes(value.toLowerCase()))
    );
    
    setFreelancers(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    
    let filtered = [...dummyFreelancers];
    
    // Apply search filter first
    if (searchQuery) {
      filtered = filtered.filter(freelancer => 
        freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        freelancer.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        freelancer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply skills filter
    if (name === 'skills' && value.length > 0) {
      filtered = filtered.filter(freelancer => 
        freelancer.skills.some(skill => value.includes(skill))
      );
    }
    
    // Apply rating filter
    if (name === 'minRating') {
      filtered = filtered.filter(freelancer => freelancer.rating >= value);
    }
    
    // Apply rate filter
    if (name === 'maxRate' && value) {
      filtered = filtered.filter(freelancer => freelancer.hourly_rate <= value);
    }
    
    // Apply student filter
    if (name === 'freelancerType' && value) {
      filtered = filtered.filter(freelancer => value === 'talentrise' ? freelancer.isTalentRise : true);
    }
    
    setFreelancers(filtered);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    let filtered = [...dummyFreelancers];
    
    switch(key) {
      case 'previous':
        filtered = filtered.filter(f => f.previously_worked);
        break;
      case 'top':
        filtered = filtered.filter(f => f.top_rated);
        break;
      case 'suggested':
        filtered = aiSuggestions;
        break;
      case 'talentrise':
        filtered = filtered.filter(f => f.isTalentRise);
        break;
      default:
        // 'all' tab - no filtering needed
        break;
    }
    
    setFreelancers(filtered);
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= Math.floor(rating)) {
          return <FaStar key={star} className="text-yellow-400" />;
        } else if (star - 0.5 <= rating) {
          return <FaStarHalfAlt key={star} className="text-yellow-400" />;
        }
        return <FaRegStar key={star} className="text-yellow-400" />;
      })}
    </div>
  );

  const renderFreelancerCard = (freelancer) => (
    <Col xs={24} sm={12} lg={8} xl={6} key={freelancer.id}>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Card
          hoverable
          className="h-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          cover={
            <div className="relative h-32 bg-gradient-to-r from-teal-500 to-blue-500 overflow-hidden">
              <div className="absolute inset-0 bg-opacity-20 bg-black"></div>
              {freelancer.isTalentRise && (
                <Badge.Ribbon text="TalentRise" color="cyan" className="z-10" />
              )}
              {freelancer.top_rated && (
                <Badge.Ribbon text="Top Rated" color="gold" className="z-10" />
              )}
            </div>
          }
          bodyStyle={{ padding: '16px' }}
        >
          <div className="flex flex-col items-center text-center -mt-14 mb-3">
            <Avatar 
              size={80}
              src={freelancer.avatar}
              className="border-4 border-white shadow-md"
            />
            <h3 className="font-bold text-gray-900 mt-2">{freelancer.name}</h3>
            <p className="text-sm text-gray-500">
              {freelancer.specialization}
              {freelancer.isTalentRise && (
                <span className="ml-2 inline-flex items-center text-cyan-500">
                  <RiseOutlined className="mr-1" /> TalentRise
                </span>
              )}
            </p>
            
            <div className="flex items-center gap-1 mt-1">
              {renderStars(freelancer.rating)} 
              <span className="font-medium text-yellow-500 ml-1">
                {freelancer.rating}
              </span>
            </div>
            
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {freelancer.skills.slice(0, 3).map((skill, idx) => (
                <Tag key={idx} color="blue" className="text-xs m-1">{skill}</Tag>
              ))}
              {freelancer.skills.length > 3 && (
                <Tooltip title={freelancer.skills.slice(3).join(', ')}>
                  <Tag color="default" className="text-xs m-1">+{freelancer.skills.length - 3} more</Tag>
                </Tooltip>
              )}
            </div>
          </div>
          
          {freelancer.isTalentRise && (
            <div className="mt-2 mb-3 px-3 py-2 bg-cyan-50 rounded-lg text-xs">
              <div className="flex items-center gap-1 text-cyan-600">
                <FaGraduationCap /> {freelancer.university}
              </div>
              <div className="flex items-center gap-1 text-cyan-600 mt-1">
                <ExperimentOutlined /> Available: {freelancer.availableHours} hrs/week
              </div>
            </div>
          )}
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div className="flex items-center">
              <ThunderboltOutlined className="mr-1 text-teal-500" /> 
              {freelancer.response_time}
            </div>
            <div className="flex items-center">
              <RiseOutlined className="mr-1 text-teal-500" /> 
              {freelancer.success_rate}% Success
            </div>
            <div className="flex items-center">
              <TeamOutlined className="mr-1 text-teal-500" /> 
              {freelancer.completed_projects} Projects
            </div>
            <div className="flex items-center font-semibold text-teal-600">
              <DollarOutlined className="mr-1" /> 
              ₹{freelancer.hourly_rate}/hr
            </div>
          </div>
          
          <Button 
            type="primary"
            block
            className="mt-4 bg-gradient-to-r from-teal-500 to-emerald-500 border-0 hover:from-teal-600 hover:to-emerald-600"
            onClick={() => navigate(`/client/profile/${freelancer.id}`)}
          >
            View Profile
          </Button>
        </Card>
      </motion.div>
    </Col>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <CSider userId={userId} role={role} dropdown={true} collapsed={isMobile} />
      
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'ml-0 pb-16' : 'ml-14'}`}>
        <CHeader userId={userId} />
        <div className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
          {/* AI Assistant - Velo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 relative overflow-hidden"
          >
            <div className="rounded-2xl p-6 bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 text-white shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <FaRobot className="text-2xl" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-xl mb-1 flex items-center">
                    Velo <span className="text-xs ml-2 bg-white/20 px-2 py-0.5 rounded-full">AI Assistant</span>
                  </h2>
                  <p className="mb-4 text-white/90">
                    Based on your recent project "{dummyProjects[0].title}", I've found some perfect matches. 
                    These freelancers have the exact skills you need!
                  </p>
                  
                  <div className="flex flex-wrap gap-3 my-3">
                    {aiSuggestions.length === 0 ? (
                      <div className="flex gap-3 w-full">
                        <Skeleton.Avatar active size={48} />
                        <Skeleton active paragraph={{ rows: 1 }} />
                      </div>
                    ) : (
                      aiSuggestions.map(suggestion => (
                        <div 
                          key={suggestion.id}
                          onClick={() => navigate(`/client/profile/${suggestion.id}`)}
                          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2 pl-1 pr-3 rounded-full cursor-pointer hover:bg-white/20 transition-all duration-200"
                        >
                          <Avatar src={suggestion.avatar} size={32} />
                          <span>{suggestion.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="default" 
                      ghost
                      icon={<BulbOutlined />}
                      className="border-white/30 hover:border-white text-white hover:text-white hover:bg-white/10"
                    >
                      More AI Suggestions
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-transparent to-transparent pointer-events-none opacity-20">
              <div className="h-full w-full bg-grid-pattern"></div>
            </div>
          </motion.div>

          {/* Search and Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <Search
                placeholder="Search by name, skills, or specialization..."
                allowClear
                enterButton={<Button icon={<SearchOutlined />}>Search</Button>}
                size="large"
                onSearch={handleSearch}
                className="flex-1"
              />
              
              <div className="flex flex-wrap gap-2">
                <Select
                  mode="multiple"
                  placeholder="Skills"
                  style={{ minWidth: 180 }}
                  onChange={(value) => handleFilterChange('skills', value)}
                >
                  {["React", "Node.js", "UI/UX", "Figma", "Flutter", "Python", "Docker", "AWS", 
                    "TypeScript", "Swift", "Blockchain", "Machine Learning"].map(skill => (
                    <Option key={skill} value={skill}>{skill}</Option>
                  ))}
                </Select>
                
                <Select
                  placeholder="Min Rating"
                  style={{ width: 120 }}
                  onChange={(value) => handleFilterChange('minRating', value)}
                >
                  <Option value={0}>Any Rating</Option>
                  <Option value={3}>3+</Option>
                  <Option value={4}>4+</Option>
                  <Option value={4.5}>4.5+</Option>
                </Select>
                
                <Select
                  placeholder="Budget"
                  style={{ width: 130 }}
                  onChange={(value) => handleFilterChange('maxRate', value)}
                >
                  <Option value={0}>Any Budget</Option>
                  <Option value={25}>Under ₹25/hr</Option>
                  <Option value={40}>Under ₹40/hr</Option>
                  <Option value={60}>Under ₹60/hr</Option>
                </Select>
                
                <Select
                  placeholder="Freelancer Type"
                  style={{ width: 150 }}
                  onChange={(value) => handleFilterChange('freelancerType', value)}
                >
                  <Option value="all">All Freelancers</Option>
                  <Option value="professional">Professional</Option>
                  <Option value="talentrise">TalentRise</Option>
                </Select>
                
                <Select
                  placeholder="Project Complexity"
                  style={{ width: 150 }}
                  onChange={(value) => handleFilterChange('complexity', value)}
                >
                  <Option value="all">Any Complexity</Option>
                  <Option value="entry">Entry-Level</Option>
                  <Option value="intermediate">Intermediate</Option>
                  <Option value="advanced">Advanced</Option>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Tabs for different views */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs 
              activeKey={activeTab} 
              onChange={handleTabChange}
              className="talent-tabs"
            >
              <TabPane 
                tab={<span><TeamOutlined /> All Talent</span>} 
                key="all"
              >
                {loading ? (
                  <Row gutter={[16, 16]}>
                    {[1, 2, 3, 4].map(n => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={n}>
                        <Card className="h-full" loading={true}></Card>
                      </Col>
                    ))}
                  </Row>
                ) : freelancers.length === 0 ? (
                  <Empty description="No freelancers match your criteria" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {freelancers.map(renderFreelancerCard)}
                  </Row>
                )}
              </TabPane>
              
              <TabPane 
                tab={<span><HistoryOutlined /> Previously Worked</span>} 
                key="previous"
              >
                {loading ? (
                  <Row gutter={[16, 16]}>
                    {[1, 2].map(n => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={n}>
                        <Card className="h-full" loading={true}></Card>
                      </Col>
                    ))}
                  </Row>
                ) : freelancers.length === 0 ? (
                  <Empty description="You haven't worked with any freelancers yet" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {freelancers.map(renderFreelancerCard)}
                  </Row>
                )}
              </TabPane>
              
              <TabPane 
                tab={<span><StarOutlined /> Top Rated</span>} 
                key="top"
              >
                {loading ? (
                  <Row gutter={[16, 16]}>
                    {[1, 2, 3].map(n => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={n}>
                        <Card className="h-full" loading={true}></Card>
                      </Col>
                    ))}
                  </Row>
                ) : freelancers.length === 0 ? (
                  <Empty description="No top rated freelancers found" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {freelancers.map(renderFreelancerCard)}
                  </Row>
                )}
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <BulbOutlined /> AI Suggested
                    <Badge count="Velo" style={{ backgroundColor: '#14b8a6', marginLeft: '8px' }} />
                  </span>
                } 
                key="suggested"
              >
                {aiSuggestions.length === 0 ? (
                  <div className="text-center py-10">
                    <Skeleton active paragraph={{ rows: 0 }} avatar={{ size: 64 }} />
                    <p className="text-gray-400 mt-4">Velo is analyzing your projects to find the perfect matches...</p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-teal-50 p-4 mb-6 rounded-lg border border-teal-100 text-teal-800">
                      <div className="flex items-center gap-3">
                        <FaBrain className="text-teal-500 text-lg" />
                        <div>
                          <p className="font-medium">Velo's AI suggestions for "{dummyProjects[0].title}"</p>
                          <p className="text-sm text-teal-600">These freelancers have skills that perfectly match your project requirements.</p>
                        </div>
                      </div>
                    </div>
                    <Row gutter={[16, 16]}>
                      {freelancers.map(renderFreelancerCard)}
                    </Row>
                  </div>
                )}
              </TabPane>
              
              <TabPane 
                tab={<span><RiseOutlined /> TalentRise</span>} 
                key="talentrise"
              >
                <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-4 mb-6 rounded-lg border border-cyan-100">
                  <div className="flex items-center gap-3">
                    <RocketOutlined className="text-cyan-500 text-lg" />
                    <div>
                      <p className="font-medium">TalentRise: Emerging Freelance Talent</p>
                      <p className="text-sm text-cyan-600">Support rising professionals while getting quality work at budget-friendly rates.</p>
                    </div>
                  </div>
                </div>
                <Row gutter={[16, 16]}>
                  {freelancers.filter(f => f.isTalentRise).map(renderFreelancerCard)}
                </Row>
              </TabPane>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx>{`
        .ant-tabs-nav::before {
          border-bottom: none !important;
        }
        
        .ant-tabs-tab {
          padding: 12px 16px !important;
          margin: 0 8px 0 0 !important;
          transition: all 0.3s ease;
          border-radius: 8px 8px 0 0 !important;
        }
        
        .ant-tabs-tab-active {
          background-color: white !important;
          border-top: 3px solid #14b8a6 !important;
        }
        
        .talent-tabs .ant-tabs-nav {
          margin-bottom: 16px;
        }
        
        .bg-grid-pattern {
          background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default FindTalent; 