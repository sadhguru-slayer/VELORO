import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import FProfile from './pages/freelancer/FProfile';
import CProfile from './pages/client/CProfile';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilingPage from './pages/ProfilingPage';
import { verifyToken, refreshToken } from './utils/auth';
import CCollaboration from './pages/client/CCollaboration';
import CConnectionRequests from './pages/client/CConnectionRequests';
import CDashboard from './pages/client/CDashboard';
import ProjectPost from './pages/client/ProjectPost';
import ViewBids from './pages/client/ViewBids';
import CHomepage from './pages/client/CHomepage';
import BrowseProjectsPage from './pages/freelancer/BrowseProjectsPage';
import ProjectDetailPage from './pages/freelancer/ProjectDetailPage';
import FCollaboration from './pages/freelancer/FCollaboration';
import FDashboard from './pages/freelancer/FDashboard';
import FHomepage from './pages/freelancer/FHomepage';
import PrivateRoute from './PrivateRoute';  // Import the PrivateRoute component
import ProjectPageForBidding from './pages/freelancer/ProjectPageForBidding';
import PostedProjectForBidsPage from './pages/client/PostedProjectForBidsPage';
import FNotifications from './pages/freelancer/FNotifications';
import CNotifications from './pages/client/CNotifications';
import Cookies from 'js-cookie';  // Import js-cookie
import CConnections from './pages/client/CConnections';
import { message } from 'antd';

const App = () => {
  const [isTokenValid, setIsTokenValid] = useState(true);
  const token = Cookies.get('accessToken');  // Get token from cookies

  useEffect(() => {
    const checkTokenAndProfile = async () => {
      if (token) {
        const isValid = await verifyToken(token);
        if (!isValid) {
          const newToken = await refreshToken();
          if (newToken) {
            Cookies.set('accessToken', newToken, { expires: 1, secure: true, sameSite: 'Strict' });
          } else {
            setIsTokenValid(false);
          }
        }
      }
    };
    
    checkTokenAndProfile();
  }, [token]);


  const userRole = Cookies.get('role') || 'client'; // Default to 'client' if no role is found

  useEffect(() => {
    if (token) {
      const socket = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/?token=${token}`);
  
      socket.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          
          // Check if the notification is an array (ignore it)
          if (Array.isArray(notification)) {
            return;
          }
  
          // Check if the notification has the expected format
          if (
            notification &&
            typeof notification === "object" &&
            "notification_id" in notification &&
            "notification_text" in notification &&
            "created_at" in notification &&
            "related_model_id" in notification &&
            "type" in notification
          ) {
            console.log(notification)
            showNotification(notification);
          } else {
            console.warn("Invalid notification format:", notification);
          }
        } catch (error) {
          console.error("Error parsing notification:", error);
        }
      };
  
      socket.onclose = (event) => {
        console.log(`WebSocket closed with code: ${event.code}`);
        if (event.code !== 1000) {
          console.error("WebSocket closed abnormally!", event);
        }
      };
  
      socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };
  
      return () => {
        socket.close();
      };
    }
  }, [token]);
  
  

const showNotification = (notification) => {
  const isClient = userRole === "client";
  const bgColor = isClient ? "from-teal-500 to-teal-700" : "from-violet-500 to-violet-700";
  const textColor = "text-white";

  message.open({
    content: (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`p-1 rounded-xl shadow-xl bg-gradient-to-r ${bgColor} ${textColor} flex items-start backdrop-blur-lg border border-white/20`}
      >
        <span className="text-lg mr-3 animate-bounce">🔔</span>
        <div>
          <p className="text-sm">
          <div dangerouslySetInnerHTML={{ __html: notification.notification_text }} />
          </p>
         
        </div>
      </motion.div>
    ),
    duration: 4,
    style: {
      width: 320,
    },
  });
};



  if (!isTokenValid) {
    return <Navigate to="/login" />;
  }
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element=<HomePage /> />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        

        {/* Client Routes */}
        <Route path="/client">  
        <Route path="profile/:id" element={<PrivateRoute element={CProfile} />} />
        <Route path="homepage" element={<PrivateRoute element={CHomepage} />} />
        <Route path="connections_requests" element={<PrivateRoute element={CConnectionRequests} />} />
        <Route path="connections" element={<PrivateRoute element={CConnections} />} />

        <Route path="notifications" element={<PrivateRoute element={CNotifications} />} />
        
        <Route path="dashboard" element={<PrivateRoute element={CDashboard} />} />
        <Route path="dashboard/projects/:id" element={<PrivateRoute element={PostedProjectForBidsPage} />} />
        <Route path="collaboration" element={<PrivateRoute element={CCollaboration} />} />
        <Route path="post-project" element={<PrivateRoute element={ProjectPost} />} />
        <Route path="view-bids" element={<PrivateRoute element={ViewBids} />} />
        <Route path="view-bids/posted-project/:id" element={<PrivateRoute element={PostedProjectForBidsPage} />} />
        
        </Route>
        
        {/* Freelancer Routes */}
        <Route path="/freelancer">
        <Route path="profile/:id" element={<PrivateRoute element={FProfile} />} />
        <Route path="notifications" element={<PrivateRoute element={FNotifications} />} />
  <Route path="dashboard" element={<PrivateRoute element={FDashboard} />} />
  <Route path="dashboard/projects/:id" element={<PrivateRoute element={ProjectDetailPage} />} />
  <Route path="collaboration" element={<PrivateRoute element={FCollaboration} />} />
  <Route path="browse_project" element={<PrivateRoute element={BrowseProjectsPage} />} />
  <Route path="browse_project/project-view/:id" element={<PrivateRoute element={ProjectPageForBidding} />} />
  <Route path="homepage" element={<PrivateRoute element={FHomepage} />}/>
</Route>

      </Routes>
    </Router>
  );
};

export default App;
