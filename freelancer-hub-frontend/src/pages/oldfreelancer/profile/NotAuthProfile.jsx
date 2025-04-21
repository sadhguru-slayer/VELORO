import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Avatar, Button, Statistic, Card, Tag, Divider, Progress, Tooltip, Rate, Alert } from "antd";
import { FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaBriefcase, FaGraduationCap, FaLock, FaGithub, FaLinkedin, FaGlobe, FaSignInAlt } from "react-icons/fa";

const NotAuthProfile = ({ userId, role, isAuthenticated, isEditable }) => {
  const { userId: outletUserId } = useOutletContext() || { userId: null };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Dummy data for the freelancer profile (limited version for non-authenticated users)
  const freelancerData = {
    id: outletUserId,
    name: "Michael Chen",
    title: "Backend Developer & DevOps Specialist",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    verified: true,
    location: "Seattle, WA",
    joinDate: "October 2021",
    bio: "Experienced backend developer specializing in scalable architectures, cloud infrastructure, and DevOps practices. I help businesses build robust and efficient backend systems.",
    skills: [
      { name: "Node.js", level: 92 },
      { name: "Python", level: 88 },
      { name: "AWS", level: 95 },
      { name: "Docker", level: 90 },
      { name: "Kubernetes", level: 85 },
    ],
    stats: {
      completedProjects: 29,
      clientSatisfaction: 97,
    },
    ratings: {
      average: 4.7,
      count: 23,
    },
  };

  useEffect(() => {
    // In a real app, you would fetch the freelancer data here
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [outletUserId]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Alert
          message="Limited Profile View"
          description="Sign in to see the full profile, connect with this freelancer, and access all features."
          type="info"
          showIcon
          action={
            <Button 
              type="primary" 
              size="small" 
              className="bg-violet-600 hover:bg-violet-700 border-none"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          }
          className="mb-8"
        />
        
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
                  
                  <Button 
                    type="primary"
                    icon={<FaSignInAlt className="mr-2" />}
                    className="mt-4 md:mt-0 bg-violet-600 hover:bg-violet-700 border-none"
                    onClick={() => navigate('/login')}
                  >
                    Sign In to Connect
                  </Button>
                </div>
                
                <div className="flex mt-4 space-x-2">
                  <Tag color="blue" className="px-3 py-1 flex items-center">
                    <Rate disabled defaultValue={freelancerData.ratings.average} count={5} className="text-xs mr-1" />
                    {freelancerData.ratings.average} ({freelancerData.ratings.count} reviews)
                  </Tag>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mt-4">{freelancerData.bio}</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="shadow-sm">
            <Statistic 
              title="Completed Projects" 
              value={freelancerData.stats.completedProjects} 
              valueStyle={{ color: '#7c3aed' }}
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
        </div>
        
        {/* Skills (Limited) */}
        <Card title="Skills" className="shadow-sm mb-8">
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
        </Card>
        
        {/* Locked Content */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-violet-100 p-4 rounded-full mb-4">
              <FaLock className="text-violet-600 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Full Profile Access Restricted</h2>
            <p className="text-gray-600 mb-6 max-w-lg">
              Sign in to view this freelancer's complete profile, including experience, education, portfolio, and more.
            </p>
            <Button 
              type="primary" 
              size="large"
              icon={<FaSignInAlt className="mr-2" />}
              className="bg-violet-600 hover:bg-violet-700 border-none"
              onClick={() => navigate('/login')}
            >
              Sign In to View Full Profile
            </Button>
          </div>
        </div>
        
        {/* Hire Me Section (Limited) */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl shadow-md p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Interested in working with {freelancerData.name.split(' ')[0]}?</h2>
              <p className="text-violet-100 mb-4 md:mb-0">Sign in to get in touch and discuss your project requirements.</p>
            </div>
            <Button 
              size="large"
              icon={<FaSignInAlt className="mr-2" />}
              className="bg-white text-violet-600 hover:bg-violet-50 border-none"
              onClick={() => navigate('/login')}
            >
              Sign In to Hire
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotAuthProfile; 