import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView, useAnimation, useMotionValue, useAnimationFrame, useMotionValueEvent } from 'framer-motion';
import { verifyToken, refreshToken } from '../utils/auth';
import { IoLogIn } from "react-icons/io5";

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
// const Scene3D = lazy(() => import('../components/Scene3D'));

// At the top of the file, add a custom smooth scroll hook 
const useSmoothScroll = () => {
  useEffect(() => {
    // Implement smooth scrolling
    const handleLinkClick = (e) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);
};

// Optimize the horizontal scroll hook with smoother transitions and better snap points
const useHorizontalScroll = (containerRef) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Smoother transform with improved timing
  const horizontalScrollX = useTransform(
    scrollYProgress,
    [0, 0.1, 0.9, 1], // Better control points
    ["0%", "0%", "-75%", "-75%"] // Smoother transitions with delayed start/end
  );

  return { horizontalScrollX, scrollYProgress };
};

// Optimize the sticky parallax hook with less aggressive transforms
const useStickyParallax = (ref) => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  // Less intense parallax values
  const opacity = useTransform(scrollYProgress, [0, 0.8, 0.9, 1], [1, 1, 0.9, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.02, 1.05]); // Reduced scale values
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]); // Less vertical movement
  
  return { opacity, scale, y, scrollYProgress };
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
  
  // All custom hooks next
  const [featuresRef, featuresControls] = useInViewAnimation();
  const [stepsRef, stepsControls] = useInViewAnimation();
  
  // Scroll progress hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // All transform hooks - MODIFIED to remove dependencies on smoothScrollProgress
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -30]);
  const featuresY = useTransform(scrollYProgress, [0.1, 0.3], [30, 0]);
  const stepsY = useTransform(scrollYProgress, [0.4, 0.6], [30, 0]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  // const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);
  const featuresScale = useTransform(scrollYProgress, [0.1, 0.3, 0.4], [0.98, 1, 1]);
  const stepsScale = useTransform(scrollYProgress, [0.3, 0.5, 0.6], [0.98, 1, 1]);
  const heroRotate = useTransform(scrollYProgress, [0, 0.2], [0, -1]);
  const featuresRotate = useTransform(scrollYProgress, [0.1, 0.3], [-1, 0]);
  const stepsRotate = useTransform(scrollYProgress, [0.4, 0.6], [-1, 0]);
  
  // MODIFIED: Use a static background color instead of transform
  const navbarBg = "rgba(255, 255, 255, 0.8)";
  
  // Navigation items
  const navItems = [
    { name: 'Home', ref: heroRef },
    { name: 'Features', ref: featuresContainerRef },
    { name: 'How It Works', ref: stepsContainerRef }
  ];

  // Add cursor tracking
  const { mouseX, mouseY, smoothMouseX, smoothMouseY } = useCursorTracking();

  // Add refs for new scroll features
  const horizontalSectionRef = useRef(null);
  const stickyHeroRef = useRef(null);
  const featuresWrapperRef = useRef(null);
  const timelineRef = useRef(null);
  
  // Add scroll hooks for advanced effects
  const { horizontalScrollX } = useHorizontalScroll(horizontalSectionRef);
  const { opacity: heroOpacity, scale: heroScale, y: heroParallaxY } = useStickyParallax(stickyHeroRef);
  
  // Optimize main scroll progress with higher stiffness and damping for smoother transitions
  const { scrollYProgress: mainScrollProgress } = useScroll({ restDelta: 0.001 }); // Add restDelta for smoother progress
  const smoothMainScrollProgress = useSpring(mainScrollProgress, { 
    stiffness: 50, // Lower stiffness for smoother motion
    damping: 40,   // Higher damping to reduce oscillation
    mass: 0.8      // Reduced mass for less momentum
  });
  
  // Improve timeline section to avoid skipping
  useMotionValueEvent(smoothMainScrollProgress, "change", (latest) => {
    // Wider range to ensure complete animations
    if (latest > 0.35 && latest < 0.75) {
      const timelineProgress = (latest - 0.35) / 0.4; // normalize to 0-1 range with wider bounds
      const stepIndex = Math.min(Math.floor(timelineProgress * updatedSteps.length), updatedSteps.length - 1);
      
      // Only update if actually changing to avoid rerenders
      if (stepIndex !== currentTimelineStep) {
        setCurrentTimelineStep(stepIndex);
      }
    }
  });

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

  // Add the smooth scroll hook
  useSmoothScroll();

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

      {/* Optimized Navigation Bar - reduce transform complexity */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10"
        style={{ 
          backgroundColor: useTransform(
            smoothMainScrollProgress,
            [0, 0.1],
            ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.9)"]
          ),
          backdropFilter: "blur(12px)",
          boxShadow: useTransform(
            smoothMainScrollProgress,
            [0, 0.1],
            ["0 0 0 rgba(124, 58, 237, 0)", "0 4px 20px rgba(124, 58, 237, 0.15)"]
          ),
          // Replace transform with opacity for better performance
          opacity: useTransform(
            smoothMainScrollProgress,
            [0, 0.05],
            [0, 1]
          ),
          // Use fixed position instead of transform for better performance
          top: 0,
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
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

      {/* Simplified Hero Section - reduced animations */}
      <motion.section 
        ref={stickyHeroRef}
        className="relative min-h-screen flex items-center overflow-hidden will-change-transform"
        style={{
          opacity: heroOpacity,
        }}
      >
        <motion.div 
          className="absolute inset-0 -z-10 overflow-hidden transform-gpu"
          style={{
            scale: heroScale,
            y: heroParallaxY,
          }}
        >
          {/* Simplified background with fewer animated elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50/80 via-white/90 to-white/70"></div>
          
          {/* Reduced number of animated background elements */}
          <motion.div
            className="absolute -top-20 -right-20 w-[60%] h-[60%] rounded-full bg-violet-200/20 filter blur-[120px]"
            style={{
              // Use simpler transform with less aggressive values
              y: useTransform(smoothMainScrollProgress, [0, 0.5], ["0%", "-10%"]),
              // Avoid multiple transforms for better performance
            }}
            // Replace animating scale with static scale
            initial={{ scale: 1 }}
          />
          <motion.div 
            className="absolute -bottom-20 -left-20 w-[60%] h-[60%] rounded-full bg-teal-200/20 filter blur-[120px]"
            style={{
              // Use simpler transform with less aggressive values
              y: useTransform(smoothMainScrollProgress, [0, 0.5], ["0%", "10%"]),
            }}
            // Replace animating scale with static scale
            initial={{ scale: 1 }}
          />
        </motion.div>
        
        {/* Hero content with simplified transforms */}
        <div className="container mx-auto px-6 py-16 md:py-24 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            {/* Simplified left column animations */}
            <motion.div 
              className="lg:col-span-7 order-2 lg:order-1 transform-gpu"
              initial={{ opacity: 0, y: 50 }} // Reduced distance
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }} // Simpler easing
              style={{
                // Simplify transforms to only what's necessary
                opacity: useTransform(smoothMainScrollProgress, [0, 0.4], [1, 0.2]),
              }}
            >
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-violet-100 border border-violet-200 transform-gpu">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-600 to-teal-500 mr-2"></span>
                <span className="text-sm font-medium text-violet-800">Introducing Veloro</span>
              </div>
              
              {/* Headline - Enhanced with 3D text */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-slate-900 leading-tight text-3d">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500">Smarter Way</span> to Collaborate on Projects
              </h1>
              
              {/* Subheadline - Focus on trust and solution */}
              <p className="text-lg md:text-xl text-slate-700 mb-8 max-w-2xl">
                Veloro brings freelancers and clients together with powerful collaboration tools, secure workflows, and AI-driven insights — launching soon to transform how teams work.
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
                      <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75v.75h.75a3 3 0 013 3v.75H21a.75.75 0 010 1.5h-.75v2.25H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
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
                <p className="text-sm text-slate-600 mb-4">Be among the first to experience Veloro when we launch.</p>
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
            </motion.div>
            
            {/* Simplified right column animation */}
            <motion.div 
              className="lg:col-span-5 order-1 lg:order-2 transform-gpu"
              style={{
                // Reduce the number of transforms
                opacity: useTransform(smoothMainScrollProgress, [0, 0.4], [1, 0.2]),
                // Use more moderate rotation values 
                rotateY: useTransform(smoothMouseX, [0, 1], [-5, 5]), // Reduced from [-10, 10]
                rotateX: useTransform(smoothMouseY, [0, 1], [2, -2]), // Reduced from [5, -5]
              }}
            >
              <div className="relative">
                {/* Platform mockup showcase */}
                <div className="relative bg-white backdrop-filter backdrop-blur-sm shadow-xl rounded-2xl border border-violet-100/60 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-violet-500/5 to-teal-500/5 border-b border-violet-100/30 flex items-center px-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="mx-auto text-sm font-medium text-slate-500">Veloro Collaboration Dashboard</div>
                  </div>
                  <div className="pt-12 p-2">
                    <img 
                      src="https://placehold.co/600x400/f5f3ff/6d28d9?text=Veloro+Platform+Preview&font=open-sans" 
                      alt="Veloro Platform Preview" 
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
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Improved Horizontal Scrolling Features Section with better sticky behavior */}
      <section 
        ref={horizontalSectionRef} 
        className="relative h-[400vh] overflow-hidden"
      >
        {/* Add will-change to optimize performance */}
        <div className="sticky top-0 h-screen flex items-center overflow-hidden will-change-transform">
          <motion.div 
            className="flex flex-nowrap items-stretch gap-8 px-[10vw] transform-gpu"
            style={{ x: horizontalScrollX }}
            // Add transition to ensure smooth movement
            transition={{ ease: "linear" }}
          >
            {/* Feature cards - simplify hover animations */}
            {updatedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-[80vw] md:w-[45vw] lg:w-[30vw] h-full p-8 bg-white/90 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg transform-gpu"
                style={{
                  transformStyle: "preserve-3d",
                }}
                whileHover={{ 
                  z: 20, // Reduced value
                  scale: 1.02, // Simpler transform
                }}
              >
                {/* Simplified 3D transforms with better performance */}
                <motion.div
                  className="w-16 h-16 flex items-center justify-center rounded-xl 
                    bg-gradient-to-r from-violet-600 to-teal-500 mb-6 text-white text-2xl transform-gpu"
                  style={{ 
                    // Use single transform property for better performance
                    translateZ: 20, // Reduced value
                  }}
                >
                  {feature.icon}
                </motion.div>
                
                {/* Simplified feature content */}
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-violet-700 to-indigo-600 
                  bg-clip-text text-transparent mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 mb-6 text-lg">
                  {feature.description}
                </p>
                
                {feature.tier && (
                  <div className="mt-auto inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
                    {feature.tier === 'all' ? 'All Tiers' : `${feature.tier}+`}
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Final call-to-action card */}
            <motion.div
              className="flex-shrink-0 w-[80vw] md:w-[45vw] lg:w-[30vw] h-full p-8 bg-gradient-to-br from-violet-600/90 to-teal-500/90 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg text-white flex flex-col justify-center items-center transform-gpu"
            >
              <h3 className="text-3xl font-bold mb-6 text-center">Ready to Experience More?</h3>
              <p className="text-lg mb-8 text-white/80 text-center">
                Discover all the powerful features Veloro has to offer
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }} // Reduced scale
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white rounded-full text-violet-700 font-semibold shadow-xl"
              >
                Explore All Features
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Improved Timeline Section with better sticky behavior */}
      <section ref={timelineRef} className="relative py-20 min-h-[120vh]"> {/* Slightly reduced height */}
        <motion.div 
          className="sticky top-[20vh] px-6 max-w-7xl mx-auto transform-gpu"
          style={{
            // More gradual opacity transition
            opacity: useTransform(
              smoothMainScrollProgress,
              [0.35, 0.4, 0.7, 0.75],
              [0, 1, 1, 0]
            )
          }}
        >
          <motion.h2
            className="text-3d text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-violet-800 to-teal-700 bg-clip-text text-transparent mb-16"
          >
            Your Project Journey
          </motion.h2>
          
          {/* Smoother timeline progress bar */}
          <div className="relative h-2 bg-violet-100/50 rounded-full mb-16 overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-violet-600 to-teal-500 rounded-full transform-gpu"
              style={{ 
                width: useTransform(
                  smoothMainScrollProgress,
                  [0.35, 0.7], // Expanded range
                  ["0%", "100%"]
                )
              }}
              // Add transition for smoother animation
              transition={{ ease: "linear" }}
            />
            
            {/* Simplified timeline step indicators */}
            {updatedSteps.map((_, index) => (
              <motion.div 
                key={index}
                className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                  index <= currentTimelineStep 
                    ? "bg-gradient-to-r from-violet-600 to-teal-500 border-white" 
                    : "bg-white border-violet-200"
                }`}
                style={{ 
                  left: `${(index / (updatedSteps.length - 1)) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  boxShadow: index <= currentTimelineStep ? "0 0 15px rgba(124, 58, 237, 0.5)" : "none"
                }}
              />
            ))}
          </div>
          
          {/* Current step content with simplified animations */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTimelineStep}
              initial={{ opacity: 0, y: 15 }} // Reduced distance
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }} // Reduced distance
              transition={{ duration: 0.4 }} // Shorter duration
              className="max-w-3xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-lg transform-gpu"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-r from-violet-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                  {currentTimelineStep + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-violet-800 mb-3">
                    {updatedSteps[currentTimelineStep].title}
                  </h3>
                  <p className="text-slate-700 text-lg">
                    {updatedSteps[currentTimelineStep].description}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Optimize Stats Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-teal-500/5 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }} // Increased margin
            transition={{ duration: 0.5 }}
            className="text-3d text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-violet-800 to-teal-700 bg-clip-text text-transparent mb-16"
          >
            Platform Impact
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 perspective-1200">
            {updatedStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, rotateY: 45 }} // Reduced rotation 
                whileInView={{ opacity: 1, rotateY: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.6, // Reduced duration
                  type: "spring",
                  stiffness: 80,
                  damping: 20
                }}
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: index % 2 === 0 ? "left" : "right",
                }}
                // Remove hover animation causing stuttering
                className="relative bg-white/90 backdrop-blur-xl rounded-xl p-8 border border-white/20 shadow-xl transform-gpu"
              >
                {/* Static 3D effect with no hover animation */}
                <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-700 to-teal-600 bg-clip-text text-transparent mb-2"
                  style={{ transform: "translateZ(15px)" }}>
                  {stat.value}
                </h3>
                
                <p className="text-slate-600 font-medium text-lg"
                  style={{ transform: "translateZ(5px)" }}>
                  {stat.label}
                </p>
                
                {/* Simple decorative element */}
                <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-gradient-to-tr from-violet-500/20 to-teal-500/20 rounded-full blur-xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section with 3D Depth and Parallax */}
      <section className="relative py-32 overflow-hidden">
        <motion.div 
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.1) 0%, rgba(255, 255, 255, 0) 70%)",
            y: useTransform(smoothMainScrollProgress, [0.7, 1], ["20%", "0%"]),
            scale: useTransform(smoothMainScrollProgress, [0.7, 1], [1.2, 1]),
            opacity: useTransform(smoothMainScrollProgress, [0.7, 0.8, 1], [0, 1, 1]),
          }}
        />
        
        <div className="max-w-6xl mx-auto px-4 perspective-1200">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/30 shadow-2xl overflow-hidden relative"
          >
            {/* Background decorative elements */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
            
            <div className="relative">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-3d text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-violet-800 to-teal-700 bg-clip-text text-transparent mb-8"
              >
                Take Your Collaboration to the Next Level
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-slate-700 text-xl text-center mb-12 max-w-2xl mx-auto"
              >
                Join the future of professional work with powerful tools designed for modern teams. Get early access today.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto"
              >
                <input 
                  type="email" 
                  placeholder="Enter your work email" 
                  className="w-full px-6 py-4 rounded-full text-lg border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(124, 58, 237, 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-3d w-full sm:w-auto whitespace-nowrap px-8 py-4 bg-gradient-to-r from-violet-600 to-teal-500 rounded-full text-white font-medium text-lg shadow-lg"
                >
                  Get Priority Access
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer with subtle 3D effect */}
      <footer className="relative py-12 border-t border-white/20 bg-white/50 backdrop-blur-sm overflow-x-hidden">
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
      
      {/* Smoother scroll progress indicator */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-teal-500 origin-left z-50 transform-gpu"
        style={{ scaleX: smoothMainScrollProgress }}
        transition={{ ease: "linear" }}
      />
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
    title: "Velo AI Insights",
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

// Add CSS classes to reduce animations in global styles
const globalStyles = `
  /* Add this to your CSS or styled-jsx */
  html {
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  .transform-gpu {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000;
    will-change: transform;
  }

  .text-3d {
    text-shadow: 
      0px 1px 0px rgba(255,255,255,.5),
      0px 2px 0px rgba(170,170,170,.5);
    transform: translateZ(0);
  }
`;

export default HomePage;
