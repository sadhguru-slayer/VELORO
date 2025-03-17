import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView, useAnimate, useAnimation } from 'framer-motion';
import LoadingComponent from '../components/LoadingComponent';
import { verifyToken, refreshToken } from '../utils/auth';
import { IoLogIn } from "react-icons/io5";

import { 
  FaRocket, FaUsers, FaCog, FaChartLine, 
  FaLinkedin, FaTwitter, FaInstagram, FaArrowRight
} from 'react-icons/fa';

// First, move the useInViewAnimation hook to the very top, outside the component
// Make sure it's defined before the HomePage component
const useInViewAnimation = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, {
    threshold: 0.2,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return [ref, controls];
};

const HomePage = () => {
  // All state hooks first
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // All ref hooks next
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const featuresContainerRef = useRef(null);
  const stepsContainerRef = useRef(null);
  const testimonialsContainerRef = useRef(null);
  
  // All custom hooks next
  const [featuresRef, featuresControls] = useInViewAnimation();
  const [stepsRef, stepsControls] = useInViewAnimation();
  const [testimonialsRef, testimonialsControls] = useInViewAnimation();
  
  // Scroll progress hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // All transform hooks - MODIFIED to remove dependencies on smoothScrollProgress
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -30]);
  const featuresY = useTransform(scrollYProgress, [0.1, 0.3], [30, 0]);
  const stepsY = useTransform(scrollYProgress, [0.4, 0.6], [30, 0]);
  const testimonialsY = useTransform(scrollYProgress, [0.6, 0.8], [30, 0]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);
  const featuresScale = useTransform(scrollYProgress, [0.1, 0.3, 0.4], [0.98, 1, 1]);
  const stepsScale = useTransform(scrollYProgress, [0.3, 0.5, 0.6], [0.98, 1, 1]);
  const testimonialsScale = useTransform(scrollYProgress, [0.5, 0.7, 0.8], [0.98, 1, 1]);
  const heroRotate = useTransform(scrollYProgress, [0, 0.2], [0, -1]);
  const featuresRotate = useTransform(scrollYProgress, [0.1, 0.3], [-1, 0]);
  const stepsRotate = useTransform(scrollYProgress, [0.4, 0.6], [-1, 0]);
  const testimonialsRotate = useTransform(scrollYProgress, [0.6, 0.8], [-1, 0]);
  
  // MODIFIED: Use a static background color instead of transform
  const navbarBg = "rgba(255, 255, 255, 0.8)";
  
  // Navigation items
  const navItems = [
    { name: 'Home', ref: heroRef },
    { name: 'Features', ref: featuresContainerRef },
    { name: 'How It Works', ref: stepsContainerRef },
    { name: 'Testimonials', ref: testimonialsContainerRef }
  ];

  // All useEffect hooks
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      // Determine which section is currently in view
      for (const item of navItems) {
        if (item.ref.current) {
          const element = item.ref.current;
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
            setActiveSection(item.name.toLowerCase());
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkTokens = async () => {
      try {
        const token = Cookies.get('accessToken');
        const rToken = Cookies.get('refreshToken');

        if (!token || !rToken) {
          setLoading(false);
          return;
        }

        const isTokenValid = await verifyToken(token);

        if (!isTokenValid) {
          const newToken = await refreshToken(rToken);
          if (newToken) {
            Cookies.set('accessToken', newToken);
          } else {
            throw new Error('Token refresh failed');
          }
        }

        const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        });

        const { is_profiled, role } = response.data.user;

        if (role === 'client') {
          navigate('/client/homepage');
        } else {
          navigate('/freelancer/homepage');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    checkTokens();
  }, [navigate]);

  // Regular functions
  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };
  
  const scrollToSection = (ref) => {
    setMenuOpen(false);
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };


  return (
    <div ref={containerRef} className="relative max-h-fit h-fit overflow-hidden bg-[#F9FAFB] perspective-1000">
      {/* Animated Background */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
      >
        {/* Gradient overlay */}
        <div className="absolute overflow-x-hidden inset-0 bg-gradient-to-b from-white via-white to-transparent opacity-80" />
        
        {/* Abstract Shapes - MODIFIED to remove transform dependencies */}
        <motion.div 
          className="absolute top-0 overflow-x-hidden w-full h-full bg-violet-500/10 rounded-full filter blur-[120px] animate-pulse"
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full filter blur-[120px] animate-pulse delay-1000"
        />
        <motion.div 
          className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full filter blur-[80px] animate-pulse delay-500"
        />
      </motion.div>

      {/* Navigation Bar with Glassmorphism Effect */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10
                  bg-white/20 shadow-lg shadow-violet-500/5"
        style={{ 
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center"
            >
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-violet-800 to-teal-600 bg-clip-text text-transparent">
                Veloro
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.ref)}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative text-sm font-medium transition-colors ${
                    activeSection === item.name.toLowerCase() 
                      ? "text-violet-700" 
                      : "text-slate-700 hover:text-violet-600"
                  }`}
                >
                  {item.name}
                  {activeSection === item.name.toLowerCase() && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-teal-500"
                      layoutId="activeSection"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
              
              <div className="h-6 w-px bg-gray-300/50 mx-2" />
              
              <motion.button
                onClick={handleLogin}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                className="group px-5 py-2 bg-white/10 backdrop-blur-md rounded-full
                  border border-violet-500/20 
                  transition-all duration-300 ease-out
                  hover:shadow-lg hover:shadow-violet-500/10"
              >
                <span className="relative flex items-center gap-2">
                  <span className="bg-gradient-to-r from-violet-800 to-teal-600 
                    bg-clip-text text-transparent font-medium text-sm"
                  >
                    Login
                  </span>
                  <IoLogIn className="text-teal-600 text-sm transition-all duration-300 
                    ease-out transform group-hover:translate-x-0.5" 
                  />
                </span>
              </motion.button>

              <motion.button
                onClick={handleGetStarted}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 8px 16px rgba(124, 58, 237, 0.2)"
                }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2 bg-gradient-to-r from-violet-600 to-teal-500 
                  rounded-full text-white font-medium text-sm
                  transition-all duration-300 group"
              >
                <span className="flex items-center gap-2">
                  Get Started
                  <motion.span
                    className="transform group-hover:translate-x-0.5 transition-transform duration-300"
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-md text-gray-700 focus:outline-none"
              >
                <div className="w-6 flex flex-col gap-1.5">
                  <motion.div 
                    animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }}
                    className="h-0.5 bg-violet-700 rounded-full"
                  />
                  <motion.div 
                    animate={{ opacity: menuOpen ? 0 : 1 }}
                    className="h-0.5 bg-violet-700 rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }}
                    className="h-0.5 bg-violet-700 rounded-full"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu with Glassmorphism */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/30 backdrop-blur-xl border-t border-white/10"
            >
              <div className="px-6 py-4 space-y-4">
                {navItems.map((item) => (
                  <motion.button
                    key={item.name}
                    onClick={() => scrollToSection(item.ref)}
                    className={`block w-full text-left py-2 ${
                      activeSection === item.name.toLowerCase() 
                        ? "text-violet-700 font-medium" 
                        : "text-slate-700"
                    }`}
                  >
                    {item.name}
                  </motion.button>
                ))}
                <div className="pt-4 flex flex-col gap-3">
                  <motion.button
                    onClick={handleLogin}
                    className="w-full py-2.5 text-center border border-violet-500/20 rounded-lg
                      text-violet-700 font-medium bg-white/20 backdrop-blur-md"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    onClick={handleGetStarted}
                    className="w-full py-2.5 text-center bg-gradient-to-r from-violet-600 to-teal-500 
                      rounded-lg text-white font-medium"
                  >
                    Get Started
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* REMOVED: Standalone progress bar */}

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        style={{ 
          y: heroY, 
          scale: heroScale,
          rotateX: heroRotate
        }}
        className="relative min-h-screen flex items-center justify-center px-6 pt-20 will-change-transform overflow-x-hidden"
      >
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-violet-900 via-indigo-800 to-teal-800 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease: "easeOut" }}
            >
              Transform Your Future with Veloro
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-slate-700 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, ease: "easeOut" }}
            >
              Where Innovation Meets Excellence
            </motion.p>
            <motion.div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 12px 24px rgba(124, 58, 237, 0.25)"
                }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-teal-500 
                  rounded-full text-white font-medium shadow-lg 
                  hover:shadow-violet-500/25 transition-all duration-300 group"
              >
                <span className="flex items-center gap-2">
                  Get Started
                  <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </motion.button>

              <motion.button
                onClick={handleLogin}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                className="group px-8 py-4 bg-white/10 backdrop-blur-md 
                  rounded-full border border-violet-500/20 
                  transition-all duration-300 ease-out
                  hover:shadow-lg hover:shadow-violet-500/10"
              >
                <span className="relative flex items-center gap-2">
                  <span className="bg-gradient-to-r from-violet-800 to-teal-600 
                    bg-clip-text text-transparent font-medium"
                  >
                    Login
                  </span>
                  <IoLogIn className="text-teal-600 text-lg transition-all duration-300 
                    ease-out transform group-hover:translate-x-0.5" 
                  />
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex flex-col items-center"
            >
              <span className="text-sm text-gray-500 mb-2">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center p-1">
                <motion.div 
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-1.5 h-1.5 bg-violet-600 rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        ref={featuresContainerRef}
        style={{ 
          y: featuresY, 
          scale: featuresScale,
          rotateX: featuresRotate
        }}
        className="relative py-20 z-10 will-change-transform overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-violet-800 to-teal-700 bg-clip-text text-transparent mb-8"
          >
            Why Choose Veloro
          </motion.h2>
          
          <motion.div
            ref={featuresRef}
            initial="hidden"
            animate={featuresControls}
            variants={sectionVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="p-6 bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-300 shadow-lg group h-full"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-teal-500 mb-4 text-white text-xl">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <motion.p 
                  className="text-4xl font-bold bg-gradient-to-r from-violet-700 to-teal-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {stat.value}
                </motion.p>
                <motion.p 
                  className="text-slate-600 mt-2 font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {stat.label}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        ref={stepsContainerRef}
        style={{ 
          y: stepsY, 
          scale: stepsScale,
          rotateX: stepsRotate
        }}
        className="relative py-20 bg-gradient-to-b from-violet-900/5 to-transparent will-change-transform overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-violet-800 to-teal-700 bg-clip-text text-transparent mb-6"
          >
            How Veloro Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-center mb-16 max-w-2xl mx-auto"
          >
            Your success journey in three simple steps
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/20 via-teal-500/20 to-violet-500/20" />
            
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative p-6 bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg"
              >
                <motion.div 
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.2, type: "spring" }}
                >
                  {index + 1}
                </motion.div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-violet-800 mb-4 text-center">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-center">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        ref={testimonialsContainerRef}
        style={{ 
          y: testimonialsY, 
          scale: testimonialsScale,
          rotateX: testimonialsRotate
        }}
        className="relative py-20 will-change-transform overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-violet-800 to-teal-700 bg-clip-text text-transparent mb-6"
          >
            Success Stories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-center mb-16 max-w-2xl mx-auto"
          >
            Join thousands of satisfied professionals who've found success with Veloro
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="p-6 bg-white/90 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg group"
              >
                <div className="flex gap-1 mb-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400" />
                  <div>
                    <p className="text-slate-800 font-semibold">{testimonial.author}</p>
                    <p className="text-slate-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-b from-transparent to-violet-900/5 overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-800 to-teal-700 bg-clip-text text-transparent mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Join Veloro today and experience the future of professional freelancing.
              Your next big opportunity awaits.
            </p>
            <motion.button
              onClick={handleGetStarted}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 12px 24px rgba(124, 58, 237, 0.2)"
              }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex px-8 py-4 bg-gradient-to-r from-violet-600 to-teal-500 
                rounded-full text-white font-medium shadow-lg 
                hover:shadow-violet-500/25 transition-all duration-300 group"
            >
              <span className="flex items-center gap-2">
                Get Started Now
                <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/10 bg-white/50 backdrop-blur-sm overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerLinks.map((column, index) => (
              <div key={index}>
                <h3 className="text-slate-800 font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href="#"
                        className="text-gray-700 hover:text-gray-900 transition-colors duration-300"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-700">
              © 2024 Veloro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const stats = [
  { value: "20K+", label: "Active Freelancers" },
  { value: "15K+", label: "Completed Projects" },
  { value: "98%", label: "Success Rate" },
  { value: "$10M+", label: "Paid to Freelancers" }
];

const features = [
  {
    icon: "💫",
    title: "AI-Powered Matching",
    description: "Our advanced algorithms connect you with the perfect opportunities based on your skills and preferences."
  },
  {
    icon: "🤝",
    title: "Seamless Collaboration",
    description: "Built-in tools for real-time communication, file sharing, and project management."
  },
  {
    icon: "🔒",
    title: "Secure Payments",
    description: "Protected transactions with escrow service and milestone-based payment system."
  }
];

const steps = [
  {
    title: "Create Your Profile",
    description: "Build your professional profile highlighting your skills, experience, and portfolio. Let our AI optimize your visibility."
  },
  {
    title: "Connect & Collaborate",
    description: "Find perfect matches, engage with clients, and start working on exciting projects that align with your expertise."
  },
  {
    title: "Grow & Succeed",
    description: "Build your reputation, increase your earnings, and expand your professional network within our community."
  }
];

const testimonials = [
  {
    quote: "Veloro transformed my freelancing career. The quality of projects and clients is unmatched.",
    author: "Sarah Chen",
    role: "UX Designer"
  },
  {
    quote: "As a business owner, finding reliable talent has never been easier. Veloro's matching system is exceptional.",
    author: "Michael Rodriguez",
    role: "Startup Founder"
  },
  {
    quote: "The platform's collaborative tools and payment protection give me peace of mind with every project.",
    author: "David Kumar",
    role: "Full-Stack Developer"
  }
];

const footerLinks = [
  {
    title: "Platform",
    links: ["How it Works", "Features", "Pricing", "FAQ"]
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Blog", "Press"]
  },
  {
    title: "Resources",
    links: ["Support", "Documentation", "Terms of Service", "Privacy"]
  },
  {
    title: "Connect",
    links: ["Twitter", "LinkedIn", "Instagram", "Contact"]
  }
];

export default HomePage;
