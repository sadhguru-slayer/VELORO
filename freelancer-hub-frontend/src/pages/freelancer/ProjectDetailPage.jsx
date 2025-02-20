import React, { useState, useEffect } from "react";
import FHeader from "../../components/freelancer/FHeader";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FSider from "../../components/freelancer/FSider";
import { Progress,Card,Row,Col,Modal, Button, Input, notification } from "antd";
import { capitalize } from "@mui/material";
import { Upload } from "antd";
import { CheckCircleOutlined, ExclamationCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { GrRevert } from "react-icons/gr";

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const [taskStatus,setTaskStatus]=useState("");
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null); // Project data state
  const [isModalVisible, setIsModalVisible] = useState(false); // To show the modal for comments
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const handleMenuClick = (component) => {
    if (location.pathname !== "/freelancer/dashboard") {
      navigate("/freelancer/dashboard", { state: { component } });
    }
  };

  const yourTasks= [
    { name: 'Initial Design', status: 'pending', dueDate: '2024-12-15' },
    
  ]
  const tasks= [
    { name: 'Design Wireframe', status: 'Completed', dueDate: '2024-12-10', priority: 'High' },
    { name: 'Build Frontend', status: 'In Progress', dueDate: '2024-12-18', priority: 'Medium' },
    { name: 'Backend API Integration', status: 'Pending', dueDate: '2024-12-22', priority: 'Low' },
  ];
  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        // Simulating project data (replace with real API call)
        const projectData = {
          title: "Website Redesign",
          client: "ABC Corp",
          deadline: "2024-12-31",
          status: "Ongoing",
          budget: "5000",
          description:
            "A complete redesign of the client website to improve UX/UI and performance.",
          milestones: [
            {
              name: "Initial Design",
              dueDate: "2024-12-15",
              status: "Completed",
            },
            {
              name: "Development Phase",
              dueDate: "2024-12-20",
              status: "In Progress",
            },
            { name: "Testing", dueDate: "2024-12-25", status: "Pending" },
          ],
          tasks: [
            {
              name: "Create Wireframes",
              assignedTo: "Freelancer A",
              deadline: "2024-12-10",
              status: "Completed",
            },
            {
              name: "Develop Frontend",
              assignedTo: "Freelancer B",
              deadline: "2024-12-18",
              status: "In Progress",
            },
          ],
          messages: [
            { sender: "Client", message: "Please focus on responsive design." },
            {
              sender: "Freelancer A",
              message: "I have completed the wireframes and shared them.",
            },
          ],
        };
        setProject(projectData);
      } catch (error) {
        console.error("Error fetching project details", error);
        notification.error({ message: "Error loading project details." });
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
      const newMessage = {
        sender: "Freelancer",
        message: value,
      };
      setProject((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, newMessage],
      }));
      handleCloseModal();
      notification.success({ message: "Comment added successfully!" });
    }
  };


  const [previousStatus, setPreviousStatus] = useState(""); // Keep track of the previous status
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false); // State to show/hide the modal
  const [newStatus, setNewStatus] = useState(""); // Store the new status that user selects
