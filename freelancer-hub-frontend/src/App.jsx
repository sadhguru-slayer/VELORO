import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path="connections" element={<PrivateRoute element={CConnectionRequests} />} />

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
