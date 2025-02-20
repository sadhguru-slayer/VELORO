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

const ProjectPost = () => {
  const [show, setShow] = useState(false);
 
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]); // State for selected options
  const [loading, setLoading] = useState(false);
  const [postProject, setPostProject] = useState(false);
  const [domain, setDomain] = useState([]);
  const [skills, setSkills] = useState([]);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "", // Adding description for project
    budget: 0, // Budget for the entire project
    deadline: "", // Deadline for the project
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
    setFormValues({
      ...formValues,
      tasks: [
        ...formValues.tasks,
        { title: "", description: "", budget: 0, skills_required_for_task: [],deadline:"" },
      ],
    });
  };
  const [taskShow, setTaskShow] = useState(
    formValues.tasks.reduce((acc, _, index) => {
      acc[index] = false; // Set initial state for each task
      return acc;
    }, {})
  );

  const handleTasksDeadlineChange = (date,taskIndex) => {
    // Check if the passed date is valid
    if (!(date instanceof Date) || isNaN(date)) {
      console.error("Invalid date value:", date);
      return;
    }
    const formattedDate = formatDate(date);
  
    handleTaskChange(taskIndex, "deadline", formattedDate);
  };

  const handleTaskChange = (taskIndex, name, value) => {
    const updatedTasks = [...formValues.tasks];

    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      [name]: value, // Dynamically set the value based on name (e.g., task name, task description, etc.)
    };

    setFormValues({
      ...formValues,
      tasks: updatedTasks,
    });
  };

  const formOnchange = (e) => {
    if (!e.target) {
      console.error("Event target is undefined");
      return;
    }

    const { name, value } = e.target;

    // Check if name and value exist to prevent further issues
    if (name !== undefined && value !== undefined) {
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    } else {
      console.error("Form field missing name or value");
    }
  };

  const getAuthHeaders = () => {
    const accessToken = Cookies.get("accessToken");
    return {
      Authorization: `Bearer ${accessToken}`, // Return the header object directly
    };
  };

  const formSubmit = async (e) => {
    e.preventDefault();
  
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
          deadline: '',
          domain: '',
          is_collaborative: false,
          skills_required: [],
        });
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

  return (
    <div className="flex h-screen bg-gray-100">
      <CSider
        dropdown={true}
        collapsed={true}
        handleMenuClick={handleMenuClick}
        handleProfileMenu={handleProfileMenu}
      />

      <div
        className=" bg-gray-100 flex-1 flex flex-col overflow-x-hidden 
  ml-14 sm:ml-16 md:ml-16 lg:ml-22"
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
              <div className="create_rpoject_section w-full h-auto">
                <div className="flex justify-center items-center w-full h-full py-4 rounded-lg bg-white">
                  {!postProject ? (
                    <div
                      className="flex flex-col items-center cursor-pointer "
                      onClick={handleAddProjectClick}
                    >
                      <IoMdAdd className="text-gray-500 text-9xl" />
                      <p>Post a project?Click here</p>
                    </div>
                  ) : (
                    <form
                      className="w-[80%] h-full mx-auto"
                      onSubmit={formSubmit}
                    >
                      <h2 className="text-xl text-gray-900 font-bold my-5">
                        Project Details
                      </h2>
                      <div className="relative z-0 w-full mb-5 group">
                        <input
                          type="text"
                          name="title"
                          id="title"
                          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                          placeholder=" "
                          value={formValues.title}
                          onChange={formOnchange}
                          required
                        />
                        <label
                          htmlFor="title"
                          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          Project Title
                        </label>
                      </div>
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
                      <div className="relative z-0 w-full mb-5 group">
                        <input
                          type="number"
                          name="budget"
                          id="budget"
                          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                          placeholder=" "
                          value={formValues.budget}
                          onChange={formOnchange}
                          required
                        />
                        <label
                          htmlFor="budget"
                          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          Project Budget
                        </label>
                      </div>
                      <div className="cursor-pointer relative z-1 w-full mb-5 mt-2 group md:gap-6">
                        <Datepicker
                          options={dateOptions}
                          selected={new Date(formValues.deadline)}
                          onChange={handleDeadlineChange}
                          show={show}
                          setShow={handleClose}
                        />
                      </div>

                      <div className="relative z-auto w-full mb-5 flex flex-col gap-3 group">
                        <Select
                          name="domain"
                          options={domain} // Use the domain options fetched and formatted
                          onChange={domainChange} // Handle domain change
                          value={selectedDomain} // Set the selected domain
                          className="basic-multi-select"
                          classNamePrefix="select"
                          placeholder="Select a Domain"
                        />
                      </div>
                      <div className="relative z-0 w-full mb-5 flex flex-col gap-3 group">
                        <div className="flex items-center gap-5 group">
                          <label
                            htmlFor="is_collaborative"
                            className="text-gray-500"
                          >
                            Collaborative
                          </label>
                          <Checkbox
                            name="is_collaborative"
                            id="is_collaborative"
                            value={isCollaborative}
                            {...label}
                            color="#009688"
                            onChange={() => {
                              const newValue = !isCollaborative; // Toggle the value of isCollaborative
                              setIsCollaborative(newValue); // Update the state
                              formOnchange({
                                target: {
                                  name: "is_collaborative",
                                  value: newValue,
                                }, // Correctly set the value
                              });
                            }}
                          />
                        </div>
                      </div>

                      {!isCollaborative ? (
                        <div className="relative z-auto w-full mb-5 flex flex-col gap-3 group">
                          <div className="relative z-auto w-full mb-5 group">
                            <Select
                              isMulti
                              required={false}
                              name="skills_required"
                              options={filteredOptions} // Pass the filtered options
                              value={formValues.skills_required} // Set the selected skills
                              onChange={handleSkillChange} // Handle skill selection change
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
                            <div
                              key={index}
                              className="tasks_cards w-full h-full p-4 border rounded-md"
                            >
                              <h2 className="text-md font-bold pl-lg">
                                Task {index + 1}
                              </h2>
                              <div className="card_content border p-4 flex flex-col gap-3 rounded-md">
                                <input
                                  type="text"
                                  name={`task_${index + 1}_name`}
                                  className="block py-2.5 px-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none"
                                  placeholder="Task name"
                                  value={task.title}
                                  onChange={(e) =>
                                    handleTaskChange(
                                      index,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  required
                                />

                                <Editor
                                  placeholder="Task Description"
                                  value={task.description}
                                  onTextChange={(e) =>
                                    handleTaskChange(
                                      index,
                                      "description",
                                      e.htmlValue
                                    )
                                  }
                                  style={{ height: "12rem" }}
                                />

                                <Select
                                  isMulti
                                  name={`task_${index + 1}_skills`}
                                  options={filteredOptions}
                                  className="basic-multi-select"
                                  classNamePrefix="skills_required_for_task"
                                  value={task.skills_required_for_task}
                                  onChange={(e) =>
                                    handleTaskChange(index, "skills_required_for_task", e)
                                  }
                                  placeholder={`Select Skills for Task ${
                                    index + 1
                                  }`}
                                />

                                <Datepicker
                                options={dateOptions}
                                selected={new Date(formValues.tasks[index].deadline)}
                                onChange={(date) => {
                                  handleTasksDeadlineChange(date, index);
                                }}
                                show={taskShow[index]}  // Show or hide based on the task's specific state
                                setShow={(show) => {
                                  if (show) {
                                    handleShowDatePicker(index);  // Show the date picker for the specific task
                                  } else {
                                    handleHideDatePicker(index);  // Hide the date picker for the specific task
                                  }
                                }}
                                dateFormat="yyyy-MM-dd"
                              />

                                <input
                                  type="number"
                                  name={`task_${index + 1}_budget`}
                                  className="block p-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none"
                                  placeholder="Task Budget"
                                  value={task.budget}
                                  onChange={(e) =>
                                    handleTaskChange(
                                      index,
                                      "budget",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                            </div>
                          ))}
                          <div className="border rounded-md add_tasks_cards w-full py-3 flex justify-center items-center flex-col">
                            <button
                              onClick={handleAddTask}
                              className="border p-4 py-2 rounded-md text-md bg-teal-400 text-white"
                            >
                              Add Task
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="mt-4">
                        <button
                          type="submit"
                          className="bg-teal-500 text-white py-2 px-4 rounded-md"
                        >
                          Submit Project
                        </button>
                      </div>
                    </form>
                  )}
                  <div className="">
                  
                  </div>
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
