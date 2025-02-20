import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

      const { access, refresh, is_profiled, role } = response.data;

      // Store tokens in cookies
      Cookies.set("accessToken", access, { secure: true, sameSite: 'Strict' });
      Cookies.set("refreshToken", refresh, { secure: true, sameSite: 'Strict' });
      Cookies.set("role", role, { secure: true, sameSite: 'Strict' });

      // Redirect based on is_profiled and role
      if(role === 'client'){
        navigate("/client/dashboard");
      }
      else if (!is_profiled) {
        navigate("/profiling");
      } else if (role === "freelancer") {
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
    <div className="h-[100vh] items-center flex justify-center px-5 lg:px-0">
      <div className="h-[100%] max-w-screen-xl bg-white border shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 flex w-[100%] justify-center items-center">
          <div className="flex flex-col items-center w-[100%]">
            <div className="text-center">
              <h1 className="text-2xl xl:text-4xl font-extrabold text-blue-900">
                Login
              </h1>
              <p className="text-[12px] text-gray-500">
                Hey, enter your details to login to your account
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
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs">{errors.username}</p>
                )}
                <input
                  className={`w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="rememberMe" className="text-sm">
                    Remember me
                  </label>
                </div>
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
                  <span className="ml-3">Login</span>
                </button>
                <p className="mt-6 text-xs text-gray-600 text-center">
                  New user?{" "}
                  <a href="/register">
                    <span className="text-blue-900 font-semibold">Sign Up</span>
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-blue-900 text-center hidden md:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(https://www.tailwindtap.com/assets/common/marketing.svg)`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
