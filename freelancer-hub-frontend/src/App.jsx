import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState, useCallback } from 'react';
import { motion } from "framer-motion";
import { message, Spin } from 'antd';
import Cookies from 'js-cookie';
import DOMPurify from "dompurify";
import { verifyToken, refreshToken } from './utils/auth';
import PrivateRoute from './PrivateRoute';

// Lazy load components for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Client Routes Configuration
const clientRoutes = [
  {
    path: "profile/:id",
    component: lazy(() => import('./pages/client/CProfile')),
    allowedRoles: ['client', 'freelancer']
  },
  {
    path: "homepage",
    component: lazy(() => import('./pages/client/CHomepage')),
    allowedRoles: ['client']
  },
  {
    path: "connections_requests",
    component: lazy(() => import('./pages/client/CConnectionRequests')),
    allowedRoles: ['client']
  },
  {
    path: "connections",
    component: lazy(() => import('./pages/client/CConnections')),
    allowedRoles: ['client']
  },
  {
    path: "notifications",
    component: lazy(() => import('./pages/client/CNotifications')),
    allowedRoles: ['client']
  },
  {
    path: "dashboard",
    component: lazy(() => import('./pages/client/CDashboard')),
    allowedRoles: ['client']
  },
  {
    path: "dashboard/projects/:id",
    component: lazy(() => import('./pages/client/PostedProjectForBidsPage')),
    allowedRoles: ['client']
  },
  {
    path: "collaboration",
    component: lazy(() => import('./pages/client/profile/Collaboration')),
    allowedRoles: ['client']
  },
  {
    path: "post-project",
    component: lazy(() => import('./pages/client/ProjectPost')),
    allowedRoles: ['client']
  },
  {
    path: "view-bids",
    component: lazy(() => import('./pages/client/ViewBids')),
    allowedRoles: ['client']
  },
  {
    path: "view-bids/posted-project/:id",
    component: lazy(() => import('./pages/client/PostedProjectForBidsPage')),
    allowedRoles: ['client']
  }
];

// Freelancer Routes Configuration
const freelancerRoutes = [
  {
    path: "profile/:id",
    component: lazy(() => import('./pages/freelancer/FProfile')),
    allowedRoles: ['client', 'freelancer']
  },
  {
    path: "homepage",
    component: lazy(() => import('./pages/freelancer/FHomepage')),
    allowedRoles: ['freelancer']
  },
  {
    path: "notifications",
    component: lazy(() => import('./pages/freelancer/FNotifications')),
    allowedRoles: ['freelancer']
  },
  {
    path: "dashboard",
    component: lazy(() => import('./pages/freelancer/FDashboard')),
    allowedRoles: ['freelancer']
  },
  {
    path: "dashboard/projects/:id",
    component: lazy(() => import('./pages/freelancer/ProjectDetailPage')),
    allowedRoles: ['freelancer']
  },
  {
    path: "collaboration",
    component: lazy(() => import('./pages/freelancer/FCollaboration')),
    allowedRoles: ['freelancer']
  },
  {
    path: "browse_project",
    component: lazy(() => import('./pages/freelancer/BrowseProjectsPage')),
    allowedRoles: ['freelancer']
  },
  {
    path: "browse_project/project-view/:id",
    component: lazy(() => import('./pages/freelancer/ProjectPageForBidding')),
    allowedRoles: ['freelancer']
  }
];

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="h-screen w-screen flex items-center justify-center">
    <Spin size="large" className="text-teal-500" />
  </div>
);

const App = () => {
  const [isTokenValid, setIsTokenValid] = useState(true);
  const token = Cookies.get('accessToken');
  const userRole = Cookies.get('role') || 'client';

  // Token validation
  useEffect(() => {
    const checkTokenAndProfile = async () => {
      if (!token) return;

      try {
        const isValid = await verifyToken(token);
        if (!isValid) {
          const newToken = await refreshToken();
          if (newToken) {
            Cookies.set('accessToken', newToken, { 
              expires: 1, 
              secure: true, 
              sameSite: 'Strict' 
            });
          } else {
            setIsTokenValid(false);
          }
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setIsTokenValid(false);
      }
    };
    
    checkTokenAndProfile();
  }, [token]);

  // WebSocket notification handler
  const showNotification = useCallback((notification) => {
    const isClient = userRole === "client";
    const bgColor = isClient ? "from-teal-500 to-teal-700" : "from-violet-500 to-violet-700";

    message.open({
      content: (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`p-1 rounded-xl shadow-xl bg-gradient-to-r ${bgColor} text-white flex items-start backdrop-blur-lg border border-white/20`}
        >
          <span className="text-lg mr-3 animate-bounce">🔔</span>
          <div>
            <p className="text-sm">
              <div dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(notification.notification_text) 
              }} />
            </p>
          </div>
        </motion.div>
      ),
      duration: 4,
      style: { width: 320 },
    });
  }, [userRole]);

  // WebSocket connection
  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/?token=${token}`);
    
    const handleMessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        if (Array.isArray(notification)) return;

        const requiredFields = [
          "notification_id",
          "notification_text",
          "created_at",
          "related_model_id",
          "type"
        ];

        if (requiredFields.every(field => field in notification)) {
          showNotification(notification);
        }
      } catch (error) {
        console.error("Notification parsing error:", error);
      }
    };

    socket.onmessage = handleMessage;
    socket.onclose = (event) => {
      if (event.code !== 1000) {
        console.error("WebSocket closed abnormally:", event);
      }
    };
    socket.onerror = (error) => console.error("WebSocket Error:", error);

    return () => socket.close();
  }, [token, showNotification]);

  if (!isTokenValid) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/login" 
            element={token ? <Navigate to={`/${userRole}/homepage`} replace /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={token ? <Navigate to={`/${userRole}/homepage`} replace /> : <RegisterPage />} 
          />

          {/* Client Routes */}
          <Route path="/client/*">
            <Route index element={<Navigate to="homepage" replace />} />
            {clientRoutes.map(({ path, component: Component, allowedRoles }) => (
              <Route
                key={path}
                path={path}
                element={
                  <PrivateRoute
                    element={Component}
                    allowedRoles={allowedRoles}
                  />
                }
              />
            ))}
          </Route>

          {/* Freelancer Routes */}
          <Route path="/freelancer/*">
            <Route index element={<Navigate to="homepage" replace />} />
            {freelancerRoutes.map(({ path, component: Component, allowedRoles }) => (
              <Route
                key={path}
                path={path}
                element={
                  <PrivateRoute
                    element={Component}
                    allowedRoles={allowedRoles}
                  />
                }
              />
            ))}
          </Route>

          {/* Catch-all route */}
          <Route 
            path="*" 
            element={
              <Navigate 
                to={token ? `/${userRole}/homepage` : '/login'} 
                replace 
              />
            } 
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
