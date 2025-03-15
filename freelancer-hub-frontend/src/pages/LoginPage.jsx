import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingComponent from '../components/LoadingComponent';
import { verifyToken, refreshToken as refreshAuthToken } from '../utils/auth';
import Cookies from 'js-cookie';

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkTokens = async () => {
      setLoading(true); // Start loading
      try {
        const accessToken = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');

        if (!accessToken || !refreshToken) {
          return null; // No tokens, no session
        }

        // Step 1: Verify the access token validity
        const isTokenValid = await verifyToken(accessToken);

        // Step 2: Refresh token if invalid
        if (!isTokenValid) {
          const newAccessToken = await refreshAuthToken(refreshToken);
          if (newAccessToken) {
            Cookies.set('accessToken', newAccessToken, { secure: true, sameSite: 'Strict' });
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
          navigate('/client/homepage');
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

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = { username, password, remember_me: rememberMe };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        payload
      );
      const { access, refresh, role } = response.data;

      // Store tokens in cookies
      Cookies.set("accessToken", access, { secure: true, sameSite: 'Strict' });
      Cookies.set("refreshToken", refresh, { secure: true, sameSite: 'Strict' });
      Cookies.set("role", role, { secure: true, sameSite: 'Strict' });

      // Redirect based on is_profiled and role
      if(role === 'client'){
        navigate("/client/homepage");
      }
      else {
        navigate("/freelancer/homepage");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors({ api: error.response.data.error || "Login failed." });
      } else {
        console.error("Error logging in:", error);
      }
    }
  };

  if (loading) {
    return <LoadingComponent text="Please wait while we verify your session..." />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A1B] flex items-center justify-center p-4 md:p-0">
      {/* Animated Background with both color schemes */}
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
                Welcome Back to Veloro
              </h2>
              <p className="text-gray-300 mb-8">
                Your gateway to professional excellence and meaningful collaborations
              </p>

              {/* Role Cards */}
              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-violet-500/20">
                  <h3 className="text-xl font-semibold text-violet-300 mb-2">Freelancer Portal</h3>
                  <p className="text-gray-400 text-sm">Access your projects, track earnings, and find new opportunities.</p>
                </div>
                <div className="p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-teal-500/20">
                  <h3 className="text-xl font-semibold text-teal-300 mb-2">Client Dashboard</h3>
                  <p className="text-gray-400 text-sm">Manage your projects, connect with talent, and grow your business.</p>
                </div>
              </div>

              {/* Platform Stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { stat: "20K+", label: "Active Users" },
                  { stat: "98%", label: "Success Rate" },
                  { stat: "15K+", label: "Projects" },
                  { stat: "$10M+", label: "Paid Out" }
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">{item.stat}</div>
                    <div className="text-sm text-gray-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Sign In to Veloro
              </h1>
              <p className="text-gray-400">
                Access your professional workspace
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
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && (
                  <p className="text-red-400 text-xs">{errors.username}</p>
                )}
              </div>

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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p className="text-red-400 text-xs">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-gray-600 focus:ring-gray-400"
                  />
                  <span className="text-sm text-gray-300">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
                  Forgot password?
                </a>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Sign In</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.button>

              <p className="text-center text-gray-400">
                New to Veloro?{" "}
                <a href="/register" className="font-medium text-white hover:text-gray-300 transition-colors duration-200">
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
