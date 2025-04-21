import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Progress, Card, Row, Col, Modal, Button, Input, notification, 
  Spin, Tag, Timeline, Tooltip, Select, Statistic, Badge, DatePicker,
  Upload
} from "antd";
import { 
  CheckCircleOutlined, ExclamationCircleOutlined, UploadOutlined,
  ClockCircleOutlined, DollarOutlined, FileDoneOutlined,
  MessageOutlined, UserOutlined, CalendarOutlined, FlagOutlined,
  LinkOutlined
} from "@ant-design/icons";
import { GrRevert } from "react-icons/gr";
import { motion, AnimatePresence } from "framer-motion";
// import '../../../assets/css/ProjectDetailPage.css';

const ProjectDetailPage = ({ userId, role, isAuthenticated, isEditable }) => {
  const navigate = useNavigate();
  const [taskStatus, setTaskStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const handleMenuClick = (component) => {
    if (location.pathname !== "/freelancer/dashboard") {
      navigate("/freelancer/dashboard", { state: { component } });
    }
  };

  const yourTasks = [
    { name: 'Initial Design', status: 'pending', dueDate: '2024-12-15', priority: 'High' },
  ];
  
  const tasks = [
    { name: 'Design Wireframe', status: 'Completed', dueDate: '2024-12-10', priority: 'High', assignedTo: 'You' },
    { name: 'Build Frontend', status: 'In Progress', dueDate: '2024-12-18', priority: 'Medium', assignedTo: 'You' },
    { name: 'Backend API Integration', status: 'Pending', dueDate: '2024-12-22', priority: 'Low', assignedTo: 'Team Member' },
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
          description: "A complete redesign of the client website to improve UX/UI and performance.",
          completionPercentage: 45,
          isCollaborative: true,
          milestones: [
            { name: "Initial Design", dueDate: "2024-12-15", status: "Completed" },
            { name: "Development Phase", dueDate: "2024-12-20", status: "In Progress" },
            { name: "Testing", dueDate: "2024-12-25", status: "Pending" },
          ],
          tasks: [
            { name: "Create Wireframes", assignedTo: "You", deadline: "2024-12-10", status: "Completed" },
            { name: "Develop Frontend", assignedTo: "You", deadline: "2024-12-18", status: "In Progress" },
          ],
          messages: [
            { sender: "Client", message: "Please focus on responsive design.", timestamp: "2023-12-01 10:30" },
            { sender: "You", message: "I have completed the wireframes and shared them.", timestamp: "2023-12-02 15:45" },
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

  const [previousStatus, setPreviousStatus] = useState("");
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [showRevert, setShowRevert] = useState(false);
  const [link, setLink] = useState("");
  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    const selectedStatus = e.target.value;
    setNewStatus(selectedStatus);
    setIsStatusModalVisible(true);
  };

  const handleConfirm = (link, files) => {
    setPreviousStatus(taskStatus);
    setTaskStatus(newStatus);
    setIsStatusModalVisible(false);

    notification.success({
      message: "Status Updated",
      description: `Task status changed to ${newStatus.replace(/_/g, " ").toUpperCase()}`,
      placement: 'bottomRight'
    });
  };

  const handleCancel = () => {
    setIsStatusModalVisible(false);
  };

  const handleRevert = () => {
    setShowRevert(false);
    setTaskStatus(previousStatus);
    
    notification.info({
      message: "Status Reverted",
      description: `Task status reverted to previous state`,
      placement: 'bottomRight'
    });
  };

  const handleFileChange = (info) => {
    setFiles(info.fileList);
  };

  const handleLinkChange = (e) => {
    setLink(e.target.value);
  };

  const handleConfirmChange = () => {
    if (!link && files.length === 0) {
      notification.error({
        message: "No Attachments",
        description: "Please add a link or upload at least one file.",
      });
      return;
    }

    setShowRevert(true);
    handleConfirm(link, files);
    setLink("");
    setFiles([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Loading project details..." />
      </div>
    );
  }

  const calculateDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = calculateDaysRemaining(project.deadline);

  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 shadow-lg">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full 
              filter blur-3xl mix-blend-overlay -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full 
              filter blur-3xl mix-blend-overlay translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                <p className="text-indigo-100 text-lg">
                  Client: {project.client} • 
                  {project.isCollaborative && 
                    <span className="ml-2 bg-violet-500/30 text-white px-2 py-1 rounded-full text-xs">
                      Collaborative
                    </span>
                  }
                </p>
              </div>
              
              <div className="flex flex-col gap-2 w-full md:w-auto bg-white/10 p-4 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-indigo-100">Project Status:</span>
                  <Tag color={project.status === "Completed" ? "success" : 
                           project.status === "Ongoing" ? "processing" : "warning"}>
                    {project.status}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-100">Budget:</span>
                  <span className="text-white font-semibold">₹{project.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-100">Deadline:</span>
                  <span className="text-white">{project.deadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-100">Days Remaining:</span>
                  <span className={`font-semibold ${daysRemaining < 7 ? 'text-red-300' : 'text-white'}`}>
                    {daysRemaining} days
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white">Overall Completion</span>
                  <span className="text-white">{project.completionPercentage}%</span>
                </div>
                <Progress 
                  percent={project.completionPercentage} 
                  strokeColor={{
                    '0%': '#8B5CF6',
                    '100%': '#10B981'
                  }}
                  trailColor="rgba(255, 255, 255, 0.2)"
                  showInfo={false}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-6">
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} md={16}>
            <motion.div 
              whileHover={{ scale: 1.01 }} 
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card 
                title={<span className="text-lg font-semibold">Project Overview</span>}
                className="shadow-md hover:shadow-lg transition-all duration-300 h-full"
              >
                <p className="text-gray-700 mb-6 text-base">
                  {project.description}
                </p>
                
                <h3 className="font-semibold text-gray-800 mb-4">Milestones</h3>
                <Timeline
                  items={project.milestones.map((milestone, index) => ({
                    color: milestone.status === "Completed" ? "green" : 
                           milestone.status === "In Progress" ? "blue" : "gray",
                    children: (
                      <div>
                        <p className="font-medium">{milestone.name}</p>
                        <p className="text-sm text-gray-500">Due: {milestone.dueDate}</p>
                        <Tag color={milestone.status === "Completed" ? "success" : 
                                    milestone.status === "In Progress" ? "processing" : "default"}>
                          {milestone.status}
                        </Tag>
                      </div>
                    )
                  }))}
                />
              </Card>
            </motion.div>
          </Col>
          
          <Col xs={24} md={8}>
            <motion.div 
              whileHover={{ scale: 1.01 }} 
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card 
                title={<span className="text-lg font-semibold">Project Stats</span>}
                className="shadow-md hover:shadow-lg transition-all duration-300 h-full"
              >
                <div className="space-y-6">
                  <Statistic 
                    title={<span className="text-gray-600">Tasks Completed</span>}
                    value={tasks.filter(t => t.status === 'Completed').length}
                    suffix={`/ ${tasks.length}`}
                    valueStyle={{ color: '#8B5CF6' }}
                  />
                  
                  <Statistic 
                    title={<span className="text-gray-600">Next Deadline</span>}
                    value={
                      tasks.filter(t => t.status !== 'Completed')
                           .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]?.dueDate || 'None'
                    }
                    valueStyle={{ color: '#8B5CF6', fontSize: '16px' }}
                  />
                  
                  <div>
                    <h4 className="text-gray-600 mb-2">Priority Tasks</h4>
                    {tasks.filter(t => t.priority === 'High' && t.status !== 'Completed')
                          .map((task, idx) => (
                      <Tag key={idx} color="error" className="mb-2">{task.name}</Tag>
                    ))}
                    {tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length === 0 && 
                      <p className="text-gray-500 text-sm">No high priority tasks pending</p>
                    }
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24}>
            <motion.div 
              whileHover={{ scale: 1.01 }} 
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card 
                title={
                  <div className="flex items-center">
                    <FileDoneOutlined className="text-violet-600 mr-2" />
                    <span className="text-lg font-semibold">Your Tasks</span>
                  </div>
                }
                className="shadow-md hover:shadow-lg transition-all duration-300"
                extra={
                  <Select
                    defaultValue="all"
                    style={{ width: 120 }}
                    options={[
                      { value: 'all', label: 'All Tasks' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'completed', label: 'Completed' },
                    ]}
                  />
                }
              >
                <div className="space-y-4">
                  {yourTasks.map((task, index) => (
                    <AnimatePresence key={index}>
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white shadow border rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 text-lg">{task.name}</span>
                              <Tag color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'default'}>
                                {task.priority}
                              </Tag>
                            </div>
                            <div className="flex items-center text-gray-500 text-sm mt-1">
                              <CalendarOutlined className="mr-1" /> Due: {task.dueDate}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Select
                              value={taskStatus || task.status} 
                              onChange={handleChange}
                              className={`w-full sm:w-40 transition duration-200 ease-in-out ${
                                (taskStatus || task.status) === "pending" ? "status-pending" : 
                                (taskStatus || task.status) === "in_progress" ? "status-progress" : "status-completed"
                              }`}
                              options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'in_progress', label: 'In Progress' },
                                { value: 'completed', label: 'Completed' }
                              ]}
                            />
                            
                            {showRevert && (
                              <Tooltip title="Revert Status">
                                <Button
                                  icon={<GrRevert className="text-gray-600" />}
                                  onClick={handleRevert}
                                  className="flex items-center justify-center"
                                />
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  ))}
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24}>
            <motion.div 
              whileHover={{ scale: 1.01 }} 
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card 
                title={
                  <div className="flex items-center">
                    <ClockCircleOutlined className="text-violet-600 mr-2" />
                    <span className="text-lg font-semibold">Project Tasks</span>
                  </div>
                }
                className="shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Row gutter={[16, 16]}>
                  {tasks.map((task, index) => (
                    <Col xs={24} md={8} key={index}>
                      <motion.div 
                        whileHover={{ y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card 
                          className="h-full shadow-sm hover:shadow-md transition-all duration-300 border-t-4 border-solid"
                          style={{ 
                            borderTopColor: task.status === 'Completed' ? '#10B981' : 
                                           task.status === 'In Progress' ? '#3B82F6' : '#EF4444' 
                          }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">{task.name}</h3>
                            <Badge
                              status={task.status === 'Completed' ? 'success' : 
                                     task.status === 'In Progress' ? 'processing' : 'error'}
                              text={task.status}
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center text-gray-600">
                              <CalendarOutlined className="mr-2" /> {task.dueDate}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <UserOutlined className="mr-2" /> {task.assignedTo}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <FlagOutlined className="mr-2" /> {task.priority} Priority
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <Progress 
                              percent={task.status === 'Completed' ? 100 : 
                                      task.status === 'In Progress' ? 50 : 0} 
                              strokeColor="#8B5CF6"
                            />
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <Button type="primary" className="bg-violet-600 hover:bg-violet-700">
                              View Details
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </motion.div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} md={12}>
            <motion.div 
              whileHover={{ scale: 1.01 }} 
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card 
                title={
                  <div className="flex items-center">
                    <MessageOutlined className="text-violet-600 mr-2" />
                    <span className="text-lg font-semibold">Communication</span>
                  </div>
                }
                className="shadow-md hover:shadow-lg transition-all duration-300 h-full"
                extra={
                  <Button type="primary" icon={<MessageOutlined />} onClick={handleOpenModal}>
                    New Message
                  </Button>
                }
              >
                <Timeline
                  items={project.messages.map((msg, index) => ({
                    color: msg.sender === "Client" ? "blue" : "green",
                    children: (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{msg.sender}</span>
                          <span className="text-xs text-gray-500">{msg.timestamp}</span>
                        </div>
                        <p>{msg.message}</p>
                      </div>
                    )
                  }))}
                />
              </Card>
            </motion.div>
          </Col>
          
          <Col xs={24} md={12}>
            <motion.div 
              whileHover={{ scale: 1.01 }} 
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card 
                title={
                  <div className="flex items-center">
                    <ExclamationCircleOutlined className="text-violet-600 mr-2" />
                    <span className="text-lg font-semibold">Alerts & Recommendations</span>
                  </div>
                }
                className="shadow-md hover:shadow-lg transition-all duration-300 h-full"
              >
                <div className="space-y-4">
                  {tasks.some((task) => task.status === 'Pending') && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center p-4 bg-red-50 text-red-600 rounded-lg border border-red-200"
                    >
                      <ExclamationCircleOutlined className="text-xl mr-4" />
                      <span>You have pending tasks that require attention.</span>
                    </motion.div>
                  )}
                  
                  {daysRemaining < 7 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center p-4 bg-yellow-50 text-yellow-600 rounded-lg border border-yellow-200"
                    >
                      <ClockCircleOutlined className="text-xl mr-4" />
                      <span>Project deadline is approaching. Only {daysRemaining} days remaining.</span>
                    </motion.div>
                  )}
                  
                  {yourTasks.some((task) => task.status === 'in_progress') && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center p-4 bg-blue-50 text-blue-600 rounded-lg border border-blue-200"
                    >
                      <CheckCircleOutlined className="text-xl mr-4" />
                      <span>Milestone "Development Phase" is in progress. Keep it up!</span>
                    </motion.div>
                  )}
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center p-4 bg-violet-50 text-violet-600 rounded-lg border border-violet-200"
                  >
                    <UserOutlined className="text-xl mr-4" />
                    <span>Maintain regular communication with client for better project flow.</span>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>

      <Modal
        title={<span className="text-lg">Confirm Status Change</span>}
        open={isStatusModalVisible}
        onOk={handleConfirmChange}
        onCancel={handleCancel}
        okText="Confirm"
        cancelText="Cancel"
        okButtonProps={{ style: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' } }}
        width={500}
        className="status-change-modal"
      >
        <p className="text-base mb-4">
          Are you sure you want to change the status to "{newStatus?.replace(/_/g, " ").toUpperCase()}"?
        </p>
        <p className="text-sm text-gray-500 mb-4">You can attach a link and files to provide context to your client.</p>

        <div className="mb-4">
          <Input
            prefix={<LinkOutlined className="text-gray-400" />}
            type="url"
            value={link}
            onChange={handleLinkChange}
            placeholder="Enter a link (optional)"
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <Upload
            multiple
            onChange={handleFileChange}
            fileList={files}
            beforeUpload={() => false}
            showUploadList={{ showRemoveIcon: true }}
          >
            <Button icon={<UploadOutlined />} className="bg-violet-50 text-violet-600 border-violet-200">
              Upload Files
            </Button>
          </Upload>
        </div>

        {files.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Uploaded Files:</h4>
            <ul className="list-disc list-inside">
              {files.map((file, index) => (
                <li key={index} className="text-sm">
                  {file.name} - {file.size / 1024 > 1024 ? 
                    `${(file.size / 1024 / 1024).toFixed(2)} MB` : 
                    `${(file.size / 1024).toFixed(2)} KB`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>

      <Modal
        title={<span className="text-lg">Send Message</span>}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => handleAddComment(document.getElementById("comment").value)}
            style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
          >
            Send
          </Button>,
        ]}
        width={500}
      >
        <Input.TextArea
          id="comment"
          rows={4}
          placeholder="Type your message here..."
          className="mb-4"
        />
        <Upload
          multiple
          beforeUpload={() => false}
          showUploadList={{ showRemoveIcon: true }}
          className="mb-2"
        >
          <Button icon={<UploadOutlined />} className="bg-violet-50 text-violet-600 border-violet-200">
            Attach Files
          </Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
