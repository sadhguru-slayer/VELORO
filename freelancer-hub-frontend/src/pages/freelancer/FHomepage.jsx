import React, { useEffect, useRef, useState } from "react";
import FHeader from "../../components/freelancer/FHeader";
import FSider from "../../components/freelancer/FSider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import { useMediaQuery } from "react-responsive";
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';
import '../../assets/css/FHomepage.css';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Title
);

const statData = {
  activeProjects: 5,
  completedProjects: 20,
  successRate: 95,
  earnings: 50000,
  inProgressProjects: 30,
};

const successRateData = {
  labels: ["Success Rate"],
  datasets: [
    {
      label: "Success Rate",
      data: [statData.successRate, 100 - statData.successRate],
      backgroundColor: ["#34D399", "#F87171"], // Soft green and red for success/failure
    },
  ],
};

const projectData = {
  labels: ["Active Projects", "Completed Projects", "Monthly Earnings"],
  datasets: [
    {
      label: "Projects & Earnings",
      data: [
        statData.activeProjects,
        statData.completedProjects,
        statData.earnings,
      ],
      backgroundColor: ["#1E3A8A", "#2563EB", "#F59E0B"], // Blue, blue, and yellow for variety
      borderRadius: 10,
      borderSkipped: false,
    },
  ],
};

