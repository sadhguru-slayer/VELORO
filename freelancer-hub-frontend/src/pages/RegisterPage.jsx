import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingComponent from '../components/LoadingComponent';
import { refreshToken, verifyToken } from "../utils/auth";
import Cookies from 'js-cookie';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Modal } from 'antd';

const RegistrationForm = () => {

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formTouched, setFormTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFreelancerSelected, setIsFreelancerSelected] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
    console.log(isStudent,role);

    const payload = { 
      email,
      password, 
      confirm_password, 
      role: isStudent ? "student" : role,
      is_talentrise: isStudent  // Only set to true if user is a student
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/create_user/",
        payload
      );
      
      if (response.data.access && response.data.refresh) {
        Cookies.set("accessToken", response.data.access);
        Cookies.set("refreshToken", response.data.refresh);
        Cookies.set("is_talentrise", isStudent);  // Set cookie based on student status
        if(isStudent || role === "freelancer"){
          navigate("/freelancer/homepage");
        }else{
          navigate("/client/dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors({ api: error.response.data.error || "Registration failed." });
      } else {
        console.error("Error creating user:", error);
      }
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  // Show modal for mobile devices
  const showRoleModal = () => {
    setIsModalVisible(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  // Modified handleRoleSelect to handle mobile
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "Freelancer") {
      if (window.innerWidth < 1024) {
        showRoleModal();
      } else {
        setIsFreelancerSelected(true);
      }
    } else {
      setIsFreelancerSelected(false);
      setIsStudent(false);
    }
  };

  // Student selection modal content
  const renderStudentSelection = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-violet-700 mb-4 text-center">
        Are you a student?
      </h2>
      <p className="text-gray-600 mb-8 text-center text-sm">
        Students get access to additional learning resources and mentorship opportunities
      </p>

      <div className="grid grid-cols-1 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setIsStudent(true);
            handleModalClose();
          }}
          className={`p-4 rounded-xl border ${
            isStudent 
              ? "border-violet-500 bg-violet-500/20" 
              : "border-violet-400/20"
          } transition-all duration-200`}
        >
          <h3 className="text-lg font-semibold text-violet-600 mb-2">Yes, I'm a Student</h3>
          <p className="text-sm text-gray-600">Get access to TalentRise program and special resources</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setIsStudent(false);
            handleModalClose();
          }}
          className={`p-4 rounded-xl border ${
            !isStudent && role === "Freelancer"
              ? "border-violet-500 bg-violet-500/20" 
              : "border-violet-400/20"
          } transition-all duration-200`}
        >
          <h3 className="text-lg font-semibold text-violet-600 mb-2">No, I'm a Professional</h3>
          <p className="text-sm text-gray-600">Continue as a regular freelancer</p>
        </motion.button>
      </div>
    </div>
  );

  const renderLeftPanel = () => {
    if (isFreelancerSelected) {
      return (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="relative h-full flex flex-col items-center justify-center p-8"
        >
          <h2 className="text-2xl font-bold text-violet-700 mb-4">
            Are you a student?
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            Students get access to additional learning resources and mentorship opportunities
          </p>

          <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsStudent(true)}
              className={`p-4 rounded-xl border ${
                isStudent 
                  ? "border-violet-500 bg-violet-500/20" 
                  : "border-violet-400/20"
              }`}
            >
              <h3 className="text-lg font-semibold text-violet-600 mb-2">Yes, I'm a Student</h3>
              <p className="text-sm text-gray-600">Get access to TalentRise program and special resources</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsStudent(false)}
              className={`p-4 rounded-xl border ${
                !isStudent && role === "Freelancer"
                  ? "border-violet-500 bg-violet-500/20" 
                  : "border-violet-400/20"
              }`}
            >
              <h3 className="text-lg font-semibold text-violet-600 mb-2">No, I'm a Professional</h3>
              <p className="text-sm text-gray-600">Continue as a regular freelancer</p>
            </motion.button>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="relative h-full flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-violet-700 mb-4">
          Join the Future of Work
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Whether you're hiring or looking for work, we help you connect.
        </p>

        <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
          <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm border border-violet-400/20">
            <h3 className="text-lg font-semibold text-violet-600 mb-1">For Freelancers</h3>
            <p className="text-gray-600 text-xs">Access top projects and grow your career.</p>
          </div>
          <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm border border-teal-400/20">
            <h3 className="text-lg font-semibold text-teal-600 mb-1">For Clients</h3>
            <p className="text-gray-600 text-xs">Find talent and scale your business.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      {/* Background gradients - same as login page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-violet-500/30 to-teal-400/30 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-l from-violet-500/30 to-teal-400/30 rounded-full filter blur-[120px]" />
      </div>

      {/* Main card - consistent with login page */}
      <motion.div 
        className="relative w-full max-w-5xl h-[90vh] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl flex overflow-hidden mx-4"
      >
        {/* Left Panel with conditional rendering */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-teal-400/5" />
          <AnimatePresence mode="wait">
            {renderLeftPanel()}
          </AnimatePresence>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="w-full p-4 flex items-center justify-center">
          <div className="w-full max-w-sm space-y-4">
            <h1 className="text-xl font-bold text-center bg-gradient-to-r from-violet-600 to-teal-500 bg-clip-text text-transparent mb-1">
              Create Account
            </h1>
            <p className="text-center text-gray-600 text-xs mb-4">
              Join Talintz and unlock new opportunities
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.api && (
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-xs text-center">{errors.api}</p>
                </div>
              )}

              <div className="space-y-3">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-violet-600">Email</label>
                  <input
                    id="email"
                    type="email"
                    className={`w-full px-3 py-2 rounded-lg bg-white/60 border ${
                      errors.email ? "border-red-500" : "border-violet-400/20"
                    } text-sm text-gray-700 placeholder-gray-500 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all duration-200`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-[0.7rem] mt-0.5">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-violet-600">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className={`w-full px-3 py-2 rounded-lg bg-white/60 border ${
                        errors.password ? "border-red-500" : "border-violet-400/20"
                      } text-sm text-gray-700 placeholder-gray-500 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all duration-200`}
                      placeholder="Create password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordStrength(getPasswordStrength(e.target.value));
                        setFormTouched(true);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors"
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-[0.7rem] mt-0.5">{errors.password}</p>
                  )}
                </div>

                {/* Password Strength */}
                <div className="space-y-1">
                  <div className="flex space-x-1 h-1">
                    {[...Array(4)].map((_, index) => (
                      <motion.div
                        key={index}
                        className={`h-full w-1/4 rounded-full ${
                          index < passwordStrength
                            ? passwordStrength === 1
                              ? "bg-red-400"
                              : passwordStrength === 2
                              ? "bg-orange-400"
                              : passwordStrength === 3
                              ? "bg-yellow-400"
                              : "bg-green-400"
                            : "bg-gray-200"
                        }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.1 }}
                      />
                    ))}
                  </div>
                  <p className="text-[0.7rem] text-gray-400">
                    {passwordStrength === 0 && "Add a password"}
                    {passwordStrength === 1 && "Weak password"}
                    {passwordStrength === 2 && "Fair password"}
                    {passwordStrength === 3 && "Good password"}
                    {passwordStrength === 4 && "Strong password"}
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-violet-600">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full px-3 py-2 rounded-lg bg-white/60 border ${
                        errors.confirm_password ? "border-red-500" : "border-violet-400/20"
                      } text-sm text-gray-700 placeholder-gray-500 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all duration-200`}
                      placeholder="Confirm password"
                      value={confirm_password}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-red-400 text-[0.7rem] mt-0.5">{errors.confirm_password}</p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-violet-600">I want to...</label>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect("Freelancer")}
                      className={`p-2 rounded-lg border ${
                        role === "Freelancer"
                          ? "border-violet-500 bg-violet-500/20"
                          : "border-violet-400/20"
                      } transition-all duration-200`}
                    >
                      <span className="text-xs font-medium">Work as Freelancer</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect("Client")}
                      className={`p-2 rounded-lg border ${
                        role === "Client"
                          ? "border-violet-500 bg-violet-500/20"
                          : "border-teal-300/10 bg-white/5"
                      } transition-all duration-200`}
                    >
                      <span className="text-xs font-medium text-violet-700">Hire Talent</span>
                    </motion.button>
                  </div>
                  {errors.role && (
                    <p className="text-red-400 text-xs mt-1">{errors.role}</p>
                  )}
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-teal-400 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
              >
                Create Account
              </motion.button>

              <p className="text-center text-gray-600 text-sm">
                Already have an account?{" "}
                <a href="/login" className="font-medium text-teal-500 hover:text-teal-300 transition-colors duration-200">
                  Sign in
                </a>
              </p>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Modal for mobile */}
      <Modal
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
        className="rounded-2xl overflow-hidden"
        style={{ padding: 0 }}
      >
        {renderStudentSelection()}
      </Modal>
    </div>
  );

};

export default RegistrationForm;
