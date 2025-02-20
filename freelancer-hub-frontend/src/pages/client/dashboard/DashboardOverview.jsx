import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie'
import { Modal, Button, Table, Input, Select, Pagination, Tabs } from 'antd';


import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaEye, FaSortAmountDown } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardOverview = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsSummary, setProjectsSummary] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [clientUsername, setClientUsername] = useState('');
  const [activeProjects, setActiveProjects] = useState(0);
  const [pendingTasks, setPendingtasks] = useState(0);
  const [tasksDueThisWeek, setTasksDueThisWeek] = useState(0);
  const [projectsCompletedAheadLastMonth, setProjectsCompletedAheadLastMonth] = useState(0.0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const pageSize = 4;
  const navigate = useNavigate();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Spend Over Time',
        data: [],
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      },
    ],
  });
  
  const [timeFrame, setTimeFrame] = useState('monthly'); 
  const fetchSpendingData = async (timeFrame) => {
    try {
      const accessToken = Cookies.get('accessToken');
      const csrftoken = Cookies.get('csrftoken');
      
      const response = await axios.get(`http://127.0.0.1:8000/api/client/spending_data/`, {
        params: { time_frame: timeFrame },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-CSRFToken': csrftoken,
        },
      });
      
      setChartData(response.data);
      
    } catch (error) {
      console.error('Error fetching spending data:', error);
    }
  };
  
  useEffect(() => {
    fetchSpendingData(timeFrame); // Fetch data based on the current time frame
  }, [timeFrame]);
  
  const handleTimeFrameChange = (newTimeFrame) => {
    setTimeFrame(newTimeFrame);
  };

  useEffect(() => {
    const fetchDashBoardOverview = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const csrftoken = Cookies.get('csrftoken');
        
        const response = await axios.get('http://127.0.0.1:8000/api/client/dashboard_overview', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-CSRFToken': csrftoken,
          },
        });
        const data = response.data;
        setActiveProjects(data.active_projects);
        setPendingtasks(data.pending_tasks);
        setTotalSpend(data.total_spent);
        setUpcomingDeadlines(data.nearest_deadlines);
        setProjectsSummary(data.project_summary ); // Ensure it's always an array
        setRecentActivities(data.recent_activities);
        setTasksDueThisWeek(data.tasks_due_this_week);
        setProjectsCompletedAheadLastMonth(data.projects_completed_ahead_last_month)
        setClientUsername(data.client_username.username);
        // console.log(data.client_username)
      } catch (error) {
        console.error('Error fetching dashboard overview:', error);
      }
    };

    fetchDashBoardOverview();
  }, []);

  const openDetails = (project) => {
    setSelectedProject(project);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedProject(null);
    setShowDetails(false);
  };
  const paginatedData = projectsSummary && projectsSummary.length > 0 
    ? projectsSummary.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      )
    : []; // Default to an empty array if there are no projects yet

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };
  
  const onMoreClick = (component) => {
    navigate('/client/dashboard', { state: { component } })
  };
  
    // Dummy data for demo purposes
    const performanceData = {
      freelancerResponseTime: 2.5, // in hours
      timeSaved: 30, // in hours
    };
  

  const handleShowActiveProjects = () => {
    navigate('/client/dashboard', { state: { component: 'projects', status: 'Ongoing' } });
  };

  const handleButtonClick = (activity,record_id) => {
    if (activity.activity_type === "project_created" || activity.activity_type === "project_updated") {
      navigate(`/client/view-bids/posted-project/${record_id}`, { state: { record_id } })
    } else if (activity.activity_type === "profile_updated") {
      navigate("/client/profile/");
    } else if (activity.activity_type === "event_created" || activity.activity_type === "event_updated") {
      navigate("/client/dashboard/", { state: { component: "upcoming-events" } });
    }
  };
  return (
    <div className="p-3 sm:p-3 md:p-4 lg:p-6">
      {/* Welcome Banner */}
      <div className="bg-teal-400 text-white text-center p-6 rounded-lg">
  <h1 className="text-2xl font-semibold">
    
    {tasksDueThisWeek === 1
      ? `Hi ${clientUsername}, 1 task due this week!`
      : tasksDueThisWeek > 1
      ? `Hi ${clientUsername}, ${tasksDueThisWeek} tasks due this week!`
      : `Hi ${clientUsername}, No tasks due this week!`}
  </h1>
  <p>
    {projectsCompletedAheadLastMonth === 0
      ? `No projects completed ahead of deadlines last month!`
      : projectsCompletedAheadLastMonth === 100
      ? `100% of projects completed ahead of deadlines last month!`
      : `${projectsCompletedAheadLastMonth}% of projects completed ahead of deadlines last month!`}
  </p>
  <div className="mt-4 flex justify-center gap-4">
    <button
      onClick={() => navigate('/client/post-project')}
      className="bg-charcolBlue text-white px-4 py-2 rounded"
    >
      Post a New Project
    </button>
  </div>
</div>


      {/* Performance Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold" onClick={handleShowActiveProjects}>Active Projects</h3>
          <div className="flex items-center mt-2">
            <p className="text-2xl font-bold">{activeProjects}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Pending tasks</h3>
          <p>{pendingTasks} tasks pending approval</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Total Spend</h3>
          <p>₹{totalSpend}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Freelancer Response Time</h3>
          <p>{performanceData.freelancerResponseTime} hours</p>
        </div>
      </div>

      {/* Project Summary */}
      <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold flex justify-between">
          <span>Projects' Summary</span>
          <span className='underline text-teal-600 cursor-pointer text-md' onClick={() => onMoreClick("projects")}>
            more+
          </span>
        </h2>

        <div className="hidden md:block mt-4 overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Project Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Deadline</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Budget Utilized</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((record, index) => (
                <tr key={index} className={record.status === 'Delayed' ? 'bg-red-100' : 'bg-green-100'}>
                  <td className="px-4 py-2 text-sm">{record.title}</td>
                  <td className="px-4 py-2 text-sm">{record.status}</td>
                  <td className="px-4 py-2 text-sm">{record.deadline}</td>
                  <td className="px-4 py-2 text-sm">{record.budget}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 text-sm"
                      onClick={() => {
                        navigate(`/client/dashboard/projects/${record.id}`, { state: { record } });
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden">
                {paginatedData.map((record, index) => (
                  <div key={record.id} className="mb-4 border border-gray-200 rounded-md">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                      className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none"
                    >
                      {record.title}
                    </button>
                    {openDropdown === index && (
                      <div className="p-3 bg-white flex flex-wrap justify-center">
                        <p><strong>Deadline:</strong> {record.deadline}</p>
                        <p><strong>Status:</strong> {record.status}</p>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            className="text-charcolBlue"
                            icon={<FaEye />}
                            onClick={() => openDetails(record)}
                          >
                            Preview
                          </Button>
                          <Button
                            className="bg-charcolBlue text-teal-400 hover:text-teal-500"
                            onClick={() => navigate(`/client/view-bids/posted-project/${record.id}`, { state: { record } })}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

        <div className="mt-4 flex justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={projectsSummary.length}
            onChange={handlePaginationChange}
            showSizeChanger={false}
          />
        </div>

        {/* Modal for Project Details */}
        <Modal
          title="Project Details"
          open={showDetails}
          onCancel={closeDetails}
          footer={[<Button key="close" onClick={closeDetails} type="primary">Close</Button>]}
          width={800}
        >
          {selectedProject && (
            <div>
              <h3>{selectedProject.title}</h3>
              <p><strong>Deadline:</strong> {selectedProject.deadline}</p>
              <p><strong>Status:</strong> {selectedProject.status}</p>
              <p><strong>Client:</strong> {selectedProject.client}</p>
              {/* Add more project details here */}
            </div>
          )}
        </Modal>
      </div>



      {/* Upcoming Deadlines & tasks */}
      <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold flex justify-between"><span>Upcoming Deadlines</span><span className='underline text-teal-600 cursor-pointer text-md' onClick={()=>onMoreClick("upcoming-events")}>more+</span></h2>

        <div className="mt-4">
          {upcomingDeadlines.slice(0,5).map((tasks, index) => (
            <div key={index} className="flex justify-between items-center mb-4">
              <p>{tasks.title} - {tasks.deadline}</p>
              <button className="bg-mutedGold text-white px-2 py-2 rounded">Notify Freelancer</button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold flex justify-between">
        <span>Recent Activity</span>
        <span className="underline text-teal-600 cursor-pointer text-md" onClick={() => onMoreClick("recent_activity")}>more+</span>
      </h2>
      <div className="mt-4">
        <ul>
          {recentActivities.slice(0, 5).map((activity) => {
            const cutIndex = activity.description.indexOf('- Changed fields:');
            const slicedDescription = cutIndex !== -1 ? activity.description.slice(0, cutIndex) : activity.description;
            const displayDescription = slicedDescription.length > 50 ? `${slicedDescription.slice(0, 70)}...` : slicedDescription;
            return (
            <li key={activity.id} className="flex justify-between mb-2">
            <span>{displayDescription}</span>
            {activity.activity_type === "project_created" ||
              activity.activity_type === "project_updated" ||
              activity.activity_type === "profile_updated" ||
              activity.activity_type === "event_created" ||
              activity.activity_type === "event_updated" ? (
                <button className="bg-teal-500 text-white px-2 py-2 rounded"
                onClick={() => handleButtonClick(activity,activity.related_object_id)}
                >
                  View Details
                </button>
              ) : null}
            </li>
            )
          })}
        </ul>
      </div>
    </div>

      {/* Spend Chart */}
      <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold flex justify-between items-center">
    <span>Spending Overview</span>
    <span
      className="underline text-teal-600 cursor-pointer text-md"
      onClick={() =>
        handleTimeFrameChange(
          timeFrame === 'monthly'
            ? 'weekly'
            : timeFrame === 'weekly'
            ? 'yearly'
            : 'monthly'
        )
      }
    >
      more+
    </span>
  </h2>

  <Line data={chartData} /> {/* Displaying the chart with the fetched data */}

  <div className="mt-6 flex space-x-4">
    <button
      onClick={() => handleTimeFrameChange('weekly')}
      className={`px-4 py-2 rounded-md text-white ${
        timeFrame === 'weekly' ? 'bg-charcolBlue' : 'bg-teal-400'
      } hover:bg-charcolBlue transition duration-300`}
    >
      Weekly
    </button>
    <button
      onClick={() => handleTimeFrameChange('monthly')}
      className={`px-4 py-2 rounded-md text-white ${
        timeFrame === 'monthly' ? 'bg-charcolBlue' : 'bg-teal-400'
      } hover:bg-charcolBlue transition duration-300`}
    >
      Monthly
    </button>
    <button
      onClick={() => handleTimeFrameChange('yearly')}
      className={`px-4 py-2 rounded-md text-white ${
        timeFrame === 'yearly' ? 'bg-charcolBlue' : 'bg-teal-400'
      } hover:bg-charcolBlue transition duration-300`}
    >
      Yearly
    </button>
  </div>
</div>



    </div>
  );
};

export default DashboardOverview;
