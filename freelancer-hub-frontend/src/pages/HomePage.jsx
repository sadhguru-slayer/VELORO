import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView, useAnimate, useAnimation, useMotionValue, useVelocity, useAnimationFrame } from 'framer-motion';
import LoadingComponent from '../components/LoadingComponent';
import { verifyToken, refreshToken } from '../utils/auth';
import { IoLogIn } from "react-icons/io5";
import { Suspense, lazy } from 'react';

import { 
  FaRocket, FaUsers, FaCog, FaChartLine, 
  FaLinkedin, FaTwitter, FaInstagram, FaArrowRight
} from 'react-icons/fa';

// Update the useCursorTracking hook
const useCursorTracking = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(0, { stiffness: 100, damping: 20 });
  const smoothMouseY = useSpring(0, { stiffness: 100, damping: 20 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      mouseX.set(x);
      mouseY.set(y);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  
  useAnimationFrame(() => {
    smoothMouseX.set(mouseX.get());
    smoothMouseY.set(mouseY.get());
  });
  
  return { mouseX, mouseY, smoothMouseX, smoothMouseY };
};

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

// Update the Floating3DElement component
const Floating3DElement = ({ x, y, baseDelay, children, className, depth = 1 }) => {
  const float = useSpring({
    y: [0, -10, 0],
    config: { duration: 3000 + baseDelay * 500, loop: true }
  });
  
  const transform = useTransform(
    [x, y], 
    ([latestX, latestY]) => `perspective(1000px) 
      rotateX(${(latestY - 0.5) * 5 * depth}deg) 
      rotateY(${(latestX - 0.5) * -10 * depth}deg)
      translateZ(${depth * 10}px)`
  );
  
  return (
    <motion.div 
      className={`transform-gpu ${className}`}
      style={{ transform, ...float }}
    >
      {children}
    </motion.div>
  );
};

// Lazy load 3D components
const Scene3D = lazy(() => import('../components/Scene3D'));

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

  // Add cursor tracking
  const { mouseX, mouseY, smoothMouseX, smoothMouseY } = useCursorTracking();

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

  // Add hero content movement based on cursor
  const heroContentX = useTransform(smoothMouseX, [0, 1], [-15, 15]);
  const heroContentY = useTransform(smoothMouseY, [0, 1], [-10, 10]);
  const heroDepth = useTransform(smoothMouseX, [0, 1], [1.05, 0.95]);

  return (
    <div ref={containerRef} className="relative max-h-fit h-fit overflow-hidden bg-[#F9FAFB] perspective-1000">
      {/* Animated Background with 3D Layers */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
      >
        {/* Gradient overlay */}
        <div className="absolute overflow-x-hidden inset-0 bg-gradient-to-b from-white via-white to-transparent opacity-80" />
        
        {/* 3D Floating Abstract Shapes */}
        <div className="perspective-1000 relative w-full h-full">
          <motion.div 
            style={{
              x: useTransform(smoothMouseX, [0, 1], [-20, 20]),
              y: useTransform(smoothMouseY, [0, 1], [-20, 20]),
            }}
            className="absolute top-0 left-0 w-full h-full transform-gpu"
          >
        <motion.div 
          className="absolute top-0 overflow-x-hidden w-full h-full bg-violet-500/10 rounded-full filter blur-[120px] animate-pulse"
              style={{ 
                translateZ: useTransform(smoothMouseY, [0, 1], [20, -20])
              }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full filter blur-[120px] animate-pulse delay-1000"
              style={{ 
                translateZ: useTransform(smoothMouseX, [0, 1], [-30, 30]) 
              }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full filter blur-[80px] animate-pulse delay-500"
              style={{ 
                translateZ: useTransform(smoothMouseX, [0, 1], [50, -50]) 
              }}
        />
          </motion.div>
        </div>
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
                Talintz
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

      {/* Hero Section - Streamlined with Professional Appeal */}
      <motion.section 
        ref={heroRef}
        style={{
          y: heroY, 
            scale: heroScale,
          rotateX: heroRotate
          }}
        className="relative min-h-screen flex items-center overflow-hidden will-change-transform"
        >
        {/* Simplified Background with subtle movement */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50/80 via-white/90 to-white/70"></div>
          
          {/* Simplified abstract shapes with reduced motion */}
          <motion.div
            className="absolute -top-20 -right-20 w-[40%] h-[40%] rounded-full bg-violet-200/20 filter blur-[80px]"
            animate={{ scale: [1, 1.03, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-20 -left-20 w-[40%] h-[40%] rounded-full bg-teal-200/20 filter blur-[80px]"
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>
        
        {/* Content container */}
        <div className="container mx-auto px-6 py-16 md:py-24 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            {/* Left column: Text content (wider) */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-violet-100 border border-violet-200">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-600 to-teal-500 mr-2"></span>
                <span className="text-sm font-medium text-violet-800">Introducing Talint</span>
              </div>
              
              {/* Headline - Strong and clear value proposition */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-slate-900 leading-tight">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500">Smarter Way</span> to Collaborate on Projects
              </h1>
              
              {/* Subheadline - Focus on trust and solution */}
              <p className="text-lg md:text-xl text-slate-700 mb-8 max-w-2xl">
                Talintz brings freelancers and clients together with powerful collaboration tools, secure workflows, and AI-driven insights — launching soon to transform how teams work.
              </p>
              
              {/* Trust indicators rather than historical stats */}
              <div className="grid grid-cols-3 md:grid-cols-3 gap-3 mb-8 max-w-xl">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-violet-100/30 shadow-sm">
                  <div className="flex items-center justify-center h-10 w-10 mb-2 rounded-full bg-violet-100 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-violet-600">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-center text-sm font-medium text-slate-800">Enterprise-grade Security</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-violet-100/30 shadow-sm">
                  <div className="flex items-center justify-center h-10 w-10 mb-2 rounded-full bg-violet-100 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-violet-600">
                      <path d="M16.5 7.5h-9v9h9v-9z" />
                      <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-center text-sm font-medium text-slate-800">AI-Powered Insights</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-violet-100/30 shadow-sm">
                  <div className="flex items-center justify-center h-10 w-10 mb-2 rounded-full bg-violet-100 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-violet-600">
                      <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                    </svg>
                  </div>
                  <p className="text-center text-sm font-medium text-slate-800">Student Program</p>
                </div>
              </div>
              
              {/* Early access form - build anticipation */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-violet-100/40 shadow-sm mb-8 max-w-xl">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Join the Waitlist</h3>
                <p className="text-sm text-slate-600 mb-4">Be among the first to experience Talintz when we launch.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="px-4 py-3 rounded-lg border border-violet-200 flex-grow focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-colors"
                  />
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-teal-500 rounded-lg text-white font-medium shadow-sm"
                  >
                    Get Early Access
                  </motion.button>
                </div>
              </div>
              
              {/* CTA Buttons - simplified */}
              <div className="flex flex-wrap gap-4">
              <motion.button
                onClick={handleGetStarted}
                whileTap={{ scale: 0.98 }}
                  className="px-7 py-3 bg-gradient-to-r from-violet-600 to-teal-500 
                    rounded-lg text-white font-medium shadow-md
                    transition-shadow duration-300 hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                    Learn More
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                </span>
              </motion.button>

              <motion.button
                onClick={handleLogin}
                whileTap={{ scale: 0.98 }}
                  className="px-7 py-3 bg-white 
                    rounded-lg text-violet-700 font-medium border border-violet-200
                    transition-all duration-300 hover:border-violet-300 hover:bg-violet-50"
                >
                  <span className="flex items-center gap-2">
                    Watch Demo
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                </span>
              </motion.button>
              </div>
            </div>
            
            {/* Right column: Visual content (platform preview) */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="relative">
                {/* Platform mockup showcase */}
                <div className="relative bg-white backdrop-filter backdrop-blur-sm shadow-xl rounded-2xl border border-violet-100/60 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-violet-500/5 to-teal-500/5 border-b border-violet-100/30 flex items-center px-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="mx-auto text-sm font-medium text-slate-500">Talintz Collaboration Dashboard</div>
                  </div>
                  <div className="pt-12 p-2">
                    <img 
                      src="https://placehold.co/600x400/f5f3ff/6d28d9?text=Veloro+Platform+Preview&font=open-sans" 
                      alt="Talintz Platform Preview" 
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex gap-2 mb-3">
                      <div className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">Team Chat</div>
                      <div className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-medium">Tasks</div>
                      <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">Files</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-slate-200 rounded-full w-full"></div>
                      <div className="h-2 bg-slate-200 rounded-full w-3/4"></div>
                      <div className="h-2 bg-slate-200 rounded-full w-1/2"></div>
                    </div>
                  </div>
                </div>
                
                {/* Floating feature highlights */}
          <motion.div 
                  className="absolute -top-6 -right-6 px-4 py-2 bg-white rounded-lg shadow-lg border border-violet-100"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-violet-100">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-violet-600">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-slate-800">End-to-end encryption</span>
                  </div>
                </motion.div>
                
            <motion.div
                  className="absolute -bottom-4 -left-4 px-4 py-2 bg-white rounded-lg shadow-lg border border-teal-100"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-teal-100">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-teal-600">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-slate-800">Tiered collaboration</span>
              </div>
          </motion.div>
              </div>
              
              {/* Coming soon badge */}
              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-teal-100 border border-violet-200/50">
                  <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-violet-500"></span>
                  <span className="text-sm font-medium bg-gradient-to-r from-violet-700 to-teal-600 inline-block text-transparent bg-clip-text">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust indicators - logos section */}
          <div className="mt-16 md:mt-24 border-t border-slate-200/50 pt-10">
            <p className="text-center text-sm text-slate-500 mb-6">BACKED BY INDUSTRY EXPERTS</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
              <svg width="124" height="24" viewBox="0 0 124 24" className="text-slate-400">
                <rect width="124" height="24" fill="currentColor" fillOpacity="0.2" rx="4"/>
              </svg>
              <svg width="94" height="24" viewBox="0 0 94 24" className="text-slate-400">
                <rect width="94" height="24" fill="currentColor" fillOpacity="0.2" rx="4"/>
              </svg>
              <svg width="144" height="24" viewBox="0 0 144 24" className="text-slate-400">
                <rect width="144" height="24" fill="currentColor" fillOpacity="0.2" rx="4"/>
              </svg>
              <svg width="104" height="24" viewBox="0 0 104 24" className="text-slate-400">
                <rect width="104" height="24" fill="currentColor" fillOpacity="0.2" rx="4"/>
              </svg>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section with 3D Cards */}
      <motion.section 
        ref={featuresContainerRef}
        style={{ 
          y: featuresY, 
          scale: featuresScale,
          rotateX: featuresRotate
        }}
        className="relative py-20 z-10 will-change-transform overflow-x-hidden perspective-1000"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-violet-800 to-teal-700 bg-clip-text text-transparent mb-8"
          >
            Why Choose Talintz
          </motion.h2>
          
          <motion.div 
            ref={featuresRef}
            initial="hidden"
            animate={featuresControls}
            variants={sectionVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 perspective-1000"
          >
            {updatedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                style={{
                  transformStyle: "preserve-3d",
                  x: useTransform(
                    smoothMouseX, 
                    [0, 1], 
                    [index === 0 ? -10 : index === 2 ? 10 : 0, index === 0 ? 10 : index === 2 ? -10 : 0]
                  ),
                  y: useTransform(
                    smoothMouseY, 
                    [0, 1], 
                    [-5, 5]
                  )
                }}
                whileHover={{ 
                  z: 30,
                  rotateY: [0, 2, -2, 0],
                  transition: { duration: 0.5 }
                }}
                className="p-6 bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 hover:bg-white/90 
                  transition-all duration-300 shadow-lg group h-full transform-gpu"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-xl 
                  bg-gradient-to-r from-violet-600 to-teal-500 mb-4 text-white text-xl transform-gpu"
                  style={{ transformStyle: "preserve-3d", translateZ: 20 }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-700 to-indigo-600 
                  bg-clip-text text-transparent mb-3 transform-gpu"
                  style={{ transformStyle: "preserve-3d", translateZ: 15 }}
                >
                  {feature.title}
                </h3>
                <p className="text-slate-600 transform-gpu"
                  style={{ transformStyle: "preserve-3d", translateZ: 10 }}
                >
                  {feature.description}
                </p>
                
                {/* Feature badge */}
                {feature.tier && (
                  <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100/70 text-violet-800">
                    {feature.tier === 'all' ? 'All Tiers' : `${feature.tier}+`}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
            
          {/* Stats Section with floating effect */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 perspective-1000">
            {updatedStats.map((stat, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{
                  x: useTransform(smoothMouseX, [0, 1], [-5, 5]),
                  y: useTransform(smoothMouseY, [0, 1], [-5, 5]),
                  rotate: useTransform(
                    [smoothMouseX, smoothMouseY],
                    ([x, y]) => (x - 0.5) * (y - 0.5) * 3
                  )
                }}
                className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 transform-gpu"
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
            Seamless Collaboration Flow
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-center mb-16 max-w-2xl mx-auto"
          >
            Our intuitive platform guides you through every step of the project lifecycle
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/20 via-teal-500/20 to-violet-500/20" />
            
            {updatedSteps.map((step, index) => (
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
                  <h3 className="text-lg font-semibold text-violet-800 mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-center text-sm">
                    {step.description}
                  </p>
              </div>
            </motion.div>
            ))}
          </div>
          
          {/* AI Assistant Callout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-20 p-6 bg-gradient-to-r from-violet-100/50 to-teal-100/50 backdrop-blur-sm rounded-xl border border-white/30 relative overflow-hidden"
          >
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-r from-violet-300/20 to-teal-300/20 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-teal-500 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                  <path d="M16.5 7.5h-9v9h9v-9z" />
                  <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-violet-700 to-teal-600 bg-clip-text text-transparent mb-2">
                  Meet Nova AI - Your Intelligent Assistant
                </h3>
                <p className="text-slate-700">
                  Our AI-powered assistant helps track progress, suggests optimal task distribution, and provides insights to keep your projects on time and within budget.
                </p>
          </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-teal-500 rounded-full text-white font-medium shadow-lg flex-shrink-0"
              >
                Try Talintz AI
              </motion.button>
        </div>
          </motion.div>
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
            See how our collaborative platform is transforming the way professionals work together
              </motion.p>
              
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {updatedTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="p-6 bg-white/90 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-violet-100 text-violet-800">
                    {testimonial.userType}
                  </span>
                </div>
                <p className="text-slate-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 flex items-center justify-center text-white font-medium">
                    {testimonial.author.charAt(0)}
                  </div>
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
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
              className="text-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-800 to-teal-700 bg-clip-text text-transparent mb-6">
                Ready to Transform Your Collaboration?
            </h2>
              <p className="text-slate-600 mb-8 max-w-2xl">
                Join Talintz today and experience the future of professional freelancing with our tiered collaboration platform. Connect, create, and succeed together.
              </p>
              
              <div className="space-y-4">
                {ctaFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 flex-shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-teal-500 flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                    <p className="text-slate-700">{feature}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 flex flex-wrap gap-4">
                <motion.button
              onClick={handleGetStarted}
              whileHover={{ 
                    scale: 1.03,
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
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex px-8 py-4 bg-white/80 backdrop-blur-sm
                    rounded-full text-violet-700 font-medium border border-violet-200
                    hover:shadow-lg transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    View Pricing
                  </span>
                </motion.button>
              </div>
              </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-violet-50 to-teal-50 rounded-2xl p-6 border border-white/50 shadow-xl">
                <div className="absolute -top-5 -right-5 transform rotate-6">
                  <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-violet-100 text-violet-700 font-medium">
                    Student Program Available!
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="rounded-xl bg-white/80 p-4 border border-violet-100/30 flex flex-col">
                    <h3 className="text-violet-800 font-medium mb-2">Tiered Features</h3>
                    <ul className="text-xs text-slate-600 space-y-2 flex-grow">
                      <li className="flex items-center gap-1">
                        <span className="text-teal-500">✓</span> Real-time messaging
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="text-teal-500">✓</span> File sharing
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="text-teal-500">✓</span> Task management
                      </li>
                    </ul>
                    <div className="text-center mt-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-violet-100 text-violet-800">
                        Starter
                      </span>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-teal-500/10 p-4 border border-white/30 flex flex-col">
                    <h3 className="text-violet-800 font-medium mb-2">Pro Collaboration</h3>
                    <ul className="text-xs text-slate-600 space-y-2 flex-grow">
                      <li className="flex items-center gap-1">
                        <span className="text-teal-500">✓</span> Extended history
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="text-teal-500">✓</span> AI insights
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="text-teal-500">✓</span> Video meetings
                      </li>
                    </ul>
                    <div className="text-center mt-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-violet-600 to-teal-500 text-white">
                        Pro & Elite
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 rounded-xl bg-white/80 p-4 border border-violet-100/30 flex items-center justify-between">
                    <div>
                      <h3 className="text-violet-800 font-medium mb-1">Nova AI Assistant</h3>
                      <p className="text-xs text-slate-600">AI-powered progress tracking and insights</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-teal-500 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M16.5 7.5h-9v9h9v-9z" />
                        <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
            </div>
          </motion.div>
          </div>
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
              © 2024 Talintz. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const updatedStats = [
  { value: "20K+", label: "Active Users" },
  { value: "15K+", label: "Completed Projects" },
  { value: "3.2M", label: "Collaboration Hours" },
  { value: "98%", label: "Satisfaction Rate" }
];

const updatedFeatures = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-7.152.52c-2.43 0-4.817-.178-7.152-.52C2.87 16.438 1.5 14.706 1.5 12.76V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
      <path d="M19.5 22.5c-1.414 0-2.5-1.119-2.5-2.5v-2.732a48.827 48.827 0 001.084-.145 2.452 2.452 0 001.416-1.2 2.445 2.445 0 00.176-1.876 2.448 2.448 0 00-.506-.847 2.449 2.449 0 00-.81-.554 2.45 2.45 0 00-.944-.18c-.31 0-.613.07-.891.205.272-.688.453-1.41.535-2.17a3.25 3.25 0 00-1.642-3.115 3.257 3.257 0 00-1.597-.457c-.824 0-1.592.288-2.195.831a17.754 17.754 0 00-.821.77c-.212-.181-.431-.35-.659-.504a3.254 3.254 0 00-1.904-.551 3.26 3.26 0 00-1.597.457A3.25 3.25 0 005.5 9.5c0 .196.17.39.05.582-.262-.238-.534-.462-.814-.67a3.245 3.245 0 00-1.879-.574 3.256 3.256 0 00-1.879.585A3.254 3.254 0 00.5 11.5c0 .426.085.825.236 1.188.136.332.32.64.548.91-.096-.012-.192-.018-.29-.018a2.452 2.452 0 00-1.666.674 2.45 2.45 0 00-.666 1.776c0 .617.237 1.224.666 1.667.265.267.592.459.948.576.284.092.58.131.877.131.183 0 .365-.024.541-.07V20c0 1.381 1.086 2.5 2.5 2.5h13z" />
    </svg>,
    title: "Tiered Group Chats",
    description: "Collaborate seamlessly with different tiers of access – from basic messaging to advanced project management and AI insights.",
    tier: 'all'
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
    </svg>,
    title: "Project Collaboration",
    description: "Real-time task management, file sharing, and multi-freelancer workflows designed for complex projects and teams.",
    tier: 'Pro'
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M18.75 12.75h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013 12zM9 3.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM9 15.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
    </svg>,
    title: "Nova AI Insights",
    description: "AI-powered analytics track project progress, optimize task distribution, and provide actionable recommendations.",
    tier: 'Elite'
  }
];

const updatedSteps = [
  {
    title: "Project Creation",
    description: "Clients create projects and invite freelancers to collaborate in a dedicated group space."
  },
  {
    title: "Task Discussion",
    description: "Teams discuss requirements, share files, and assign responsibilities in real-time."
  },
  {
    title: "Real-Time Updates",
    description: "Collaborators share progress updates, ask questions, and provide feedback instantly."
  },
  {
    title: "Resource Management",
    description: "Files, links, and tasks are organized and easily accessible for the entire team."
  },
  {
    title: "Project Completion",
    description: "Once completed, projects are archived but remain accessible for future reference."
  }
];

const updatedTestimonials = [
  {
    quote: "The tiered collaboration system made it easy to manage complex projects with multiple freelancers. The real-time updates saved us countless hours of back-and-forth.",
    author: "Michael Rodriguez",
    role: "Project Manager, TechCorp",
    userType: "Client"
  },
  {
    quote: "As a freelance developer, Talintz has revolutionized how I collaborate with clients and other freelancers. The integrated chat and task system keeps everything organized.",
    author: "Sarah Chen",
    role: "Full Stack Developer",
    userType: "Freelancer"
  },
  {
    quote: "The student program helped me gain real-world experience while still in college. I built my portfolio and connected with amazing clients before graduation.",
    author: "David Kumar",
    role: "UI/UX Designer",
    userType: "Student"
  }
];

const ctaFeatures = [
  "Tiered collaboration tools for projects of any size",
  "AI-powered progress tracking and insights",
  "Secure file sharing and organized project resources",
  "Seamless communication between clients and freelancers",
  "Special programs for students and emerging professionals"
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
