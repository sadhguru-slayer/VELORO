import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, notification, Checkbox } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import CSider from '../../components/client/CSider';

const PostedProjectForBidsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { record } = location.state || {}; // Getting the project details passed via navigation
  const [activeComponent, setActiveComponent] = useState('');

  const [selectedFilters, setSelectedFilters] = useState({
    tasks: [],
    skills: [],
    duration: '',
    bidAmount: '',
  });

  const pathnames = location.pathname.split('/').filter(x => x);

  const handleMenuClick = (component) => {
    if (component !== 'projects') {
      navigate('/client/dashboard', { state: { component } });
    }
  };

  const [activeProfileComponent, setActiveProfileComponent] = useState('');

  const handleProfileMenu = (profileComponent) => {

    if (location.pathname !== '/client/profile') {
      navigate('/client/profile', { state: { profileComponent } });
    }
  };

  useEffect(() => {
    // Mocking the API call to fetch project details and bids
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        // Simulated project data
        const projectData = {
          title: "Edo okati",
          description: "We need a skilled freelancer to develop an AI-based model for predicting data trends.",
          budget: "$5000 - $7000",
          dateRange: "12-01-2025 to 29-01-2025",
          domain: "ML, Data Science",
          isCollaborative: true,
          tasks: [
            { title: "Data Collection", description: "Collecting necessary data for the project", skills: ["Python", "Pandas"], budget: "$1500" },
            { title: "Model Development", description: "Developing the AI model for data prediction", skills: ["TensorFlow", "Machine Learning"], budget: "$3000" },
            { title: "Model Evaluation", description: "Evaluating the performance of the model", skills: ["Python", "Data Analysis"], budget: "$2000" },
          ],
        };
        const bidsData = [
          {
            task: "Data Collection",
            skills: ["Python", "Pandas"],
            duration: "2 weeks",
            bidAmount: 1400,  // Ensure it's a number
            freelancer: "John Doe",
          },
          {
            task: "Model Development",
            skills: ["TensorFlow", "Machine Learning"],
            duration: "3 weeks",
            bidAmount: 2800,  // Ensure it's a number
            freelancer: "Jane Smith",
          },
          {
            task: "Model Evaluation",
            skills: ["Python", "Data Analysis"],
            duration: "1 week",
            bidAmount: 1900,  // Ensure it's a number
            freelancer: "Tom Brown",
          },
        ];

        setProject({ ...projectData, bids: bidsData });
      } catch (error) {
        console.error("Error fetching project details", error);
        notification.error({ message: 'Error loading project details.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, []);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleAddComment = (value) => {
    if (value) {
      const newMessage = { sender: "Freelancer", message: value };
      setProject((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, newMessage],
      }));
      handleCloseModal();
      notification.success({ message: 'Comment added successfully!' });
    }
  };

  const handleFilterChange = (filterName, value) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  // Filter the bids based on selected filters
  const filteredBids = project?.bids.filter((bid) => {
    const matchesTask = selectedFilters.tasks.length ? selectedFilters.tasks.includes(bid.task) : true;
    const matchesSkills = selectedFilters.skills.length ? selectedFilters.skills.every(skill => bid.skills.includes(skill)) : true;
    const matchesDuration = selectedFilters.duration ? bid.duration === selectedFilters.duration : true;
    
    // Convert selectedFilters.bidAmount to a number and compare it with the bidAmount
    const matchesBidAmount = selectedFilters.bidAmount ? bid.bidAmount <= Number(selectedFilters.bidAmount) : true;
    
    return matchesTask && matchesSkills && matchesDuration && matchesBidAmount;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <CSider dropdown={true} collapsed={true} handleMenuClick={handleMenuClick} abcds={activeComponent} handleProfileMenu={handleProfileMenu} activeProfileComponent={activeProfileComponent}/>

      <div className=" bg-gray-100 flex-1 flex flex-col overflow-x-hidden 
  ml-14 sm:ml-16 md:ml-16 lg:ml-22">  <FHeader />
        <div className="flex-1 overflow-auto bg-gray-200 p-6">
          

          {/* Project Overview */}
          <div className="bg-white p-6 mb-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold">{project.title}</h2>
            <p><strong>Description:</strong> {project.description}</p>
            <p><strong>Budget:</strong> {project.budget}</p>
            <p><strong>Date Range:</strong> {project.dateRange}</p>
            <p><strong>Domain:</strong> {project.domain}</p>
            <p><strong>Collaborative:</strong> {project.isCollaborative ? 'Yes' : 'No'}</p>

            <h3 className="text-xl font-semibold mb-4">Project Tasks</h3>
            {project.tasks.map((task, index) => (
              <div key={index} className="bg-white p-4 mb-4 rounded-lg shadow-sm">
                <p><strong>Task {index + 1}:</strong> {task.title}</p>
                <p>{task.description}</p>
                <p><strong>Skills Needed:</strong> {task.skills.join(', ')}</p>
                <p><strong>Task Budget:</strong> {task.budget}</p>
              </div>
            ))}
          </div>

          {/* Filter Section */}
          <div className="bg-white p-4 mb-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Filter Bids</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Tasks</label>
                <Checkbox.Group
                  options={project.tasks.map(task => ({ label: task.title, value: task.title }))}
                  onChange={(checkedValues) => handleFilterChange('tasks', checkedValues)}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Skills</label>
                <Checkbox.Group
                  options={['Python', 'TensorFlow', 'Pandas', 'Machine Learning', 'Data Analysis'].map(skill => ({ label: skill, value: skill }))}
                  onChange={(checkedValues) => handleFilterChange('skills', checkedValues)}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Duration</label>
                <select
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  className="w-full border-gray-300 rounded-md p-2 text-sm"
                >
                  <option value="">Any</option>
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="3 weeks">3 weeks</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Bid Amount</label>
                <input
                  type="number"
                  onChange={(e) => handleFilterChange('bidAmount', e.target.value)}
                  className="w-full border-gray-300 rounded-md p-2 text-sm"
                  placeholder="Max bid amount"
                />
              </div>
            </div>
          </div>

          {/* Bids List */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Bids</h3>
            <div>
              {filteredBids.map((bid, index) => (
                <div key={index} className="bg-gray-50 p-4 mb-4 rounded-md shadow-sm">
                  <p><strong>Freelancer:</strong> {bid.freelancer}</p>
                  <p><strong>Task:</strong> {bid.task}</p>
                  <p><strong>Skills:</strong> {bid.skills.join(', ')}</p>
                  <p><strong>Duration:</strong> {bid.duration}</p>
                  <p><strong>Bid Amount:</strong> {bid.bidAmount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostedProjectForBidsPage;