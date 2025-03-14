import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion, useScroll, useTransform } from 'framer-motion';
import LoadingComponent from '../components/LoadingComponent';
import { verifyToken, refreshToken } from '../utils/auth';

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);

  useEffect(() => {
    const checkTokens = async () => {
      try {
        const token = Cookies.get('accessToken');
        const rToken = Cookies.get('refreshToken');

        if (!token || !rToken) {
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
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkTokens();
  }, [navigate]);

  if (loading) {
    return <LoadingComponent text="Please wait while we verify your session..." />;
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden bg-[#0A0A1B]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/30 rounded-full filter blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/30 rounded-full filter blur-[120px]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
              Veloro
            </h1>
            <p className="text-2xl md:text-3xl text-purple-100 mb-8 font-light">
              Where Elite Talent Shapes Tomorrow's Success
            </p>
            <p className="text-lg md:text-xl text-purple-200 mb-12 max-w-3xl mx-auto">
              Join the next generation of freelancing excellence. Connect with top-tier clients, 
              collaborate seamlessly, and elevate your professional journey.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <motion.a
                href="/register"
                whileHover={{ scale: 1.02 }}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
              >
                Start Your Journey
              </motion.a>
              <motion.a
                href="/login"
                whileHover={{ scale: 1.02 }}
                className="px-8 py-4 bg-white/5 backdrop-blur-sm rounded-xl text-white font-semibold border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                Sign In
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-purple-200 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32">
        <motion.div style={{ y }} className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-6">
            Why Choose Veloro
          </h2>
          <p className="text-purple-200 text-center mb-16 max-w-2xl mx-auto">
            Experience the future of freelancing with our cutting-edge platform designed 
            for serious professionals and ambitious businesses.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/5 hover:bg-white/10 transition-all duration-500"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 mb-6">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-purple-200 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 bg-gradient-to-b from-violet-900/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-6">
            How Veloro Works
          </h2>
          <p className="text-purple-200 text-center mb-16 max-w-2xl mx-auto">
            Your success journey in three simple steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-7xl font-bold text-white/10 absolute -top-8 left-0">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 relative">
                  {step.title}
                </h3>
                <p className="text-purple-200 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-6">
            Success Stories
          </h2>
          <p className="text-purple-200 text-center mb-16 max-w-2xl mx-auto">
            Join thousands of satisfied professionals who've found success with Veloro
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/5"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-purple-200 mb-8 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400" />
                  <div>
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    <p className="text-purple-300 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-b from-transparent to-violet-900/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-purple-200 mb-8 max-w-2xl mx-auto">
              Join Veloro today and experience the future of professional freelancing.
              Your next big opportunity awaits.
            </p>
            <motion.a
              href="/register"
              whileHover={{ scale: 1.02 }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
            >
              Get Started Now
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {footerLinks.map((column, index) => (
              <div key={index}>
                <h3 className="text-white font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-purple-200 hover:text-white transition-colors duration-300">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center pt-8 border-t border-white/5">
            <p className="text-purple-300">
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
