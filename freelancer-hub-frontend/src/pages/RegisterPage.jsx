import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingComponent from '../components/LoadingComponent';
import { refreshToken, verifyToken } from "../utils/auth";
import Cookies from 'js-cookie';

const RegistrationForm = () => {

  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkTokens = async () => {
      setLoading(true); // Start loading
      try {
        const token = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');

        if (!token || !refreshToken) {
          return null;
        }

        // Step 1: Verify token validity
        const isTokenValid = await verifyToken(refreshToken);

        // Step 2: Refresh token if invalid
        if (!isTokenValid) {
          const newToken = await refreshToken(refreshToken);
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
        // Step 3: Navigate based on profile status and role
        if (role === 'client') {
          navigate('/client/dashboard');
        } else {
          navigate('/freelancer/homepage');
        }
      } catch (error) {
        console.error('Authentication error:', error);

        // Clear tokens and redirect to login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      } finally {
        setLoading(false); // End loading
      }
    };

    checkTokens();
  }, [navigate]);

  if (loading) {
    return <LoadingComponent text="Please wait while we verify your session..." />;
  }

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (password !== confirm_password) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    if (!role) {
      newErrors.role = "Please select a role.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = { username, email, password, confirm_password, role };

    try {
      // Make the API request to register the user
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/create_user/",
        payload
      );if (response.data.access && response.data.refresh) {
        console.log(response.data.refresh);
        Cookies.set("accessToken", response.data.access);
        Cookies.set("refreshToken", response.data.refresh);
        
        // Redirect based on role
        if (role === "Client") {
          navigate("/client/dashboard");
        } else if (role === "Freelancer") {
          navigate("/freelancer/homepage");
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        // Set API errors
        setErrors({ api: error.response.data.error || "Registration failed." });
      } else {
        console.error("Error creating user:", error);
      }
    }
  };
  if (loading) {
    return <LoadingComponent text="Please wait while we verify your session..." />;
  }
  return (
    <div className="min-h-screen bg-[#0A0A1B] flex items-center justify-center p-4 md:p-0">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-violet-600/20 to-teal-500/20 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-violet-600/20 to-teal-500/20 rounded-full filter blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-6xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl flex overflow-hidden"
      >
        {/* Left Panel - Feature Showcase */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-teal-500/10" />
          <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="max-w-md"
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Join the Future of Work
              </h2>
              <p className="text-gray-300 mb-8">
                Whether you're hiring or looking for work, Veloro helps you connect, collaborate, and succeed.
              </p>

              {/* Role Cards */}
              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-violet-500/20">
                  <h3 className="text-xl font-semibold text-violet-300 mb-2">For Freelancers</h3>
                  <p className="text-gray-400 text-sm">Access top projects, build your portfolio, and grow your career.</p>
                </div>
                <div className="p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-teal-500/20">
                  <h3 className="text-xl font-semibold text-teal-300 mb-2">For Clients</h3>
                  <p className="text-gray-400 text-sm">Find exceptional talent, manage projects, and scale your business.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-gray-400">
                Join Veloro and unlock new opportunities
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.api && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{errors.api}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                    errors.username ? "border-red-500" : "border-white/10"
                  } text-white placeholder-gray-500 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200`}
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && (
                  <p className="text-red-400 text-xs">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                    errors.email ? "border-red-500" : "border-white/10"
                  } text-white placeholder-gray-500 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                      errors.password ? "border-red-500" : "border-white/10"
                    } text-white placeholder-gray-500 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200`}
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && (
                    <p className="text-red-400 text-xs">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300" htmlFor="confirm_password">
                    Confirm Password
                  </label>
                  <input
                    id="confirm_password"
                    type="password"
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                      errors.confirm_password ? "border-red-500" : "border-white/10"
                    } text-white placeholder-gray-500 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200`}
                    placeholder="Confirm password"
                    value={confirm_password}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirm_password && (
                    <p className="text-red-400 text-xs">{errors.confirm_password}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300" htmlFor="role">
                  I want to...
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole("Freelancer")}
                    className={`p-4 rounded-xl border ${
                      role === "Freelancer"
                        ? "border-violet-500 bg-violet-500/20"
                        : "border-white/10 bg-white/5"
                    } transition-all duration-200`}
                  >
                    <span className="text-sm font-medium text-white">Work as Freelancer</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole("Client")}
                    className={`p-4 rounded-xl border ${
                      role === "Client"
                        ? "border-teal-500 bg-teal-500/20"
                        : "border-white/10 bg-white/5"
                    } transition-all duration-200`}
                  >
                    <span className="text-sm font-medium text-white">Hire Talent</span>
                  </motion.button>
                </div>
                {errors.role && (
                  <p className="text-red-400 text-xs">{errors.role}</p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Create Account</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.button>

              <p className="text-center text-gray-400">
                Already have an account?{" "}
                <a href="/login" className="font-medium text-white hover:text-gray-300 transition-colors duration-200">
                  Sign in
                </a>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationForm;
