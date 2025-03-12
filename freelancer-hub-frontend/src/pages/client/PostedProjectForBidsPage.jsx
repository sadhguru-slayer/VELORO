import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, notification, Checkbox, Card, Pagination } from 'antd';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import CSider from '../../components/client/CSider';
import CHeader from '../../components/client/CHeader';
import axios from 'axios';
import Cookies from 'js-cookie';

const PostedProjectForBidsPage = ({ userId, role }) => {
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

  const pathnames = location.pathname.split('/').filter((x) => x);

  const handleMenuClick = (component) => {
    if (component !== 'projects') {
      navigate('/client/dashboard', { state: { component } });
    }
  };

  const [activeProfileComponent, setActiveProfileComponent] = useState('');

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/client/profile') {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
    }
  };

  const { id: projectId } = useParams();
  const bidsData = [
    {
      task: 'Data Collection',
      skills: ['Python', 'Pandas'],
      duration: '2 weeks',
      bidAmount: 1400, // Ensure it's a number
      freelancer: 'John Doe',
    },
    {
      task: 'Model Development',
      skills: ['TensorFlow', 'Machine Learning'],
      duration: '3 weeks',
      bidAmount: 2800, // Ensure it's a number
      freelancer: 'Jane Smith',
    },
    {
      task: 'Model Evaluation',
      skills: ['Python', 'Data Analysis'],
      duration: '1 week',
      bidAmount: 1900, // Ensure it's a number
      freelancer: 'Tom Brown',
    },
  ];

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/client/get_project/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('accessToken')}`,
            },
          }
        );
        const isCollaborative = response.data.is_collaborative;
        setProject(response.data);
        console.log(response.data.tasks);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBidsDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/client/get_bids_on_project/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('accessToken')}`,
            },
          }
        );
        const bids = response.data;
        console.log(bids);
        setLoading(false);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBidsDetails();
    fetchProjectDetails();
  }, [projectId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project || !project.tasks) {
    return <div>No project details available.</div>;
  }

  const handleFilterChange = (key, value) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <CSider
        userId={userId}
        role={role}
        dropdown={true}
        collapsed={true}
        handleMenuClick={handleMenuClick}
        abcds={activeComponent}
        handleProfileMenu={handleProfileMenu}
        activeProfileComponent={activeProfileComponent}
      />
      <div className="bg-gray-100 flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-16 md:ml-16 lg:ml-22">
        <CHeader userId={userId} />

        <div className="flex-1 overflow-auto bg-gray-200 p-6">
          {/* Project Overview */}
          <div className="bg-white p-6 mb-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-teal-600">{project.title}</h2>
            <p>
              <strong>Description : </strong>
              <div dangerouslySetInnerHTML={{ __html: project.description }} />
            </p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-700">
              <p><strong>Budget : </strong> {project.budget}</p>
              <p><strong>Date Range : </strong> {project.deadline}</p>
              <p><strong>Domain : </strong> {project.domain.name}</p>
              <p><strong>Collaborative : </strong> {project.isCollaborative ? 'Yes' : 'No'}</p>
            </div>
            <h3 className="text-xl font-semibold mt-4 mb-2">Project Tasks</h3>
            {project.tasks.map((task, index) => (
              <Card key={index} className="mb-4 shadow-sm">
                <p><strong>Task {index + 1} : </strong> {task.title}</p>
                <div dangerouslySetInnerHTML={{ __html: task.description }} /><p>
                <strong>Skills Needed : </strong> 
                {task.skills_required_for_task.map((skill) => skill.name).join(', ')}
              </p>
              
                <p><strong>Task Budget : </strong> {task.budget}</p>
                <p><strong>Task Deadline : </strong> {project.deadline}</p>
              </Card>
            ))}
          </div>

          {/* Filter Section */}
          <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-teal-600 mb-4">Filter Bids</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Tasks</label>
                <Checkbox.Group
                  options={project.tasks.map((task) => ({
                    label: task.title,
                    value: task.title,
                  }))}
                  onChange={(checkedValues) => handleFilterChange('tasks', checkedValues)}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Skills</label>
                <Checkbox.Group
                  options={['Python', 'TensorFlow', 'Pandas', 'Machine Learning', 'Data Analysis'].map(
                    (skill) => ({ label: skill, value: skill })
                  )}
                  onChange={(checkedValues) => handleFilterChange('skills', checkedValues)}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Duration</label>
                <select
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-2 text-sm"
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
                  className="w-full border-gray-300 rounded-lg p-2 text-sm"
                  placeholder="Max bid amount"
                />
              </div>
            </div>
          </div>

          {/* Bids List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-teal-600">Bids</h3>
            <div>
              {bidsData.map((bid, index) => (
                <Card key={index} className="mb-4 shadow-sm">
                  <p><strong>Freelancer : </strong> {bid.freelancer}</p>
                  <p><strong>Task : </strong> {bid.task}</p>
                  <p><strong>Skills : </strong> {bid.skills.join(', ')}</p>
                  <p><strong>Duration : </strong> {bid.duration}</p>
                  <p><strong>Bid Amount : </strong> {bid.bidAmount}</p>
                </Card>
              ))}
            </div>
            {/* Pagination */}
            <Pagination
              current={1}
              pageSize={5}
              total={bidsData.length}
              className="mt-4"
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostedProjectForBidsPage;
