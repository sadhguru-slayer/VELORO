import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import { Link } from 'react-router-dom';

const allProjects = [
  {
    id: 1,
    title: 'Build a Website',
    payment: '500-1000',
    duration: '1-2 weeks',
    collaboration: 'Solo',
    description: 'Build a responsive portfolio website for a client.',
  },
  {
    id: 2,
    title: 'Design a Logo',
    payment: '100-300',
    duration: '3-5 days',
    collaboration: 'Solo',
    description: 'Design a creative logo for a startup business.',
  },
  {
    id: 3,
    title: 'App Development',
    payment: '2000-5000',
    duration: '1 month',
    collaboration: 'Team',
    description: 'Develop a mobile app for a client in the e-commerce space.',
  },
  {
    id: 4,
    title: 'Social Media Marketing',
    payment: '300-800',
    duration: '1 month',
    collaboration: 'Team',
    description: 'Create a social media marketing strategy for a brand.',
  },
];

const BrowseProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(allProjects);
  const [filters, setFilters] = useState({
    payment: '',
    duration: '',
    collaboration: '',
  });

  const handleMenuClick = (component) => {
    if (location.pathname !== '/freelancer/dashboard') {
      navigate('/freelancer/dashboard', { state: { component } });
    }
  };

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/freelancer/profile') {
      navigate('/freelancer/profile', { state: { profileComponent } });
    }
  };
  
  useEffect(() => {
    // Filter projects based on selected filters
    let filteredProjects = allProjects;

    if (filters.payment) {
      filteredProjects = filteredProjects.filter(project => project.payment.includes(filters.payment));
    }
    if (filters.duration) {
      filteredProjects = filteredProjects.filter(project => project.duration.includes(filters.duration));
    }
    if (filters.collaboration) {
      filteredProjects = filteredProjects.filter(project => project.collaboration === filters.collaboration);
    }

    setProjects(filteredProjects);
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Navigate to project details page
  const handleViewProject = (project) => {
    navigate(`/freelancer/browse_project/project-view/${project.id}`, { state: { project } });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <FSider dropdown={true} collapsed={true} handleMenuClick={handleMenuClick} handleProfileMenu={handleProfileMenu}/>
      
      {/* Main Content Area */}
      <div className=" bg-gray-100 flex-1 flex flex-col overflow-x-hidden 
  ml-14 sm:ml-16 md:ml-16 lg:ml-24">  {/* Header */}
        <FHeader />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-200 p-6">
          <div className="container mx-auto">
            {/* Breadcrumb */}
            

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Freelancer Project Browser</h1>

            {/* Filter Section */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <label className="mr-2 text-lg text-gray-700">Payment Range:</label>
                <select
                  name="payment"
                  onChange={handleFilterChange}
                  className="p-2 border rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="500-1000">500-1000</option>
                  <option value="100-300">100-300</option>
                  <option value="2000-5000">2000-5000</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="mr-2 text-lg text-gray-700">Duration:</label>
                <select
                  name="duration"
                  onChange={handleFilterChange}
                  className="p-2 border rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="3-5 days">3-5 days</option>
                  <option value="1 month">1 month</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="mr-2 text-lg text-gray-700">Collaboration:</label>
                <select
                  name="collaboration"
                  onChange={handleFilterChange}
                  className="p-2 border rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="Solo">Solo</option>
                  <option value="Team">Team</option>
                </select>
              </div>
            </div>

            {/* Project List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-2"><strong>Payment:</strong> {project.payment}</p>
                    <p className="text-gray-600 mb-2"><strong>Duration:</strong> {project.duration}</p>
                    <p className="text-gray-600 mb-2"><strong>Collaboration:</strong> {project.collaboration}</p>
                    <p className="text-gray-600">{project.description}</p>

                    {/* View Project Button */}
                    <button
                      onClick={() => handleViewProject(project)}
                      className="mt-6 bg-gradient-to-bl from-violet-300 via-violet-400 to-violet-500 text-white px-3 py-3 rounded-lg shadow-sm hover:bg-gradient-to-l transition-all duration-200"
                      >
                      View Project
                    </button>
                  </div>
                ))
              ) : (
                <p>No projects match your filter criteria.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseProjectsPage;
