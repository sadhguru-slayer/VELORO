import React, { useEffect, useRef, useState } from "react";
import FHeader from "../../components/freelancer/FHeader";
import FSider from "../../components/freelancer/FSider";
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
      backgroundColor: ["#34D399", "#F87171"], // Soft green and red for success/failure
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
      backgroundColor: ["#1E3A8A", "#2563EB", "#F59E0B"], // Blue, blue, and yellow for variety
      borderRadius: 10,
      borderSkipped: false,
    },
  ],
};

const FHomepage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (component) => {
    if (location.pathname !== "/freelancer/dashboard") {
      navigate("/freelancer/dashboard", { state: { component } });
    }
  };
  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== "/freelancer/profile") {
      navigate("/freelancer/profile", { state: { profileComponent } });
    }
  };

  const pathnames = location.pathname.split("/").filter((x) => x);

  const skillBasedProjects = [
    {
      id: 1,
      name: "Build a React Dashboard",
      description: "A dashboard for analytics.",
      time: "3 days left",
    },
    {
      id: 2,
      name: "Logo Design",
      description: "Create a unique logo for a startup.",
      time: "5 days left",
    },
    {
      id: 3,
      name: "WordPress Blog Setup",
      description: "Setup and customize a WordPress blog.",
      time: "2 days left",
    },
    {
      id: 4,
      name: "SEO Optimization",
      description: "Optimize a website for search engines.",
      time: "7 days left",
    },
    {
      id: 5,
      name: "SEO Optimization",
      description: "Optimize a website for search engines.",
      time: "7 days left",
    },
    {
      id: 6,
      name: "SEO Optimization",
      description: "Optimize a website for search engines.",
      time: "7 days left",
    },
  ];

  const handleNavigate = (component) => {
    navigate("/freelancer/dashboard", { state: { component } });
  };


  const containerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [projectWidth, setProjectWidth] = useState(0);

  // Function to calculate the width of a card
  const calculateProjectWidth = () => {
    if (containerRef.current && containerRef.current.firstChild) {
      const card = containerRef.current.firstChild;
      const style = window.getComputedStyle(card);
      const width = card.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
      setProjectWidth(width);
    }
  };

  useEffect(() => {
    calculateProjectWidth();
    window.addEventListener("resize", calculateProjectWidth);
    return () => window.removeEventListener("resize", calculateProjectWidth);
  }, []);


  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -projectWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: projectWidth, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth);
    }
  };
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <FSider dropdown={true} collapsed={true} handleMenuClick={handleMenuClick} handleProfileMenu={handleProfileMenu}/>
      
      {/* Main Content Area */}
      <div className="bg-gray-100 flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-16 md:ml-16 lg:ml-24">
        {/* Header */}
        <FHeader />

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          <div className="flex w-full flex-col md:p-6 sm:p-4 p-4">
            {/* Welcome Banner */}
            <div className="h-[60vh] md:max-h-[70vh] sm:h-[60vh] lg:h-[80vh] max-h-[auto] border shadow-sm bg-gradient-to-br from-blue-800 to-violet-600 text-white border-gray-300 p-6 rounded-lg flex justify-center flex-col">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
                Welcome back, Sadguru!
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl italic mt-2 opacity-80">
                'Strive for progress, not perfection.'
              </p>
            </div>
          </div>

          {/* Skill-Based Projects */}
          
          <div className="h-max relative flex flex-col justify-center gap-4 p-6 py-12 bg-gray-300 ">
          <h2 className="text-2xl text-center sm:text-xl md:text-2xl lg:text-3xl font-bold text-charcolBlue capitalize">
              Projects Based on Your Skills
            </h2>
      <button onClick={scrollLeft} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 shadow-lg rounded-full z-10">
        &lt;
      </button>
      <div ref={containerRef} className="flex cursor-auto overflow-x-auto scroll-smooth space-x-4 p-4">
        {skillBasedProjects.map((record, index) => (
          <div
            key={index}
            className="flex-none w-[12rem] sm:w-[14rem] md:w-[16rem] lg:w-[20rem] card p-4 sm:p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
          >
            <h3 className="text-xl sm:text-2xl font-semibold">{record.name}</h3>
            <p className="text-sm sm:text-base text-gray-600">{record.description}</p>
            <p className="text-xs sm:text-sm text-gray-500">{record.time}</p>
            <button
              onClick={() =>
                navigate(`/freelancer/browse-projects/project-view/${record.id}`, {
                  state: { record },
                })
              }
              className="button mt-4 sm:mt-6"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
      <button onClick={scrollRight} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 shadow-lg rounded-full z-10">
        &gt;
      </button>
    </div>


          {/* Dashboard Cards */}
          <div className="flex w-full h-full md:max-h-[100vh] sm:h-[70vh] md:h-[80vh] lg:h-[100vh] max-h-auto flex-col p-2 sm:p-2 md:p-4 gap-3 justify-center">
          <h2 className="text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-charcolBlue uppercase text-center">
            Swift Action
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8">
            {/* My Projects */}
            <div className="card rounded-lg p-4 sm:p-5 md:p-6 lg:p-6 bg-white shadow-sm">
              <h2 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-semibold text-violet-500 mb-4">
                My Projects
              </h2>
              <p className="text-gray-700 mb-4 text-sm sm:text-xs md:text-md lg:text-lg">
                View and manage your active projects.
              </p>
              <button
                onClick={() => handleNavigate("projects")}
                className="button float-right mt-4 sm:mt-6 text-mutedGold bg-charcolBlue px-4 sm:px-3 md:px-4 lg:px-5 py-2 rounded-lg text-xs sm:text-base"
              >
                Go to Projects
              </button>
            </div>
        
            {/* Browse Projects */}
            <div className="card rounded-lg p-4 sm:p-5 md:p-6 lg:p-6 bg-white shadow-sm">
              <h2 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-semibold text-violet-500 mb-4">
                Browse Projects
              </h2>
              <p className="text-gray-700 mb-4 text-sm sm:text-xs md:text-md lg:text-lg">
                Explore new projects and start bidding.
              </p>
              <button
                onClick={() => navigate("/freelancer/browse-projects")}
                className="button float-right mt-4 sm:mt-6 text-mutedGold bg-charcolBlue px-4 sm:px-3 md:px-4 lg:px-5 py-2 rounded-lg text-xs sm:text-base"
              >
                Browse Now
              </button>
            </div>
        
            {/* Notifications */}
            <div className="card rounded-lg p-4 sm:p-5 md:p-6 lg:p-6 bg-white shadow-sm">
              <h2 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-semibold text-violet-500 mb-4">
                Notifications
              </h2>
              <p className="text-gray-700 mb-4 text-sm sm:text-xs md:text-md lg:text-lg">
                Stay updated with project updates.
              </p>
              <button className="button float-right mt-4 sm:mt-6 text-mutedGold bg-charcolBlue px-4 sm:px-3 md:px-4 lg:px-5 py-2 rounded-lg text-xs sm:text-base">
                View Notifications
              </button>
            </div>
        
            {/* Earnings */}
            <div className="card rounded-lg p-4 sm:p-5 md:p-6 lg:p-6 bg-white shadow-sm">
              <h2 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-semibold text-violet-500 mb-4">
                Earnings
              </h2>
              <p className="text-gray-700 mb-4 text-sm sm:text-xs md:text-md lg:text-lg">
                Check your earnings and pending invoices.
              </p>
              <button
                onClick={() => handleNavigate("earnings")}
                className="button float-right mt-4 sm:mt-6 text-mutedGold bg-charcolBlue px-4 sm:px-3 md:px-4 lg:px-5 py-2 rounded-lg text-xs sm:text-base"
              >
                View Earnings
              </button>
            </div>
          </div>
        </div>

          {/* Recent Activity Section */}
          <div className="flex w-full flex-col p-6 bg-gray-200">
  <h2 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-semibold text-violet-500 text-center uppercase mb-6">
    Recent Activity
  </h2>
  <ul  className="bg-white border shadow-sm rounded-lg p-6 space-y-4">
    <li className="flex justify-between items-center py-3 border-b border-gray-300 hover:bg-gray-100 transition-all duration-300">
      <span className="text-sm sm:text-base text-gray-700">Submitted a proposal for "E-commerce Website".</span>
      <span className="text-xs sm:text-sm text-gray-500">2 hours ago</span>
    </li>
    <li className="flex justify-between items-center py-3 border-b border-gray-300 hover:bg-gray-100 transition-all duration-300">
      <span className="text-sm sm:text-base text-gray-700">Accepted a project: "Logo Design".</span>
      <span className="text-xs sm:text-sm text-gray-500">1 day ago</span>
    </li>
    <li className="flex justify-between items-center py-3 border-b border-gray-300 hover:bg-gray-100 transition-all duration-300">
      <span className="text-sm sm:text-base text-gray-700">Profile updated.</span>
      <span className="text-xs sm:text-sm text-gray-500">3 days ago</span>
    </li>
  </ul>
</div>

          {/* Stats Overview */}
          <div className="flex w-full h-full flex-col p-6 mb-5">
            <h2 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl text-violet-500 font-semibold uppercase text-center">
              Stats Overview
            </h2>
            <div className="w-full  mt-8 flex flex-col gap-6 md:gap-8">
              <div className="flex gap-6 w-full">
                {/* Active Projects */}
                <div className="w-full p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="text-gray-800 font-semibold">Active Projects</h3>
                  <p className="text-6xl font-extrabold bg-gradient-to-br from-violet-500 via-violet-300 to-charcolBlue text-transparent bg-clip-text">
                    {statData.activeProjects}
                  </p>
                </div>

                {/* Completed Projects */}
                <div className="w-full p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="text-gray-800 font-semibold">Completed Projects</h3>
                  <p className="text-6xl font-extrabold bg-gradient-to-br from-violet-500 via-violet-300 to-charcolBlue text-transparent bg-clip-text">
                    {statData.completedProjects}
                  </p>
                </div>
              </div>

              <div className="flex gap-6 flex-wrap sm:flex-wrap md:flex-nowrap w-full mb-6">
                {/* Success Rate */}
                <div className="bg-white w-[30%] flex-shrink-0 p-4 flex flex-col items-center rounded-lg justify-center">
                  <h3 className="text-gray-800 font-semibold">Success Rate</h3>
                  <div className="h-auto w-auto flex justify-center">
                    <Pie
                      data={successRateData}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: "top" } },
                      }}
                    />
                  </div>
                  <p className="text-xl text-gray-600 mt-2">{statData.successRate}%</p>
                </div>

                {/* Monthly Earnings */}
                <div className="bg-white w-[70%] p-4 flex flex-col flex-grow-0 items-center rounded-lg justify-center">
                  <h3 className="text-gray-800 font-semibold">Monthly Earnings</h3>
                  <div className="h-[75%] w-[100%] flex justify-center">
                    <Bar
                      data={projectData}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: "top" } },
                      }}
                    />
                  </div>
                  <p className="text-xl text-gray-600 mt-2">₹{statData.earnings}</p>
                </div>
              </div>
            </div>
            
            {/* Announcements */}
            <div className="flex w-full flex-col justify-center">
            <div className=" bg-white border border-gray-300 p-4 rounded-lg shadow">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Announcements</h2>
              <p className="text-gray-600 mt-2">
                Platform updates and new features will appear here.
              </p>
            </div>
          </div>
            </div>

          
        </div>
      </div>
    </div>
  );
};

export default FHomepage;
