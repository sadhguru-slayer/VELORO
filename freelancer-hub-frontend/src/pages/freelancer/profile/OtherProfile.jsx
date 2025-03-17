import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, Button, Statistic, Card, Tag, Divider, Progress, Tooltip, Rate } from "antd";
import { FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaBriefcase, FaGraduationCap, FaCode, FaGithub, FaLinkedin, FaGlobe, FaEnvelope, FaUserPlus } from "react-icons/fa";

const OtherProfile = ({ userId, role, isAuthenticated, isEditable }) => {
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  // Dummy data for the freelancer profile
  const freelancerData = {
    id: userId,
    name: "Sarah Miller",
    title: "UI/UX Designer & Frontend Developer",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    verified: true,
    location: "New York, NY",
    joinDate: "March 2021",
    bio: "Creative UI/UX designer with a strong background in frontend development. I specialize in creating intuitive, accessible, and visually appealing interfaces that enhance user experience.",
    hourlyRate: 55,
    skills: [
      { name: "UI Design", level: 98 },
      { name: "UX Research", level: 90 },
      { name: "Figma", level: 95 },
      { name: "React", level: 85 },
      { name: "CSS/SASS", level: 92 },
    ],
    languages: [
      { name: "English", level: "Native" },
      { name: "German", level: "Conversational" },
    ],
    education: [
      {
        degree: "M.A. Interactive Design",
        institution: "Parsons School of Design",
        year: "2018-2020",
      },
      {
        degree: "B.A. Visual Communication",
        institution: "Rhode Island School of Design",
        year: "2014-2018",
      },
    ],
    experience: [
      {
        position: "Senior UI/UX Designer",
        company: "Creative Solutions Agency",
        duration: "2020-Present",
        description: "Lead designer for enterprise clients, focusing on user research, wireframing, and high-fidelity prototypes.",
      },
      {
        position: "UI Designer",
        company: "Digital Innovations",
        duration: "2018-2020",
        description: "Designed user interfaces for mobile applications and responsive websites.",
      },
    ],
    portfolio: [
      {
        title: "Finance App Redesign",
        description: "Complete UX overhaul of a personal finance application",
        image: "https://via.placeholder.com/300",
        link: "#",
      },
      {
        title: "E-learning Platform",
        description: "UI design and frontend implementation for an educational platform",
        image: "https://via.placeholder.com/300",
        link: "#",
      },
      {
        title: "Healthcare Dashboard",
        description: "Accessible dashboard design for healthcare professionals",
        image: "https://via.placeholder.com/300",
        link: "#",
      },
    ],
    socialLinks: {
      github: "https://github.com/sarahmiller",
      linkedin: "https://linkedin.com/in/sarahmiller",
      website: "https://sarahmiller.design",
    },
    stats: {
      completedProjects: 47,
      ongoingProjects: 2,
      clientSatisfaction: 99,
      onTimeDelivery: 97,
    },
    ratings: {
      average: 4.9,
      count: 38,
    },
  };

  useEffect(() => {
    // In a real app, you would fetch the freelancer data here
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [userId]);

  const handleConnect = () => {
    if (isPending) {
      // Cancel connection request
      setIsPending(false);
    } else if (isConnected) {
      // Disconnect
      setIsConnected(false);
    } else {
      // Send connection request
      setIsPending(true);
    }
  };

  const getConnectButtonText = () => {
    if (isPending) return "Cancel Request";
    if (isConnected) return "Connected";
    return "Connect";
  };

  const getConnectButtonIcon = () => {
    if (isPending || isConnected) return null;
    return <FaUserPlus className="mr-2" />;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
          <div className="h-40 bg-gradient-to-r from-violet-500 to-indigo-600 relative"></div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4">
              <Avatar 
                src={freelancerData.avatar} 
                size={120} 
                className="border-4 border-white shadow-lg"
              />
              
              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold flex items-center">
                      {freelancerData.name}
                      {freelancerData.verified && (
                        <Tooltip title="Verified Freelancer">
                          <FaCheckCircle className="ml-2 text-violet-500" />
                        </Tooltip>
                      )}
                    </h1>
                    <p className="text-gray-600">{freelancerData.title}</p>
                    
                    <div className="flex items-center mt-1 text-gray-500 text-sm">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{freelancerData.location}</span>
                      <span className="mx-2">•</span>
                      <FaCalendarAlt className="mr-1" />
                      <span>Joined {freelancerData.joinDate}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex space-x-2">
                    <Button 
                      type="primary"
                      icon={<FaEnvelope className="mr-2" />}
                      className="bg-indigo-600 hover:bg-indigo-700 border-none"
                      onClick={() => {}}
                    >
                      Message
                    </Button>
                    
                    <Button 
                      type={isPending || isConnected ? "default" : "primary"}
                      icon={getConnectButtonIcon()}
                      className={`${
                        isPending 
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300" 
                          : isConnected 
                            ? "bg-violet-100 text-violet-600 hover:bg-violet-200 border-violet-300" 
                            : "bg-violet-600 hover:bg-violet-700 text-white border-none"
                      }`}
                      onClick={handleConnect}
                    >
                      {getConnectButtonText()}
                    </Button>
                  </div>
                </div>
                
                <div className="flex mt-4 space-x-2">
                  <Tag color="purple" className="px-3 py-1">
                    ${freelancerData.hourlyRate}/hr
                  </Tag>
                  <Tag color="blue" className="px-3 py-1 flex items-center">
                    <Rate disabled defaultValue={freelancerData.ratings.average} count={5} className="text-xs mr-1" />
                    {freelancerData.ratings.average} ({freelancerData.ratings.count} reviews)
                  </Tag>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mt-4">{freelancerData.bio}</p>
            
            <div className="flex mt-4 space-x-3">
              <Tooltip title="GitHub Profile">
                <a href={freelancerData.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-violet-600">
                  <FaGithub size={20} />
                </a>
              </Tooltip>
              <Tooltip title="LinkedIn Profile">
                <a href={freelancerData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-violet-600">
                  <FaLinkedin size={20} />
                </a>
              </Tooltip>
              <Tooltip title="Personal Website">
                <a href={freelancerData.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-violet-600">
                  <FaGlobe size={20} />
                </a>
              </Tooltip>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-sm">
            <Statistic 
              title="Completed Projects" 
              value={freelancerData.stats.completedProjects} 
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
          <Card className="shadow-sm">
            <Statistic 
              title="Ongoing Projects" 
              value={freelancerData.stats.ongoingProjects} 
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
          <Card className="shadow-sm">
            <Statistic 
              title="Client Satisfaction" 
              value={freelancerData.stats.clientSatisfaction} 
              suffix="%" 
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
          <Card className="shadow-sm">
            <Statistic 
              title="On-Time Delivery" 
              value={freelancerData.stats.onTimeDelivery} 
              suffix="%" 
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </div>
        
        {/* Skills & Experience */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Skills */}
          <div className="lg:col-span-1">
            <Card title="Skills" className="shadow-sm h-full">
              {freelancerData.skills.map((skill, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{skill.name}</span>
                    <span className="text-violet-600">{skill.level}%</span>
                  </div>
                  <Progress 
                    percent={skill.level} 
                    showInfo={false} 
                    strokeColor="#7c3aed" 
                    trailColor="#e5e7eb"
                  />
                </div>
              ))}
              
              <Divider />
              
              <h3 className="text-lg font-medium mb-3">Languages</h3>
              {freelancerData.languages.map((language, index) => (
                <div key={index} className="flex justify-between mb-2">
                  <span className="text-gray-700">{language.name}</span>
                  <Tag color="purple">{language.level}</Tag>
                </div>
              ))}
            </Card>
          </div>
          
          {/* Experience & Education */}
          <div className="lg:col-span-2">
            <Card title="Experience" className="shadow-sm mb-6">
              {freelancerData.experience.map((exp, index) => (
                <div key={index} className={index !== 0 ? "mt-6" : ""}>
                  <div className="flex items-start">
                    <FaBriefcase className="text-violet-500 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-800">{exp.position}</h3>
                      <p className="text-gray-600">{exp.company} • {exp.duration}</p>
                      <p className="mt-1 text-gray-700">{exp.description}</p>
                    </div>
                  </div>
                  {index !== freelancerData.experience.length - 1 && <Divider />}
                </div>
              ))}
            </Card>
            
            <Card title="Education" className="shadow-sm">
              {freelancerData.education.map((edu, index) => (
                <div key={index} className={index !== 0 ? "mt-6" : ""}>
                  <div className="flex items-start">
                    <FaGraduationCap className="text-violet-500 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-800">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution} • {edu.year}</p>
                    </div>
                  </div>
                  {index !== freelancerData.education.length - 1 && <Divider />}
                </div>
              ))}
            </Card>
          </div>
        </div>
        
        {/* Portfolio */}
        <Card title="Portfolio Highlights" className="shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancerData.portfolio.map((item, index) => (
              <div key={index} className="group">
                <div className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-violet-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 w-full">
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-white font-medium hover:underline"
                        >
                          View Project
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Hire Me Section */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl shadow-md p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Interested in working with {freelancerData.name.split(' ')[0]}?</h2>
              <p className="text-violet-100 mb-4 md:mb-0">Get in touch to discuss your project requirements and availability.</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                size="large"
                className="bg-white text-violet-600 hover:bg-violet-50 border-none"
                onClick={() => {}}
              >
                Hire Me
              </Button>
              <Button 
                size="large"
                className="bg-transparent text-white hover:bg-white/10 border-white"
                onClick={() => {}}
              >
                View More Work
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OtherProfile; 