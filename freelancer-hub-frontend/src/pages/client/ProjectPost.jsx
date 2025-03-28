import React, { useEffect, useState } from "react";
import CSider from "../../components/client/CSider";
import { useLocation, useNavigate, Link } from "react-router-dom";
import CHeader from "../../components/client/CHeader";
import IndividualLoadingComponent from "../../components/IndividualLoadingComponent";
import FreelancerSuggestions from './FreelancerSuggestions';
import { IoMdAdd } from "react-icons/io";
// import Datepicker from "react-tailwindcss-datepicker";
import Checkbox from "@mui/material/Checkbox";
import { Editor } from "primereact/editor";
import Select from "react-select";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Datepicker from "tailwind-datepicker-react";
import axios from "axios";
import { message, Modal } from 'antd';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { Switch } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useMediaQuery } from 'react-responsive';
import MilestoneSection from '../../components/MilestoneSection';
import ProjectReview from './ProjectReview';

const label = { inputProps: { "aria-label": "Checkbox" } };

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

today.setHours(0, 0, 0, 0);

const dateOptions = {
  title: "Project Deadline",
  autoHide: true,
  todayBtn: false,
  clearBtn: true,
  clearBtnText: "Clear",
  maxDate: new Date("2030-01-01"),
  minDate: today,
  theme: {
    background: "bg-gray-200 rounded-md",
    todayBtn: "",
    clearBtn: "bg-teal-500",
    icons: "p-2 text-sm",
    text: "text-md",
    // Apply line-through only for past dates (before today)
    disabledText: "bg-gray-300 text-gray-400 rounded-sm hover:bg-gray-300",
    input: "cursor-pointer bg-gray-none rounded-md",
    inputIcon: "text-teal-400",
    selected: "bg-teal-400 text-white rounded-sm",
  },
  icons: {
    prev: () => (
      <span>
        <IoIosArrowBack />
      </span>
    ),
    next: () => (
      <span>
        <IoIosArrowForward />
      </span>
    ),
  },
  datepickerClassNames: "top-12",
  defaultDate: tomorrow,
  language: "en",
  // Disable only the past dates (before today)
  disabledDates: [
    (date) => {
      // Disable only dates before today, and do not apply the disabled style to future dates
      return date < today;
    },
  ],
  weekDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  inputNameProp: "date",
  inputIdProp: "date",
  inputPlaceholderProp: "Select Date",
  inputDateFormatProp: {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
};

// Add this custom configuration for message
message.config({
  top: 60, // Distance from top
  duration: 3, // Display duration in seconds
  maxCount: 3, // Max number of messages shown at once
});

// First, update the calculateMilestoneBudgetTotal function to be more explicit
const calculateMilestoneBudgetTotal = (milestones) => {
  return milestones.reduce((acc, milestone) => 
    acc + (milestone.milestone_type === 'progress' ? 0 : Number(milestone.amount || 0)), 0
  );
};

// Add a new function to calculate remaining automated amount
const calculateRemainingAutomatedAmount = (task) => {
  const totalMilestoneAmount = calculateMilestoneBudgetTotal(task.milestones);
  return Number(task.budget) - totalMilestoneAmount;
};

// Then define TaskCard component
const TaskCard = ({
  task,
  index,
  filteredOptions,
  taskShow,
  handleTaskChange,
  handleTasksDeadlineChange,
  handleDeleteTask,
  handleShowDatePicker,
  handleHideDatePicker,
  handleTaskMilestoneChange,
  handleAddTaskMilestone,
  taskDateErrors,
  taskBudgetErrors,
  dateOptions,
  formatDate,
  isCollaborative,  // Add this prop
  formValues,       // Add this prop for checking project milestones
  taskMilestoneErrors,  // Add this prop
  handleTaskMilestoneDatePickerShow, // Add this prop
  taskMilestoneShow,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-gray-900 flex items-center">
            <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-2">
              <span className="text-sm text-teal-500 font-medium">{index + 1}</span>
            </span>
            Task Details
          </h4>
          <button
            type="button"
            onClick={() => handleDeleteTask(index)}
            className="text-red-500 hover:text-red-700 transition-colors duration-200"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Task Title */}
        <input
          type="text"
          value={task.title}
          onChange={(e) => handleTaskChange(index, "title", e.target.value)}
          placeholder="Enter task title"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          required
        />

        {/* Task Description */}
        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <Editor
            value={task.description}
            onTextChange={(e) => handleTaskChange(index, "description", e.htmlValue)}
            style={{ height: "150px" }}
          />
        </div>

        {/* Task Budget and Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Budget
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={task.budget}
                onChange={(e) => handleTaskChange(index, "budget", e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            </div>
            {taskBudgetErrors[index] && (
              <p className="mt-1 text-sm text-red-500">{taskBudgetErrors[index]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Deadline
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Datepicker
              options={dateOptions}
              selected={task.deadline ? new Date(task.deadline) : null}
              onChange={(date) => handleTasksDeadlineChange(date, index)}
              show={taskShow[index]}
              setShow={(show) => {
                show ? handleShowDatePicker(index) : handleHideDatePicker(index);
              }}
            />
            {taskDateErrors[index] && (
              <p className="mt-1 text-sm text-red-500">{taskDateErrors[index]}</p>
            )}
          </div>
        </div>

        {/* Task Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills for this Task
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Select
            isMulti
            options={filteredOptions}
            value={task.skills_required_for_task}
            onChange={(e) => handleTaskChange(index, "skills_required_for_task", e)}
            placeholder="Select required skills for this task"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Only show if milestones total is less than task budget */}
        {calculateMilestoneBudgetTotal(task.milestones) < Number(task.budget) ? (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Automatic Payment</h4>
                <p className="text-sm text-gray-600">
                  {task.automated_payment !== false ? (
                    calculateMilestoneBudgetTotal(task.milestones) === 0 
                      ? `Full payment of ${Number(task.budget).toFixed(2)} ₹ will be processed automatically on task completion.`
                      : `Remaining ${calculateRemainingAutomatedAmount(task).toFixed(2)} ₹ will be processed automatically on task completion.`
                  ) : (
                    "Automatic payment is disabled. All payments will be processed manually."
                  )}
                </p>
              </div>
              <Switch
                checked={task.automated_payment !== false}
                onChange={(checked) => handleTaskChange(index, "automated_payment", checked)}
                className={`${
                  task.automated_payment !== false ? 'bg-teal-500' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Toggle automated payment</span>
                <span
                  className={`${
                    task.automated_payment !== false ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </div>
        ) : null}

        {/* Add Milestones Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Task Milestones</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleAddTaskMilestone(index)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              <IoMdAdd className="mr-1 h-5 w-5" />
              Add Milestone
            </motion.button>
          </div>

          {task.milestones.map((milestone, mIndex) => (
            <motion.div
              key={mIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-sm text-teal-500 font-medium">{mIndex + 1}</span>
                    </span>
                    <h4 className="text-sm font-medium text-gray-900">Milestone Details</h4>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedMilestones = [...task.milestones];
                      updatedMilestones.splice(mIndex, 1);
                      handleTaskChange(index, "milestones", updatedMilestones);
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Milestone Title
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter milestone title"
                      value={milestone.title}
                      onChange={(e) => handleTaskMilestoneChange(index, mIndex, 'title', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Milestone Type
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={milestone.milestone_type}
                      onChange={(e) => handleTaskMilestoneChange(index, mIndex, 'milestone_type', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="progress">Progress Only</option>
                      <option value="hybrid">Progress & Payment</option>
                    </select>
                  </div>

                  {(milestone.milestone_type === 'payment' || milestone.milestone_type === 'hybrid') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (₹)
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={milestone.amount}
                          onChange={(e) => handleTaskMilestoneChange(index, mIndex, 'amount', e.target.value)}
                          className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Datepicker
                      options={dateOptions}
                      selected={milestone.due_date ? new Date(milestone.due_date) : null}
                      onChange={(date) => handleTaskMilestoneChange(index, mIndex, 'due_date', formatDate(date))}
                      show={taskMilestoneShow[`${index}-${mIndex}`] || false}
                      setShow={(show) => handleTaskMilestoneDatePickerShow(index, mIndex, show)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Add error display section */}
                {taskMilestoneErrors[index] && taskMilestoneErrors[index][mIndex] && (
                  <div className="bg-red-50 p-3 rounded-md">
                    {taskMilestoneErrors[index][mIndex].map((error, i) => (
                      <p key={i} className="text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                )}

                {/* Update the automated payment checkbox to be disabled when necessary */}
                <label className={`flex items-center space-x-2 cursor-pointer ${
                  milestone.milestone_type === 'progress' ? 'opacity-50' : ''
                }`}>
                  <input
                    type="checkbox"
                    checked={milestone.is_automated}
                    onChange={(e) => handleTaskMilestoneChange(index, mIndex, 'is_automated', e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    disabled={milestone.milestone_type === 'progress'}
                  />
                  <span className="text-sm text-gray-600">
                    Auto-process payment on completion
                    {milestone.milestone_type === 'progress' && " (Not applicable for Progress-only milestones)"}
                  </span>
                </label>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const ProjectPost = ({userId, role, MAX_TASKS=3}) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [show, setShow] = useState(false);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]); // State for selected options
  const [loading, setLoading] = useState(false);
  const [postProject, setPostProject] = useState(false);
  const [domain, setDomain] = useState([]);
  const [skills, setSkills] = useState([]);
  const [taskDateErrors, setTaskDateErrors] = useState([]);
  const [taskBudgetErrors, setTaskBudgetErrors] = useState([]);
  const [errorsResolved, setErrorResolved] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [taskMilestoneShow, setTaskMilestoneShow] = useState({});

  // Add these new state variables at the beginning of the ProjectPost component
  const [showLowFundsModal, setShowLowFundsModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletHoldBalance, setWalletHoldBalance] = useState(0);
  const [totalRequiredAmount, setTotalRequiredAmount] = useState(0);
  const [proceedAsDraft, setProceedAsDraft] = useState(false);

  const [formValues, setFormValues] = useState({
    total_auto_payment: 0,
    title: "",
    description: "",
    budget: 0,
    deadline: "2025-02-24",
    domain: "",
    is_collaborative: false,
    skills_required: [],
    payment_strategy: "automatic",
    milestones: [],
    tasks: [{
      title: "",
      description: "",
      budget: 0,
      deadline: "",
      skills_required_for_task: [],
      milestones: [],
      automated_payment: true,
    }],
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/categories/",
          {
            headers: getAuthHeaders(),
          }
        );

        // Check if the response is an array and format it
        if (Array.isArray(response.data)) {
          const domainOptions = response.data.map((category) => ({
            value: category.id, // Use category name as value
            label: category.name, // Use category name as label
          }));
          setDomain(domainOptions); // Set categories in state
        } else {
          console.error("Expected an array but got:", response.data);
        }
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    fetchDomains(); // Call the fetchDomains function
  }, []); // Empty dependency array to run only on mount

  // Handle domain selection change
  const domainChange = (selected) => {
    setSelectedDomain(selected); // Update selected domain object
    fetchSkills(selected);
    setSkills([]); // Reset skills when domain changes
    setFilteredOptions([]); // Reset filtered skills when domain changes
    setFormValues((prevValues) => ({
      ...prevValues,
      domain: selected ? selected.value : "",
      skills_required: [],
    }));
  };

  // Fetch skills based on the selected domain

  const fetchSkills = async (selectedDomain) => {
    if (!selectedDomain) {
      return; // Avoid fetching if no domain is selected
    }
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/skills/${selectedDomain.value}/`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (Array.isArray(response.data)) {
        const skillOptions = response.data.map((skill) => ({
          value: skill.id, // Assuming the skill has an 'id' field
          label: skill.name, // Assuming the skill has a 'name' field
        }));
        setSkills(skillOptions); // Set skills from API response
      } else {
        console.error("Skills data is not an array", response.data);
        setSkills([]); // Reset skills in case of invalid response
      }
    } catch (error) {
      console.error("Error fetching skills", error);
      setSkills([]); // Reset skills on error
    }
  };
  // Run when selectedDomain changes

  // Filter skills based on the fetched skills
  useEffect(() => {
    if (Array.isArray(skills)) {
      const newFilteredOptions = skills.map((skill) => ({
        value: skill.value,
        label: skill.label,
      }));
      setFilteredOptions(newFilteredOptions); // Set filtered skill options
    }
  }, [skills]);

  // Select component for skills

  const capitalize = (str) => {
    if (typeof str !== "string") return ""; // Return an empty string if it's not a string
    if (!str) return ""; // Handle empty strings
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleAddProjectClick = () => {
    setPostProject(true);
  };

  const handleMenuClick = (component) => {
    if (location.pathname !== "/client/dashboard") {
      navigate("/client/dashboard", { state: { component } });
    }
  };
  const [activeProfileComponent, setActiveProfileComponent] = useState('');
  const [individualLoading, setIndividualLoading] = useState(false);

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/client/profile') {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
    } else {
      setActiveProfileComponent(profileComponent);
    }

    setIndividualLoading(true);

    setTimeout(() => {
      setIndividualLoading(false);
    }, 500);
  };

  const handleClose = (state) => {
    setShow(state);
  };

  const handleAddTask = () => {
    if (formValues.tasks.length < MAX_TASKS) {
      setFormValues({
        ...formValues,
        tasks: [
          ...formValues.tasks,
          {
            title: "",
            description: "",
            budget: 0,
            deadline: "",
            skills_required_for_task: [],
            milestones: [],
            automated_payment: true,
          },
        ],
      });
      
      // Fix: Update taskShow state when adding new task
      setTaskShow(prev => ({
        ...prev,
        [formValues.tasks.length]: false
      }));
    }
  };
  const [taskShow, setTaskShow] = useState(
    formValues.tasks.reduce((acc, _, index) => {
      acc[index] = false; // Set initial state for each task
      return acc;
    }, {})
  );

  const validateTaskBudget = () => {
    let totalTaskBudget = 0;
    let newTaskBudgetErrors = [...taskBudgetErrors]; // Start with a copy of the existing errors
  
    // Loop through each task to calculate the total task budget
    for (let i = 0; i < formValues.tasks.length; i++) {
      totalTaskBudget += Number(formValues.tasks[i].budget);
      
      // If any task has a budget error, add it to the errors array
      if (Number(formValues.tasks[i].budget) < 0) {
        newTaskBudgetErrors[i] = 'Budget cannot be negative'; // Set error for this task
      } else if(Number(totalTaskBudget) > Number(formValues.budget)){
        newTaskBudgetErrors[i] = 'Total budget exceeded'; // Set error for this task
      }
      else {
        newTaskBudgetErrors[i] = ''; // Clear any previous error for this task
      }
    }
    // Check if total task budget exceeds the project budget
  
    setTaskBudgetErrors([...newTaskBudgetErrors]); // Ensure the error state is updated
    setErrorResolved(true); // Form is valid for submission
    return true;
  };
  

// Function to parse date and return valid date object
const parseDate = (dateString) => {
  if (!dateString) {
    console.error("Date string is empty or undefined");
    return null;
  }

  const formattedDateString = `${dateString}T00:00:00Z`;
  const date = new Date(formattedDateString);

  if (isNaN(date.getTime())) {
    console.error("Invalid date format:", formattedDateString);
    return null;
  }

  return date;
};



const validateTaskDeadlines = (date = undefined) => {
  let projectDeadline;
  
  if (date === undefined) {
    projectDeadline = parseDate(formValues.deadline);
  } else {
    projectDeadline = parseDate(date);
  }

  if (!projectDeadline) {
    console.error("Invalid project deadline.");
    setErrorResolved(false); // Project deadline error
    return false;
  }

  const today = new Date();
  let newTaskDateErrors = [...taskDateErrors]; // Start with a copy of existing task date errors

  // Loop through each task to validate its deadline
  for (let i = 0; i < formValues.tasks.length; i++) {
    const task = formValues.tasks[i];
    const taskDeadline = parseDate(task.deadline);

    if (!taskDeadline) {
      console.error(`Invalid task deadline for Task ${i + 1}`);
      continue; // Skip invalid task deadlines
    }

    // Check if task deadline is before today or after the project deadline
    if (taskDeadline > projectDeadline || taskDeadline < today) {
      newTaskDateErrors[i] = "Task deadlines must be before the project deadline and cannot be today or before.";
    } else {
      newTaskDateErrors[i] = ''; // Clear previous errors for this task
    }
  }

  // If any task deadline is invalid, set the errors array
  if (newTaskDateErrors.some((error) => error !== '')) {
    setTaskDateErrors([...newTaskDateErrors]);
    setErrorResolved(false); // Form is not ready for submission
    return false;
  }

  // Clear any errors if validation passes
  setTaskDateErrors([...newTaskDateErrors]);
  setErrorResolved(true); // Form is valid for submission
  return true;
};



// Handle changes in the task deadline
const handleTasksDeadlineChange = (date, taskIndex) => {
  if (!(date instanceof Date) || isNaN(date)) {
    console.error("Invalid date value:", date);
    return;
  }

  const formattedDate = formatDate(date);
  handleTaskChange(taskIndex, "deadline", formattedDate);
  validateTaskDeadlines(); // Only validate deadlines when deadline changes
  
};

// Handle changes in the task data (such as budget or deadline)
const handleTaskChange = (taskIndex, name, value) => {
  const updatedTasks = [...formValues.tasks];

  updatedTasks[taskIndex] = {
    ...updatedTasks[taskIndex],
    [name]: value,
  };

  setFormValues((prevValues) => {
    const updatedFormValues = {
      ...prevValues,
      tasks: updatedTasks,
    };
    console.log(name)
    if (name === 'deadline') {
      validateTaskDeadlines(); // Validate deadlines when deadline changes
    } else if (name === 'budget') {
      validateTaskBudget(); // Validate budget when budget changes
    }

    return updatedFormValues;
  });
};

// Handle form changes (e.g., project budget or deadline)
const formOnchange = (e) => {
  if (!e.target) {
    console.error("Event target is undefined");
    return;
  }

  const { name, value } = e.target;

  if (name !== undefined && value !== undefined) {
    setFormValues((prevValues) => {
      const updatedFormValues = {
        ...prevValues,
        [name]: value,
      };
      if (name === 'deadline') {

        validateTaskDeadlines();
      } else if (name === 'budget') {
        validateTaskBudget();
      }

      return updatedFormValues;
    });
  } else {
    console.error("Form field missing name or value");
  }
};

// UseEffect to ensure validation runs when tasks are updated
useEffect(() => {
  validateTaskDeadlines();
  validateTaskBudget();
}, [formValues.tasks]);
  

  const getAuthHeaders = () => {
    const accessToken = Cookies.get("accessToken");
    return {
      Authorization: `Bearer ${accessToken}`, // Return the header object directly
    };
  };

  const handleSkillChange = (selectedSkills) => {
    // Extract just the skill IDs
    const skillIds = selectedSkills.map(skill => skill.value);
    setFormValues((prevValues) => ({
      ...prevValues,
      skills_required: skillIds,
    }));
  };

  // Add new state variables
  const [showHybridConflictModal, setShowHybridConflictModal] = useState(false);
  const [conflictingMilestones, setConflictingMilestones] = useState([]);
  const [agreedToConvert, setAgreedToConvert] = useState(false);

  // Add this validation function
  const validateHybridConflicts = () => {
    const conflicts = [];
    
    formValues.milestones.forEach((milestone, index) => {
      if (milestone.milestone_type === 'hybrid') {
        const hasTaskHybrid = formValues.tasks.some(task => 
          task.milestones.some(m => m.milestone_type === 'hybrid')
        );
        
        if (hasTaskHybrid) {
          conflicts.push({
            index,
            title: milestone.title || `Milestone ${index + 1}`,
            originalType: 'hybrid'
          });
        }
      }
    });

    if (conflicts.length > 0) {
      setConflictingMilestones(conflicts);
      return false;
    }
    return true;
  };

  // Add this function to calculate total automated payments
  const calculateTotalAutomatedPayments = () => {
    let total = 0;

    // Add project milestones with automated payments
    formValues.milestones.forEach(milestone => {
      if (milestone.is_automated && (milestone.milestone_type === 'payment' || milestone.milestone_type === 'hybrid')) {
        total += Number(milestone.amount || 0);
      }
    });

    // Add task milestones with automated payments
    formValues.tasks.forEach(task => {
      let taskMilestoneTotal = 0;  // Reset for each task

      // Calculate total milestone payments for this task
      task.milestones.forEach(milestone => {
        if (milestone.is_automated && (milestone.milestone_type === 'payment' || milestone.milestone_type === 'hybrid')) {
          taskMilestoneTotal += Number(milestone.amount || 0);
        }
      });

      // If task has automated payment, add the remaining amount
      if (task.automated_payment !== false) {
        const remainingAmount = Number(task.budget || 0) - taskMilestoneTotal;
        total += remainingAmount;
      }
      
      // Always add the milestone payments
      total += taskMilestoneTotal;
    });

    return total;
  };

  // Add this function to fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/finance/wallet/balance/",
        { headers: getAuthHeaders() }
      );
      setWalletBalance(response.data.balance);
      setWalletHoldBalance(response.data.hold_balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      message.error("Could not fetch wallet balance");
    }
  };

  // Add useEffect to fetch wallet balance when component mounts
  useEffect(() => {
    fetchWalletBalance();
  }, []);

  // Add this function at the top level of the ProjectPost component
  const checkForTaskPayments = (tasks) => {
    return tasks.some(task => 
      task.milestones.some(m => 
        m.milestone_type === 'payment' || m.milestone_type === 'hybrid'
      )
    );
  };

  const [projectData, setProjectData] = useState(null);
  const [showProjectOverview, setShowProjectOverview] = useState(false);

  // Update the formSubmit function to include all validations
  const formSubmit = async (e) => {
    e.preventDefault();

    // Run all validations
    const isBudgetValid = validateTaskBudget();
    const areDeadlinesValid = validateTaskDeadlines();
    const areProjectMilestonesValid = validateProjectMilestones();
    const areTaskMilestonesValid = validateTaskMilestones();
    const hasHybridConflicts = !validateHybridConflicts();

    // Check if any validation failed
    if (!isBudgetValid || !areDeadlinesValid || !areProjectMilestonesValid || !areTaskMilestonesValid) {
      message.error({
        content: "Please fix the validation errors before submitting.",
        className: 'custom-message error',
      });
      return;
    }

    // Handle hybrid conflicts first
    if (hasHybridConflicts && !agreedToConvert) {
      setShowHybridConflictModal(true);
      return;
    }

    // Calculate total required amount and check wallet balance
    const totalRequired = calculateTotalAutomatedPayments();
    setTotalRequiredAmount(totalRequired);

    if (totalRequired > walletBalance - walletHoldBalance && !proceedAsDraft) {
      setShowLowFundsModal(true);
      return;
    }

    // Proceed with form submission
    try {
      const payload = {
        ...formValues,
        status: proceedAsDraft ? 'draft' : 'pending',
        skills_required: formValues.skills_required,
        total_auto_payment: (!hasHybridConflicts || agreedToConvert) ? totalRequired : 0,
        milestones: formValues.milestones.map(m => ({
          ...m,
          amount: Number(m.amount)
        })),
        tasks: formValues.tasks.map(t => ({
          ...t,
          skills_required_for_task: t.skills_required_for_task.map(skill => skill.value),
          milestones: t.milestones.map(m => ({
            ...m,
            amount: Number(m.amount)
          }))
        }))
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/post_project/",
        payload,
        { headers: getAuthHeaders() }
      );
      
      if (response.status >= 200 && response.status < 300) {
        setShowSuccessModal(true);
        setProjectData(response.data.project);
      }
    } catch (error) {
      message.error({
        content: "Failed to post project. Please try again.",
        className: 'custom-message error',
      });
      console.error("Error submitting form:", error);
    }
  };

  const handleModalConfirm = () => {
    setShowSuccessModal(false);
    setPostProject(false); // Reset to initial add project screen
    setShowProjectOverview(true);
    // Reset all form values
    setFormValues({
      title: "",
      description: "",
      budget: 0,
      deadline: formatDate(tomorrow), // Use tomorrow's date as default
      domain: "",
      is_collaborative: false,
      skills_required: [],
      payment_strategy: "automatic",
      milestones: [],
      tasks: [{
        title: "",
        description: "",
        budget: 0,
        deadline: "",
        skills_required_for_task: [],
        milestones: [],
        automated_payment: true,
      }]
    });

    // Reset all other states
    setSelectedDomain("");
    setSelectedOptions([]);
    setIsCollaborative(false);
    setCurrentStep(1);
    setShowProjectMilestones(false);
    setTaskShow({});
    setTaskDateErrors([]);
    setTaskBudgetErrors([]);
    setMilestoneErrors({});
    setTaskMilestoneErrors({});
    setProceedAsDraft(false);
    setErrorResolved(true);
    
    // Reset milestone related states
    setProjectMilestoneShow({});
    setTaskMilestoneShow({});

    // Show success message
    message.success({
      content: "Project posted successfully! Create another project or return to dashboard.",
      duration: 5,
    });
  };

  // Function to format a JavaScript Date object into "YYYY-MM-DD" format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so we add 1
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // Format as "YYYY-MM-DD"
  };

  const handleDeadlineChange = (date) => {
    // Check if the passed date is valid
    if (!(date instanceof Date) || isNaN(date)) {
      console.error("Invalid date value:", date);
      return;
    }

    // Format the date to "YYYY-MM-DD"
    const formattedDate = formatDate(date);
    // Update the form values state
    setFormValues((prevValues) => ({
      ...prevValues,
      deadline: formattedDate, // Store the formatted date in the form values
    }));

    validateTaskDeadlines(formattedDate);
  };
 

  const handleShowDatePicker = (taskIndex) => {
    setTaskShow((prevState) => ({
      ...prevState,
      [taskIndex]: true,
    }));
  };

  const handleHideDatePicker = (taskIndex) => {
    setTaskShow((prevState) => ({
      ...prevState,
      [taskIndex]: false,
    }));
  };

  const handleDeleteTask = (index) => {
    const updatedTasks = [...formValues.tasks];
    updatedTasks.splice(index, 1); // Removes the task at the specified index
    setFormValues({
      ...formValues,
      tasks: updatedTasks,
    });
  };
  

  // New milestone handlers

  const handleProjectMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...formValues.milestones];
    
    // Check if any task has hybrid milestones
    const hasTaskHybrid = formValues.tasks.some(task => 
      task.milestones.some(m => m.milestone_type === 'hybrid')
    );
    
    if (hasTaskHybrid && (field === 'milestone_type' && (value === 'payment' || value === 'hybrid'))) {
      // If task has hybrid milestones, force project milestone to be progress-only
      updatedMilestones[index] = {
        ...updatedMilestones[index],
        milestone_type: 'progress',
        amount: 0,
        is_automated: false
      };
      message.info('Project milestones set to progress-only due to task hybrid milestones');
    } else {
      updatedMilestones[index][field] = value;
      
      if (field === 'milestone_type' && value === 'progress') {
        updatedMilestones[index].amount = 0;
        updatedMilestones[index].is_automated = false;
      }
    }
    
    setFormValues(prev => ({
      ...prev,
      milestones: updatedMilestones
    }));
    
    // Clear error for this milestone
    if (milestoneErrors[index]) {
      const updatedErrors = { ...milestoneErrors };
      delete updatedErrors[index];
      setMilestoneErrors(updatedErrors);
    }
    
    // Validate after a small delay to let state update
    setTimeout(() => {
      validateProjectMilestones();
    }, 100);
  };

  const handleAddTaskMilestone = (taskIndex) => {
    const updatedTasks = [...formValues.tasks];
    updatedTasks[taskIndex].milestones = [
      ...updatedTasks[taskIndex].milestones,
      { title: "", milestone_type: "hybrid", amount: 0, due_date: "", is_automated: true }
    ];
    setFormValues(prev => ({ ...prev, tasks: updatedTasks }));
    
    // Initialize date picker state for new milestone
    setTaskMilestoneShow(prev => ({
      ...prev,
      [`${taskIndex}-${updatedTasks[taskIndex].milestones.length - 1}`]: false
    }));
  };

  // Update the handleTaskMilestoneChange function to set automated_payment to false when milestones equal budget
  const handleTaskMilestoneChange = (taskIndex, milestoneIndex, field, value) => {
    const updatedTasks = [...formValues.tasks];
    
    // Update the milestone field
    updatedTasks[taskIndex].milestones[milestoneIndex][field] = value;
    
    // Calculate total milestone budget
    const totalMilestoneBudget = calculateMilestoneBudgetTotal(updatedTasks[taskIndex].milestones);
    
    // If milestone budget equals task budget, set automated_payment to false
    if (totalMilestoneBudget === Number(updatedTasks[taskIndex].budget)) {
      updatedTasks[taskIndex].automated_payment = false;
    }
    
    setFormValues(prev => ({ ...prev, tasks: updatedTasks }));
    setTimeout(() => {
      validateTaskMilestones();
    }, 100);
    // Rest of your existing validation logic...
  };

  // Add these new state variables at the top of the ProjectPost component
  const [projectMilestoneShow, setProjectMilestoneShow] = useState({});

  // Add these new handler functions
  const handleProjectMilestoneDatePickerShow = (index, show) => {
    setProjectMilestoneShow(prev => ({
      ...prev,
      [index]: show
    }));
  };

  const handleTaskMilestoneDatePickerShow = (taskIndex, milestoneIndex, show) => {
    setTaskMilestoneShow(prev => ({
      ...prev,
      [`${taskIndex}-${milestoneIndex}`]: show
    }));
  };

  // Add these state variables to the ProjectPost component
  const [milestoneErrors, setMilestoneErrors] = useState({});
  const [taskMilestoneErrors, setTaskMilestoneErrors] = useState({});
  const [showPaymentWarningModal, setShowPaymentWarningModal] = useState(false);
  const [conflictingTaskIndex, setConflictingTaskIndex] = useState(null);

  // Add this validation function for project milestones
  const validateProjectMilestones = () => {
    let totalMilestoneBudget = 0;
    let newMilestoneErrors = {};
    let isValid = true;
    const projectDeadline = parseDate(formValues.deadline);
    
    formValues.milestones.forEach((milestone, index) => {
      let errors = [];
      
      // Validate due date
      if (!milestone.due_date) {
        errors.push("Due date is required");
        isValid = false;
      } else {
        const milestoneDate = parseDate(milestone.due_date);
        if (milestoneDate > projectDeadline) {
          errors.push("Must be before project deadline");
          isValid = false;
        }
      }
      
      // Only validate payment amounts for payment/hybrid milestones if no task has hybrid milestones
      const hasTaskHybrid = formValues.tasks.some(task => 
        task.milestones.some(m => m.milestone_type === 'hybrid')
      );

      if (!hasTaskHybrid && (milestone.milestone_type === 'payment' || milestone.milestone_type === 'hybrid')) {
        if (Number(milestone.amount) <= 0) {
          errors.push("Amount must be greater than 0");
          isValid = false;
        }
        totalMilestoneBudget += Number(milestone.amount || 0);
      }

      if (errors.length > 0) {
        newMilestoneErrors[index] = errors;
        // Scroll to and highlight the milestone with error
        setTimeout(() => {
          const element = document.getElementById(`milestone-${index}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-milestone');
            setTimeout(() => {
              element.classList.remove('highlight-milestone');
            }, 2000);
          }
        }, 100);
      }
    });

    setMilestoneErrors(newMilestoneErrors);
    return isValid;
  };

  // Add this validation function for task milestones
  const validateTaskMilestones = () => {
    let newTaskMilestoneErrors = {};
    let isValid = true;
    const today = new Date();
    
    formValues.tasks.forEach((task, taskIndex) => {
      let totalTaskMilestoneBudget = 0;
      const taskDeadline = parseDate(task.deadline);
      
      if (!task.milestones || task.milestones.length === 0) {
        return; // Skip if no milestones
      }

      task.milestones.forEach((milestone, milestoneIndex) => {
        let errors = [];
        
        // Title validation
        if (!milestone.title || milestone.title.trim() === '') {
          errors.push("Title is required");
          isValid = false;
        }

        // Due date validation
        if (!milestone.due_date) {
          errors.push("Due date is required");
          isValid = false;
        } else {
          const milestoneDate = parseDate(milestone.due_date);
          
          if (!milestoneDate || isNaN(milestoneDate.getTime())) {
            errors.push("Invalid date format");
            isValid = false;
          } else {
            // Validate against task deadline
            if (taskDeadline && milestoneDate > taskDeadline) {
              errors.push("Must be before task deadline");
              isValid = false;
            }
            
            // Validate not in past
            if (milestoneDate < today) {
              errors.push("Cannot be in the past");
              isValid = false;
            }
          }
        }
        
        // Amount validation for payment/hybrid milestones
        if (milestone.milestone_type === 'payment' || milestone.milestone_type === 'hybrid') {
          const amount = Number(milestone.amount);
          if (!amount || amount <= 0) {
            errors.push("Amount must be greater than 0");
            isValid = false;
          }
          totalTaskMilestoneBudget += amount;
        }

        // Budget validation
        console.log(totalTaskMilestoneBudget, Number(task.budget))
        if (totalTaskMilestoneBudget > Number(task.budget)) {
          errors.push("Total milestone amounts exceed task budget");
          isValid = false;
        }

        if (errors.length > 0) {
          if (!newTaskMilestoneErrors[taskIndex]) {
            newTaskMilestoneErrors[taskIndex] = {};
          }
          newTaskMilestoneErrors[taskIndex][milestoneIndex] = errors;
        }
      });
    });
    
    setTaskMilestoneErrors(newTaskMilestoneErrors);
    return isValid;
  };

  // Add a function to handle automatic payment settings based on milestones
  const setTaskAutomatedPayment = (taskIndex, hasPaymentMilestones) => {
    const updatedTasks = [...formValues.tasks];
    const task = updatedTasks[taskIndex];
    
    // If no payment milestones, set automated payment for task completion
    if (!hasPaymentMilestones) {
      task.automated_payment = true;
    } else {
      task.automated_payment = false;
    }
    
    setFormValues(prev => ({ ...prev, tasks: updatedTasks }));
  };

  // Update the handleAddProjectMilestone function
  const handleAddProjectMilestone = () => {
    // Check if any task has payment/hybrid milestones
    const hasTaskPaymentMilestones = formValues.tasks.some(task => 
      task.milestones.some(m => 
        m.milestone_type === 'payment' || m.milestone_type === 'hybrid'
      )
    );

    // If tasks have payment milestones, force project milestones to be progress-only
    if (hasTaskPaymentMilestones) {
      setFormValues(prev => ({
        ...prev,
        milestones: [...prev.milestones, {
          title: "",
          milestone_type: "progress", // Default to progress
          amount: 0,
          due_date: "",
          is_automated: false
        }]
      }));
      return;
    }

    // Otherwise allow normal milestone creation with progress default
    setFormValues(prev => ({
      ...prev,
      milestones: [...prev.milestones, {
        title: "",
        milestone_type: "progress", // Changed from hybrid to progress
        amount: 0,
        due_date: "",
        is_automated: true
      }]
    }));
  };

  // Add this handler function
  const handleConvertConflicts = () => {
    const updatedMilestones = [...formValues.milestones];
    
    conflictingMilestones.forEach(conflict => {
      updatedMilestones[conflict.index] = {
        ...updatedMilestones[conflict.index],
        milestone_type: 'progress',
        amount: 0,
        is_automated: false
      };
    });

    setFormValues(prev => ({
      ...prev,
      milestones: updatedMilestones
    }));
    
    setAgreedToConvert(true);
    setShowHybridConflictModal(false);
    
    // Highlight and scroll to first conflict
    if (conflictingMilestones.length > 0) {
      const firstConflict = conflictingMilestones[0];
      const element = document.getElementById(`milestone-${firstConflict.index}`);
      if (element) {
        element.classList.add('highlight-milestone');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
          element.classList.remove('highlight-milestone');
        }, 2000);
      }
    }

    message.success('Milestones converted to progress-only');
  };

  // First, let's add a helper function to calculate milestone budget total

  // Add new state for step management
  const [currentStep, setCurrentStep] = useState(1);
  const [showProjectMilestones, setShowProjectMilestones] = useState(false);

  // Add this function to handle step navigation
  const handleStepChange = (step) => {
    if (step > currentStep) {
      // Validate current step before proceeding
      if (step === (isCollaborative ? 4 : 3)) { // Final step validation
        const isBudgetValid = validateTaskBudget();
        const areDeadlinesValid = validateTaskDeadlines();
        const areProjectMilestonesValid = validateProjectMilestones();
        const areTaskMilestonesValid = validateTaskMilestones();
        
        if (!isBudgetValid || !areDeadlinesValid || !areProjectMilestonesValid || !areTaskMilestonesValid) {
          message.error("Please fix all validation errors before proceeding to review");
          return;
        }
      }
      setCurrentStep(step);
    } else {
      setCurrentStep(step);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <CSider
        userId={userId}
        role={role}
        dropdown={true}
        collapsed={true}
        handleMenuClick={handleMenuClick}
        handleProfileMenu={handleProfileMenu}
        activeProfileComponent={activeProfileComponent}
      />
  
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'ml-0 pb-16' : 'ml-14'}`}>
        <CHeader userId={userId}/>
        
        <div className="flex-1 overflow-auto bg-slate-50/90 p-4 md:p-6">
          {loading ? (
            <IndividualLoadingComponent />
          ) : (
            <div className="max-w-6xl mx-auto">
            {!postProject ? (
              <>
                {showProjectOverview ? (
                  <FreelancerSuggestions project={projectData} />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-10 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-slate-100"
                    onClick={handleAddProjectClick}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                        <IoMdAdd className="text-white text-4xl" />
                      </div>
                      <p className="text-slate-800 text-xl font-semibold tracking-tight">
                        Create a New Project
                      </p>
                      <p className="text-slate-600 text-base text-center max-w-lg leading-relaxed">
                        Start by creating a project and find the perfect freelancer for your needs
                      </p>
                    </div>
                  </motion.div>
                )}
              </>
            ): (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-100"
                >
                  <div className="border-b border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-8">
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Create New Project
                      </h1>
                      <div className="flex items-center space-x-3">
                      <div className="flex flex-col xs:flex-row items-start xs:items-center space-y-2 xs:space-y-0 xs:space-x-2 sm:space-x-3">
                      <span className="text-xs sm:text-sm font-medium text-slate-600 whitespace-nowrap">
                        Project Type:
                      </span>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Switch
                          checked={isCollaborative}
                          onChange={(checked) => {
                            setIsCollaborative(checked);
                            formOnchange({
                              target: { name: "is_collaborative", value: checked },
                            });
                          }}
                          className={`${
                            isCollaborative ? 'bg-gradient-to-r from-teal-500 to-teal-600' : 'bg-slate-200'
                          } relative inline-flex h-6 sm:h-7 w-11 sm:w-14 items-center rounded-full transition-colors duration-300 ease-in-out shrink-0`}
                        >
                          <span className={`${
                            isCollaborative ? 'translate-x-6 sm:translate-x-8' : 'translate-x-1'
                          } inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out`}
                          />
                        </Switch>
                        <span className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">
                          {isCollaborative ? 'Collaborative' : 'Single Freelancer'}
                        </span>
                      </div>
                    </div>
                      </div>
                    </div>

                    {/* Project Type Description */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 shadow-inner">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {isCollaborative ? (
                            <div className="p-3 bg-teal-100 rounded-xl">
                              <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="p-3 bg-teal-100 rounded-xl">
                              <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-800 mb-1">
                            {isCollaborative ? 'Collaborative Project' : 'Single Freelancer Project'}
                          </h3>
                          <p className="text-slate-600 leading-relaxed">
                            {isCollaborative 
                              ? `Break down your project into up to ${MAX_TASKS} tasks, each with its own requirements and budget.`
                              : 'Perfect for projects that require a single freelancer to handle all responsibilities.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form section with enhanced styling */}
                  <form onSubmit={formSubmit} className="p-6 space-y-8">
                    {/* Step Progress Bar */}
                    <div className="mb-8">
                      {/* Step Progress Container */}
                      <div className="relative">
                        {/* Progress Bar Background */}
                        <div className="absolute top-4 sm:top-5 md:top-6 left-0 w-full h-1 bg-slate-200">
                          <div 
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-300"
                            style={{ 
                              width: `${(currentStep - 1) * (100 / (isCollaborative ? 3 : 2))}%` 
                            }}
                          />
                        </div>

                        {/* Steps Container */}
                        <div className="relative flex justify-between">
                          {(isCollaborative ? [1, 2, 3, 4] : [1, 2, 3]).map((step) => (
                            <div key={step} className="flex flex-col items-center">
                              <button
                                type="button"
                                onClick={() => handleStepChange(step)}
                                className={`
                                  w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 
                                  rounded-full flex items-center justify-center
                                  transition-all duration-300 transform
                                  ${currentStep >= step 
                                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg scale-110' 
                                    : 'bg-white text-slate-500 border-2 border-slate-200'
                                  }
                                  ${currentStep === step 
                                    ? 'ring-4 ring-teal-100' 
                                    : ''
                                  }
                                  hover:shadow-md hover:scale-105
                                  text-xs sm:text-sm md:text-base
                                `}
                              >
                                {currentStep > step ? (
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <span className="font-semibold">{step}</span>
                                )}
                              </button>
                              
                              {/* Step Label */}
                              <div className="mt-2 sm:mt-3 md:mt-4 space-y-0.5 sm:space-y-1">
                                <span className={`
                                  block text-xs sm:text-sm md:text-base font-medium text-center
                                  ${currentStep >= step ? 'text-teal-600' : 'text-slate-500'}
                                `}>
                                  {step === 1 && "Project Details"}
                                  {step === 2 && "Budget & Milestones"}
                                  {step === 3 && (isCollaborative ? "Tasks & Milestones" : "Review & Submit")}
                                  {step === 4 && "Review & Submit"}
                                </span>
                                {/* Optional Step Description */}
                                <span className="hidden sm:block text-[10px] sm:text-xs text-slate-400 text-center max-w-[80px] sm:max-w-[100px] md:max-w-[120px] mx-auto">
                                  {step === 1 && "Basic project information"}
                                  {step === 2 && "Set budget and timeline"}
                                  {step === 3 && (isCollaborative ? "Define tasks" : "Final review")}
                                  {step === 4 && "Final review"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Add this CSS to your existing styles */}
                    <style jsx global>{`
                      /* Smooth transitions for progress bar */
                      .progress-bar-transition {
                        transition: width 0.4s ease-in-out;
                      }
                      
                      /* Pulse animation for current step */
                      @keyframes pulse-teal {
                        0% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(20, 184, 166, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0); }
                      }
                      
                      .step-button-current {
                        animation: pulse-teal 2s infinite;
                      }
                    `}</style>

                    {/* Step 1: Project Details */}
                    <div className={`transition-all duration-500 ${currentStep === 1 ? 'block' : 'hidden'}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-lg p-6 shadow-sm"
                      >
                        <h2 className="text-xl font-semibold mb-6">Project Details</h2>
                        
                        {/* Project Title */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formValues.title}
                            onChange={formOnchange}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-teal-500"
                            required
                          />
                        </div>

                        {/* Project Description */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Description <span className="text-red-500">*</span>
                          </label>
                          <Editor
                            value={formValues.description}
                            onTextChange={(e) => setFormValues({
                              ...formValues,
                              description: e.htmlValue,
                            })}
                            style={{ height: "200px" }}
                          />
                        </div>

                        {/* Domain Selection */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Domain <span className="text-red-500">*</span>
                          </label>
                          <Select
                            options={domain}
                            value={selectedDomain}
                            onChange={domainChange}
                            className="react-select-container"
                            classNamePrefix="react-select"
                          />
                        </div>

                        {/* Skills Selection (for non-collaborative projects) */}
                        {!isCollaborative && (
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Required Skills <span className="text-red-500">*</span>
                            </label>
                            <Select
                              isMulti
                              options={filteredOptions}
                              value={formValues.skills_required}
                              onChange={handleSkillChange}
                              className="react-select-container"
                              classNamePrefix="react-select"
                            />
                          </div>
                        )}

                        {/* Next Step Button */}
                        <div className="flex justify-end mt-6">
                          <button
                            type="button"
                            onClick={() => handleStepChange(2)}
                            className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                          >
                            Next: Budget & Milestones
                          </button>
                        </div>
                      </motion.div>
                    </div>

                    {/* Step 2: Budget & Milestones */}
                    <div className={`transition-all duration-500 ${currentStep === 2 ? 'block' : 'hidden'}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-lg p-6 shadow-sm"
                      >
                        <h2 className="text-xl font-semibold mb-6">Budget & Milestones</h2>

                        {/* Project Budget */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Budget (₹) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="budget"
                              value={formValues.budget}
                              onChange={formOnchange}
                              className="w-full pl-8 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-teal-500"
                              required
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          </div>
                        </div>

                        {/* Project Deadline */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Deadline <span className="text-red-500">*</span>
                          </label>
                          <Datepicker
                            options={dateOptions}
                            selected={new Date(formValues.deadline)}
                            onChange={handleDeadlineChange}
                            show={show}
                            setShow={handleClose}
                          />
                        </div>

                        {/* Project Milestones Toggle */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">
                              Add Project Milestones
                            </label>
                            <Switch
                              checked={showProjectMilestones}
                              onChange={setShowProjectMilestones}
                              className={`${
                                showProjectMilestones ? 'bg-teal-500' : 'bg-gray-200'
                              } relative inline-flex h-6 w-11 items-center rounded-full`}
                            >
                              <span className="sr-only">Enable project milestones</span>
                              <span
                                className={`${
                                  showProjectMilestones ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                              />
                            </Switch>
                          </div>
                        </div>

                        {/* Project Milestones Section */}
                        {showProjectMilestones && (
                          <div className="space-y-4">
                            {formValues.milestones.map((milestone, index) => {
                              const hasTaskPayment = checkForTaskPayments(formValues.tasks);
                              
                              return (
                                <motion.div
                                  key={index}
                                  id={`milestone-${index}`}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="milestone-card bg-white rounded-lg p-6 professional-shadow hover:professional-shadow-lg"
                                >
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center space-x-2">
                                        <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                                          <span className="text-sm text-teal-500 font-medium">{index + 1}</span>
                                        </span>
                                        <h4 className="text-sm font-medium text-gray-900">Milestone Details</h4>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedMilestones = [...formValues.milestones];
                                          updatedMilestones.splice(index, 1);
                                          setFormValues(prev => ({ ...prev, milestones: updatedMilestones }));
                                        }}
                                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                      >
                                        <TrashIcon className="h-5 w-5" />
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Milestone Title
                                          <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Enter milestone title"
                                          value={milestone.title}
                                          onChange={(e) => handleProjectMilestoneChange(index, 'title', e.target.value)}
                                          className="modern-input w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none"
                                        />
                                      </div>

                                      {/* Milestone Type Select */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Milestone Type
                                          <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <select
                                          value={milestone.milestone_type}
                                          onChange={(e) => handleProjectMilestoneChange(index, 'milestone_type', e.target.value)}
                                          className="modern-input w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none"
                                          disabled={hasTaskPayment}
                                        >
                                          <option value="progress">Progress Only</option>
                                          {!hasTaskPayment && (
                                            <option value="hybrid">Progress & Payment</option>
                                          )}
                                        </select>
                                      </div>

                                      {/* Conditional Payment Fields */}
                                      {!hasTaskPayment && (milestone.milestone_type === 'payment' || milestone.milestone_type === 'hybrid') && (
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Amount (₹)
                                                <span className="text-red-500 ml-1">*</span>
                                          </label>
                                              <div className="relative">
                                          <input
                                            type="number"
                                                  placeholder="Enter amount"
                                                  value={milestone.amount}
                                                  onChange={(e) => handleProjectMilestoneChange(index, 'amount', e.target.value)}
                                                  className="modern-input w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none"
                                                />
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                          </div>
                                          </div>
                                        )}

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Due Date
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <Datepicker
                                          options={dateOptions}
                                            selected={milestone.due_date ? new Date(milestone.due_date) : null}
                                            onChange={(date) => handleProjectMilestoneChange(index, 'due_date', formatDate(date))}
                                            show={projectMilestoneShow[index] || false}
                                            setShow={(show) => handleProjectMilestoneDatePickerShow(index, show)}
                                            className="modern-input w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none"
                                          />
                                        </div>
                                    </div>

                                    {/* Automated Payment Checkbox */}
                                    {!hasTaskPayment && (
                                      <div className="flex items-center mt-4">
                                        <label className={`flex items-center space-x-2 cursor-pointer ${
                                          milestone.milestone_type === 'progress' ? 'opacity-50' : ''
                                        }`}>
                                          <input
                                            type="checkbox"
                                            checked={milestone.is_automated}
                                            onChange={(e) => handleProjectMilestoneChange(index, 'is_automated', e.target.checked)}
                                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                            disabled={milestone.milestone_type === 'progress' || hasTaskPayment}
                                          />
                                          <span className="text-sm text-gray-600">
                                            Auto-process payment on completion
                                            {milestone.milestone_type === 'progress' && " (Not applicable for Progress-only milestones)"}
                                          </span>
                                        </label>
                                      </div>
                                    )}
                                  </div>

                                  {milestoneErrors[index] && (
                                    <div className="bg-red-50 p-3 rounded-md mt-4">
                                      {milestoneErrors[index].map((error, i) => (
                                        <p key={i} className="text-sm text-red-600">{error}</p>
                                      ))}
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                            <button
                              type="button"
                              onClick={handleAddProjectMilestone}
                              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-500 hover:text-teal-500 transition-colors"
                            >
                              <IoMdAdd className="inline-block mr-2" />
                              Add Milestone
                            </button>
                          </div>
                        )}

                        {/* Navigation Buttons */}
                        
                          <div className={`flex justify-between gap-1 mt-6 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                            <button
                              type="button"
                            onClick={() => handleStepChange(1)}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepChange(isCollaborative ? 3 : 3)}
                            className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                          >
                            {isCollaborative ? 'Next: Tasks & Milestones' : 'Next: Review & Submit'}
                          </button>
                          </div>
                      </motion.div>
                    </div>

                    {/* Step 3: Tasks & Milestones (only for collaborative) or Review & Submit */}
                    <div className={`transition-all duration-500 ${currentStep === 3 ? 'block' : 'hidden'}`}>
                      {isCollaborative ? (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white rounded-lg p-6 shadow-sm"
                        >
                          {/* Existing Tasks & Milestones content */}
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Tasks & Milestones</h2>
                            {formValues.tasks.length < MAX_TASKS && (
                              <button
                                type="button"
                                onClick={handleAddTask}
                                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                              >
                                <IoMdAdd className="inline-block mr-2" />
                                Add Task ({formValues.tasks.length}/{MAX_TASKS})
                              </button>
                            )}
                          </div>

                          {/* Tasks List */}
                          <div className="space-y-6">
                            {formValues.tasks.map((task, index) => (
                              <TaskCard
                                key={index}
                                task={task}
                                index={index}
                                filteredOptions={filteredOptions}
                                taskShow={taskShow}
                                handleTaskChange={handleTaskChange}
                                handleTasksDeadlineChange={handleTasksDeadlineChange}
                                handleDeleteTask={handleDeleteTask}
                                handleShowDatePicker={handleShowDatePicker}
                                handleHideDatePicker={handleHideDatePicker}
                                handleTaskMilestoneChange={handleTaskMilestoneChange}
                                handleAddTaskMilestone={handleAddTaskMilestone}
                                taskDateErrors={taskDateErrors}
                                taskBudgetErrors={taskBudgetErrors}
                                dateOptions={dateOptions}
                                formatDate={formatDate}
                                isCollaborative={isCollaborative}
                                formValues={formValues}
                                taskMilestoneErrors={taskMilestoneErrors}
                                handleTaskMilestoneDatePickerShow={handleTaskMilestoneDatePickerShow}
                                taskMilestoneShow={taskMilestoneShow}
                              />
                            ))}
                          </div>

                          {/* Navigation Buttons */}
                          <div className={`flex justify-between gap-1 mt-6 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                            <button
                              type="button"
                              onClick={() => handleStepChange(2)}
                              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStepChange(4)}
                              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                            >
                              Next: Review & Submit
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white rounded-lg p-6 shadow-sm"
                        >
                          <h2 className="text-xl font-semibold mb-6">Review & Submit</h2>
                          <ProjectReview project={formValues} isCollaborative={false} />
                          
                          <div className="flex justify-between mt-6">
                            <button
                              type="button"
                              onClick={() => handleStepChange(2)}
                              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                            >
                              Post Project
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Step 4: Review & Submit (only for collaborative) */}
                    {isCollaborative && (
                      <div className={`transition-all duration-500 ${currentStep === 4 ? 'block' : 'hidden'}`}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white rounded-lg p-6 shadow-sm"
                        >
                          <h2 className="text-xl font-semibold mb-6">Review & Submit</h2>
                          <ProjectReview project={formValues} isCollaborative={true} />
                          
                          <div className="flex justify-between mt-6">
                            <button
                              type="button"
                              onClick={() => handleStepChange(3)}
                              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                            >
                              Post Project
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </form>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add custom styles */}
      <style jsx global>{`
        /* Base styles for form elements */
        .form-container {
          position: relative;
          z-index: 1;
        }

        /* Select styles */
        .react-select-container {
          position: relative;
          z-index: 40;
        }

        .react-select__menu {
          z-index: 50 !important;
        }

        /* Date picker styles */
        .tailwind-datepicker-container,
        div[role="dialog"] {
          z-index: 50 !important;
        }

        /* Task section specific z-index handling */
        .task-card {
          position: relative;
          margin-bottom: 2rem; /* Add more space between tasks */
        }

        /* Ensure last task's select is visible */
        .task-card:last-child {
          margin-bottom: 3rem; /* Extra space for the last task */
        }

        .task-card .react-select-container {
          z-index: 40;
        }

        /* Progressive z-index for stacked tasks */
        .task-card:nth-child(1) { z-index: 40; }
        .task-card:nth-child(2) { z-index: 39; }
        .task-card:nth-child(3) { z-index: 38; }

        /* Modal and message z-index */
        .ant-modal {
          z-index: 1001 !important;
        }
        
        .ant-modal-mask {
          z-index: 1000 !important;
        }
        
        .ant-message {
          z-index: 1002 !important;
        }

        /* Editor z-index */
        .p-editor-container {
          position: relative;
          z-index: 30;
        }
        
        .p-editor-toolbar {
          z-index: 31;
        }

        /* Existing styles */
        .react-select-container .react-select__control {
          border-radius: 0.5rem;
          border-color: #e5e7eb;
          min-height: 44px;
        }

        .react-select-container .react-select__control:hover {
          border-color: #14b8a6;
        }

        .react-select-container .react-select__control--is-focused {
          border-color: #14b8a6;
          box-shadow: 0 0 0 1px #14b8a6;
        }

        .react-select-container .react-select__option--is-selected {
          background-color: #14b8a6;
        }

        .react-select-container .react-select__option:hover {
          background-color: #99f6e4;
        }

        /* Date picker additional styles */
        .tailwind-datepicker input {
          z-index: 40;
        }

        .tailwind-datepicker-container {
          margin-bottom: 1rem;
        }

        /* Editor container styles */
        .p-editor-container .p-editor-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }

        .p-editor-container .p-editor-content {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }

        /* Custom Modal Styles */
        .custom-modal .ant-modal-content {
          border-radius: 1rem;
          padding: 0;
        }

        .custom-modal .ant-modal-header {
          border-radius: 1rem 1rem 0 0;
          padding: 1.5rem;
          background: white;
          border-bottom: none;
        }

        .custom-modal .ant-modal-body {
          padding: 0 1.5rem;
        }

        .custom-modal .ant-modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          border-radius: 0 0 1rem 1rem;
        }

        .custom-modal .ant-btn {
          border-radius: 0.5rem;
          height: 2.5rem;
          padding: 0 1.25rem;
          font-weight: 500;
        }

        .custom-modal .ant-btn-primary {
          background-color: #14b8a6;
          border-color: #14b8a6;
        }

        .custom-modal .ant-btn-primary:hover {
          background-color: #0d9488;
          border-color: #0d9488;
        }

        .custom-modal .ant-btn-default {
          border-color: #e5e7eb;
          color: #6b7280;
        }

        .custom-modal .ant-btn-default:hover {
          color: #374151;
          border-color: #9ca3af;
        }

        /* Custom Message Styles */
        .custom-message {
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .custom-message.success {
          background-color: #d1fae5;
          border: 1px solid #059669;
        }

        .custom-message.error {
          background-color: #fee2e2;
          border: 1px solid #dc2626;
        }

        .custom-message .ant-message-notice-content {
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
        }

        /* Message icons */
        .ant-message-success .anticon {
          color: #059669;
        }

        .ant-message-error .anticon {
          color: #dc2626;
        }

        /* Z-index fixes */
        .ant-message {
          z-index: 1002 !important;
        }

        .ant-modal-wrap {
          z-index: 1001 !important;
        }

        .ant-modal-mask {
          z-index: 1000 !important;
        }

        /* Milestone section specific styles */
        .milestone-card {
          position: relative;
          transition: all 0.3s ease;
        }

        .milestone-card:hover {
          transform: translateY(-2px);
        }

        /* Additional teal theme styles */
        .text-teal-gradient {
          background: linear-gradient(45deg, #14b8a6, #0d9488);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .milestone-progress {
          background: linear-gradient(90deg, #14b8a6 0%, #0d9488 100%);
        }

        /* Enhanced focus states */
        .focus-teal:focus {
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
        }

        /* Improved input styles */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }

        /* Add this CSS to the style section */
        .highlight-milestone {
          animation: highlight 2s ease-in-out;
          box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.5);
        }

        @keyframes highlight {
          0% { background-color: rgba(204, 251, 241, 0.5); }
          50% { background-color: rgba(204, 251, 241, 1); }
          100% { background-color: rgba(204, 251, 241, 0); }
        }

        /* Modern Gradient Backgrounds */
        .section-gradient {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .header-gradient {
          background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
        }

        /* Enhanced Card Styles */
        .form-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .form-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        /* Input Styling */
        .modern-input {
          transition: all 0.2s ease;
          border-width: 2px;
        }

        .modern-input:focus {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
          transform: translateY(-1px);
        }

        /* Section Headers */
        .section-header {
          position: relative;
          padding-left: 1rem;
        }

        .section-header::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 24px;
          background: linear-gradient(to bottom, #0d9488, #14b8a6);
          border-radius: 2px;
        }

        /* Progress Steps */
        .progress-step {
          position: relative;
        }

        .progress-step::after {
          content: '';
          position: absolute;
          top: 50%;
          right: -50%;
          width: 100%;
          height: 2px;
          background: #e2e8f0;
          z-index: 0;
        }

        .progress-step.active::after {
          background: #0d9488;
        }

        .progress-step:last-child::after {
          display: none;
        }

        /* Animated Submit Button */
        .submit-button {
          background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
          transition: all 0.3s ease;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
        }

        /* Milestone Cards */
        .milestone-card {
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .milestone-card:hover {
          border-color: #0d9488;
          transform: translateY(-2px);
        }

        /* Enhanced Select Styles */
        .react-select__control {
          border-width: 2px !important;
          transition: all 0.2s ease !important;
        }

        .react-select__control:hover {
          border-color: #0d9488 !important;
        }

        /* Tooltip Enhancements */
        .custom-tooltip {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        /* Date Picker Styling */
        .tailwind-datepicker input {
          border-width: 2px;
          transition: all 0.2s ease;
        }

        .tailwind-datepicker input:focus {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        /* Editor Enhancements */
        .p-editor-container {
          border-radius: 0.75rem;
          overflow: hidden;
          border: 2px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .p-editor-container:focus-within {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        /* Animated Add Buttons */
        .add-button {
          background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
          transition: all 0.3s ease;
        }

        .add-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
        }

        /* Section Transitions */
        .section-enter {
          opacity: 0;
          transform: translateY(20px);
        }

        .section-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 300ms, transform 300ms;
        }

        /* Professional Shadows */
        .professional-shadow {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .professional-shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        /* Elegant Borders */
        .elegant-border {
          border: 2px solid #e2e8f0;
          transition: border-color 0.2s ease;
        }

        .elegant-border:hover {
          border-color: #0d9488;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        ::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>

      {/* Customized Modal */}
      <Modal
        title={
          <div className="text-lg font-semibold text-gray-900 pb-3 border-b">
            Project Posted Successfully
          </div>
        }
        open={showSuccessModal}
        onOk={handleModalConfirm}
        onCancel={handleModalConfirm}
        okText="Okay"
        className="custom-modal"
        centered
        maskClosable={false}
        closeIcon={
          <span className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        }
      >
        <div className="py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700">
                Your project has been posted successfully! You can view and manage it from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add this to your JSX */}
      <Modal
        title={
          <div className="text-lg font-semibold text-gray-900 pb-3 border-b">
            Payment Conflict Warning
          </div>
        }
        open={showPaymentWarningModal}
        onOk={() => setShowPaymentWarningModal(false)}
        onCancel={() => setShowPaymentWarningModal(false)}
        okText="Understood"
        cancelText="Close"
        className="custom-modal"
        centered
        maskClosable={false}
      >
        <div className="py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700">
                {isCollaborative
                  ? "You cannot have payment milestones in both project and tasks. This would result in double payments. Please choose one level for payment milestones."
                  : "You cannot have payment milestones in both project and tasks. Please choose one level for payment milestones."}
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add this modal JSX before the closing </div> tag */}
      <Modal
        title={
          <div className="text-lg font-semibold text-gray-900 pb-3 border-b">
            Milestone Conflict Detected
          </div>
        }
        open={showHybridConflictModal}
        onOk={handleConvertConflicts}
        onCancel={() => setShowHybridConflictModal(false)}
        okText="Resolve and Submit"
        cancelText="Cancel"
        className="custom-modal"
        centered
        maskClosable={false}
      >
        <div className="py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-3">
              <p className="text-gray-700">
                We found {conflictingMilestones.length} project milestone(s) with hybrid type while tasks 
                also contain hybrid milestones. These project milestones will be converted to progress-only:
              </p>
              
              <ul className="list-disc pl-5 text-gray-600">
                {conflictingMilestones.map((milestone, idx) => (
                  <li key={idx}>{milestone.title}</li>
                ))}
              </ul>

              <div className="flex items-center mt-4">
                <button
                  onClick={() => {
                    const firstConflict = conflictingMilestones[0];
                    const element = document.getElementById(`milestone-${firstConflict.index}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      element.classList.add('highlight-milestone');
                      setTimeout(() => {
                        element.classList.remove('highlight-milestone');
                      }, 2000);
                    }
                  }}
                  className="text-teal-600 hover:text-teal-700 flex items-center"
                >
                  <span>Take Me There</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Low Funds Warning Modal */}
      <Modal
        title={
          <div className="text-lg font-semibold text-gray-900 pb-3 border-b">
            Insufficient Wallet Balance
          </div>
        }
        open={showLowFundsModal}
        onOk={() => {
          setProceedAsDraft(true);
          setShowLowFundsModal(false);
          // Automatically submit the form again
          formSubmit({ preventDefault: () => {} });
        }}
        onCancel={() => {
          setShowLowFundsModal(false);
          setProceedAsDraft(false);
        }}
        okText="Save as Draft"
        cancelText="Edit Project"
        className="custom-modal"
        centered
        maskClosable={false}
      >
        <div className="py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-3">
              <p className="text-gray-700">
                Your wallet balance (₹{walletBalance}) {
                  walletHoldBalance > 0 ? `(₹${walletHoldBalance} is on hold) which will be deducted from your balance making it ₹${walletBalance - walletHoldBalance})` : ''
                } is insufficient for the automated payments (₹{totalRequiredAmount}) in this project.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">You have two options:</h4>
                <ul className="list-disc pl-5 text-gray-600 space-y-2">
                  <li>
                    <span className="font-medium">Save as Draft:</span> The project will be saved in draft status until you add sufficient funds to your wallet.
                  </li>
                  <li>
                    <span className="font-medium">Edit Project:</span> Modify or remove automated payments to match your current wallet balance.
                  </li>
                </ul>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Current automated payments include:
                <ul className="list-disc pl-5 mt-2">
                  {formValues.milestones.some(m => m.is_automated && ['payment', 'hybrid'].includes(m.milestone_type)) && (
                    <li>Project milestone payments</li>
                  )}
                  {formValues.tasks.some(t => t.automated_payment !== false || 
                    t.milestones.some(m => m.is_automated && ['payment', 'hybrid'].includes(m.milestone_type))) && (
                    <li>Task payments and milestone payments</li>
                  )}
                </ul>
              </div>
            </div>
            
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectPost;
