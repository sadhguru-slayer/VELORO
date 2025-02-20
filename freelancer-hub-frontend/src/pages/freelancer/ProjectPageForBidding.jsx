import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import FHeader from '../../components/freelancer/FHeader';  // Assuming you have a header component
import FSider from '../../components/freelancer/FSider';  // Assuming you have a sidebar component
import { Modal, Button, Table, Input, Select, Tabs, Row, Col, Pagination, Card } from 'antd';
import { FaLink } from "react-icons/fa6";

const {TabPane} = Tabs

const ProjectPageForBidding = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (component) => {
    if (location.pathname !== '/freelancer/dashboard') {
      navigate('/freelancer/dashboard', { state: { component } });
    }
  };

  const [bidAmount, setBidAmount] = useState(0);
  const [bidMessage, setBidMessage] = useState('');
  const [preferredCommunication, setPreferredCommunication] = useState('');
  const [methodology, setMethodology] = useState('');
  const [toolsTechnologies, setToolsTechnologies] = useState('');
  const [examplesLink, setExamplesLink] = useState('');
  const [examples, setExamples] = useState([null,null]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [project, setProject] = useState(null);
  const [bidInfo, setBidInfo] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isBidComplete, setIsBidComplete] = useState(false);
  const [budgetType, setBudgetType] = useState('combined'); // 'individual' or 'combined'
  const [combinedBudget, setCombinedBudget] = useState(0); // For combined budget
  const [taskBudgets, setTaskBudgets] = useState({}); // To store individual budgets for each task
  
  const [taskSelected, setTaskSelected] = useState([]);
  const [maxSelectableTasks, setMaxSelectableTasks] = useState(3); // Default to 1 task

  const fetchProjectDetails = async () => {
    // Simulated project data
    const projectData = {
      id:1,
      title: "AI-Based Model for Predicting Data Trends",
      description: "We need a skilled freelancer to develop an AI-based model for predicting data trends.",
      budget: "$5000 - $7000",
      dateRange: "12-01-2025 to 29-01-2025",
      domain: "ML, Data Science",
      isCollaborative: true,
      tasks: [
        {id:1, title: "Data Collection", description: "Collecting necessary data for the project", skills: ["Python", "Pandas"], budget: "$1500" },
        {id:2, title: "Model Development", description: "Developing the AI model for data prediction", skills: ["TensorFlow", "Machine Learning"], budget: "$3000" },
        {id:3, title: "Model Evaluation", description: "Evaluating the performance of the model", skills: ["Python", "Data Analysis"], budget: "$2000" },
      ],
    };
    setProject(projectData);
};
  useEffect(() => {
    fetchProjectDetails();
  }, []);
  const CommunicationChannels = [
    { id: 1, value: "Email" },
    { id: 2, value: "Phone" },
    { id: 3, value: "Chat" },
    { id: 4, value: "Zoom" }
  ];
  const [bidOnProjectData, setBidOnProjectData] = useState({
    projectid: project?.id,
    bidAmount: 0, // Initialize as a number
    bidMessage: '',
    preferredCommunication: '',
    methodology: '',
    toolsTechnologies: '',
    examples: [],
    estimatedCost: '',
  });
  
  const [bidOnTasks, setBidOnTasks] = useState({
  projectid: project?.id,
  tasks: [],  // Initially set as an empty array
  taskedBudget: 0,
  individualTaskBudget:{},
  budgetType: '',
  bidMessage: '',
  preferredCommunication: '',
  methodology: '',
  toolsTechnologies: '',
  examples: [],
  estimatedCost: '',
});

