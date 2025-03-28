import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState, useCallback } from 'react';
import { motion } from "framer-motion";
import { message, Spin } from 'antd';
import Cookies from 'js-cookie';
import CMessages from './pages/client/CMessages';

import DOMPurify from "dompurify";
import { verifyToken, refreshToken } from './utils/auth';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from './components/layouts/DashboardLayout';
import FreelancerAnalyticsPage from './pages/freelancer/dashboard/FreelancerAnalyticsPage';
import ProjectManagementPage from './pages/freelancer/dashboard/ProjectManagementPage';
import Earnings from './pages/freelancer/dashboard/Earnings';
import BiddingOverview from './pages/freelancer/dashboard/BiddingOverview';
import UpcomingEvents from './pages/freelancer/dashboard/UpcomingEvents';
import ProjectDetailPage from './pages/freelancer/ProjectDetailPage';
import ClientDashboardLayout from './components/layouts/ClientDashboardLayout';
import DashboardOverview from './pages/client/dashboard/DashboardOverview';
import PostedProjects from './pages/client/dashboard/PostedProjects';
import RecentActivity from './pages/client/dashboard/RecentActivity';
import Spendings from './pages/client/dashboard/Spendings';
import React from 'react';
import CProfile from './pages/client/CProfile';
import FProfile from './pages/freelancer/FProfile';
import CConnections from './pages/client/CConnections';
import CConnectionRequests from './pages/client/CConnectionRequests';
import FConnections from './pages/freelancer/FConnections';
import FConnectionRequests from './pages/freelancer/FConnectionRequests';
import ArchivedChats from './pages/client/messages/ArchivedChats';
import MessageRequests from './pages/client/messages/MessageRequests';
import GroupChats from './pages/client/messages/groups/index';
import FGroupChats from './pages/freelancer/messages/groups/index';
// import GroupChats from './pages/client/messages/GroupChats';
import CreateGroup from './pages/client/messages/CreateGroup';
import Communities from './pages/client/messages/Communities';
import ChatSettings from './pages/client/messages/settings/index';
import FChatsettings from './pages/freelancer/messages/settings/index';
// import DirectMessages from './pages/client/messages/DirectMessages';
import DirectMessages from './pages/client/messages/direct/index';
import FDirectMessages from './pages/freelancer/messages/direct/index';
import NotificationSettings from './pages/freelancer/messages/settings/components/NotificationSettings';
import PermissionsSettings from './pages/freelancer/messages/settings/components/PermissionsSettings';
import AppearanceSettings from './pages/freelancer/messages/settings/components/AppearanceSettings';
import FMessages from './pages/freelancer/FMessages';
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
  },
  {
    path: "messages/*",
    element: <PrivateRoute element={CMessages} allowedRoles={['client']} />,
    children: [
      {
        path: "",
        element: <Navigate to="direct" replace />
      },
      {
        path: "direct",
        element: <DirectMessages />
      },
      {
        path: "groups",
        element: <GroupChats />
      },
      {
        path: "communities",
        element: <Communities />
      },
      {
        path: "settings",
        element: <ChatSettings />
      }
    ]
  },
  {
    path: "find-talent",
    component: lazy(() => import('./pages/client/FindTalent')),
    allowedRoles: ['client']
  }
];

// Client Profile Routes
const clientProfileRoutes = [
  {
    path: "",
    component: lazy(() => import('./pages/client/profile/AuthProfile')),
    allowedRoles: ['client', 'freelancer']
  },
  {
    path: "view_profile",
    component: lazy(() => import('./pages/client/profile/AuthProfile')),
    allowedRoles: ['client', 'freelancer']
  },
  {
    path: "edit_profile",
    component: lazy(() => import('./pages/client/profile/EditProfile')),
    allowedRoles: ['client']
  },
  {
    path: "reviews_ratings",
    component: lazy(() => import('./pages/client/profile/RatingsRatings')),
    allowedRoles: ['client']
  }, 
  {
    path: "collaborations",
    component: lazy(() => import('./pages/client/profile/Collaboration')),
    allowedRoles: ['client']
  }
];

