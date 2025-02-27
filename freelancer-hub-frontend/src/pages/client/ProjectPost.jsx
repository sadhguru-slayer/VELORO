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
import { message } from 'antd';
import Cookies from 'js-cookie';

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

const ProjectPost = ({userId, role,MAX_TASKS=3}) => {
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
    console.log("Validation failed. Please fix the errors.");
    return; // Prevent form submission
  }
  
    try {
      // Make the POST request
      const response = await axios.post(
        "http://127.0.0.1:8000/api/post_project/",
        formValues,
        {
          headers: getAuthHeaders(),
        }
      );
      if (response.status >= 200 && response.status < 300) {
        message.success("Project Posted")
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
        window.location.reload();
      }

    } catch (error) {
      // Handle errors (e.g., network issues, bad responses)
      console.error("Error submitting form:", error);
    }
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
  
    <div
      className="flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-16 md:ml-16 lg:ml-22 bg-gray-100"
    >
      {/* Header */}
      <CHeader />
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-200 p-6">
        {/* Content Section */}
        {loading ? (
          <IndividualLoadingComponent />
        ) : (
          <>
            <div className="create_project_section w-full h-auto bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-center items-center w-full py-4 rounded-lg bg-white">
                {!postProject ? (
                  <div
                    className="flex flex-col items-center cursor-pointer "
                    onClick={handleAddProjectClick}
                  >
                    <IoMdAdd className="text-gray-500 text-9xl" />
                    <p className="text-gray-700 text-lg font-medium mt-2">
                      Post a project? Click here
                    </p>
                  </div>
                ) : (
                  <form
                    className="w-[80%] mx-auto"
                    onSubmit={formSubmit}
                  >
                    <h2 className="text-xl text-gray-900 font-bold my-5">
                      Project Details
                    </h2>
                    {/* Project Title */}
                    <div className="relative z-0 w-full mb-5 group">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                        value={formValues.title}
                        onChange={formOnchange}
                        required
                      />
                      <label
                        htmlFor="title"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600"
                      >
                        Project Title
                      </label>
                    </div>
  
                    {/* Project Description */}
                    <div className="relative z-0 w-full mb-5 group">
                      <Editor
                        placeholder="Project Description"
                        onTextChange={(e) =>
                          setFormValues({
                            ...formValues,
                            description: e.htmlValue,
                          })
                        }
                        style={{ height: "15rem" }}
                      />
                    </div>
  
                    {/* Project Budget */}
                    <div className="relative z-0 w-full mb-5 group">
                      <input
                        type="number"
                        name="budget"
                        id="budget"
                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                        value={formValues.budget}
                        onChange={formOnchange}
                        required
                      />
                      <label
                        htmlFor="budget"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600"
                      >
                        Project Budget
                      </label>
                    </div>
  
                    {/* Deadline Date Picker */}
                    <div className="cursor-pointer relative z-1 w-full mb-5 mt-2 group md:gap-6">
                      <Datepicker
                        options={dateOptions}
                        selected={new Date(formValues.deadline)}
                        onChange={handleDeadlineChange}
                        show={show}
                        setShow={handleClose}
                      />
                    </div>
  
                    {/* Domain Selection */}
                    <div className="relative z-0 w-full mb-5 flex flex-col gap-3 group">
                      <Select
                        name="domain"
                        options={domain}
                        onChange={domainChange}
                        value={selectedDomain}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Select a Domain"
                      />
                    </div>
  
                    {/* Collaborative Checkbox */}
                    <div className="relative z-0 w-full mb-5 flex flex-col gap-3 group">
                      <div className="flex items-center gap-5">
                        <label htmlFor="is_collaborative" className="text-gray-500">
                          Collaborative
                        </label>
                        <Checkbox
                          name="is_collaborative"
                          id="is_collaborative"
                          value={isCollaborative}
                          {...label}
                          color="#009688"
                          onChange={() => {
                            const newValue = !isCollaborative;
                            setIsCollaborative(newValue);
                            formOnchange({
                              target: {
                                name: "is_collaborative",
                                value: newValue,
                              },
                            });
                          }}
                        />
                      </div>
                    </div>
  
                    {/* Task Management */}
                    {!isCollaborative ? (
                      <div className="relative z-auto w-full mb-5 flex flex-col gap-3 group">
                        <div className="relative z-auto w-full mb-5 group">
                          <Select
                            isMulti
                            required={false}
                            name="skills_required"
                            options={filteredOptions}
                            value={formValues.skills_required}
                            onChange={handleSkillChange}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select Skills"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="tasks_section flex flex-col gap-3">
                        <h2 className="text-lg font-bold">
                          Divide Tasks Based on {capitalize(selectedDomain)}
                        </h2>
                        {formValues.tasks.map((task, index) => (
                          <div key={index} className="task-card border p-4 rounded-md shadow-sm mb-5">
                            <h2 className="text-md font-bold pl-4">Task {index + 1}</h2>
                            <div className="flex flex-col gap-4">
                              {/* Task Name */}
                              <input
                                type="text"
                                name={`task_${index + 1}_name`}
                                className="block py-2.5 px-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none"
                                placeholder="Task name"
                                value={task.title}
                                onChange={(e) =>
                                  handleTaskChange(index, "title", e.target.value)
                                }
                                required
                              />
                              
                              {/* Task Description */}
                              <Editor
                                placeholder="Task Description"
                                value={task.description}
                                onTextChange={(e) =>
                                  handleTaskChange(index, "description", e.htmlValue)
                                }
                                style={{ height: "12rem" }}
                              />
                        
                              {/* Task Skills */}
                              <Select
                                isMulti
                                name={`task_${index + 1}_skills`}
                                options={filteredOptions}
                                value={task.skills_required_for_task}
                                onChange={(e) =>
                                  handleTaskChange(index, "skills_required_for_task", e)
                                }
                                className="basic-multi-select"
                                classNamePrefix="skills_required_for_task"
                                placeholder={`Select Skills for Task ${index + 1}`}
                              />
                        
                              {/* Task Deadline */}
                              <Datepicker
                                options={dateOptions}
                                selected={new Date(task.deadline)} 
                                onChange={(date) => handleTasksDeadlineChange(date, index)}
                                show={taskShow[index]}
                                setShow={(show) => {
                                  show ? handleShowDatePicker(index) : handleHideDatePicker(index);
                                }}
                                dateFormat="yyyy-MM-dd"
                              />
                              {/* Show task deadline error */}
                              {taskDateErrors[index] && (
                                <div className="error-message text-red-500">{taskDateErrors[index]}</div>
                              )}
                        
                              {/* Task Budget */}
                              <input
                                type="number"
                                name={`task_${index + 1}_budget`}
                                className="block p-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none"
                                placeholder="Task Budget"
                                value={task.budget}
                                onChange={(e) =>
                                  handleTaskChange(index, "budget", e.target.value)
                                }
                                required
                              />
                              {/* Show task budget error */}
                              {taskBudgetErrors[index] && (
                                <div className="error-message text-red-500">
                                  {taskBudgetErrors[index]}
                                </div>
                              )}
                              
                        
                              {/* Delete Task Button */}
                              <button
                                onClick={() => handleDeleteTask(index)}
                                className="text-red-500 mt-2"
                              >
                                Delete Task
                              </button>
                            </div>
                          </div>
                        ))}              
                        {/* Add Task Button */}
                        {formValues.tasks.length < MAX_TASKS && (
                          <div className="border rounded-md w-full py-3 flex justify-center items-center flex-col">
                            <button
                              onClick={handleAddTask}
                              className="border p-4 py-2 rounded-md text-md bg-teal-400 text-white"
                            >
                              Add Task
                            </button>
                          </div>
                        )}                        
                      </div>
                    )}
  
                    {/* Submit Button */}
                    <div className="mt-4 flex justify-center">
                    {!errorsResolved ? (
                      <button onClick={()=>message.error("There are few errors please resolve")}
                      className="bg-teal-500 text-white py-2 px-6 rounded-md hover:bg-teal-400"
                      
                      >Submit Project</button>
                    ):(
                      <button
                        type="submit"
                        className="bg-teal-500 text-white py-2 px-6 rounded-md hover:bg-teal-400"
                      >
                        Submit Project
                      </button>
                    )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
  
  );
};

export default ProjectPost;
