import React, { useState, useEffect } from 'react';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import IndividualLoadingComponent from '../../components/IndividualLoadingComponent';

const FProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeProfileComponent, setActiveProfileComponent] = useState('view_profile');
  
  const [individualLoading, setIndividualLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentState = location.state?.activeProfileComponent;
    if (currentState) {
      setActiveProfileComponent(currentState);
    } else {
      setActiveProfileComponent('profile');
    }
    setLoading(false);
  }, [location.state]);

  const handleMenuClick = (component) => {
    if (location.pathname !== '/freelancer/dashboard') {
      navigate('/freelancer/dashboard', { state: { component } });
    } 
  };

  const pathnames = location.pathname.split('/').filter(x => x);

  // Sample data for collaborators, skills, portfolio, and reviews
  const collaborators = [
    { id: 1, name: 'Jane Smith', role: 'UI/UX Designer', image: '/path/to/jane.jpg' },
    { id: 2, name: 'Mike Johnson', role: 'Backend Developer', image: '/path/to/mike.jpg' },
    { id: 3, name: 'Sarah Lee', role: 'Graphic Designer', image: '/path/to/sarah.jpg' },
  ];

  const skills = [
    { name: 'React', level: 90 },
    { name: 'Node.js', level: 85 },
    { name: 'UI/UX Design', level: 80 },
    { name: 'Graphic Design', level: 75 },
  ];

  const portfolio = [
    { id: 1, title: 'E-commerce Website', image: '/path/to/project1.jpg', link: '#' },
    { id: 2, title: 'Mobile App Design', image: '/path/to/project2.jpg', link: '#' },
    { id: 3, title: 'Branding Project', image: '/path/to/project3.jpg', link: '#' },
  ];

  const reviews = [
    { id: 1, client: 'Client A', rating: 5, comment: 'Amazing work! Highly recommended.' },
    { id: 2, client: 'Client B', rating: 4, comment: 'Great communication and delivery.' },
    { id: 3, client: 'Client C', rating: 5, comment: 'Will definitely work with again.' },
  ];

  const connections = [
    { id: 1, name: 'Anna Taylor', role: 'Software Engineer', image: '/path/to/anna.jpg' },
    { id: 2, name: 'Ben Wilson', role: 'Project Manager', image: '/path/to/ben.jpg' },
    { id: 3, name: 'Lily Davis', role: 'Product Designer', image: '/path/to/lily.jpg' },
  ];

 
  const handleProfileMenu = (profileComponent) => {
    console.log(profileComponent)
    if (location.pathname !== '/profile/profile') {
      navigate('/profile/profile', { state: { profileComponent } });
    }
    else {
      setActiveProfileComponent(profileComponent);
    }

    setIndividualLoading(true);

    setTimeout(() => {
      setIndividualLoading(false);
    }, 500);
  };

  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <FSider dropdown={true} collapsed={true} handleMenuClick={handleMenuClick} handleProfileMenu={handleProfileMenu} activeProfileComponent={activeProfileComponent} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-16 md:ml-16 lg:ml-24">
        {/* Header */}
        <FHeader />

        {/* Profile Content */}
        <div className="flex-1 overflow-auto bg-gray-200 p-4">
          {loading ? (
            <div>Loading...</div>
          ) : individualLoading ? (
            <IndividualLoadingComponent />
          ) : (
            <div className="flex flex-col items-start space-y-6">
              {/* Profile Overview */}
              <div className="bg-white p-6 rounded-lg shadow-md w-full">
                <div className="flex items-center space-x-6">
                  <img src="/path/to/your/profile-picture.jpg" alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold">John Doe</h2>
                    <p className="text-gray-600">Full Stack Developer</p>
                    <div className="mt-2 text-gray-500">
                      <p>📍 San Francisco, CA</p>
                      <p>🔗 500+ Connections</p>
                    </div>
                    <div className="mt-4 flex space-x-4">
                      <button className="bg-charcolBlue text-white py-2 px-6 rounded-lg hover:bg-violet-700 transition duration-300">
                        Edit Profile
                      </button>
                      <button className="bg-violet-500 text-white py-2 px-6 rounded-lg hover:bg-charcolBlue transition duration-300">
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills and Expertise */}
              <div className="bg-white p-6 rounded-lg shadow-md w-full">
                <h3 className="text-xl font-semibold mb-4">Skills & Expertise</h3>
                <div className="space-y-3">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <p className="w-24 text-sm font-medium">{skill.name}</p>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-violet-500 h-2 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                      <p className="w-10 text-sm text-gray-600">{skill.level}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio */}
              <div className="bg-white p-6 rounded-lg shadow-md w-full">
                <h3 className="text-xl font-semibold mb-4">Portfolio</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolio.map((project) => (
                    <div key={project.id} className="relative group">
                      <img src={project.image} alt={project.title} className="w-full h-48 object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition duration-300 rounded-lg flex items-center justify-center">
                        <a href={project.link} className="text-white font-semibold">
                          View Project
                        </a>
                      </div>
                      <p className="mt-2 text-sm font-medium">{project.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Collaborators */}
              <div className="bg-white p-6 rounded-lg shadow-md w-full">
                <h3 className="text-xl font-semibold mb-4">Current Collaborators</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex flex-col items-center">
                      <img src={collaborator.image} alt={collaborator.name} className="w-16 h-16 rounded-full object-cover" />
                      <p className="mt-2 text-sm font-semibold">{collaborator.name}</p>
                      <p className="text-xs text-gray-500">{collaborator.role}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews and Ratings */}
              <div className="bg-white p-6 rounded-lg shadow-md w-full">
                <h3 className="text-xl font-semibold mb-4">Reviews & Ratings</h3>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{review.client[0]}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{review.client}</p>
                        <div className="flex items-center space-x-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <span key={i} className="text-yellow-500">★</span>
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connections */}
              <div className="bg-white p-6 rounded-lg shadow-md w-full">
                <h3 className="text-xl font-semibold mb-4">Connections</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex flex-col items-center">
                      <img src={connection.image} alt={connection.name} className="w-16 h-16 rounded-full object-cover" />
                      <p className="mt-2 text-sm font-semibold">{connection.name}</p>
                      <p className="text-xs text-gray-500">{connection.role}</p>
                      <button className="mt-2 bg-charcolBlue text-white py-1 px-4 rounded-lg hover:bg-charcolBlue transition duration-300">
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="mt-6 flex justify-between w-full">
                <Link to="/freelancer/dashboard">
                  <button className="bg-charcolBlue text-white py-2 px-6 rounded-lg hover:bg-violet-700 transition duration-300">
                    Go to Dashboard
                  </button>
                </Link>
                <button className="bg-violet-500 text-white py-2 px-6 rounded-lg hover:bg-charcolBlue transition duration-300">
                  Hire Me
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FProfile;