// Freelancer Routes Configuration
const freelancerRoutes = [
  {
    path: "profile/:id",
    component: lazy(() => import('./pages/client/CProfile')),
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

// Freelancer Profile Routes
const freelancerProfileRoutes = [
  {
    path: "view_profile",
    component: lazy(() => import('./pages/freelancer/profile/AuthProfile')),
    allowedRoles: ['client', 'freelancer']
  },

  {
    path: "connections",
    component: lazy(() => import('./pages/freelancer/profile/Connections')),
    allowedRoles: ['freelancer']
  },
  {
    path: "collaborations",
    component: lazy(() => import('./pages/freelancer/profile/Collaborations')),
    allowedRoles: ['freelancer']
  },
  {
    path: "portfolio",
    component: lazy(() => import('./pages/freelancer/profile/Portfolio')),
    allowedRoles: ['freelancer']
  },
  {
    path: "settings",
    component: lazy(() => import('./pages/freelancer/profile/Settings')),
    allowedRoles: ['freelancer']
  }
];

// Create a separate array for dashboard routes
const dashboardRoutes = [
  {
    path: "",
    component: lazy(() => import('./pages/freelancer/dashboard/FreelancerAnalyticsPage')),
    allowedRoles: ['freelancer']
  },
  {
    path: "freelancer-analytics",
    component: lazy(() => import('./pages/freelancer/dashboard/FreelancerAnalyticsPage')),
    allowedRoles: ['freelancer']
  },
  {
    path: "projects",
    component: lazy(() => import('./pages/freelancer/dashboard/ProjectManagementPage')),
    allowedRoles: ['freelancer']
  },
  {
    path: "project-management",
    component: lazy(() => import('./pages/freelancer/dashboard/ProjectManagementPage')),
    allowedRoles: ['freelancer']
  },
  {
    path: "earnings",
    component: lazy(() => import('./pages/freelancer/dashboard/Earnings')),
    allowedRoles: ['freelancer']
  },
  {
    path: "bidding-overview",
    component: lazy(() => import('./pages/freelancer/dashboard/BiddingOverview')),
    allowedRoles: ['freelancer']
  },
  {
    path: "upcoming-events",
    component: lazy(() => import('./pages/freelancer/dashboard/UpcomingEvents')),
    allowedRoles: ['freelancer']
  },
  {
    path: "projects/:id",
    component: lazy(() => import('./pages/freelancer/ProjectDetailPage')),
    allowedRoles: ['freelancer']
  }
];

// Create a separate array for client dashboard routes
const clientDashboardRoutes = [
  {
    path: "",
    component: lazy(() => import('./pages/client/dashboard/DashboardOverview')),
    allowedRoles: ['client']
  },
  {
    path: "overview",
    component: lazy(() => import('./pages/client/dashboard/DashboardOverview')),
    allowedRoles: ['client']
  },
  {
    path: "projects",
    component: lazy(() => import('./pages/client/dashboard/PostedProjects')),
    allowedRoles: ['client']
  },
  {
    path: "recent_activity",
    component: lazy(() => import('./pages/client/dashboard/RecentActivity')),
    allowedRoles: ['client']
  },
  {
    path: "spendings",
    component: lazy(() => import('./pages/client/dashboard/Spendings')),
    allowedRoles: ['client']
  },
  {
    path: "upcoming-events",
    component: lazy(() => import('./pages/freelancer/dashboard/UpcomingEvents')),
    allowedRoles: ['client']
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
  const userId = Cookies.get('userId');

  // Modify the role check to treat student as freelancer
  const getEffectiveRole = (role) => {
    return role === 'student' ? 'freelancer' : role;
  };

  const userRole = getEffectiveRole(Cookies.get('role')) || 'client';

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
            
            {/* Regular client routes */}
            {clientRoutes.filter(route => !route.path.startsWith('profile')).map(({ path, component: Component, allowedRoles }) => (
              <Route
                key={path}
                path={path}
                element={<PrivateRoute element={Component} allowedRoles={allowedRoles} />}
              />
            ))}
            
            {/* Profile routes using CProfile */}
            <Route path="profile/:id/*" element={<PrivateRoute element={CProfile} allowedRoles={['client', 'freelancer']} />}>
              {clientProfileRoutes.map(({ path, component: Component }) => (
                <Route
                  key={path}
                  path={path}
                  element={<Component />}
                />
              ))}
            </Route>
            
            {/* Dashboard routes with shared layout */}
            <Route 
              path="dashboard" 
              element={
                <PrivateRoute 
                  element={ClientDashboardLayout} 
                  allowedRoles={['client']} 
                />
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="overview" element={<DashboardOverview />} />
              <Route path="projects" element={<PostedProjects />} />
              <Route path="recent_activity" element={<RecentActivity />} />
              <Route path="spendings" element={<Spendings />} />
              <Route path="upcoming-events" element={<UpcomingEvents />} />
              <Route path="projects/:id" element={
                <PrivateRoute
                  element={lazy(() => import('./pages/client/PostedProjectForBidsPage'))}
                  allowedRoles={['client']}
                />
              } />
            </Route>

            {/* Client Connection Routes */}
            <Route
              path="connections"
              element={
                <PrivateRoute allowedRoles={['client']}>
                  <CConnections />
                </PrivateRoute>
              }
            />
            <Route
              path="connection-requests"
              element={
                <PrivateRoute allowedRoles={['client']}>
                  <CConnectionRequests />
                </PrivateRoute>
              }
            />

            {/* Messages Route */}
            <Route
              path="messages/*"
              element={<PrivateRoute element={CMessages} allowedRoles={['client']} />}
            >
              <Route index element={<Navigate to="direct" replace />} />
              <Route path="direct" element={<DirectMessages />} />
              <Route path="groups" element={<GroupChats />} />
              <Route path="communities" element={<Communities />} />
              <Route path="settings" element={<ChatSettings />} />
            </Route>
          </Route>

          {/* Freelancer/Student Routes - Update allowedRoles to include 'student' */}
          <Route path="/freelancer/*">
            <Route index element={<Navigate to="homepage" replace />} />
            
            {/* Regular freelancer routes */}
            {freelancerRoutes.filter(route => !route.path.startsWith('profile')).map(({ path, component: Component, allowedRoles }) => (
              <Route
                key={path}
                path={path}
                element={
                  <PrivateRoute 
                    element={Component} 
                    allowedRoles={[...allowedRoles, 'student']} // Add student to allowed roles
                  />
                }
              />
            ))}
            
            {/* Profile routes using FProfile */}
            <Route 
              path="profile/:id/*" 
              element={
                <PrivateRoute 
                  element={FProfile} 
                  allowedRoles={['client', 'freelancer', 'student']} 
                />
              }
            >
              {freelancerProfileRoutes.map(({ path, component: Component }) => (
                <Route
                  key={path}
                  path={path}
                  element={<Component />}
                />
              ))}
            </Route>
            
            {/* Dashboard routes with shared layout */}
            <Route 
              path="dashboard" 
              element={
                <PrivateRoute 
                  element={DashboardLayout} 
                  allowedRoles={['freelancer', 'student']} 
                />
              }
            >
              <Route index element={<FreelancerAnalyticsPage />} />
              <Route path="freelancer-analytics" element={<FreelancerAnalyticsPage />} />
              <Route path="projects" element={<ProjectManagementPage />} />
              <Route path="project-management" element={<ProjectManagementPage />} />
              <Route path="earnings" element={<Earnings />} />
              <Route path="bidding-overview" element={<BiddingOverview />} />
              <Route path="upcoming-events" element={<UpcomingEvents />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
            </Route>

            {/* Freelancer Connection Routes */}
            <Route
              path="connections"
              element={
                <PrivateRoute
                  element={FConnections}
                  allowedRoles={['freelancer', 'student']}>
                </PrivateRoute>
              } 
            />

            <Route
              path="connection-requests"
              element={
                <PrivateRoute allowedRoles={['freelancer', 'student']}>
                  <FConnectionRequests />
                </PrivateRoute>
              }
            />

            {/* Freelancer Messages Route */}
            <Route
              path="messages/*"
              element={
                <PrivateRoute 
                  element={FMessages} 
                  allowedRoles={['freelancer', 'student']} 
                />
              }
            >
              <Route index element={<Navigate to="direct" replace />} />
              <Route path="direct" element={<FDirectMessages />} />
              <Route path="groups" element={<FGroupChats />} />
              <Route path="communities" element={<Communities />} />
              <Route path="settings" element={<FChatsettings />} />
            </Route>
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
