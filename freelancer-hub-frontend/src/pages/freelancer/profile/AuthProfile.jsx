import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Tabs, Avatar, Button, Statistic, Card, Tag, Divider, Progress, 
  Tooltip, Timeline, Modal, Table, Select, Badge 
} from "antd";
import {
  FaEdit, FaStar, FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaBriefcase, FaGraduationCap, FaCode, FaGithub, FaLinkedin, FaGlobe,
  FaAward, FaCertificate, FaUserGraduate, FaTrophy, FaBook
} from "react-icons/fa";
import {
  UserOutlined, EditOutlined, ProjectOutlined, StarOutlined,
  TeamOutlined, CalendarOutlined, MailOutlined, GlobalOutlined,
  CheckCircleOutlined, EyeOutlined, SecurityScanOutlined,
  ExperimentOutlined, TrophyOutlined, BookOutlined,
  SafetyCertificateOutlined, DollarOutlined, ClockCircleOutlined,
  RiseOutlined, FallOutlined, ExclamationCircleOutlined, UpOutlined, DownOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import './css/AuthProfile.css';
import Cookies from "js-cookie";
import axios from "axios";
import { RiAwardLine, RiUserStarLine } from 'react-icons/ri';
import { IoSchoolOutline } from 'react-icons/io5';
import { GrConnect } from 'react-icons/gr';
import { BiSolidMessageRounded } from 'react-icons/bi';

// Add StatCard component definition
const StatCard = ({ title, value, icon, color, suffix, trend, trendValue }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-violet-100/30 
      hover:border-violet-200/50 transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-3">
      <span className={`text-${color}-500/70`}>{icon}</span>
      {trend && (
        <div className={`flex items-center ${
          trend === 'up' ? 'text-emerald-500/70' : 'text-rose-500/70'
        }`}>
          {trend === 'up' ? <RiseOutlined /> : <FallOutlined />}
          <span className="ml-1 text-sm">{trendValue}%</span>
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <p className={`text-xl font-semibold text-${color}-700/90`}>
      {value}{suffix}
    </p>
  </motion.div>
);

// Add this comprehensive dummy data structure
const getDummyData = (role) => ({
  basic: {
    id: 1,
    name: "Alex Johnson",
    role: role,
    title: role === 'student' ? "Student Developer" : "Full Stack Developer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    verified: true,
    location: "San Francisco, CA",
    joinDate: "January 2022",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Passionate developer with a strong foundation in modern web technologies. Committed to delivering high-quality solutions and continuous learning.",
    hourlyRate: 45,
    availability: "20-30 hrs/week",
  },
  
  professional: {
    skills: [
      { name: "React", level: 95, projects: 15 },
      { name: "Node.js", level: 90, projects: 12 },
      { name: "Python", level: 85, projects: 8 },
      { name: "MongoDB", level: 80, projects: 10 },
      { name: "AWS", level: 75, projects: 6 },
      { name: "TypeScript", level: 88, projects: 9 },
      { name: "Docker", level: 82, projects: 7 },
      { name: "GraphQL", level: 78, projects: 5 },
    ],
    languages: [
      { name: "English", level: "Native", proficiency: 100 },
      { name: "Spanish", level: "Fluent", proficiency: 85 },
      { name: "French", level: "Basic", proficiency: 40 },
    ],
    certifications: [
      {
        name: "AWS Certified Developer",
        issuer: "Amazon Web Services",
        date: "2023",
        credentialId: "AWS-123456",
      },
      {
        name: "Google Cloud Professional",
        issuer: "Google",
        date: "2022",
        credentialId: "GCP-789012",
      },
    ],
  },

  student: role === 'student' ? {
    institution: {
      name: "Stanford University",
      location: "Stanford, CA",
      program: "Computer Science",
      year: 3,
      gpa: 3.8,
    },
    academic: {
      major: "Computer Science",
      minor: "Data Science",
      expectedGraduation: "2025",
      coursework: [
        "Advanced Algorithms",
        "Machine Learning",
        "Database Systems",
        "Web Development",
      ],
      achievements: [
        {
          title: "Dean's List",
          period: "Fall 2023",
          description: "Maintained GPA above 3.7",
        },
        {
          title: "Hackathon Winner",
          period: "Spring 2023",
          description: "First place in University Hackathon",
        },
      ],
    },
    research: [
      {
        title: "ML Algorithm Optimization",
        role: "Research Assistant",
        professor: "Dr. Sarah Chen",
        period: "2023-Present",
      },
    ],
  } : null,

    experience: [
      {
        position: "Senior Developer",
        company: "Tech Solutions Inc.",
      location: "San Francisco, CA",
        duration: "2020-Present",
      description: "Lead developer for enterprise web applications",
      achievements: [
        "Reduced application load time by 40%",
        "Implemented CI/CD pipeline",
        "Mentored junior developers",
      ],
      technologies: ["React", "Node.js", "AWS"],
    },
    {
      position: "Full Stack Developer",
        company: "StartUp Innovations",
      location: "San Jose, CA",
        duration: "2019-2020",
      description: "Full stack development for SaaS products",
      achievements: [
        "Developed real-time collaboration features",
        "Improved database performance",
      ],
      technologies: ["Vue.js", "Python", "PostgreSQL"],
    },
  ],

    portfolio: [
      {
        title: "E-commerce Platform",
      description: "Full-featured online store with payment integration",
        image: "https://via.placeholder.com/300",
        link: "#",
      technologies: ["React", "Node.js", "Stripe"],
      highlights: [
        "100,000+ monthly active users",
        "99.9% uptime",
        "Mobile-first design",
      ],
      },
      {
        title: "Task Management App",
      description: "Real-time collaboration tool for teams",
        image: "https://via.placeholder.com/300",
        link: "#",
      technologies: ["Vue.js", "Firebase", "Material UI"],
      highlights: [
        "Real-time updates",
        "Offline support",
        "Cross-platform compatibility",
      ],
    },
  ],

  stats: {
    earnings: {
      total: 75000,
      monthly: 6250,
      trend: "+12%",
    },
    projects: {
      completed: 32,
      ongoing: 3,
      satisfaction: 98,
      onTime: 95,
    },
    ratings: {
      average: 4.8,
      total: 127,
      breakdown: {
        5: 85,
        4: 32,
        3: 8,
        2: 2,
        1: 0,
      },
    },
    hours: {
      total: 2840,
      weekly: 35,
      availability: "Open to offers",
    },
  },

  social: {
      github: "https://github.com/alexjohnson",
      linkedin: "https://linkedin.com/in/alexjohnson",
      website: "https://alexjohnson.dev",
    twitter: "https://twitter.com/alexjohnson",
  },

  education: role !== 'freelancer' ? [
    // education data
  ] : null
});

// Tab Components
const SkillsTab = ({ skills = [], languages = [] }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Skills & Expertise</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-violet-100 text-violet-600 rounded-full text-sm">
              {skill.name}
            </span>
          ))}
                    </div>
                  </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Languages</h3>
        <div className="space-y-2">
          {languages.map((lang, index) => (
            <div key={index} className="flex items-center justify-between">
              <span>{lang.name}</span>
              <span className="text-sm text-gray-500">{lang.level}</span>
            </div>
          ))}
                </div>
                </div>
              </div>
            </div>
);