const handleBidSubmit = () => {
  let message;

  // Ensure taskSelected is updated with selected tasks
  const taskIds = taskSelected.map((task) => task.id); // Mapping to get only the task IDs
  
  // Check for required fields before submitting
  if (!project?.isCollaborative) {
    // Non-collaborative project: Use bid amount for the entire project
    if (bidAmount && bidMessage && preferredCommunication && methodology && estimatedCost) {
      setBidOnProjectData({
        projectid: project?.id,
        bidAmount: bidAmount,
        bidMessage: bidMessage,
        preferredCommunication: preferredCommunication,
        methodology: methodology,
        toolsTechnologies: toolsTechnologies,
        examples: examples,
        estimatedCost: estimatedCost,
      });
      message = "Bid Successful";
    } else {
      message = 'Please fill in all the required fields.';
    }
  } else {
    // Collaborative project: Handle individual/combined task budgets
    let taskedBudget = 0;

    if (budgetType === "individual") {
      // Sum up individual task budgets (if taskBudgets is an object with task keys and their budgets)
      taskedBudget = Object.values(taskBudgets).reduce((sum, budget) => sum + budget, 0); // Summing up the individual task budgets
    } else if (budgetType === "combined") {
      // Use combined budget for all tasks
      taskedBudget = combinedBudget;
    }
    
    // Check if all required fields are filled before submitting the bid
    if (taskedBudget && bidMessage && preferredCommunication && methodology && estimatedCost) {
      // Update the bid data with tasks and their IDs
      setBidOnTasks({
        projectid: project?.id,
        tasks: taskIds,  // Use the task IDs mapped from taskSelected
        taskedBudget: taskedBudget,
        individualTaskBudget:taskBudgets,
        budgetType: budgetType,
        bidMessage: bidMessage,
        preferredCommunication: preferredCommunication,
        methodology: methodology,
        toolsTechnologies: toolsTechnologies,
        examples: examples,
        estimatedCost: estimatedCost,
      });
      console.log(bidOnTasks);
      message = "Bid Successful";
    } else {
      message = 'Please fill in all the required fields.';
    }
  }

  // After submitting the bid, display the relevant message
  if (message.includes("Successful")) {
    console.log("Selected Task IDs:", taskIds);  // Ensure task IDs are correctly updated
    setIsBidComplete(true);  // Assuming you want to show the bid details after submission
  }

  openDetails(message);  // Display message
};

  
  
  const openDetails = (message) => {
    setBidInfo(message); // Set either the success or error message here
    setShowDetails(true);
  };
  
  const closeDetails = () => {
    setBidInfo(null);
    setShowDetails(false);
  };
  
  const [fileChange, setFileChange] = useState(null);

useEffect(() => {
  const changeExample = () => {
    setExamples([examplesLink, fileChange]);
  };
    changeExample();
}, [fileChange, examplesLink]);

