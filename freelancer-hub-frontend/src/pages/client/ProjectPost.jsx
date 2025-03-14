import React, { useEffect, useState } from "react";
import CSider from "../../components/client/CSider";
import { useLocation, useNavigate, Link } from "react-router-dom";
import CHeader from "../../components/client/CHeader";
import IndividualLoadingComponent from "../../components/IndividualLoadingComponent";
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

  const [formValues, setFormValues] = useState({
    title: "",
    description: "", // Adding description for project
    budget: 0, // Budget for the entire project
    deadline: "2025-02-24", // Deadline for the project
    domain: "", // The category/domain of the project
    is_collaborative: false, // To handle collaborative projects
    skills_required: [], // Array of skill IDs required for the project
    tasks: [], // Array to hold task details if the project is collaborative
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

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== "/client/profile") {
      navigate("/client/profile", { state: { profileComponent } });
    }
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
        { title: "", description: "", budget: 0, skills_required_for_task: [],deadline:"" },
      ],
    });
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
        console.log(Number(totalTaskBudget,Number(formValues.budget)))
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

  const formSubmit = async (e) => {
    e.preventDefault();

    const isBudgetValid = validateTaskBudget();
    const areDeadlinesValid = validateTaskDeadlines();

    if (!isBudgetValid || !areDeadlinesValid) {
      message.error({
        content: "Please fix the validation errors before submitting.",
        className: 'custom-message error',
      });
      return;
    }
  
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/post_project/",
        formValues,
        {
          headers: getAuthHeaders(),
        }
      );
      
      if (response.status >= 200 && response.status < 300) {
        setShowSuccessModal(true);
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
    setFormValues({
      tasks: [],
      title: '',
      description: '',
      budget: 0,
      deadline: new Date(),
      domain: '',
      is_collaborative: false,
      skills_required: [],
    });
    navigate('/client/dashboard');
  };

  const handleSkillChange = (selectedSkills) => {
    // Extract the skill IDs from the selected skills (assuming each skill has an `id` property)
    setFormValues((prevValues) => ({
      ...prevValues,
      skills_required: selectedSkills, // Update the `skills_required` array with skill IDs
    }));
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
  

  return (
    <div className="flex h-screen bg-gray-100">
      <CSider
        userId={userId}
        role={role}
        dropdown={true}
        collapsed={true}
        handleMenuClick={handleMenuClick}
        handleProfileMenu={handleProfileMenu}
      />
  
      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${isMobile ? 'ml-0 pb-16' : 'ml-14 sm:ml-14 md:ml-14 lg:ml-16'}
      `}>
        <CHeader />
        
        <div className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
          {loading ? (
            <IndividualLoadingComponent />
          ) : (
            <div className="max-w-5xl mx-auto">
              {!postProject ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm p-8 cursor-pointer hover:shadow-md transition-all duration-300"
                  onClick={handleAddProjectClick}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
                      <IoMdAdd className="text-teal-500 text-4xl" />
                    </div>
                    <p className="text-gray-700 text-lg font-medium">
                      Create a New Project
                    </p>
                    <p className="text-gray-500 text-sm text-center max-w-md">
                      Start by creating a project and find the perfect freelancer for your needs
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm p-8"
                >
                  <form onSubmit={formSubmit} className="space-y-8">
                    {/* Project Header */}
                    <div className="border-b border-gray-200 pb-6">
                      <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                      <p className="mt-1 text-sm text-gray-500">
                        Fill in the details below to post your project and find the perfect freelancer.
                      </p>
                    </div>

                    {/* Basic Project Details */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formValues.title}
                          onChange={formOnchange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter a clear title for your project"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Description
                        </label>
                        <div className="rounded-lg border border-gray-300 overflow-hidden">
                          <Editor
                            value={formValues.description}
                            onTextChange={(e) =>
                              setFormValues({
                                ...formValues,
                                description: e.htmlValue,
                              })
                            }
                            style={{ height: "200px" }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Budget (₹)
                          </label>
                          <input
                            type="number"
                            name="budget"
                            value={formValues.budget}
                            onChange={formOnchange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter project budget"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Deadline
                          </label>
                          <div className="relative">
                            <Datepicker
                              options={{
                                ...dateOptions,
                                theme: {
                                  ...dateOptions.theme,
                                  input: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200",
                                },
                              }}
                              selected={new Date(formValues.deadline)}
                              onChange={handleDeadlineChange}
                              show={show}
                              setShow={handleClose}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Domain
                        </label>
                        <Select
                          options={domain}
                          value={selectedDomain}
                          onChange={domainChange}
                          placeholder="Select project domain"
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: '44px',
                              borderRadius: '0.5rem',
                              borderColor: '#e5e7eb',
                              '&:hover': {
                                borderColor: '#14b8a6',
                              },
                            }),
                          }}
                        />
                      </div>

                      {/* Collaborative Toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Collaborative Project</h3>
                          <p className="text-sm text-gray-500">Enable this for multi-task projects</p>
                        </div>
                        <Switch
                          checked={isCollaborative}
                          onChange={(checked) => {
                            setIsCollaborative(checked);
                            formOnchange({
                              target: {
                                name: "is_collaborative",
                                value: checked,
                              },
                            });
                          }}
                          className={`${
                            isCollaborative ? 'bg-teal-500' : 'bg-gray-200'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
                        >
                          <span
                            className={`${
                              isCollaborative ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                      </div>
                    </div>

                    {/* Skills or Tasks Section */}
                    {!isCollaborative ? (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Required Skills
                        </label>
                        <Select
                          isMulti
                          options={filteredOptions}
                          value={formValues.skills_required}
                          onChange={handleSkillChange}
                          placeholder="Select required skills"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Project Tasks ({formValues.tasks.length}/{MAX_TASKS})
                          </h3>
                          {formValues.tasks.length < MAX_TASKS && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={handleAddTask}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                              <IoMdAdd className="-ml-1 mr-2 h-5 w-5" />
                              Add Task
                            </motion.button>
                          )}
                        </div>

                        <div className="space-y-4">
                          {formValues.tasks.map((task, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="task-card bg-white rounded-lg border border-gray-200 overflow-visible"
                            >
                              <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-lg font-medium text-gray-900">
                                    Task {index + 1}
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTask(index)}
                                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>

                                <input
                                  type="text"
                                  value={task.title}
                                  onChange={(e) => handleTaskChange(index, "title", e.target.value)}
                                  placeholder="Task Title"
                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                  required
                                />

                                <div className="rounded-lg border border-gray-300 overflow-hidden">
                                  <Editor
                                    value={task.description}
                                    onTextChange={(e) =>
                                      handleTaskChange(index, "description", e.htmlValue)
                                    }
                                    style={{ height: "150px" }}
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Task Budget
                                    </label>
                                    <input
                                      type="number"
                                      value={task.budget}
                                      onChange={(e) =>
                                        handleTaskChange(index, "budget", e.target.value)
                                      }
                                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                      required
                                    />
                                    {taskBudgetErrors[index] && (
                                      <p className="mt-1 text-sm text-red-500">
                                        {taskBudgetErrors[index]}
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Task Deadline
                                    </label>
                                    <Datepicker
                                      options={dateOptions}
                                      selected={task.deadline ? new Date(task.deadline) : null}
                                      onChange={(date) => handleTasksDeadlineChange(date, index)}
                                      show={taskShow[index]}
                                      setShow={(show) => {
                                        show
                                          ? handleShowDatePicker(index)
                                          : handleHideDatePicker(index);
                                      }}
                                    />
                                    {taskDateErrors[index] && (
                                      <p className="mt-1 text-sm text-red-500">
                                        {taskDateErrors[index]}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <Select
                                  isMulti
                                  options={filteredOptions}
                                  value={task.skills_required_for_task}
                                  onChange={(e) =>
                                    handleTaskChange(index, "skills_required_for_task", e)
                                  }
                                  placeholder="Select required skills for this task"
                                  className="react-select-container z-50"
                                  classNamePrefix="react-select"
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6 border-t border-gray-200">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={!errorsResolved}
                        className={`px-6 py-3 rounded-lg text-white font-medium ${
                          errorsResolved
                            ? 'bg-teal-500 hover:bg-teal-600'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Post Project
                      </motion.button>
                    </div>
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
        okText="Go to Dashboard"
        cancelText="Close"
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
    </div>
  );
};

export default ProjectPost;
