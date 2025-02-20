import React, { useState,useEffect } from "react";
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
        const isTokenValid = await verifyToken(token);

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
        if (!is_profiled && role !== 'client') {
          navigate('/profiling');
        } else if (role === 'client') {
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
          navigate("/profiling");
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
    <div className="h-[100vh] items-center flex justify-center px-5 lg:px-0">
      <div className="max-w-screen-xl bg-white border shadow sm:rounded-lg flex justify-center flex-1">
        <div className="flex-1 bg-blue-900 text-center hidden md:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(https://www.tailwindtap.com/assets/common/marketing.svg)`,
            }}
          ></div>
        </div>
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="flex flex-col items-center">
            <div className="text-center">
              <h1 className="text-2xl xl:text-4xl font-extrabold text-blue-900">
                Sign up
              </h1>
              <p className="text-[12px] text-gray-500">
                Hey, enter your details to create your account
              </p>
            </div>
            <div className="w-full flex-1 mt-8">
              <form
                className="mx-auto max-w-xs flex flex-col gap-4"
                onSubmit={handleSubmit}
              >
                {errors.api && (
                  <p className="text-red-500 text-sm">{errors.api}</p>
                )}
                <input
                  className={`w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border ${
                    errors.username ? "border-red-500" : "border-gray-200"
                  } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs">{errors.username}</p>
                )}
                <input
                  className={`w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
                <input
                  className={`w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
                <input
                  className={`w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border ${
                    errors.confirm_password ? "border-red-500" : "border-gray-200"
                  } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
                  type="password"
                  placeholder="Confirm Password"
                  value={confirm_password}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirm_password && (
                  <p className="text-red-500 text-xs">
                    {errors.confirm_password}
                  </p>
                )}
                <select
                  className={`w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border ${
                    errors.role ? "border-red-500" : "border-gray-200"
                  } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="Client">Client</option>
                  <option value="Freelancer">Freelancer</option>
                </select>
                {errors.role && (
                  <p className="text-red-500 text-xs">{errors.role}</p>
                )}
                <button
                  type="submit"
                  className="mt-5 tracking-wide font-semibold bg-blue-900 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <svg
                    className="w-6 h-6 -ml-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                  <span className="ml-3">Sign Up</span>
                </button>
                <p className="mt-6 text-xs text-gray-600 text-center">
                  Already have an account?{" "}
                  <a href="/login">
                    <span className="text-blue-900 font-semibold">Sign in</span>
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