const handleFileChange = (event) => {
  const files = Array.from(event.target.files); 
  setFileChange(files);
};

  const handleCheckboxChange = (task, isChecked) => {
    if (isChecked) {
      if (taskSelected.length < maxSelectableTasks) {

        setTaskSelected([...taskSelected, task]); // Add task to selected list
      }
    } else {
      setTaskSelected(taskSelected.filter(t => t !== task)); // Remove task from selected list
    }
  };


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <FSider dropdown={true} collapsed={true} handleMenuClick={handleMenuClick} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-16 md:ml-16 lg:ml-24">
        {/* Header */}
        <FHeader />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-200 p-6">
          {/* Content Area */}
          
          {/* Breadcrumb */}
          <div className="text-gray-500 mb-4">
            <Link to="/freelancer/projects" className="hover:text-blue-500">Projects</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{project ? project?.title : 'Loading...'}</span>
          </div>

          {/* Project Info Section */}
          {project && (
            <div className="bg-white p-6 mb-6 rounded-lg shadow-sm flex flex-col gap-5">
            <div className="project_content flex flex-col gap-2 py-3">
            <h2 className="text-2xl font-semibold">{project?.title}</h2>
              <span className='w-full flex font-semibold'><span className='text-charcolBlue'>Budget:</span><p className='text-violet-500'> {project?.budget}</p></span>
              <span className='w-full p-3 border rounded-lg'><span className='font-semibold'>Description:</span><p> {project?.description}</p></span>
              <span className='w-full flex '><span className='text-charcolBlue font-semibold'>Date Range:</span><p> {project?.dateRange}</p></span>
              <span className='w-full flex '><span className='text-charcolBlue font-semibold'>Domain:</span><p> {project?.domain}</p></span>
              <span className='w-full flex '><span className='text-charcolBlue font-semibold'>Collaborative:</span><p> {project?.isCollaborative ? 'Yes' : 'No'}</p></span>
              </div>
            { project?.tasks.length > 0 && isBidComplete === false && project?.isCollaborative && (
  <span className='flex flex-col gap-3'>
    <div className="w-full p-3 bg-mutedGold rounded-lg">
      <h3 className='font-semibold text-md'>Note:</h3>
      <p className='text-sm'>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit perspiciatis at, facilis quae quas possimus quia beatae molestiae ex expedita fuga animi neque nesciunt fugiat recusandae ab quo consectetur ducimus?
      </p>
    </div>
    <h3 className="text-xl font-semibold mt-4">Project Tasks</h3>
    <div className="flex flex-col gap-2">
      <h4 className="text-sm sm:text-sm md:text-sm lg:text-md border bg-violet-300 px-3 py-1 rounded-lg">
        Please select any one of the task you're confident in (maximum number of task(s) can be selected is one). 
        <span className='text-charcolBlue font-semibold cursor-pointer underline'>Want to Select more? Upgrade</span>
      </h4>
      {project?.tasks.map((task, index) => {
        const isTaskDisabled = taskSelected.length >= maxSelectableTasks && !taskSelected.includes(task);
        return (
          <div
            key={index}
            className={`bg-white p-4 flex rounded-lg shadow-sm ${isTaskDisabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <label htmlFor={`task_${index+1}`} className='flex-grow-2 w-full'>
              <strong>Task {index + 1}:</strong> {task.title}
              <p>{task.description}</p>
              <p><strong>Skills Needed:</strong> {task.skills.join(', ')}</p>
              <p><strong>Task Budget:</strong> {task.budget}</p>
            </label>
            <input
              name={`task_${index+1}`}
              id={`task_${index+1}`}
              className='flex-shrink-1'
              type="checkbox"
              checked={taskSelected.includes(task)}
              onChange={(e) => handleCheckboxChange(task, e.target.checked)}
              disabled={isTaskDisabled}
            />
          </div>
        );
      })}
    </div>
  </span>
)}

{/* When isBidComplete is true, show selected tasks */}
{ isBidComplete === true && taskSelected.length > 0 && (
  <div className="w-full p-4 bg-green-100 rounded-lg mt-4">
    <h3 className="text-xl font-semibold">Selected Tasks</h3>
    <ul className="list-disc ml-6 mt-2">
      {taskSelected.map((task, index) => (
        <li key={index} className="py-1">
          <strong>Task {index + 1}:</strong> {task.title} - <span className="text-sm">{task.description}</span>
        </li>
      ))}
    </ul>
  </div>
)}

            </div>
          )}

          {/* Bid Submission Section */}
          { isBidComplete===false ?(
          <span>
          {!project?.isCollaborative ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Submit Your Bid</h2>
          
              {/* Bid Amount */}
              <div className="mb-4">
                <label htmlFor="bidAmount" className="block text-md text-gray-700 font-medium">Your Bid (₹)</label>
                <input
                  type="number"
                  id="bidAmount"
                  name="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                  placeholder="Enter your bid amount"
                />
              </div>
          
              {/* Bid Message */}
              <div className="mb-6">
                <label htmlFor="bidMessage" className="block text-md text-gray-700 font-medium">Your Message</label>
                <textarea
                  id="bidMessage"
                  name="bidMessage"
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                  placeholder="Explain why you're the best fit for this project"
                  rows="4"
                />
              </div>
          
              {/* Preferred Communication Channels */}
              <div className="mb-4">
                <label htmlFor="preferredCommunication" className="block text-md text-gray-700 font-medium">
                  Preferred Communication Channels
                </label>
                <select
                  id="preferredCommunication"
                  name="preferredCommunication"
                  value={preferredCommunication}
                  onChange={(e) => setPreferredCommunication(e.target.value)}
                  className="bg-gray-50 w-full p-3 border rounded-lg mt-2 text-md text-gray-700"

                >
                  <option value="" disabled>Select your preferred communication channel</option>
                  {CommunicationChannels.map((channel) => (
                    <option key={channel.id} value={channel.value}>
                      {channel.value}
                    </option>
                  ))}
                </select>
              </div>
          
              {/* Methodology */}
              <div className="mb-4">
                <label htmlFor="methodology" className="block text-md text-gray-700 font-medium">Methodology</label>
                <textarea
                  id="methodology"
                  name="methodology"
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                  className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                  placeholder="Describe how you plan to approach the project"
                  rows="4"
                />
              </div>
          
              {/* Tools and Technologies */}
              <div className="mb-4">
                <label htmlFor="toolsTechnologies" className="block text-md text-gray-700 font-medium">Tools and Technologies</label>
                <input
                  type="text"
                  id="toolsTechnologies"
                  name="toolsTechnologies"
                  value={toolsTechnologies}
                  onChange={(e) => setToolsTechnologies(e.target.value)}
                  className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                  placeholder="Mention the tools/technologies you will use"
                />
              </div>
          
              {/* Examples of Past Work */}
              <div className="mb-4">
                <label htmlFor="examples" className="block text-md text-gray-700 font-medium">
                  Examples of Past Work
                </label>
                <input
                  type="text"
                  id="examples"
                  name="examples"
                  value={examplesLink}
                  onChange={(e) => setExamplesLink(e.target.value)}
                  className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                  placeholder="Provide links or details of previous work"
                />
                <input
                  type="file"
                  id="fileUpload"
                  name="fileUpload"
                  onChange={(e) => handleFileChange(e)} // Define this function to handle file input
                  className="mt-2 block w-full text-sm text-gray-500
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-lg file:border-0
                             file:text-sm file:font-semibold
                             file:bg-charcolBlue file:text-white
                             hover:file:bg-violet-600"
                  multiple
                />
              </div>
          
              {/* Total Estimated Cost */}
              <div className="mb-4">
                <label htmlFor="estimatedCost" className="block text-md text-gray-700 font-medium">Total Estimated Cost (₹)</label>
                <input
                  type="number"
                  id="estimatedCost"
                  name="estimatedCost"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                  placeholder="Estimate the total cost based on your hourly rate and the project duration"
                />
              </div>
          
              {/* Submit Button */}
              <button
                onClick={handleBidSubmit}
                className="bg-violet-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-violet-600 transition-colors duration-200"
              >
                Place Bid
              </button>
            </div>
          ) : (
            taskSelected.length > 0 &&(
              <div className="flex flex-col gap-3">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Bid For Task{taskSelected.length >= 2 ? 's' : ''}
                  </h2>
                  <div className=" border p-2">
                {taskSelected.map((tasks,index)=>(
                  <div key={tasks.id} className="border-b p-1">
                  <h2 className="text-md font-semibold text-gray-800">Task {index+1}:<span className='font-normal'>{tasks.title}</span></h2>
                  </div>
                  ))
                  }
                  </div>
                  {/* Budget Type */}
                  <div className="mb-4 py-6">
                  <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row space-x-4">
                  <label className="block text-md text-gray-700 font-semibold">Select Budget Type</label>
                      
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="combined"
                          name="budgetType"
                          value="combined"
                          checked={budgetType === 'combined'}
                          onChange={(e) => setBudgetType(e.target.value)}
                          className="mr-2"
                          
                        />
                        <label htmlFor="combined" className="text-md text-gray-700">Combined Budget</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="individual"
                          name="budgetType"
                          value="individual"
                          checked={budgetType === 'individual'}
                          onChange={(e) => setBudgetType(e.target.value)}
                          className="mr-2"
                        />
                        <label htmlFor="individual" className="text-md text-gray-700">Individual Budget</label>
                      </div>
                    </div>
                  </div>
          
                  {/* If Combined Budget is selected */}
                  {budgetType === 'combined' && (
                    <div className="mb-4">
                      <label htmlFor="combinedBudget" className="block text-md text-gray-700 font-medium">
                        Combined Budget (₹)
                      </label>
                      <input
                        type="number"
                        id="combinedBudget"
                        name="combinedBudget"
                        value={combinedBudget}
                        onChange={(e) => setCombinedBudget(e.target.value)}
                        className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                        placeholder="Enter the total budget for all tasks"
                      />
                      <p className='text-xs text-violet-500 pl-3'>
                      Slecting Combined will give you the bid amount after completion of the {taskSelected.length} task{taskSelected.length>1?'s':''}
                      </p>
                    </div>
                  )}
          
                  {/* If Individual Budget is selected */}
                  {budgetType === 'individual' && (
                    <div className='flex flex-col'>
                    <div className='flex w-full gap-3'>

                      {taskSelected.map((task,index) => (
                        <div key={task.id} className="w-full">
                          <label htmlFor={`taskBudget${task.id}`} className="block text-md text-gray-700 font-medium">
                            Task {index + 1} Budget (₹)
                          </label>
                          <input
                            type="number"
                            id={`taskBudget${task.id}`}
                            name={`taskBudget${task.id}`}
                            value={taskBudgets[task.id] || ''}
                            onChange={(e) => setTaskBudgets({ ...taskBudgets, [task.id]: e.target.value })}
                            className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                            placeholder={`Enter budget for ${task.title}`}
                          />
                        </div>
                      ))}
                      </div>
                      <p className='text-xs text-violet-500 pl-3'>
                      Slecting Individual budget type will give you the bid amount after completion of each task
                      </p>
                    </div>
                  )}
          
                  {/* Bid Message */}
                  <div className="mb-6">
                    <label htmlFor="bidMessage" className="block text-md text-gray-700 font-medium">Your Message</label>
                    <textarea
                      id="bidMessage"
                      name="bidMessage"
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                      placeholder="Explain why you're the best fit for these tasks"
                      rows="4"
                    />
                  </div>
          
                  {/* Preferred Communication Channels */}
                  <div className="mb-4">
                    <label htmlFor="preferredCommunication" className="block text-md text-gray-700 font-medium">
                      Preferred Communication Channels
                    </label>
                    <select
                      id="preferredCommunication"
                      name="preferredCommunication"
                      value={preferredCommunication}
                      onChange={(e) => setPreferredCommunication(e.target.value)}
                      className="bg-gray-50 w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                    >
                      <option value="" disabled>Select your preferred communication channel</option>
                      {CommunicationChannels.map((channel) => (
                        <option key={channel.id} value={channel.value}>
                          {channel.value}
                        </option>
                      ))}
                    </select>
                  </div>
          
                  {/* Methodology */}
                  <div className="mb-4">
                    <label htmlFor="methodology" className="block text-md text-gray-700 font-medium">Methodology</label>
                    <textarea
                      id="methodology"
                      name="methodology"
                      value={methodology}
                      onChange={(e) => setMethodology(e.target.value)}
                      className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                      placeholder="Describe how you plan to approach the tasks"
                      rows="4"
                    />
                  </div>
          
                  {/* Tools and Technologies */}
                  <div className="mb-4">
                    <label htmlFor="toolsTechnologies" className="block text-md text-gray-700 font-medium">Tools and Technologies</label>
                    <input
                      type="text"
                      id="toolsTechnologies"
                      name="toolsTechnologies"
                      value={toolsTechnologies}
                      onChange={(e) => setToolsTechnologies(e.target.value)}
                      className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                      placeholder="Mention the tools/technologies you will use"
                    />
                  </div>
          
                  {/* Examples of Past Work */}
                  <div className="mb-4">
                    <label htmlFor="examples" className="block text-md text-gray-700 font-medium">
                      Examples of Past Work
                    </label>
                    <input
                      type="text"
                      id="examples"
                      name="examples"
                      value={examplesLink}
                      onChange={(e) => setExamplesLink(e.target.value)}
                      className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                      placeholder="Provide links or details of previous work"
                    />
                    <input
                      type="file"
                      id="fileUpload"
                      name="fileUpload"
                      onChange={(e) => handleFileChange(e)} // Define this function to handle file input
                      className="mt-2 block w-full text-sm text-gray-500
                                 file:mr-4 file:py-2 file:px-4
                                 file:rounded-lg file:border-0
                                 file:text-sm file:font-semibold
                                 file:bg-charcolBlue file:text-white
                                 hover:file:bg-violet-500"
                      multiple
                    />
                  </div>
          
                  {/* Total Estimated Cost */}
                  <div className="mb-4">
                    <label htmlFor="estimatedCost" className="block text-md text-gray-700 font-medium">Total Estimated Cost (₹)</label>
                    <input
                      type="number"
                      id="estimatedCost"
                      name="estimatedCost"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      className="w-full p-3 border rounded-lg mt-2 text-md text-gray-700"
                      placeholder="Estimate the total cost based on your hourly rate and the project duration"
                    />
                  </div>
          
                  {/* Submit Button */}
                  <button
                    onClick={handleBidSubmit}
                    className="bg-violet-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-violet-600 transition-colors duration-200"
                  >
                    Place Bid
                  </button>
                </div>
              </div>
            )
          )}
          </span>
        ):( 
          <span className="flex flex-col gap-4">

<div className="bg-white w-full p-4 rounded-lg flex justify-between items-center">
  {/* Left Side Content */}
  <div className="text-left max-w-[70%] sm:max-w-[80%]">
    <p className="text-sm sm:text-md font-semibold text-gray-700">
      You can collaborate with other freelancers.
    </p>
  </div>
  
  {/* Right Side Collaboration Link Button */}
  <div className="flex justify-end max-w-[30%] sm:max-w-[20%]">
    <a 
      href="#collaboration" // Replace with your actual link
      className="bg-violet-500 text-white py-2 px-3 text-xs sm:text-sm rounded-lg hover:bg-violet-600 transition duration-200 flex gap-1"
    >
      <span className="hidden sm:inline md:inline lg:inline">Collaboration Link</span><FaLink className="text-white text-md"/>
    </a>
  </div>
</div>



        {
  project?.isCollaborative ? (
        <span>
  <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Submitted Bid Details</h3>
  <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-100">
    <div className="space-y-4">
      {/* Render the individual task budgets */}
      <div className="flex items-center justify-between  border-b pb-3">
        <strong className="text-gray-600 font-medium">Bid Amount:</strong>
        <span className="text-gray-800 font-semibold">
          {Object.entries(bidOnTasks.individualTaskBudget).length > 0 && !bidOnTasks.taskedBudget ? (
            <ul>
              {Object.entries(bidOnTasks.individualTaskBudget).map(([taskId, budget], index) => (
                <li key={taskId} className="py-1">
                  <strong>Task {index + 1}:</strong> {taskId} - <span className="text-sm">&#8377; {budget}</span>
                </li>
              ))}
            </ul>
          ) : (
                  <span className="text-md font-semibold">&#8377; {bidOnTasks.taskedBudget}</span>
               )}
        </span>
      </div>

      <div className="flex justify-between items-center border-b pb-3">
        <p className="text-gray-600 font-medium">Your Message:</p>
        <p className="text-gray-800 font-semibold">{bidOnTasks.bidMessage}</p>
      </div>
      <div className="flex justify-between items-center border-b pb-3">
        <p className="text-gray-600 font-medium">Preferred Communication:</p>
        <p className="text-gray-800 font-semibold">{bidOnTasks.preferredCommunication}</p>
      </div>
      <div className="flex justify-between items-center border-b pb-3">
        <p className="text-gray-600 font-medium">Methodology:</p>
        <p className="text-gray-800 font-semibold">{bidOnTasks.methodology}</p>
      </div>
      <div className="flex justify-between items-center border-b pb-3">
        <p className="text-gray-600 font-medium">Tools and Technologies:</p>
        <p className="text-gray-800 font-semibold">{bidOnTasks.toolsTechnologies}</p>
      </div>
      <div className="flex justify-between items-center border-b pb-3">
        <p className="text-gray-600 font-medium">Examples of Past Work:</p>
        <p className="text-blue-600 font-semibold hover:underline">
          <a href={bidOnTasks.examples[0]} download={bidOnTasks.examples[1]} target="_blank" rel="noopener noreferrer">
            View Work
          </a>

        </p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-gray-600 font-medium">Total Estimated Cost:</p>
        <p className="text-gray-800 font-semibold">₹{bidOnTasks.estimatedCost}</p>
      </div>
    </div>
  </div>
</span>

) : (
   <span>
  <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Submitted Bid Details</h3>
  <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-100">
    <div className="space-y-4">
      {/* Render the individual task budgets */}
      <div className="flex items-center justify-between  border-b pb-3">
        <strong className="text-gray-600 font-medium">Bid Amount:</strong>
        <span className="text-gray-800 font-semibold">
          
                  <span className="text-md font-semibold">&#8377; {bidOnProjectData.bidAmount}</span>
               
        </span>
      </div>

      <div className="flex justify-between items-center border-b pb-3">
        <p className="text-gray-600 font-medium">Your Message:</p>
        <p className="text-gray-800 font-semibold">{bidOnProjectData.bidMessage}</p>
      </div>
      <div className="flex justify-between items-center border-b pb-3">
        <p className="text-gray-600 font-medium">Preferred Communication:</p>
        <p className="text-gray-800 font-semibold">{bidOnProjectData.preferredCommunication}</p>
      </div>
      <div className="flex justify-between items-center border-b pb-3">
        <p className="text-gray-600 font-medium">Methodology:</p>
        <p className="text-gray-800 font-semibold">{bidOnProjectData.methodology}</p>
      </div>
      <div className="flex justify-between items-center border-b pb-3">
        <p className="text-gray-600 font-medium">Tools and Technologies:</p>
        <p className="text-gray-800 font-semibold">{bidOnProjectData.toolsTechnologies}</p>
      </div>
      <div className="flex justify-between items-center border-b pb-3">
        <p className="text-gray-600 font-medium">Examples of Past Work:</p>
        <p className="text-blue-600 font-semibold hover:underline">
          <a href={bidOnProjectData.examples[0]} download={bidOnProjectData.examples[1]} target="_blank" rel="noopener noreferrer">
            View Work
          </a>

        </p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-gray-600 font-medium">Total Estimated Cost:</p>
        <p className="text-gray-800 font-semibold">₹{bidOnProjectData.estimatedCost}</p>
      </div>
    </div>
  </div>
</span>
  )
  }
  </span>
        )}
        
          <div
          className={`fixed inset-0 p-4 flex justify-center items-center w-full h-full z-[1000] overflow-auto font-[sans-serif] ${showDetails ? 'block' : 'hidden'}`}
        >
          <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6 relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 cursor-pointer shrink-0 fill-gray-400 hover:fill-red-500 float-right"
              viewBox="0 0 320.591 320.591"
              onClick={closeDetails}
            >
              <path
                d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
              />
              <path
                d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
              />
            </svg>
        
            <div className="my-8 text-center">
              {/* Success or Error Icon */}
              {typeof bidInfo === 'string' && bidInfo.includes('Successful') ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-14 shrink-0 fill-green-500 inline" viewBox="0 0 512 512">
                  <path
                    d="M383.841 171.838c-7.881-8.31-21.02-8.676-29.343-.775L221.987 296.732l-63.204-64.893c-8.005-8.213-21.13-8.393-29.35-.387-8.213 7.998-8.386 21.137-.388 29.35l77.492 79.561a20.687 20.687 0 0 0 14.869 6.275 20.744 20.744 0 0 0 14.288-5.694l147.373-139.762c8.316-7.888 8.668-21.027.774-29.344z"
                  />
                  <path
                    d="M256 0C114.84 0 0 114.84 0 256s114.84 256 256 256 256-114.84 256-256S397.16 0 256 0zm0 470.487c-118.265 0-214.487-96.214-214.487-214.487 0-118.265 96.221-214.487 214.487-214.487 118.272 0 214.487 96.221 214.487 214.487 0 118.272-96.215 214.487-214.487 214.487z"
                  />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-14 shrink-0 fill-red-500 inline" viewBox="0 0 512 512">
                  <path
                    d="M256 0C114.84 0 0 114.84 0 256s114.84 256 256 256 256-114.84 256-256S397.16 0 256 0zm0 470.487c-118.265 0-214.487-96.214-214.487-214.487 0-118.265 96.221-214.487 214.487-214.487 118.272 0 214.487 96.221 214.487 214.487 0 118.272-96.215 214.487-214.487 214.487z"
                  />
                  <path
                    d="M256 0C114.84 0 0 114.84 0 256s114.84 256 256 256 256-114.84 256-256S397.16 0 256 0zm0 470.487c-118.265 0-214.487-96.214-214.487-214.487 0-118.265 96.221-214.487 214.487-214.487 118.272 0 214.487 96.221 214.487 214.487 0 118.272-96.215 214.487-214.487 214.487z"
                  />
                </svg>
              )}
        
              {/* Success or Error Message */}
              <h4 className="text-xl text-gray-800 font-semibold mt-4">
                {typeof bidInfo === 'string' && bidInfo.includes('Successful')
                  ? 'Successfully accepted!'
                  : 'An error occurred!'}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed mt-4">
                {bidInfo || 'Please check your input and try again.'}
              </p>
            </div>
        
            <button
              type="button"
              className="px-5 py-2.5 w-full rounded-lg text-white text-sm border-none outline-none bg-gray-800 hover:bg-gray-700"
              onClick={closeDetails}
            >
              Got it
            </button>
          </div>
        </div>
        
        
        </div>
        </div>
        </div>
      )
};

export default ProjectPageForBidding;
