import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LoadingComponent from '../components/LoadingComponent';
import { verifyToken } from '../utils/auth';
import Cookies from 'js-cookie';
import { FiCheck, FiX, FiEye, FiEyeOff } from "react-icons/fi";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState({ username: false, password: false });
  const [formTouched, setFormTouched] = useState(false);

  // Single authentication check on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');
        const role = Cookies.get('role');

        // If no tokens, allow login
        if (!accessToken || !refreshToken) {
          setLoading(false);
          return;
        }

        // Verify token and redirect if valid
        const isValid = await verifyToken(accessToken);
        if (isValid) {
          // Get return URL from location state or default based on role
          const returnUrl = location.state?.from || (role === 'client' ? '/client/homepage' : '/freelancer/homepage');
          navigate(returnUrl, { replace: true });
          return;
        }

        // If token invalid, clear cookies and allow login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('role');
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setFormTouched(true);
    
    // Update typing state for animation
    if (name === 'username' || name === 'password') {
      setIsTyping(prev => ({
        ...prev,
        [name]: true
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (formTouched) {
      validateForm();
    }
  }, [formData, formTouched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        {
          username: formData.username,
          password: formData.password,
          remember_me: formData.rememberMe
        }
      );

      const { access, refresh, role } = response.data;

      // Set cookies with appropriate options
      const cookieOptions = {
        secure: true,
        sameSite: 'Strict',
        expires: formData.rememberMe ? 7 : undefined // 7 days if remember me
      };

      Cookies.set("accessToken", access, cookieOptions);
      Cookies.set("refreshToken", refresh, cookieOptions);
      Cookies.set("role", role, cookieOptions);

      // Clear any stored data for fresh session
      localStorage.clear();

      // Navigate to appropriate homepage or return URL
      const returnUrl = location.state?.from || (role === 'client' ? '/client/homepage' : '/freelancer/homepage');
      navigate(returnUrl, { replace: true });

    } catch (error) {
      setLoading(false);
      setErrors({
        api: error.response?.data?.error || "Login failed. Please try again."
      });
    }
  };

  if (loading) {
    return <LoadingComponent text="Please wait..." />;
  }

  return (
    <div className="h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      {/* Background gradients - adjusted size */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-violet-500/30 to-teal-400/30 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-l from-violet-500/30 to-teal-400/30 rounded-full filter blur-[120px]" />
      </div>

      {/* Main card - reduced max width and padding */}
      <motion.div
        className="relative w-full max-w-5xl h-[90vh] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl flex overflow-hidden mx-4"
      >
        {/* Left Panel - adjusted spacing */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-teal-400/5" />
          <div className="relative h-full flex flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-bold text-violet-700 mb-4">
              Welcome Back to Veloro
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Your gateway to professional excellence
            </p>

            {/* Role Cards - reduced padding and spacing */}
            <div className="grid grid-cols-1 gap-3 mb-6 w-full max-w-sm">
              <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm border border-violet-400/20">
                <h3 className="text-lg font-semibold text-violet-600 mb-1">Freelancer Portal</h3>
                <p className="text-gray-600 text-xs">Access your projects and opportunities</p>
              </div>
              <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm border border-teal-400/20">
                <h3 className="text-lg font-semibold text-teal-600 mb-1">Client Dashboard</h3>
                <p className="text-gray-600 text-xs">Manage your projects and talent</p>
              </div>
            </div>

            {/* Stats Cards - compact layout */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {[
                { stat: "20K+", label: "Active Users" },
                { stat: "98%", label: "Success Rate" },
                { stat: "15K+", label: "Projects" },
                { stat: "$10M+", label: "Paid Out" }
              ].map((item, index) => (
                <div key={index} className="p-3 bg-white/60 rounded-xl backdrop-blur-sm border border-violet-400/20">
                  <div className="text-xl font-bold text-violet-600">{item.stat}</div>
                  <div className="text-xs text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - adjusted spacing */}
        <div className="w-full lg:w-1/2 p-6 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-violet-600 to-teal-500 bg-clip-text text-transparent mb-2">
              Sign In to Veloro
            </h1>
            <p className="text-center text-gray-600 text-sm mb-6">
              Access your professional workspace
            </p>

            {/* Form - reduced spacing */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.api && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{errors.api}</p>
                </div>
              )}
  
              {/* Username field */}
              <div className="space-y-1 relative">
                <label className="text-sm font-medium text-violet-600 flex items-center justify-between">
                  Username
                  <AnimatePresence>
                    {isTyping.username && (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-xs text-gray-400"
                      >
                        Typing...
                      </motion.span>
                    )}
                  </AnimatePresence>
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className={`w-full px-4 py-3 rounded-xl bg-white/60 border ${
                      errors.username 
                        ? "border-red-400 focus:border-red-500" 
                        : formData.username 
                          ? "border-green-400 focus:border-green-500" 
                          : "border-violet-400/20"
                    } text-gray-700 placeholder-gray-400 focus:ring-1 transition-all duration-200`}
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onFocus={() => setIsTyping(prev => ({ ...prev, username: true }))}
                    onBlur={() => setIsTyping(prev => ({ ...prev, username: false }))}
                  />
                  <AnimatePresence>
                    {formData.username && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {errors.username ? (
                          <FiX className="text-red-500 w-5 h-5" />
                        ) : (
                          <FiCheck className="text-green-500 w-5 h-5" />
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {errors.username && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-400 text-xs"
                    >
                      {errors.username}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
  
              {/* Password field */}
              <div className="space-y-1 relative">
                <label className="text-sm font-medium text-violet-600 flex items-center justify-between">
                  Password
                  <AnimatePresence>
                    {isTyping.password && (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-xs text-gray-400"
                      >
                        Typing...
                      </motion.span>
                    )}
                  </AnimatePresence>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full px-4 py-3 rounded-xl bg-white/60 border ${
                      errors.password 
                        ? "border-red-400 focus:border-red-500" 
                        : formData.password 
                          ? "border-green-400 focus:border-green-500" 
                          : "border-violet-400/20"
                    } text-gray-700 placeholder-gray-400 pr-10 focus:ring-1 transition-all duration-200`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setIsTyping(prev => ({ ...prev, password: true }))}
                    onBlur={() => setIsTyping(prev => ({ ...prev, password: false }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-400 text-xs"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
  
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-gray-600 focus:ring-gray-400"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-sm text-gray-600 hover:text-violet-500 transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
  
              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                  !formTouched || Object.keys(errors).length > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-500 to-teal-400 hover:shadow-lg hover:shadow-violet-500/25"
                }`}
                disabled={!formTouched || Object.keys(errors).length > 0}
              >
                <span className="text-white">Sign In</span>
                {formTouched && Object.keys(errors).length === 0 && (
                  <FiCheck className="w-5 h-5 text-white" />
                )}
              </motion.button>
  
              <p className="text-center text-gray-600">
                New to Veloro?{" "}
                <a href="/register" className="font-medium text-violet-600 hover:text-teal-500 transition-colors duration-200">
                  Create an account
                </a>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