const FHomepage = ({ userId, role, isAuthenticated, isEditable }) => {
  
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [showStatsOverview, setShowStatsOverview] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Simulate loading data with staggered timing
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setChartData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Monthly Earnings (₹)',
            data: [30000, 45000, 35000, 50000, 42000, 60000],
            backgroundColor: 'rgba(124, 58, 237, 0.5)',
            borderColor: 'rgba(124, 58, 237, 1)',
            borderWidth: 2,
          }]
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        setShowStatsOverview(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

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

  const pathnames = location.pathname.split("/").filter((x) => x);

  const skillBasedProjects = [
    {
      id: 1,
      name: "Build a React Dashboard",
      description: "A dashboard for analytics.",
      time: "3 days left",
    },
    {
      id: 2,
      name: "Logo Design",
      description: "Create a unique logo for a startup.",
      time: "5 days left",
    },
    {
      id: 3,
      name: "WordPress Blog Setup",
      description: "Setup and customize a WordPress blog.",
      time: "2 days left",
    },
    {
      id: 4,
      name: "SEO Optimization",
      description: "Optimize a website for search engines.",
      time: "7 days left",
    },
    {
      id: 5,
      name: "SEO Optimization",
      description: "Optimize a website for search engines.",
      time: "7 days left",
    },
    {
      id: 6,
      name: "SEO Optimization",
      description: "Optimize a website for search engines.",
      time: "7 days left",
    },
  ];

  const handleNavigate = (component) => {
    navigate("/freelancer/dashboard", { state: { component } });
  };

  const containerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [projectWidth, setProjectWidth] = useState(0);

  useEffect(() => {
    const handleVisibility = () => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        setShowLeftButton(scrollLeft > 10);
        setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleVisibility);
      // Initial check
      handleVisibility();
      
      // Check after images/content loads
      window.addEventListener('load', handleVisibility);
      
      return () => {
        container.removeEventListener('scroll', handleVisibility);
        window.removeEventListener('load', handleVisibility);
      };
    }
  }, []);

  const calculateProjectWidth = () => {
    if (containerRef.current && containerRef.current.firstChild) {
      const card = containerRef.current.firstChild;
      const style = window.getComputedStyle(card);
      const width = card.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
      setProjectWidth(width);
    }
  };

  useEffect(() => {
    calculateProjectWidth();
    window.addEventListener("resize", calculateProjectWidth);
    return () => window.removeEventListener("resize", calculateProjectWidth);
  }, []);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -projectWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: projectWidth, behavior: "smooth" });
    }
  };

  const statsCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <FSider 
        userId={userId}
        role={role}
        isAuthenticated={isAuthenticated}
        isEditable={isEditable}
        dropdown={true} 
        collapsed={true} 
        handleProfileMenu={handleProfileMenu}
      />
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'ml-0 pb-16' : 'ml-14'}`}>
        <FHeader 
          userId={userId}
          role={role}
          isAuthenticated={isAuthenticated}
          isEditable={isEditable}
        />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto  space-y-8">
{/* Welcome banner */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl min-h-[60vh] bg-gradient-pattern">
              {/* Refined Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600
                opacity-95 animate-gradient-slow">
                {/* Enhanced Decorative Elements */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-white/20 rounded-full 
                    filter blur-3xl mix-blend-overlay -translate-x-1/2 -translate-y-1/2 animate-float-slow">
                  </div>
                  <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-indigo-300/30 rounded-full 
                    filter blur-3xl mix-blend-overlay translate-x-1/2 translate-y-1/2 animate-float-slow-reverse">
                  </div>
                </div>
              </div>
            
              {/* Enhanced Content Container */}
              <div className="relative h-full flex flex-col items-center justify-center p-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-8 max-w-4xl mx-auto text-center"
                >
                  {/* Welcome Badge */}
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm
                    border border-white/20 mb-6">
                    <span className="text-white/90 text-sm font-medium">Welcome back</span>
                  </div>
            
                  {/* Enhanced Welcome Message */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white
                    tracking-tight leading-none">
                    Hello, <span className="inline-block">
                      <span className="inline-block bg-gradient-to-r from-white to-indigo-200 
                        bg-clip-text text-transparent animate-gradient-x">
                        Sadguru!
                      </span>
                    </span>
                  </h1>
            
                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    <motion.div
                      variants={statsCardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.1 }}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20
                        hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-indigo-100 text-sm font-medium">Active Projects</span>
                          <span className="p-2 bg-white/10 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <CountUp
                            start={0}
                            end={12}
                            duration={2}
                            className="text-3xl font-bold text-white"
                          />
                          <span className="text-green-400 text-sm font-medium">+2 this week</span>
                        </div>
                        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </motion.div>
            
                    <motion.div
                      variants={statsCardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.2 }}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20
                        hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-indigo-100 text-sm font-medium">Success Rate</span>
                          <span className="p-2 bg-white/10 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <CountUp
                            start={0}
                            end={95}
                            duration={2}
                            className="text-3xl font-bold text-white"
                          />
                          <span className="text-2xl font-bold text-white ml-1">%</span>
                        </div>
                        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                    </motion.div>
            
                    <motion.div
                      variants={statsCardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.3 }}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20
                        hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-indigo-100 text-sm font-medium">Total Earnings</span>
                          <span className="p-2 bg-white/10 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white mr-1">₹</span>
                          <CountUp
                            start={0}
                            end={50000}
                            duration={2}
                            separator=","
                            className="text-3xl font-bold text-white"
                          />
                        </div>
                        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                    </motion.div>
            
                    <motion.div
                      variants={statsCardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.4 }}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20
                        hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-indigo-100 text-sm font-medium">In Progress Projects</span>
                          <span className="p-2 bg-white/10 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <CountUp
                            start={0}
                            end={30}
                            duration={2}
                            className="text-3xl font-bold text-white"
                          />
                          <span className="text-green-400 text-sm font-medium">+5 this week</span>
                        </div>
                        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
            
                {/* Decorative Dots Grid */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="h-full w-full grid grid-cols-8 gap-4 opacity-20">
                    {[...Array(32)].map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-white"></div>
                    ))}
                  </div>
                </div>
            </div>
          </div>
            {/* Performance Analytics Section */}

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative bg-white rounded-2xl shadow-lg p-8"
            >
              {/* Section Header with Icon */}
              <div className="flex items-center justify-center gap-4 mb-12">
                <span className="p-2 bg-violet-100 rounded-lg">
                  <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </span>
                <h2 className="text-3xl font-bold text-gray-900">Performance Analytics</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {isLoading ? (
                  // Loading skeletons
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))
                ) : (
                  // Actual stats cards
                  <>
                    <motion.div
                      variants={statsCardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300"
                    >
                      <h3 className="text-lg font-medium opacity-90">Total Earnings</h3>
                      <div className="mt-4 text-4xl font-bold">
                        <CountUp
                          prefix="₹"
                          end={statData.earnings}
                          duration={2.5}
                          separator=","
                        />
                      </div>
                      <div className="mt-2 text-sm opacity-75">+12% from last month</div>
                    </motion.div>

                    <motion.div
                      variants={statsCardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300"
                    >
                      <h3 className="text-lg font-medium opacity-90">Active Projects</h3>
                      <div className="mt-4 text-4xl font-bold">
                        <CountUp
                          end={statData.activeProjects}
                          duration={2.5}
                        />
                      </div>
                      <div className="mt-2 text-sm opacity-75">+5% from last month</div>
                    </motion.div>

                    <motion.div
                      variants={statsCardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300"
                    >
                      <h3 className="text-lg font-medium opacity-90">In Progress Projects</h3>
                      <div className="mt-4 text-4xl font-bold">
                        <CountUp
                          end={statData.inProgressProjects}
                          duration={2.5}
                        />
                      </div>
                      <div className="mt-2 text-sm opacity-75">+10% from last month</div>
                    </motion.div>

                    <motion.div
                      variants={statsCardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300"
                    >
                      <h3 className="text-lg font-medium opacity-90">Success Rate</h3>
                      <div className="mt-4 text-4xl font-bold">
                        <CountUp
                          suffix="%"
                          end={statData.successRate}
                          duration={2.5}
                        />
                      </div>
                      <div className="mt-2 text-sm opacity-75">+5% from last month</div>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Enhanced Charts Section */}
              {/* Monthly Revenue Trend Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.3 }}
  className="bg-white rounded-2xl shadow-lg p-6"
>
  <h3 className="text-xl font-semibold mb-6 text-gray-800">Monthly Revenue Trend</h3>
  {chartData && (
    <div className="relative w-full" style={{ height: '300px' }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(124, 58, 237, 0.8)',
              titleFont: {
                size: 14
              },
              bodyFont: {
                size: 13
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(107, 114, 128, 0.1)'
              }
            }
          }
        }}
        height={300}
      />
    </div>
  )}
</motion.div>

{/* Success Rate Trend Chart */}
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.3 }}
  className="bg-white rounded-2xl shadow-lg p-6"
>
  <h3 className="text-xl font-semibold mb-6 text-gray-800">Success Rate Trend</h3>
  <div className="relative w-full" style={{ height: '300px' }}>
    <Pie
      data={successRateData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              font: {
                size: 12,
                weight: 'medium'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(124, 58, 237, 0.8)',
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            }
          }
        }
      }}
      height={300}
    />
  </div>
</motion.div>
</div>
            </motion.section>

            {/* Skill-Based Projects */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative overflow-hidden"
            >
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50 opacity-70"></div>
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.2]"></div>
              
              <div className="relative p-8 sm:p-10">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="h-1 w-10 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"></div>
                  <h2 className="text-3xl font-bold text-center">
                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                      Recommended Projects
                    </span>
                  </h2>
                  <div className="h-1 w-10 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"></div>
                </div>

                {/* Project Cards Container */}
                <div className="relative">
                  {/* Scroll Buttons */}
                  <AnimatePresence>
                    {showLeftButton && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={scrollLeft}
                        className="absolute -left-3 top-1/2 transform -translate-y-1/2 
                          bg-white/90 p-3 rounded-full z-10 shadow-lg hover:shadow-xl
                          border border-violet-100 group transition-all duration-300
                          hover:bg-violet-50"
                      >
                        <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M15 19l-7-7 7-7"/>
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <div 
                    ref={containerRef} 
                    className="flex space-x-6 overflow-x-auto scroll-smooth no-scrollbar px-2"
                  >
                    {skillBasedProjects.map((record, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex-none w-[320px] bg-white rounded-xl overflow-hidden
                          shadow-sm hover:shadow-xl transition-all duration-300
                          border border-violet-100/50 hover:border-violet-200"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">{record.name}</h3>
                                <span className="text-sm text-gray-500">{record.time}</span>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-sm font-medium">
                              {record.budget}
                            </span>
                          </div>

                          <p className="text-gray-600 text-sm mb-4">{record.description}</p>

                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Progress</span>
                              <span className="text-violet-600 font-medium">65%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {/* Team members avatars */}
                              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                              <div className="w-8 h-8 rounded-full border-2 border-white bg-violet-100 flex items-center justify-center">
                                <span className="text-xs text-violet-600 font-medium">+3</span>
                              </div>
                            </div>
                            
                            <button className="flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors">
                              <span className="text-sm font-medium">View Details</span>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Right Scroll Button */}
                  <AnimatePresence>
                    {showRightButton && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={scrollRight}
                        className="absolute -right-3 top-1/2 transform -translate-y-1/2 
                          bg-white/90 p-3 rounded-full z-10 shadow-lg hover:shadow-xl
                          border border-violet-100 group transition-all duration-300
                          hover:bg-violet-50"
                      >
                        <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M9 5l7 7-7 7"/>
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.section>

            {/* Swift Action Cards */}
            <section className="relative  rounded-2xl shadow-lg">
              <div className="p-8">
                <h2 className="text-3xl font-bold text-center mb-8">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Swift Action
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* My Projects Card */}
                  <div className="group ">
                    <div className=" inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
                    <div className=" p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg 
                      border border-gray-100 hover:border-violet-200
                      transform hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                          My Projects
                        </h3>
                        <span className="p-2 bg-violet-100 rounded-lg">
                          <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          </svg>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-6">View and manage your active projects.</p>
                      <button
                        onClick={() => handleNavigate("projects")}
                        className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 
                          hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl
                          transform hover:scale-[1.02] transition-all duration-300
                          shadow-lg hover:shadow-violet-500/25 font-medium
                          flex items-center justify-center gap-2 group"
                      >
                        Go to Projects
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Browse Projects Card */}
                  <div className="group ">
                    <div className=" inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
                    <div className=" p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg 
                      border border-gray-100 hover:border-violet-200
                      transform hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                          Browse Projects
                        </h3>
                        <span className="p-2 bg-violet-100 rounded-lg">
                          <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                          </svg>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-6">Explore new projects and start bidding.</p>
                      <button
                        onClick={() => navigate("/freelancer/browse-projects")}
                        className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 
                          hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl
                          transform hover:scale-[1.02] transition-all duration-300
                          shadow-lg hover:shadow-violet-500/25 font-medium
                          flex items-center justify-center gap-2 group"
                      >
                        Browse Now
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Notifications Card */}
                  <div className="group ">
                    <div className=" inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
                    <div className=" p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg 
                      border border-gray-100 hover:border-violet-200
                      transform hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                          Notifications
                        </h3>
                        <span className="p-2 bg-violet-100 rounded-lg">
                          <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                          </svg>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-6">Stay updated with project updates.</p>
                      <button className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 
                        hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl
                        transform hover:scale-[1.02] transition-all duration-300
                        shadow-lg hover:shadow-violet-500/25 font-medium
                        flex items-center justify-center gap-2 group">
                        View Notifications
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Earnings Card */}
                  <div className="group ">
                    <div className=" inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
                    <div className=" p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg 
                      border border-gray-100 hover:border-violet-200
                      transform hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                          Earnings
                        </h3>
                        <span className="p-2 bg-violet-100 rounded-lg">
                          <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-6">Check your earnings and pending invoices.</p>
                      <button
                        onClick={() => handleNavigate("earnings")}
                        className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 
                          hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl
                          transform hover:scale-[1.02] transition-all duration-300
                          shadow-lg hover:shadow-violet-500/25 font-medium
                          flex items-center justify-center gap-2 group"
                      >
                        View Earnings
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="relative bg-white rounded-2xl shadow-lg">
              <div className="p-8">
                <h2 className="text-3xl font-bold text-center mb-8">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Recent Activity
                  </span>
                </h2>

                <ul className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200 divide-y divide-gray-200/50">
                  {/* Activity Item 1 */}
                  <li className="group ">
                    <div className=" inset-0 bg-gradient-to-r from-violet-500/0 to-indigo-500/0 group-hover:from-violet-500/5 group-hover:to-indigo-500/5 transition-all duration-300 rounded-t-xl"></div>
                    <div className=" p-6 flex justify-between items-center gap-4 group-hover:transform group-hover:translate-x-2 transition-transform duration-300">
                      <div className="flex items-center gap-4">
                        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                          </svg>
                        </span>
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-medium">Submitted a proposal</span>
                          <span className="text-violet-600 text-sm">"E-commerce Website"</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-medium whitespace-nowrap">
                        2 hours ago
                      </span>
                    </div>
                  </li>

                  {/* Activity Item 2 */}
                  <li className="group ">
                    <div className=" inset-0 bg-gradient-to-r from-violet-500/0 to-indigo-500/0 group-hover:from-violet-500/5 group-hover:to-indigo-500/5 transition-all duration-300"></div>
                    <div className=" p-6 flex justify-between items-center gap-4 group-hover:transform group-hover:translate-x-2 transition-transform duration-300">
                      <div className="flex items-center gap-4">
                        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </span>
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-medium">Accepted a project</span>
                          <span className="text-violet-600 text-sm">"Logo Design"</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-medium whitespace-nowrap">
                        1 day ago
                      </span>
                    </div>
                  </li>

                  {/* Activity Item 3 */}
                  <li className="group ">
                    <div className=" inset-0 bg-gradient-to-r from-violet-500/0 to-indigo-500/0 group-hover:from-violet-500/5 group-hover:to-indigo-500/5 transition-all duration-300 rounded-b-xl"></div>
                    <div className=" p-6 flex justify-between items-center gap-4 group-hover:transform group-hover:translate-x-2 transition-transform duration-300">
                      <div className="flex items-center gap-4">
                        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </span>
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-medium">Profile updated</span>
                          <span className="text-violet-600 text-sm">Personal information changed</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-medium whitespace-nowrap">
                        3 days ago
                      </span>
                    </div>
                  </li>
                </ul>

                {/* Optional: View All Button */}
                <div className="mt-6 text-center">
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl 
                    border border-violet-200 text-violet-600 hover:bg-violet-50 
                    transition-all duration-300 group font-medium">
                    View All Activities
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </section>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default FHomepage;
