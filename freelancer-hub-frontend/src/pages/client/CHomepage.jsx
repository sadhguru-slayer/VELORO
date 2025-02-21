import React from "react";
import CHeader from "../../components/client/CHeader";
import CSider from "../../components/client/CSider";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Pie } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const statData = {
  activeProjects: 5,
  completedProjects: 20,
  successRate: 95,
  earnings: 50000,
};

const successRateData = {
  labels: ["Success Rate"],
  datasets: [
    {
      label: "Success Rate",
      data: [statData.successRate, 100 - statData.successRate],
      backgroundColor: ["#10B981", "#EF4444"],
    },
  ],
};

const projectData = {
  labels: ["Active Projects", "Completed Projects", "Monthly Earnings"],
  datasets: [
    {
      label: "Projects & Earnings",
      data: [
        statData.activeProjects,
        statData.completedProjects,
        statData.earnings,
      ],
      backgroundColor: ["#1E3A8A", "#2563EB", "#F59E0B"],
      borderRadius: 10,
      borderSkipped: false,
    },
  ],
};

const CHomepage = ({userId, role}) => {
  const navigate = useNavigate();
  // Mock data for skill-based projects
  const location = useLocation();
  const handleMenuClick = (component) => {
    if (location.pathname !== '/client/dashboard') {
      navigate('/client/dashboard', { state: { component } });
    }
  };
  
  const pathnames = location.pathname.split("/").filter((x) => x);

  const skillBasedProjects = [
    {
      title: "Build a React Dashboard",
      description: "A dashboard for analytics.",
      time: "3 days left",
    },
    {
      title: "Logo Design",
      description: "Create a unique logo for a startup.",
      time: "5 days left",
    },
    {
      title: "WordPress Blog Setup",
      description: "Setup and customize a WordPress blog.",
      time: "2 days left",
    },
    {
      title: "SEO Optimization",
      description: "Optimize a website for search engines.",
      time: "7 days left",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <CSider collapsed={true} handleMenuClick={handleMenuClick} />


      {/* Main Content Area */}
      <div className=" bg-gray-100 flex-1 flex flex-col overflow-x-hidden 
  ml-14 sm:ml-16 md:ml-16 lg:ml-22">  {/* Header */}
        <CHeader />

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-200">
          <div className="flex w-full h-full flex-col p-6 bg-gray-100">
           
            {/* Welcome Banner */}
            <div className="h-[80%] border shadow-sm bg-gray-50 p-6 rounded-lg mb-6 flex justify-center flex-col">
              <h1 className="text-6xl font-extrabold bg-gradient-to-br uppercase from-success via-secondary to-accent bg-clip-text text-transparent">
                Welcome back, [Freelancer Name]!
              </h1>

              <p className="text-lg mt-2 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                "Strive for progress, not perfection."
              </p>
            </div>
          </div>

          <hr />

          {/* Sliding Cards for Skill-Based Projects */}
          <div className="h-full pl-6 pr-6 flex flex-col justify-evenly relative overflow-hidden mb-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">
              Projects Based on Your Skills
            </h2>
            <div className="flex gap-6 pt-6 pb-6 overflow-x-auto">
              {skillBasedProjects.map((project, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl hover:scale-[1.03] transform transition-all duration-300  min-w-[300px] max-w-[350px]"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <p className="text-gray-500 text-sm">{project.time}</p>
                  <button className="mt-6 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-sm hover:bg-gradient-to-l  transition-all duration-200">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
          <hr />

          {/* Dashboard Cards */}

          <div className="flex w-full h-full flex-col p-6 bg-gray-100 justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {/* My Projects */}
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] transition-all transform ">
                <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                  My Projects
                </h2>
                <p className="text-gray-700 mb-4">
                  View and manage your active projects.
                </p>
                <button className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:bg-gradient-to-l  transition-all duration-300">
                  Go to Projects
                </button>
              </div>

              {/* Browse Projects */}
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] transition-all transform ">
                <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                  Browse Projects
                </h2>
                <p className="text-gray-700 mb-4">
                  Explore new projects and start bidding.
                </p>
                <button className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:bg-gradient-to-l  transition-all duration-300">
                  Browse Now
                </button>
              </div>

              {/* Notifications */}
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] hover:scale-101 transition-all transform ">
                <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                  Notifications
                </h2>
                <p className="text-gray-700 mb-4">
                  Stay updated with project updates.
                </p>
                <button className="mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-gradient-to-l hover:scale- transition-all duration-300">
                  View Notifications
                </button>
              </div>

              {/* Earnings */}
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] transition-all transform ">
                <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                  Earnings
                </h2>
                <p className="text-gray-700 mb-4">
                  Check your earnings and pending invoices.
                </p>
                <button className="mt-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:bg-gradient-to-l  transition-all duration-300">
                  View Earnings
                </button>
              </div>
            </div>
          </div>
          <hr />

          {/* Recent Activity Section */}
          <div className="flex w-full h-full flex-col p-6 bg-gray-100 justify-center">
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Recent Activity
              </h2>
              <ul className="bg-white border shadow-sm rounded-lg p-6 space-y-4">
                <li className="flex justify-between items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all duration-300">
                  <span className="text-gray-700">
                    Submitted a proposal for "E-commerce Website".
                  </span>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </li>
                <li className="flex justify-between items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all duration-300">
                  <span className="text-gray-700">
                    Accepted a project: "Logo Design".
                  </span>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </li>
                <li className="flex justify-between items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all duration-300">
                  <span className="text-gray-700">Profile updated.</span>
                  <span className="text-sm text-gray-500">3 days ago</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="flex w-full h-full flex-col p-6 bg-gray-100 justify-center">
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 ">
              {/* Active Projects */}
              <div className="bg-gray-50 p-4 rounded-lg border shadow-sm hover:shadow-lg transition-all">
                <h3 className="text-gray-800 font-semibold">Active Projects</h3>
                <p className="text-6xl font-extrabold bg-gradient-to-br uppercase from-success via-secondary to-accent bg-clip-text text-transparent">
                  {statData.activeProjects}
                </p>
              </div>

              {/* Completed Projects */}
              <div className="bg-gray-50 p-4 rounded-lg border shadow-sm hover:shadow-lg transition-all">
                <h3 className="text-gray-800 font-semibold">
                  Completed Projects
                </h3>
                <p className="text-6xl font-extrabold bg-gradient-to-br uppercase from-success via-secondary to-accent bg-clip-text text-transparent">
                  {statData.completedProjects}
                </p>
              </div>

              {/* Success Rate */}
              <div className="bg-gray-50 p-4 rounded-lg border shadow-sm hover:shadow-lg transition-all">
                <h3 className="text-gray-800 font-semibold">Success Rate</h3>
                <div className="h-32 w-full">
                  <Pie
                    data={successRateData}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: "top" } },
                    }}
                  />
                </div>
                <p className="text-xl text-gray-600 mt-2">
                  {statData.successRate}%
                </p>
              </div>

              {/* Monthly Earnings */}
              <div className="bg-gray-50 p-4 rounded-lg border shadow-sm hover:shadow-lg transition-all">
                <h3 className="text-gray-800 font-semibold">
                  Monthly Earnings
                </h3>
                <div className="h-32 w-full">
                  <Bar
                    data={projectData}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: "top" } },
                    }}
                  />
                </div>
                <p className="text-xl text-gray-600 mt-2">
                  ₹{statData.earnings}
                </p>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="flex w-full flex-col p-6 bg-gray-100 justify-center">
            <div className="mt-8 bg-gray-50 p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold text-gray-800">Announcements</h2>
              <p className="text-gray-600 mt-2">
                Platform updates and new features will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CHomepage;