const [showRevert,setShowRevert]=useState(false);
  // Function to handle status change request
  const handleChange = (e) => {
    const selectedStatus = e.target.value;
    setNewStatus(selectedStatus);
    setIsStatusModalVisible(true); // Show the confirmation modal
  };

  // Function to handle confirmation
  const handleConfirm = (link,files) => {
    // Store the previous status before changing it
    console.log(link,files)
    setPreviousStatus(taskStatus);

    // Update the task status
    setTaskStatus(newStatus);
    // Hide the modal
    setIsStatusModalVisible(false);
  };

  // Function to handle cancellation
  const handleCancel = () => {
    // Close the modal without changing the status
    setIsStatusModalVisible(false);
  };

  // Function to revert back to the previous status
  const handleRevert = () => {
    setShowRevert(false);
    setTaskStatus(previousStatus); // Revert to previous status
  };

  const [link, setLink] = useState(""); // To store the link entered by the user
  const [files, setFiles] = useState([]); // To store the files uploaded by the user

  // Handle file change
  const handleFileChange = (info) => {
    setFiles(info.fileList); // Update the file list when files are selected
  };

  // Handle link input change
  const handleLinkChange = (e) => {
    setLink(e.target.value);
  };

  // Handle Confirm Button
  const handleConfirmChange = () => {
    if (!link && files.length === 0) {
      notification.error({
        message: "No Attachments",
        description: "Please add a link or upload at least one file.",
      });
      return;
    }

    // Pass the link and files to the handleConfirm function for further processing
    setShowRevert(true);
    handleConfirm(link, files);

    // Reset the states
    setLink("");
    setFiles([]);
  };

    if (loading) {
    return <div>Loading...</div>;
  }



  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <FSider collapsed={true} dropdown={true} handleMenuClick={handleMenuClick} />

      {/* Main Content Area */}
      <div className="bg-gray-100 flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-16 md:ml-16 lg:ml-24">
        {/* Header */}
        <FHeader />
        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-200 p-6">
          {/* Breadcrumb Navigation */}
          {/*<div className="flex items-center text-gray-500 mb-6">
            <Link to="/" className="hover:text-secondary">
              Home
            </Link>
            {pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
              return (
                <span key={index} className="mx-2">
                  &gt;
                  <Link to={routeTo} className="hover:text-secondary">
                    {" "}
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Link>
                </span>
              );
            })}
          </div>*/}

          {/* Project Overview */}
          <div className="bg-white p-4  mb-6 rounded-lg shadow-sm flex flex-col gap-5">

          <div className="project_content flex flex-col gap-2 py-3 px-6">
          <h2 className="text-2xl font-semibold">{project?.title}</h2>
            <span className='w-full flex font-semibold'>
            <span className='text-charcolBlue'>Budget:</span>
            <p className='text-violet-500'>&#8377;{project?.budget}</p>
            </span>
            <span className='w-full p-3 border rounded-lg'><span className='font-semibold'>Description:</span><p> {project?.description}</p></span>
            <span className='w-full flex '><span className='text-charcolBlue font-semibold'>Deadline:</span><p> {project?.deadline}</p></span>
            <span className='w-full flex '><span className='text-charcolBlue font-semibold'>Client:</span><p> {project?.client}</p></span>
            <span className='w-full flex '><span className='text-charcolBlue font-semibold'>Collaborative:</span><p> {project?.isCollaborative ? 'Yes' : 'No'}</p></span>
            <span className='w-full flex '><span className='text-charcolBlue font-semibold'>Status:</span><p > {project?.status}</p></span>
            </div>
          </div>
          {/* Milestone Tracker sm:w-[90%] md:w-[70%]  */}
      <Card className="w-full shadow-sm hover:shadow-md p-4 mb-6 border rounded-lg">
      <h2 className="text-xl font-semibold m-2">Task Tracker</h2>
      <div className="space-y-4">
      {yourTasks.map((task, index) => (
        <div key={index} className="flex justify-between items-center p-3 bg-white shadow-sm rounded-lg border flex-col sm:flex-row md:flex-row">
          <div className="flex flex-col">
            <span className="font-semibold text-md">{task.name}</span>
            <span className="text-gray-500 text-sm">Due Date: {task.dueDate}</span>
          </div>
          <div className="flex items-center gap-4">
          <select
            value={taskStatus} // Set the initial value to the task's current status
            onChange={handleChange} // Call the confirmation handler
            className={`p-2 rounded-lg outline-none transition duration-200 ease-in-out ${
              taskStatus === "pending" || taskStatus === "" ? "bg-red-300" : taskStatus === "in_progress" ? "bg-blue-300" : "bg-green-300"
            } w-full sm:w-auto`}
          >
            {taskStatus === "pending" || taskStatus === "" ? (
              <>
                <option value="pending" className="text-red-400 bg-red-200">
                  Pending
                </option>
                <option value="in_progress" className="text-blue-500 bg-blue-200">
                  In Progress
                </option>
                <option value="completed" className="text-green-500 bg-green-200">
                  Completed
                </option>
              </>
            ) : taskStatus === "in_progress" ? (
              <>
                <option value="in_progress" className="text-blue-500 bg-blue-300">
                  In Progress
                </option>
                <option value="completed" className="text-green-500 bg-green-200">
                  Completed
                </option>
              </>
            ) : (
              <option value="completed" className="text-green-500">
                Completed
              </option>
            )}
          </select>
        
          {showRevert && (
            <GrRevert
              onClick={handleRevert}
              className="p-2 bg-gray-300 text-4xl font-bold w-full sm:w-auto text-black rounded-lg hover:bg-gray-400 transition duration-200"
            />
          )}
        </div>
        
      

      {/* Confirmation Modal */}
      <Modal
      title="Confirm Status Change"
      open={isStatusModalVisible}
      onOk={handleConfirmChange} // Handle confirm (change status)
      onCancel={handleCancel} // Handle cancel (don't change status)
      okText="Yes"
      cancelText="No"
      width={500}
    >
      <p className="text-md">
        Are you sure you want to change the status to "{newStatus.replace(/_/g, " ").toUpperCase()}"?
      </p>
      <p className="text-xs">You can send a link and file attachments to let your client know.</p>

      {/* Input for the link */}
      <div className="mb-4">
        <Input
          type="url"
          value={link}
          onChange={handleLinkChange}
          placeholder="Enter a link (optional)"
          className="w-full"
        />
      </div>

      {/* Upload Component for Files */}
      <div className="mb-4">
        <Upload
          multiple
          onChange={handleFileChange}
          fileList={files}
          beforeUpload={() => false} // Prevent auto upload, you can implement custom upload logic
          showUploadList={{ showRemoveIcon: true }}
        >
          <Button icon={<UploadOutlined />}>+ Add File</Button>
        </Upload>
      </div>

      {/* List of Files Added */}
      {files.length > 0 && (
        <div className="mb-4">
          <h4>Uploaded Files:</h4>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                <span>{file.name}</span> - {file.size / 1024 > 1024 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
        </div>
      ))}
      </div>
    </Card>

    {/* Task Breakdown */}
    <Card className="mb-6">
    <h2 className="text-xl font-semibold mb-4">Project Status Tracker</h2>
    <Row gutter={16} className="w-full">

      {tasks.map((task, index) => (
        <Col span={24} md={12} key={index}>
          <Card className="shadow-sm hover:shadow-sm mb-6 border rounded-lg">
            <h3 className="text-lg font-semibold">{task.name}</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Due: {task.dueDate}</span>
              <span
                className={`${
                  task.status === 'Completed' ? 'text-green-500' : task.status === 'In Progress' ? 'text-yellow-500' : 'text-red-500'
                }`}
              >
                {task.status}
              </span>
            </div>
            <div className="mt-4">
              <Progress percent={task.status === 'Completed' ? 100 : task.status === 'In Progress' ? 50 : 0} />
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">Priority: {task.priority}</span>
              <Button type="primary" size="small">View Details</Button>
            </div>
          </Card>
        </Col>
      ))}
      
    </Row>
    </Card>
          {/*<div className="bg-white p-6 rounded-lg shadow-sm mt-6">
            <h3 className="text-xl font-semibold mb-4">
              Project Status Overview
            </h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iure
              assumenda consequatur blanditiis ea eius deleniti quas nesciunt
              hic similique error dolores placeat repellat impedit fugiat autem,
              id tempore repudiandae voluptatem!
            </p>
            <Button
              type="primary"
              onClick={() => handleMenuClick("project-status-overview")}
              className="mt-4"
            >
              See Overview
            </Button>
          </div>*/}
          {/* Messages */}

          <Card className="w-full shadow-sm hover:shadow-md mb-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Alerts & Recommendations</h2>
        <div className="space-y-4">
          {tasks.some((task) => task.status === 'Pending') && (
            <div className="flex items-center p-4 bg-yellow-50 text-yellow-600 rounded-lg border">
              <ExclamationCircleOutlined className="text-xl mr-4" />
              <span>Some tasks are pending. Please review and take action.</span>
            </div>
          )}
          {yourTasks.some((task) => task.status === 'In Progress') && (
            <div className="flex items-center p-4 bg-blue-50 text-blue-600 rounded-lg border">
              <CheckCircleOutlined className="text-xl mr-4" />
              <span>Milestone "Development Phase" is in progress. Keep it up!</span>
            </div>
          )}
        </div>
      </Card>

          {/* Add Comment Modal */}
          <Modal
            title="Add Comment"
            open={isModalVisible}
            onCancel={handleCloseModal}
            footer={[
              <Button key="cancel" onClick={handleCloseModal}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={() =>
                  handleAddComment(document.getElementById("comment").value)
                }
              >
                Submit
              </Button>,
            ]}
          >
            <Input.TextArea
              id="comment"
              rows={4}
              placeholder="Add your comment here"
            />
          </Modal>
          
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