const ExperienceTab = ({ experience = [], portfolio = [] }) => (
  <div className="space-y-6">
    {/* Experience Section */}
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
      {experience.map((exp, index) => (
        <div key={index} className="bg-white rounded-lg p-6 shadow-sm mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{exp.position}</h3>
              <p className="text-violet-600">{exp.company}</p>
            </div>
            <span className="text-sm text-gray-500">{exp.duration}</span>
          </div>
          <p className="mt-2 text-gray-600">{exp.description}</p>
          {exp.achievements && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Key Achievements:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {exp.achievements.map((achievement, idx) => (
                  <li key={idx}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
        </div>
        
    {/* Portfolio Section - Add this to show portfolio items */}
    <div>
      <h3 className="text-lg font-semibold mb-4">Portfolio Projects</h3>
      <div className="grid gap-6 md:grid-cols-3">
        {portfolio?.map((item, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
          >
            <img
              src={item.image || '/path/to/fallback-image.jpg'} 
              alt={item.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = '/path/to/fallback-image.jpg';
              }}
            />
            <div className="p-4">
              <h4 className="font-semibold text-violet-700">{item.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              
              {item.technologies && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex} 
                      className="px-2 py-1 bg-violet-50 text-violet-600 rounded-md text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              
              {item.link && (
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-3 text-sm text-violet-600 hover:text-violet-800 flex items-center gap-1"
                >
                  <EyeOutlined /> View Project
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const EducationTab = ({ education = [] }) => (
  <div className="space-y-6">
    {education.map((edu, index) => (
      <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{edu.degree}</h3>
            <p className="text-violet-600">{edu.institution}</p>
          </div>
          <span className="text-sm text-gray-500">{edu.duration}</span>
                </div>
        <p className="mt-2 text-gray-600">{edu.description}</p>
        {edu.achievements && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Achievements:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {edu.achievements.map((achievement, idx) => (
                <li key={idx}>{achievement}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ))}
  </div>
);

const ReviewsTab = ({ reviews = [] }) => (
  <div className="space-y-6">
    {reviews.map((review, index) => (
      <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <img
            src={review.clientAvatar || '/path/to/default-avatar.jpg'}
            alt={review.clientName}
            className="w-12 h-12 rounded-full"
            onError={(e) => {
              e.target.src = '/path/to/default-avatar.jpg';
            }}
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
                    <div>
                <h3 className="font-semibold">{review.clientName}</h3>
                <p className="text-sm text-gray-500">{review.projectTitle}</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, idx) => (
                  <StarOutlined
                    key={idx}
                    className={idx < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-gray-600">{review.comment}</p>
            <span className="text-sm text-gray-500 mt-2 block">{review.date}</span>
                    </div>
                  </div>
                </div>
              ))}
  </div>
);

const AcademicTab = ({ academic = {} }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-gray-600">Current GPA: <span className="font-medium">{academic.gpa || 'N/A'}</span></p>
          <p className="text-gray-600">Major: <span className="font-medium">{academic.major || 'N/A'}</span></p>
          <p className="text-gray-600">Minor: <span className="font-medium">{academic.minor || 'N/A'}</span></p>
        </div>
                    <div>
          <p className="text-gray-600">Expected Graduation: <span className="font-medium">{academic.expectedGraduation || 'N/A'}</span></p>
          <p className="text-gray-600">Current Semester: <span className="font-medium">{academic.currentSemester || 'N/A'}</span></p>
        </div>
                    </div>
                  </div>
    
    {academic.research && (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Research & Publications</h3>
        <div className="space-y-4">
          {academic.research.map((item, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-gray-600 mt-1">{item.description}</p>
              <span className="text-sm text-violet-600">{item.date}</span>
                </div>
              ))}
        </div>
      </div>
    )}
  </div>
);

// Update getTabItems function to use these components
const getTabItems = (profileData, role) => {
  const baseTabs = [
    {
      key: "1",
      label: "Skills & Expertise",
      children: <SkillsTab skills={profileData?.professional?.skills} languages={profileData?.professional?.languages} />
    },
    {
      key: "2",
      label: "Experience & Portfolio",
      children: <ExperienceTab experience={profileData?.experience} portfolio={profileData?.portfolio} />
    },
    ...(role !== 'freelancer' ? [{
      key: "3",
      label: "Education & Certifications",
      children: <EducationTab education={profileData?.education} />
    }] : []),
    {
      key: "4",
      label: "Reviews & Ratings",
      children: <ReviewsTab reviews={profileData?.reviews} />
    }
  ];

  if (role === 'student') {
    baseTabs.push({
      key: "5",
      label: "Academic Profile",
      children: <AcademicTab academic={profileData?.student?.academic} />
    });
  }

  return baseTabs;
};

const getFreelancerStats = (data) => {
  // Add null checks and default values
  const stats = data?.stats || {};
  const completedProjects = stats?.projects?.completed || 0;
  const hourlyRate = data?.basic?.hourlyRate || 0;

  return [
    {
      title: "Total Earnings",
      value: completedProjects * hourlyRate,
      icon: <DollarOutlined className="text-2xl" />,
      color: "violet",
      trend: "up",
      trendValue: stats?.earnings?.trend || 0
    },
    {
      title: "Success Rate",
      value: stats?.projects?.satisfaction || 0,
      icon: <CheckCircleOutlined className="text-2xl" />,
      color: "emerald",
      suffix: "%",
      trend: "up",
      trendValue: 5
    },
    {
      title: "Active Projects",
      value: stats?.projects?.ongoing || 0,
      icon: <ProjectOutlined className="text-2xl" />,
      color: "blue"
    },
    {
      title: "Average Rating",
      value: stats?.ratings?.average || 0,
      icon: <StarOutlined className="text-2xl" />,
      color: "amber",
      suffix: "/5",
      trend: "up",
      trendValue: 8
    }
  ];
};

const getStudentStats = (data) => {
  // Add null checks and default values
  const studentInfo = data?.student || {};
  
  return [
    {
      title: "Learning Progress",
      value: studentInfo?.academic?.progress || 0,
      icon: <BookOutlined className="text-2xl" />,
      color: '#0d9488',
      suffix: "%"
    },
    {
      title: "Skills Mastered",
      value: studentInfo?.professional?.skills?.length || 0,
      icon: <ExperimentOutlined className="text-2xl" />,
      color: '#6366f1'
    },
    {
      title: "Academic Projects",
      value: studentInfo?.academic?.projects?.length || 0,
      icon: <ProjectOutlined className="text-2xl" />,
      color: '#eab308'
    },
    {
      title: "Internships",
      value: studentInfo?.experience?.internships?.length || 0,
      icon: <FaBriefcase className="text-2xl" />,
      color: '#ec4899'
    }
  ];
};

// Add this component definition before the AuthProfile component
const ActionButtons = ({ isEditable }) => (
  <div className="flex gap-3">
    {isEditable ? (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all"
      >
        <FaEdit />
        Edit Profile
      </motion.button>
    ) : (
      <>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all"
        >
          <GrConnect />
          Connect
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
        >
          <BiSolidMessageRounded />
          Message
        </motion.button>
      </>
    )}
  </div>
);

// The AuthProfile component should come AFTER all helper components
const AuthProfile = () => {
  const { userId,role, isEditable } = useOutletContext();
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [dummyData, setDummyData] = useState(null);
  const [error, setError] = useState(null);
  
  // Add state for profile completion tracking
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showCompletionDetails, setShowCompletionDetails] = useState(false);
  const [categoryScores, setCategoryScores] = useState({
    basic_info: { score: 0, total: 20 },
    professional_info: { score: 0, total: 25 },
    verification: { score: 0, total: 30 },
    academic_details: { score: 0, total: 25 }
  });

  useEffect(() => {
    try {
      // Only create dummy data if role is available
      if (role) {
        const initialDummyData = getDummyData(role);
      setDummyData(initialDummyData);
      setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    const fetchProfileData = async () => {
      // Only fetch if role is not available
      if (!role) {
        setLoading(true);
        try {
          const accessToken = Cookies.get('accessToken');
          if (!accessToken) {
            console.error('No access token found');
            return;
          }

          const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          setProfileData(response.data.user);
        } catch (error) {
          console.error('Error fetching profile data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [userId, role]);

  // Add profile completion calculation
  useEffect(() => {
    if (dummyData) {
      // Calculate profile completion percentages
      const basic = calculateBasicInfoScore(dummyData);
      const professional = calculateProfessionalInfoScore(dummyData);
      const verification = calculateVerificationScore(dummyData);
      const academic = role === 'student' ? calculateAcademicScore(dummyData) : { score: 0, total: 0 };
      
      setCategoryScores({
        basic_info: basic,
        professional_info: professional,
        verification: verification,
        academic_details: academic
      });
      
      // Calculate total profile completion percentage
      const totalScore = basic.score + professional.score + verification.score + academic.score;
      const totalPossible = basic.total + professional.total + verification.total + 
        (role === 'student' ? academic.total : 0);
      
      setProfileCompletion(Math.round((totalScore / totalPossible) * 100));
    }
  }, [dummyData, role]);

  // Helper functions for profile completion calculation
  const calculateBasicInfoScore = (data) => {
    const fields = ['name', 'avatar', 'bio', 'location', 'email'];
    let score = 0;
    fields.forEach(field => {
      if (data.basic?.[field]) score += 4;
    });
    return { score, total: 20, pending_items: getPendingItems(data, 'basic', fields) };
  };

  const calculateProfessionalInfoScore = (data) => {
    const fields = ['skills', 'experience', 'hourlyRate', 'availability', 'languages'];
    let score = 0;
    fields.forEach(field => {
      if (field === 'skills' && data.professional?.skills?.length > 0) score += 5;
      else if (field === 'experience' && data.experience?.length > 0) score += 5;
      else if (field === 'languages' && data.professional?.languages?.length > 0) score += 5;
      else if (data.basic?.[field]) score += 5;
    });
    return { score, total: 25, pending_items: getPendingItems(data, 'professional', fields) };
  };

  const calculateVerificationScore = (data) => {
    const fields = ['email_verified', 'phone_verified', 'identity_verified', 'portfolio_verified', 'skills_verified', 'certifications_verified'];
    let score = 0;
    fields.forEach(field => {
      if (data.verification?.[field]) score += 5;
    });
    return { score, total: 30, pending_items: getPendingItems(data, 'verification', fields) };
  };

  const calculateAcademicScore = (data) => {
    if (!data.student) return { score: 0, total: 25, pending_items: [] };
    
    const fields = ['institution', 'major', 'minor', 'expectedGraduation', 'research'];
    let score = 0;
    fields.forEach(field => {
      if (field === 'research' && data.student?.research?.length > 0) score += 5;
      else if (data.student?.[field] || data.student?.academic?.[field]) score += 5;
    });
    return { score, total: 25, pending_items: getPendingItems(data, 'academic', fields) };
  };

  const getPendingItems = (data, category, fields) => {
    const pendingItems = [];
    const messages = {
      basic: {
        name: 'Add your full name',
        avatar: 'Upload a profile picture',
        bio: 'Write a professional bio',
        location: 'Add your location',
        email: 'Verify your email address'
      },
      professional: {
        skills: 'Add your professional skills',
        experience: 'Add your work experience',
        hourlyRate: 'Set your hourly rate',
        availability: 'Set your availability',
        languages: 'Add languages you speak'
      },
      verification: {
        email_verified: 'Verify your email',
        phone_verified: 'Verify your phone number',
        identity_verified: 'Complete identity verification',
        portfolio_verified: 'Add verified portfolio items',
        skills_verified: 'Get skills verification',
        certifications_verified: 'Upload certification documents'
      },
      academic: {
        institution: 'Add your educational institution',
        major: 'Add your major',
        minor: 'Add your minor (if applicable)',
        expectedGraduation: 'Add expected graduation date',
        research: 'Add research experience'
      }
    };
    
    fields.forEach(field => {
      let isComplete = false;
      
      if (category === 'basic') {
        isComplete = Boolean(data.basic?.[field]);
      } else if (category === 'professional') {
        isComplete = field === 'skills' ? data.professional?.skills?.length > 0 :
                     field === 'experience' ? data.experience?.length > 0 :
                     field === 'languages' ? data.professional?.languages?.length > 0 :
                     Boolean(data.basic?.[field]);
      } else if (category === 'verification') {
        isComplete = Boolean(data.verification?.[field]);
      } else if (category === 'academic') {
        isComplete = field === 'research' ? data.student?.research?.length > 0 :
                   Boolean(data.student?.[field] || data.student?.academic?.[field]);
      }
      
      if (!isComplete) {
        pendingItems.push({
          item: messages[category][field],
          priority: category === 'verification' ? 'high' : 'medium'
        });
      }
    });
    
    return pendingItems;
  };

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading profile: {error}</p>
        </div>
          </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Use dummy data as fallback
  const displayData = dummyData || {};

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-8 space-y-6">
      {/* Profile Completion Section - Add this to match client side */}
      {isEditable && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-4 rounded-xl transition-colors"
            onClick={() => setShowCompletionDetails(!showCompletionDetails)}
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0">
                <Progress 
                  type="circle" 
                  percent={profileCompletion}
                  width={60}
                  strokeColor={{
                    '0%': '#8b5cf6',
                    '100%': '#6d28d9',
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <SafetyCertificateOutlined className="text-violet-500" />
                  Profile Completion Status
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {profileCompletion}% completed
                </p>
                {profileCompletion < 100 && (
                  <div className="mt-2">
                    <p className="text-sm text-violet-600">Priority items needed:</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {Object.entries(categoryScores)
                        .flatMap(([category, data]) => data.pending_items || [])
                        .filter(item => item.priority === 'high')
                        .slice(0, 3)
                        .map((item, index) => (
                          <li 
                            key={index} 
                            className="flex items-center gap-1 text-red-500"
                          >
                            <ExclamationCircleOutlined className="text-red-500" />
                            {item.item}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button
                type="text"
                icon={showCompletionDetails ? <UpOutlined /> : <DownOutlined />}
                className="text-gray-500"
              />
            </div>
          </div>

          {/* Detailed Categories - Shown on Toggle */}
          <AnimatePresence>
            {showCompletionDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        title: "Basic Information",
                        icon: <UserOutlined className="text-violet-500" />,
                        data: categoryScores.basic_info,
                        section: 'basic_info',
                        color: 'violet'
                      },
                      {
                        title: "Professional Information",
                        icon: <FaBriefcase className="text-purple-500" />,
                        data: categoryScores.professional_info,
                        section: 'professional_info',
                        color: 'purple'
                      },
                      {
                        title: "Verification Documents",
                        icon: <SecurityScanOutlined className="text-red-500" />,
                        data: categoryScores.verification,
                        section: 'verification',
                        color: 'red',
                        required: true
                      },
                      ...(role === 'student' ? [{
                        title: "Academic Details",
                        icon: <IoSchoolOutline className="text-blue-500" />,
                        data: categoryScores.academic_details,
                        section: 'academic_details',
                        color: 'blue'
                      }] : [])
                    ].map((category, index) => {
                      const score = category.data?.score || 0;
                      const total = category.data?.total || 0;
                      const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                      const remaining = total - score;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {category.icon}
                              <h4 className="font-semibold text-gray-700">{category.title}</h4>
                            </div>
                            <Tag 
                              color={percentage === 100 ? 'success' : category.required && percentage < 50 ? 'error' : 'warning'}
                            >
                              {percentage}%
                            </Tag>
                      </div>

                          <Progress 
                            percent={percentage}
                            size="small"
                            strokeColor={
                              percentage === 100 
                                ? '#10b981' 
                                : category.required && percentage < 50 
                                  ? '#ef4444' 
                                  : '#8b5cf6'
                            }
                          />

                          <div className="mt-3 text-sm">
                            <p className="text-gray-600">
                              {score} of {total} points completed
                            </p>
                            {remaining > 0 && (
                              <p className={`mt-1 ${category.required ? 'text-red-500' : 'text-violet-500'}`}>
                                {remaining} points remaining {category.required && '(Required)'}
                              </p>
                            )}
                    </div>

                          {/* Pending Items */}
                          {remaining > 0 && category.data?.pending_items?.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {category.data.pending_items.slice(0, 3).map((item, idx) => (
                                <p 
                                  key={idx} 
                                  className={`text-xs flex items-center gap-1 ${
                                    item.priority === 'high' ? 'text-red-500' : 'text-orange-500'
                                  }`}
                                >
                                  <ExclamationCircleOutlined /> {item.item}
                                </p>
                              ))}
                  </div>
                          )}

                          <Button 
                            type="link" 
                            size="small"
                            className="mt-2 p-0 text-violet-500 hover:text-violet-600"
                          >
                            Complete Now →
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Enhanced Profile Header with Role-based Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Cover Photo with Dynamic Gradient */}
        <div className="h-48 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative group"
            >
              <Avatar 
                size={128}
                src={displayData.basic?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
                className="border-4 border-white shadow-lg"
              />
              {isEditable && (
                <Button 
                  icon={<EditOutlined />}
                  className="absolute bottom-0 right-0 rounded-full bg-violet-500 
                    text-white border-2 border-white hover:bg-violet-600"
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Profile Info with Role-based Content */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="max-w-xl">
              {/* Basic Info */}
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">
                  {displayData.basic?.name || 'Loading...'}
                </h1>
                <Tag color="purple" icon={<FaUserGraduate />} className="px-3 py-1">
                  {displayData.basic?.role === 'student' ? 'Student Developer' : 'Freelancer'}
                </Tag>
                {displayData.basic?.verified && (
                  <Tooltip title="Verified Professional">
                    <CheckCircleOutlined className="text-violet-500 text-xl" />
                  </Tooltip>
                )}
              </div>

              {/* Role-specific Info */}
              {displayData.basic?.role === 'student' ? (
                <StudentInfo profileData={displayData.student} />
              ) : (
                <FreelancerInfo profileData={displayData} />
              )}

              {/* Contact & Social Links */}
              <ContactAndSocial freelancerData={displayData} />
            </div>

            {/* Action Buttons */}
            <ActionButtons isEditable={isEditable} />
          </div>

          {/* Bio Section */}
          <BioSection freelancerData={displayData} />
        </div>
      </motion.div>

      {/* Stats Overview with proper data passing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(displayData.basic?.role === 'student' 
          ? getStudentStats(displayData) 
          : getFreelancerStats(displayData)
        ).map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Tabs with loading state */}
      <Card className="rounded-xl shadow-md">
        {displayData ? (
          <Tabs
            defaultActiveKey="1"
            items={getTabItems(displayData, role)}
            tabBarGutter={24}
            className="profile-tabs"
          />
        ) : (
          <div className="p-8 text-center text-gray-500">
            Loading profile data...
          </div>
        )}
      </Card>
    </div>
  );
};

// Update these component implementations at the bottom of the file
const StudentInfo = ({ profileData }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-3 space-y-2"
  >
    <p className="text-gray-600 flex items-center gap-2">
      <IoSchoolOutline className="text-violet-500" />
      {profileData?.institution?.name} • {profileData?.academic?.major}
    </p>
    <div className="flex flex-wrap gap-2 mt-2">
      {profileData?.academic?.coursework?.map((course, index) => (
        <Tag 
          key={index}
          className="text-sm bg-violet-100 text-violet-700 px-3 py-1 rounded-full"
        >
          {course}
        </Tag>
      ))}
    </div>
  </motion.div>
);

const FreelancerInfo = ({ profileData }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-3 space-y-2"
  >
    <div className="flex items-center gap-3">
      <p className="text-gray-600 flex items-center gap-2">
        <FaBriefcase className="text-violet-500" />
        {profileData?.experience?.[0]?.position || 'Experienced Professional'}
      </p>
      <Tag color="geekblue" className="flex items-center gap-1">
        <StarOutlined />
        {profileData?.stats?.ratings?.average || '4.8'} Rating
      </Tag>
    </div>
    <div className="flex flex-wrap gap-2">
      {profileData?.skills?.map((skill, index) => (
        <Tag 
          key={index}
          className="text-sm bg-violet-100 text-violet-700 px-3 py-1 rounded-full"
        >
          {skill.name}
        </Tag>
      ))}
    </div>
  </motion.div>
);

const ContactAndSocial = ({ freelancerData }) => (
  <div className="mt-4 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
        <MailOutlined className="mr-2 text-violet-500" />
        {freelancerData.basic?.email}
      </div>
      <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
        <EnvironmentOutlined className="mr-2 text-violet-500" />
        {freelancerData.basic?.location}
      </div>
    </div>
    
    <div className="flex items-center gap-4 mt-4">
      {freelancerData.social?.github && (
        <a href={freelancerData.social.github} target="_blank" rel="noopener noreferrer">
          <FaGithub className="text-2xl text-gray-600 hover:text-violet-600 transition-colors" />
        </a>
      )}
      {freelancerData.social?.linkedin && (
        <a href={freelancerData.social.linkedin} target="_blank" rel="noopener noreferrer">
          <FaLinkedin className="text-2xl text-gray-600 hover:text-violet-600 transition-colors" />
        </a>
      )}
      {freelancerData.social?.website && (
        <a href={freelancerData.social.website} target="_blank" rel="noopener noreferrer">
          <FaGlobe className="text-2xl text-gray-600 hover:text-violet-600 transition-colors" />
        </a>
      )}
    </div>
  </div>
);

const BioSection = ({ freelancerData }) => (
  freelancerData.basic?.bio && (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-6 bg-gradient-to-r from-violet-50 to-white rounded-xl border border-violet-100"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Professional Bio</h3>
      <p className="text-gray-600 leading-relaxed">{freelancerData.basic.bio}</p>
    </motion.div>
  )
);

export default AuthProfile; 