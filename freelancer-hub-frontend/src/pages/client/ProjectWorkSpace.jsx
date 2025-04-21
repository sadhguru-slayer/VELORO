import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaRegFileAlt } from "react-icons/fa";
import { SlPicture } from "react-icons/sl";
import { 
  DragDropContext, Droppable, Draggable 
} from 'react-beautiful-dnd';
import { 
  Tabs, Button, Dropdown, Progress, Modal, Tooltip,
  Form, Input, DatePicker, Upload, Select, Switch, Popover,
  Table, Tag, Menu, Timeline, Badge, Collapse, Row, Col,
  Divider, notification, Statistic, Card, Typography, Space,
  Spin, Avatar, Empty,Pagination
} from 'antd';
import { 
  CalendarOutlined, MessageOutlined, FileOutlined, 
  CheckCircleOutlined, SettingOutlined, BarChartOutlined,
  PlusOutlined, ClockCircleOutlined, DollarOutlined,
  TeamOutlined, InboxOutlined, UploadOutlined,
  EditOutlined, DeleteOutlined, EyeOutlined,
  LinkOutlined, HistoryOutlined, FilterOutlined,
  ExclamationCircleOutlined, BellOutlined, GithubOutlined,
  CodeOutlined, CommentOutlined, FieldTimeOutlined, 
  ApartmentOutlined, BranchesOutlined, BugOutlined,
  StarOutlined, UserOutlined, DesktopOutlined, 
  MenuUnfoldOutlined, BorderOuterOutlined, ShareAltOutlined,
  HomeOutlined, ArrowLeftOutlined, ProjectOutlined,
  MailOutlined, NotificationOutlined, GlobalOutlined,
  QuestionCircleOutlined, SearchOutlined, MenuOutlined,
  DownloadOutlined, InfoCircleOutlined, SyncOutlined,
  ArrowUpOutlined, CheckOutlined, HourglassOutlined,LockOutlined, DownOutlined, EllipsisOutlined 
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

import moment from 'moment';
import Chart from 'react-apexcharts';
import CSider from '../../components/client/CSider';
import CHeader from '../../components/client/CHeader';
import { CheckCircleFilled } from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

const ProjectWorkSpace = ({ userId, role }) => {
  // Get the projectId from URL params
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [collapsed, setCollapsed] = useState(false);
    // Responsive layout hooks
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });
  const [mobileSiderVisible, setMobileSiderVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskColumns, setTaskColumns] = useState({
    pending: { id: 'pending', title: 'To Do', taskIds: [] },
    ongoing: { id: 'ongoing', title: 'In Progress', taskIds: [] },
    review: { id: 'review', title: 'Under Review', taskIds: [] },
    completed: { id: 'completed', title: 'Completed', taskIds: [] }
  });
  const [columnOrder, setColumnOrder] = useState(['pending', 'ongoing', 'review', 'completed']);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isMilestoneModalVisible, setIsMilestoneModalVisible] = useState(false);
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
  const [taskForm] = Form.useForm();
  const [milestoneForm] = Form.useForm();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [projectFiles, setProjectFiles] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [ganttViewMode, setGanttViewMode] = useState('week');
  const [isAddDependencyModalVisible, setIsAddDependencyModalVisible] = useState(false);
  const [timeTracking, setTimeTracking] = useState([]);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [trackingTaskId, setTrackingTaskId] = useState(null);
  const [trackingStartTime, setTrackingStartTime] = useState(null);
  const [riskItems, setRiskItems] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [taskFilters, setTaskFilters] = useState({
    assignee: 'all',
    status: 'all',
    priority: 'all',
    dueDate: 'all'
  });

  const timerRef = useRef(null);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setMobileView(isMobile);
      if (!isMobile && mobileSiderVisible) {
        setMobileSiderVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileSiderVisible]);
  const [activeComponent, setActiveComponent] = useState('');


  const handleMenuClick = (component) => {
    if (component !== 'projects') {
      navigate('/client/dashboard', { state: { component } });
    }
  };

  const [activeProfileComponent, setActiveProfileComponent] = useState('');

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/client/profile') {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
    }
  };

  // Mock data for demonstration - in real implementation, fetch from API
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API calls
        const projectData = {
          id: projectId || 1,
          title: "E-commerce Website Development",
          description: "Create a fully functional e-commerce platform with payment integration, inventory management, and analytics dashboard.",
          status: "ongoing",
          budget: 5000,
          paymentStatus: "partial",
          amountPaid: 2000,
          deadline: "2023-12-01",
          client: { id: 1, name: "Acme Corp", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
          startDate: "2023-08-15",
          progress: 45,
          complexity: "Intermediate",
          domain: "Web Development",
          repositoryUrl: "https://github.com/acme/ecommerce",
          projectManager: { id: 4, name: "Robert Johnson", avatar: "https://randomuser.me/api/portraits/men/4.jpg" }
        };
        
        const tasksData = [
          { 
            id: 1, 
            title: "Design Homepage UI", 
            description: "Create responsive designs for homepage", 
            status: "completed", 
            deadline: "2023-09-15", 
            assignedTo: { id: 2, name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/2.jpg" }, 
            progress: 100,
            priority: "high",
            startDate: "2023-08-20",
            endDate: "2023-09-15",
            estimatedHours: 40,
            loggedHours: 38,
            tags: ["UI", "Design", "Frontend"]
          },
          { 
            id: 2, 
            title: "Product Listing Page", 
            description: "Implement product grid with filters", 
            status: "ongoing", 
            deadline: "2023-10-15", 
            assignedTo: { id: 2, name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/2.jpg" }, 
            progress: 60,
            priority: "medium",
            startDate: "2023-09-16",
            endDate: "2023-10-15",
            estimatedHours: 30,
            loggedHours: 18,
            tags: ["Frontend", "React"]
          },
          { 
            id: 3, 
            title: "Cart Functionality", 
            description: "Build shopping cart with dynamic updates", 
            status: "pending", 
            deadline: "2023-10-30", 
            assignedTo: { id: 3, name: "Alex Brown", avatar: "https://randomuser.me/api/portraits/men/3.jpg" }, 
            progress: 0,
            priority: "high",
            startDate: "2023-10-01",
            endDate: "2023-10-30",
            estimatedHours: 25,
            loggedHours: 0,
            tags: ["Frontend", "React", "State Management"]
          },
          { 
            id: 4, 
            title: "Payment Gateway", 
            description: "Integrate Stripe/PayPal payment processing", 
            status: "pending", 
            deadline: "2023-11-15", 
            assignedTo: { id: 2, name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/2.jpg" }, 
            progress: 0,
            priority: "critical",
            startDate: "2023-10-16",
            endDate: "2023-11-15",
            estimatedHours: 35,
            loggedHours: 0,
            tags: ["Backend", "API Integration"]
          },
          { 
            id: 5, 
            title: "User Authentication", 
            description: "Create sign-up, login, password reset", 
            status: "review", 
            deadline: "2023-09-30", 
            assignedTo: { id: 3, name: "Alex Brown", avatar: "https://randomuser.me/api/portraits/men/3.jpg" }, 
            progress: 90,
            priority: "high",
            startDate: "2023-09-01",
            endDate: "2023-09-30",
            estimatedHours: 20,
            loggedHours: 22,
            tags: ["Backend", "Security"]
          }
        ];
        
        const milestonesData = [
          { id: 1, title: "UI Design Approval", amount: 1000, status: "paid", dueDate: "2023-09-15", milestone_type: "hybrid", completed: true },
          { id: 2, title: "Core Functionality", amount: 2000, status: "pending", dueDate: "2023-10-30", milestone_type: "payment", completed: false },
          { id: 3, title: "Final Delivery", amount: 2000, status: "pending", dueDate: "2023-11-30", milestone_type: "hybrid", completed: false }
        ];
        
        const teamData = [
          { id: 2, name: "Jane Smith", role: "Lead Developer", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
          { id: 3, name: "Alex Brown", role: "UI/UX Designer", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
          { id: 4, name: "Robert Johnson", role: "Project Manager", avatar: "https://randomuser.me/api/portraits/men/4.jpg" },
          { id: 5, name: "Emily Davis", role: "QA Engineer", avatar: "https://randomuser.me/api/portraits/women/5.jpg" }
        ];
        
        const filesData = [
          { id: 1, name: "UI-Mockups.zip", size: "24.5 MB", type: "application/zip", uploadedBy: "Alex Brown", date: "2023-08-20" },
          { id: 2, name: "database-schema.pdf", size: "2.7 MB", type: "application/pdf", uploadedBy: "Jane Smith", date: "2023-08-25" },
          { id: 3, name: "project-requirements.docx", size: "1.2 MB", type: "application/docx", uploadedBy: "Acme Corp", date: "2023-08-15" },
          { id: 4, name: "api-documentation.md", size: "0.5 MB", type: "text/markdown", uploadedBy: "Jane Smith", date: "2023-09-05" },
          { id: 5, name: "testing-protocols.xlsx", size: "1.8 MB", type: "application/xlsx", uploadedBy: "Emily Davis", date: "2023-09-10" }
        ];
        
        const messagesData = [
          { id: 1, sender: { id: 1, name: "Acme Corp", avatar: "https://randomuser.me/api/portraits/men/1.jpg" }, message: "How is the progress on the cart functionality?", timestamp: "2023-09-15T14:30:00" },
          { id: 2, sender: { id: 2, name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/2.jpg" }, message: "We're making good progress. Expect to have it ready for review by next week.", timestamp: "2023-09-15T14:45:00" },
          { id: 3, sender: { id: 1, name: "Acme Corp", avatar: "https://randomuser.me/api/portraits/men/1.jpg" }, message: "Great! Looking forward to it.", timestamp: "2023-09-15T15:00:00" }
        ];
        
        // Task dependencies for Gantt chart
        const dependenciesData = [
          { id: 1, predecessor: 1, successor: 2, type: "finish_to_start" },
          { id: 2, predecessor: 2, successor: 3, type: "finish_to_start" },
          { id: 3, predecessor: 3, successor: 4, type: "start_to_start" },
          { id: 4, predecessor: 5, successor: 3, type: "finish_to_start" }
        ];
        
        // Time tracking data
        const timeTrackingData = [
          { id: 1, taskId: 1, user: { id: 3, name: "Alex Brown" }, startTime: "2023-09-10T10:00:00", endTime: "2023-09-10T12:30:00", duration: 2.5, description: "Created initial wireframes" },
          { id: 2, taskId: 1, user: { id: 3, name: "Alex Brown" }, startTime: "2023-09-11T09:00:00", endTime: "2023-09-11T13:00:00", duration: 4, description: "Designed mobile layouts" },
          { id: 3, taskId: 5, user: { id: 2, name: "Jane Smith" }, startTime: "2023-09-12T14:00:00", endTime: "2023-09-12T17:30:00", duration: 3.5, description: "Implemented user signup flow" }
        ];
        
        // Risk assessment data
        const riskItemsData = [
          { id: 1, title: "API Integration Delay", description: "External payment API documentation may be incomplete", impact: "high", probability: "medium", mitigation: "Start integration early and allocate buffer time", status: "monitoring" },
          { id: 2, title: "Resource Availability", description: "Key team member on vacation during critical phase", impact: "medium", probability: "high", mitigation: "Cross-train team members before vacation", status: "mitigated" },
          { id: 3, title: "Security Compliance", description: "New regulations affecting user data storage", impact: "high", probability: "medium", mitigation: "Consult with legal team and implement required changes", status: "active" }
        ];
        
        setProject(projectData);
        setTasks(tasksData);
        setFilteredTasks(tasksData);
        setMilestones(milestonesData);
        setTeamMembers(teamData);
        setProjectFiles(filesData);
        setMessages(messagesData);
        setDependencies(dependenciesData);
        setTimeTracking(timeTrackingData);
        setRiskItems(riskItemsData);
        
        // Organize tasks by status
        const columns = {
          pending: { id: 'pending', title: 'To Do', taskIds: [] },
          ongoing: { id: 'ongoing', title: 'In Progress', taskIds: [] },
          review: { id: 'review', title: 'Under Review', taskIds: [] },
          completed: { id: 'completed', title: 'Completed', taskIds: [] }
        };
        
        tasksData.forEach(task => {
          if (columns[task.status]) {
            columns[task.status].taskIds.push(task.id);
          }
        });
        
        setTaskColumns(columns);
      } catch (error) {
        console.error("Error fetching project data:", error);
        notification.error({
          message: "Failed to load project data",
          description: "Please try refreshing the page or contact support if the issue persists."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId]);

  // Handle drag and drop for Kanban board
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    
    // Return if dropped outside a droppable area or in the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Get source and destination columns
    const sourceColumn = taskColumns[source.droppableId];
    const destColumn = taskColumns[destination.droppableId];
    
    // Moving within the same column
    if (sourceColumn === destColumn) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, parseInt(draggableId));
      
      const newColumn = {
        ...sourceColumn,
        taskIds: newTaskIds
      };
      
      setTaskColumns({
        ...taskColumns,
        [newColumn.id]: newColumn
      });
      return;
    }
    
    // Moving to a different column
    const sourceTaskIds = Array.from(sourceColumn.taskIds);
    sourceTaskIds.splice(source.index, 1);
    const newSourceColumn = {
      ...sourceColumn,
      taskIds: sourceTaskIds
    };
    
    const destTaskIds = Array.from(destColumn.taskIds);
    destTaskIds.splice(destination.index, 0, parseInt(draggableId));
    const newDestColumn = {
      ...destColumn,
      taskIds: destTaskIds
    };
    
    // Update task status in your state/database
    const updatedTasks = tasks.map(task => {
      if (task.id === parseInt(draggableId)) {
        // Update the task status based on the destination column
        return { ...task, status: destination.droppableId };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    setFilteredTasks(filterTasks(updatedTasks, taskFilters));
    setTaskColumns({
      ...taskColumns,
      [newSourceColumn.id]: newSourceColumn,
      [newDestColumn.id]: newDestColumn
    });
    
    // Show notification for status change
    const task = tasks.find(task => task.id === parseInt(draggableId));
    notification.success({
      message: "Task Status Updated",
      description: `${task.title} is now ${destination.droppableId === 'completed' ? 'completed' : 'in ' + destination.droppableId}`,
      placement: "topRight",
      duration: 3
    });
  };

  // Filter tasks based on selected filters
  const filterTasks = (tasksList, filters) => {
    return tasksList.filter(task => {
      return (filters.assignee === 'all' || task.assignedTo.id === parseInt(filters.assignee)) &&
             (filters.status === 'all' || task.status === filters.status) &&
             (filters.priority === 'all' || task.priority === filters.priority) &&
             (filters.dueDate === 'all' || handleDateFilter(task.deadline, filters.dueDate));
    });
  };

  // Handle date filter logic
  const handleDateFilter = (deadline, filter) => {
    const today = moment();
    const taskDeadline = moment(deadline);
    
    switch (filter) {
      case 'overdue':
        return taskDeadline.isBefore(today);
      case 'today':
        return taskDeadline.isSame(today, 'day');
      case 'this_week':
        return taskDeadline.isSame(today, 'week');
      case 'next_week':
        return taskDeadline.isAfter(moment().endOf('week')) && 
               taskDeadline.isBefore(moment().add(2, 'weeks').startOf('week'));
      default:
        return true;
    }
  };

  // Apply filters to tasks
  const applyFilters = (filters) => {
    setTaskFilters(filters);
    setFilteredTasks(filterTasks(tasks, filters));
  };

  // Handle task creation
  const handleTaskCreate = (values) => {
    // Calculate end date based on start date and duration
    const startDate = values.startDate.format("YYYY-MM-DD");
    const endDate = values.deadline.format("YYYY-MM-DD");
    
    // In real app, send API request to create task
    const newTask = {
      id: tasks.length + 1,
      title: values.title,
      description: values.description,
      status: "pending",
      deadline: endDate,
      startDate: startDate,
      endDate: endDate,
      assignedTo: teamMembers.find(member => member.id === values.assignedTo),
      progress: 0,
      priority: values.priority,
      estimatedHours: values.estimatedHours,
      loggedHours: 0,
      tags: values.tags || []
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setFilteredTasks(filterTasks(updatedTasks, taskFilters));
    
    // Update task columns
    const newColumns = {
      ...taskColumns,
      pending: {
        ...taskColumns.pending,
        taskIds: [...taskColumns.pending.taskIds, newTask.id]
      }
    };
    
    setTaskColumns(newColumns);
    
    // Reset form and close modal
    taskForm.resetFields();
    setIsTaskModalVisible(false);
    
    // Show success notification
    notification.success({
      message: "Task Created",
      description: `"${values.title}" has been added to the project`,
      placement: "topRight",
      duration: 4
    });
  };

  // Handle milestone creation
  const handleMilestoneCreate = (values) => {
    // In real app, send API request to create milestone
    const newMilestone = {
      id: milestones.length + 1,
      title: values.title,
      amount: values.amount,
      status: "pending",
      dueDate: values.dueDate.format("YYYY-MM-DD"),
      milestone_type: values.milestoneType,
      completed: false
    };
    
    setMilestones([...milestones, newMilestone]);
    
    // Reset form and close modal
    milestoneForm.resetFields();
    setIsMilestoneModalVisible(false);
    
    // Show success notification
    notification.success({
      message: "Milestone Created",
      description: `"${values.title}" has been added to the project milestones`,
      placement: "topRight",
      duration: 4
    });
  };

  // Handle sending messages
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    // In real app, send API request to save message
    const message = {
      id: messages.length + 1,
      sender: teamMembers[0], // For demo purposes
      message: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  // Start time tracking for a task
  const startTimeTracking = (taskId) => {
    if (isTrackingActive) {
      notification.warning({
        message: "Tracking Already Active",
        description: "Please stop the current tracking before starting a new one",
        placement: "topRight"
      });
      return;
    }
    
    setIsTrackingActive(true);
    setTrackingTaskId(taskId);
    setTrackingStartTime(new Date());
    
    // Start the timer
    timerRef.current = setInterval(() => {
      // This would update a timer display
    }, 1000);
    
    notification.info({
      message: "Time Tracking Started",
      description: `Tracking time for task: ${tasks.find(t => t.id === taskId)?.title}`,
      placement: "topRight",
      duration: 3
    });
  };

  // Stop time tracking for a task
  const stopTimeTracking = (description) => {
    if (!isTrackingActive) return;
    
    clearInterval(timerRef.current);
    
    const startTime = trackingStartTime;
    const endTime = new Date();
    const durationHours = (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
    
    // Create a new time tracking entry
    const newTracking = {
      id: timeTracking.length + 1,
      taskId: trackingTaskId,
      user: teamMembers[0], // Current user
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: parseFloat(durationHours.toFixed(2)),
      description
    };
    
    // Update task logged hours
    const updatedTasks = tasks.map(task => {
      if (task.id === trackingTaskId) {
        return {
          ...task,
          loggedHours: parseFloat((task.loggedHours + durationHours).toFixed(2))
        };
      }
      return task;
    });
    
    setTimeTracking([...timeTracking, newTracking]);
    setTasks(updatedTasks);
    setFilteredTasks(filterTasks(updatedTasks, taskFilters));
    setIsTrackingActive(false);
    setTrackingTaskId(null);
    setTrackingStartTime(null);
    
    notification.success({
      message: "Time Tracked",
      description: `Logged ${durationHours.toFixed(2)} hours for task`,
      placement: "topRight",
      duration: 3
    });
  };

  // Add task dependency
  const addDependency = (values) => {
    const newDependency = {
      id: dependencies.length + 1,
      predecessor: parseInt(values.predecessor),
      successor: parseInt(values.successor),
      type: values.type
    };
    
    setDependencies([...dependencies, newDependency]);
    setIsAddDependencyModalVisible(false);
    
    notification.success({
      message: "Dependency Added",
      description: "Task dependency has been created",
      placement: "topRight"
    });
  };

  // Mark milestone as complete
  const completeMilestone = (milestoneId) => {
    const updatedMilestones = milestones.map(milestone => {
      if (milestone.id === milestoneId) {
        return { ...milestone, completed: true, status: milestone.milestone_type === 'payment' ? 'paid' : 'approved' };
      }
      return milestone;
    });
    
    setMilestones(updatedMilestones);
    
    notification.success({
      message: "Milestone Completed",
      description: `${milestones.find(m => m.id === milestoneId)?.title} has been marked as complete`,
      placement: "topRight"
    });
  };

  // Determine project progress color
  const getProgressColor = (progress) => {
    if (progress < 30) return "#f5222d"; // Red
    if (progress < 70) return "#faad14"; // Yellow
    return "#52c41a"; // Green
  };

  // Get task by ID
  const getTaskById = (taskId) => {
    return tasks.find(task => task.id === taskId);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#52c41a';
      case 'medium': return '#1890ff';
      case 'high': return '#faad14';
      case 'critical': return '#f5222d';
      default: return '#1890ff';
    }
  };

  // Format current tracking time
  const formatTrackingTime = () => {
    if (!isTrackingActive || !trackingStartTime) return '00:00:00';
    
    const diff = new Date() - trackingStartTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Generate Gantt chart data for ApexCharts
  const getGanttChartData = () => {
    return [{
      data: tasks.map(task => ({
        x: task.title,
        y: [
          new Date(task.startDate).getTime(),
          new Date(task.endDate).getTime()
        ],
        fillColor: task.status === 'completed' ? '#52c41a' : 
                  task.status === 'ongoing' ? '#1890ff' : 
                  task.status === 'review' ? '#faad14' : '#8c8c8c',
        taskId: task.id,
        progress: task.progress,
        assignedTo: task.assignedTo.name
      }))
    }];
  };

  // Gantt chart options
  const ganttChartOptions = {
    chart: {
      height: 350,
      type: 'rangeBar',
      toolbar: {
        show: true
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        dataLabels: {
          hideOverflowingLabels: false
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        const task = tasks.find(t => t.id === opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].taskId);
        return `${task ? task.progress : 0}%`;
      },
      style: {
        colors: ['#fff']
      }
    },
    xaxis: {
      type: 'datetime',
      position: 'top'
    },
    yaxis: {
      labels: {
        formatter: function(val) {
          return val;
        }
      }
    },
    tooltip: {
      custom: function({ seriesIndex, dataPointIndex, w }) {
        const task = tasks.find(t => t.id === w.config.series[seriesIndex].data[dataPointIndex].taskId);
        if (!task) return '';
        
        return `
          <div class="apexcharts-tooltip-title">${task.title}</div>
          <div class="apexcharts-tooltip-series-group">
            <div class="apexcharts-tooltip-text">
              <div>Status: ${task.status}</div>
              <div>Progress: ${task.progress}%</div>
              <div>Assignee: ${task.assignedTo.name}</div>
              <div>Start: ${moment(task.startDate).format('MMM D, YYYY')}</div>
              <div>End: ${moment(task.endDate).format('MMM D, YYYY')}</div>
            </div>
          </div>
        `;
      }
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5
      }
    }
  };

  // Navigation route items
  const getRouteItems = () => [
    {
      title: "Back to Dashboard",
      icon: <HomeOutlined />,
      link: "/client/dashboard"
    },
    {
      title: "All Projects",
      icon: <ProjectOutlined />,
      link: "/client/dashboard/projects"
    }
  ];

  // Task Card Component
  const TaskCard = ({ task }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all border border-gray-100"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {task.tags.map((tag, index) => (
              <Tag key={index} color="blue" className="rounded-full text-xs">{tag}</Tag>
            ))}
          </div>
        </div>
        <Tag color={
          task.status === 'completed' ? 'success' :
          task.status === 'ongoing' ? 'processing' :
          task.status === 'review' ? 'warning' : 'default'
        }>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </Tag>
      </div>
      
      <p className="text-gray-600 mb-4 text-sm">{task.description}</p>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500">Assigned to</p>
          <div className="flex items-center mt-1">
            <Avatar 
              src={task.assignedTo.avatar} 
              size="small" 
              className="mr-1" 
            />
            <span className="text-sm">{task.assignedTo.name}</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500">Deadline</p>
          <div className="flex items-center mt-1 text-sm">
            <CalendarOutlined className="mr-1 text-teal-500" />
            {task.deadline}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500">Est. Hours</p>
          <div className="text-sm">{task.estimatedHours}h</div>
        </div>
        <div>
          <p className="text-xs text-gray-500">Logged Hours</p>
          <div className="text-sm">{task.loggedHours}h</div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium">{task.progress}%</span>
        </div>
        <Progress 
          percent={task.progress} 
          size="small" 
          strokeColor={getProgressColor(task.progress)}
          showInfo={false}
        />
      </div>
      
      <div className="flex justify-between pt-2 mt-2 border-t border-gray-100">
        <Button 
          type="text" 
          size="small" 
          icon={<EditOutlined />}
        >
          Edit
        </Button>
        {task.status !== 'completed' && (
          <Button
            type="primary"
            size="small"
            ghost
            icon={<ClockCircleOutlined />}
            onClick={() => startTimeTracking(task.id)}
          >
            Time Track
          </Button>
        )}
      </div>
    </motion.div>
  );

  // Milestone Card Component
  const MilestoneCard = ({ milestone }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{milestone.title}</h3>
        <Tag color={
          milestone.status === 'paid' ? 'success' :
          milestone.status === 'pending' ? 'processing' : 'default'
        }>
          {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
        </Tag>
      </div>
      
      <p className="text-gray-600 mb-4 text-sm">{milestone.description}</p>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500">Due Date</p>
          <div className="flex items-center mt-1 text-sm">
            <CalendarOutlined className="mr-1 text-teal-500" />
            {milestone.dueDate}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500">Amount</p>
          <div className="text-sm">{milestone.amount > 0 ? `$${milestone.amount}` : '-'}</div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium">{milestone.progress}%</span>
        </div>
        <Progress 
          percent={milestone.progress} 
          size="small" 
          strokeColor={getProgressColor(milestone.progress)}
          showInfo={false}
        />
      </div>
      
      <div className="flex justify-between pt-2 mt-2 border-t border-gray-100">
        <Button 
          type="text" 
          size="small" 
          icon={<EditOutlined />}
        >
          Edit
        </Button>
        {milestone.status === 'pending' && (
          <Button
            type="primary"
            size="small"
            ghost
            icon={<ClockCircleOutlined />}
            onClick={() => startTimeTracking(milestone.id)}
          >
            Time Track
          </Button>
        )}
      </div>
    </motion.div>
  );

  // Render main workspace content
  return (
    <div className="flex h-screen bg-[#F8FAFD]">
      <CSider
        userId={userId}
        role={role}
        dropdown={true}
        collapsed={true} 
        handleMenuClick={handleMenuClick}
        activeComponent={activeComponent}
        handleProfileMenu={handleProfileMenu}
        activeProfileComponent={activeProfileComponent}
      />

      <div className={`flex-1 flex flex-col overflow-hidden ${
        isMobile ? 'ml-0' : isTablet || isDesktop ? 'ml-14' : 'ml-64'
      }`}>
        <CHeader userId={userId} />
    
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-[#F8FAFD]">
          {/* Premium Breadcrumb Navigation */}
          <div className="flex items-center text-[#666666] text-sm mb-6">
            <span 
              onClick={() => navigate('/client/dashboard')} 
              className="hover:text-[#003366] cursor-pointer transition-colors duration-200"
            >
              Dashboard
            </span>
            <span className="mx-2 text-[#C0C0C0]">›</span>
            <span 
              onClick={() => navigate('/client/projects')} 
              className="hover:text-[#003366] cursor-pointer transition-colors duration-200"
            >
              Projects
            </span>
            <span className="mx-2 text-[#C0C0C0]">›</span>
            <span className="text-[#003366] font-medium">Workspace</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Enhanced Project Header */}
            <div className="bg-gradient-to-r from-[#003366] via-[#004B8F] to-[#0055B3] rounded-2xl shadow-xl overflow-hidden">
              <div className="backdrop-blur-sm bg-white/5 p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                      {project?.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-white/10 text-white text-sm px-4 py-1.5 rounded-full font-medium backdrop-blur-sm border border-white/10">
                  {project?.domain}
                </span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/90 text-sm font-medium flex items-center">
                        <UserOutlined className="mr-2" /> {project?.projectManager?.name}
                      </span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/90 text-sm font-medium">
                        Complexity: {project?.complexity}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isTrackingActive && (
                <Button 
                        className="bg-red-500 hover:bg-red-600 border-none text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  icon={<ClockCircleOutlined />}
                  onClick={() => Modal.confirm({
                    title: 'Stop Time Tracking',
                    content: (
                      <div>
                        <p>Current tracked time: {formatTrackingTime()}</p>
                        <Input 
                          placeholder="Description of work done" 
                          className="mt-3"
                          id="tracking-description"
                        />
                      </div>
                    ),
                    onOk: () => {
                      const descriptionInput = document.getElementById('tracking-description');
                      stopTimeTracking(descriptionInput ? descriptionInput.value : '');
                    }
                  })}
                >
                  {formatTrackingTime()}
                </Button>
              )}

                    <Button 
                      className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                      icon={<MessageOutlined />}
                      onClick={() => setIsChatOpen(!isChatOpen)}
                    >
                Chat
              </Button>

              <Button 
                      className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                icon={<GithubOutlined />}
                href={project?.repositoryUrl}
                target="_blank"
              >
                Repository
              </Button>

                    <Button 
                      className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                      icon={<SettingOutlined />}
                    >
                Settings
              </Button>
        </div>
      </div>

                {/* Enhanced Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A4B91] to-[#2A5CA8] flex items-center justify-center text-white shadow-lg">
                      <ProjectOutlined className="text-xl" />
                </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">Tasks</p>
                      <p className="text-white text-2xl font-bold">
                          {tasks.filter(t => t.status === 'completed').length}/{tasks.length}
                      </p>
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A4B91] to-[#2A5CA8] flex items-center justify-center text-white shadow-lg">
                      <DollarOutlined className="text-xl" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">Budget</p>
                      <p className="text-white text-2xl font-bold">
                    ${project?.amountPaid?.toLocaleString()}
                  </p>
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A4B91] to-[#2A5CA8] flex items-center justify-center text-white shadow-lg">
                      <CalendarOutlined className="text-xl" />
            </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">Timeline</p>
                      <p className="text-white text-2xl font-bold">
                        {Math.ceil((new Date(project?.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days
                      </p>
                </div>
                                    </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A4B91] to-[#2A5CA8] flex items-center justify-center text-white shadow-lg">
                      <TeamOutlined className="text-xl" />
            </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">Team</p>
                      <div className="flex items-center mt-1">
                        <Avatar.Group maxCount={3}>
                    {teamMembers.map(member => (
                            <Avatar 
                              key={member.id} 
                              src={member.avatar}
                              className="border-2 border-white/20"
                            />
                    ))}
                  </Avatar.Group>
              </div>
                    </div>
                  </div>
                </div>
              </div>
                    </div>

            {/* Enhanced Main Content Tabs */}
            <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden">
              <Tabs 
                activeKey={activeTab}
                onChange={setActiveTab}
                className="px-8 pt-6"
                items={[
                  {
                    key: 'overview',
                    label: (
                      <span className="flex items-center gap-2 px-3 py-1">
                        <BarChartOutlined />
                        Overview
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        {/* Overview Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Project Details */}
                          <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E7EB] hover:shadow-md transition-all duration-300">
                              <h3 className="text-lg font-semibold text-[#333333] mb-4">Project Description</h3>
                              <p className="text-[#666666] leading-relaxed">{project?.description}</p>
                            </div>

                            {/* Recent Activities */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E7EB] hover:shadow-md transition-all duration-300">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#333333]">Recent Activities</h3>
                                <Button 
                                  type="link" 
                                  className="text-[#003366] hover:text-[#0055B3]"
                                >
                                  View All
                                </Button>
                              </div>
                              <div className="space-y-4">
                                {/* Activity items with enhanced styling */}
                                <div className="flex items-start">
                                  <div className="w-8 h-8 rounded-full bg-[#E6F7FF] flex items-center justify-center mr-3 flex-shrink-0">
                                    <CheckCircleOutlined className="text-[#003366]" />
                                  </div>
                                  <div>
                                    <p className="text-[#333333] font-medium">Task "Design Homepage UI" marked as completed</p>
                                    <p className="text-[#666666] text-sm mt-1">Today at 2:34 PM • Jane Smith</p>
                                  </div>
                                </div>
                                {/* ... more activity items ... */}
                              </div>
                            </div>
                          </div>

                          {/* Sidebar: Upcoming & Stats */}
                          <div className="space-y-6">
                            {/* Upcoming Milestones */}
                            <div className="b
                            g-white rounded-xl shadow-sm p-6 border border-[#E5E7EB] hover:shadow-md transition-all duration-300">
                              <h3 className="text-lg font-semibold text-[#333333] mb-4">Upcoming Milestones</h3>
                              <div className="space-y-4">
                                {milestones.filter(m => !m.completed).slice(0, 2).map(milestone => (
                                  <div key={milestone.id} className="bg-[#F8FAFD] p-4 rounded-lg border border-[#E5E7EB] hover:border-[#003366] transition-all duration-300">
                                    <h4 className="font-medium text-[#333333]">{milestone.title}</h4>
                                    <div className="flex justify-between items-center mt-2">
                                      <div className="flex items-center text-[#666666] text-sm">
                                        <CalendarOutlined className="mr-1" />
                                        {milestone.dueDate}
                                      </div>
                                      {milestone.amount > 0 && (
                                        <div className="text-[#003366] font-medium">${milestone.amount.toLocaleString()}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                <Button 
                                  type="dashed" 
                                  block
                                  icon={<PlusOutlined />}
                                  onClick={() => setIsMilestoneModalVisible(true)}
                                  className="border-[#003366] text-[#003366] hover:text-[#0055B3] hover:border-[#0055B3]"
                                >
                                  Add Milestone
                                </Button>
                              </div>
                            </div>

                            {/* Project Stats */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E7EB] hover:shadow-md transition-all duration-300">
                              <h3 className="text-lg font-semibold text-[#333333] mb-4">Project Stats</h3>
                              <div className="space-y-4">
                                {/* ... existing stats with updated styling ... */}
                                  </div>
                                </div>
                                  </div>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'tasks',
                    label: (
                      <span className="flex items-center gap-2 px-2">
                        <CheckCircleOutlined />
                        Tasks
                      </span>
                    ),
                    children: (
                      <div className="p-6 bg-[#F8FAFD] rounded-b-xl">
                        {/* Premium Task Management Header */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                          <div>
                            <h3 className="text-2xl font-bold text-[#333333]">Task Management</h3>
                            <p className="text-sm text-[#666666] font-medium flex items-center mt-1">
                              <InfoCircleOutlined className="mr-2 text-[#003366]" />
                              Drag and drop tasks between columns to update their status
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <Dropdown
                              overlay={
                                <Menu>
                                  <Menu.Item key="all">All Tasks</Menu.Item>
                                  <Menu.Item key="mine">My Tasks</Menu.Item>
                                  <Menu.Item key="priority">By Priority</Menu.Item>
                                  <Menu.Item key="deadline">By Deadline</Menu.Item>
                                </Menu>
                              }
                              placement="bottomRight"
                              trigger={['click']}
                            >
                              <Button className="border-[#E5E7EB] text-[#666666] flex items-center">
                                <FilterOutlined className="mr-1" /> Filter <DownOutlined className="text-xs ml-1" />
                              </Button>
                            </Dropdown>
                            <Button 
                              type="primary"
                              className="bg-gradient-to-r from-[#003366] to-[#0055B3] border-none shadow-client-button hover:shadow-client-button-hover transition-all duration-300 flex items-center gap-2"
                              icon={<PlusOutlined />}
                              onClick={() => setIsTaskModalVisible(true)}
                            >
                              Add Task
                            </Button>
                          </div>
                        </div>
                        
                        {/* Condensed Task Stats Bar */}
                        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm mb-6 p-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#E5E7EB]">
                            <div className="flex items-center p-2">
                              <div className="w-8 h-8 rounded-lg bg-[#F0F4F8] flex items-center justify-center mr-2">
                                <CheckCircleOutlined className="text-[#003366] text-sm" />
                              </div>
                              <div>
                                <p className="text-xs text-[#666666]">Completed</p>
                                <p className="text-lg font-bold text-[#333333]">
                                  {tasks.filter(t => t.status === 'completed').length}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center p-2 pl-4">
                              <div className="w-8 h-8 rounded-lg bg-[#F0F4F8] flex items-center justify-center mr-2">
                                <SyncOutlined className="text-[#0055B3] text-sm" />
                              </div>
                              <div>
                                <p className="text-xs text-[#666666]">In Progress</p>
                                <p className="text-lg font-bold text-[#333333]">
                                  {tasks.filter(t => t.status === 'ongoing').length}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center p-2 pl-4">
                              <div className="w-8 h-8 rounded-lg bg-[#F0F4F8] flex items-center justify-center mr-2">
                                <ClockCircleOutlined className="text-[#C0C0C0] text-sm" />
                              </div>
                              <div>
                                <p className="text-xs text-[#666666]">Hours</p>
                                <p className="text-lg font-bold text-[#333333]">
                                  {tasks.reduce((total, task) => total + (task.loggedHours || 0), 0)}h
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center p-2 pl-4">
                              <div className="w-8 h-8 rounded-lg bg-[#F0F4F8] flex items-center justify-center mr-2">
                                <ArrowUpOutlined className="text-[#003366] text-sm" />
                              </div>
                              <div>
                                <p className="text-xs text-[#666666]">Completion</p>
                                <p className="text-lg font-bold text-[#333333]">
                                  {tasks.length ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Kanban Board - with less card repetition */}
                        <DragDropContext onDragEnd={onDragEnd}>
                          <div className="flex space-x-4 overflow-x-auto pb-6 custom-scrollbar">
                            {columnOrder.map(columnId => {
                              const column = taskColumns[columnId];
                              const columnTasks = column.taskIds
                                .map(taskId => getTaskById(taskId))
                                .filter(Boolean);
                              
                              return (
                                <div 
                                  key={columnId} 
                                  className={`rounded-xl min-w-[320px] w-1/4 flex-shrink-0 border overflow-hidden ${
                                    columnId === 'pending' ? 'border-[#C0C0C0]/30 bg-gradient-to-b from-[#F8FAFD] to-white' : 
                                    columnId === 'ongoing' ? 'border-[#0055B3]/30 bg-gradient-to-b from-[#F0F7FF] to-white' : 
                                    columnId === 'review' ? 'border-[#F59E0B]/30 bg-gradient-to-b from-[#FFFBEB] to-white' : 
                                    'border-[#10B981]/30 bg-gradient-to-b from-[#F0FDF4] to-white'
                                  } shadow-sm transition-all duration-300`}
                                >
                                  <div className={`flex justify-between items-center p-3 border-b ${
                                    columnId === 'pending' ? 'border-[#C0C0C0]/30 bg-[#F9FAFB]' : 
                                    columnId === 'ongoing' ? 'border-[#0055B3]/30 bg-[#F0F7FF]' : 
                                    columnId === 'review' ? 'border-[#F59E0B]/30 bg-[#FFFBEB]' : 
                                    'border-[#10B981]/30 bg-[#F0FDF4]'
                                  }`}>
                                    <h3 className="font-medium text-base flex items-center text-[#333333]">
                                      <span className={`w-2.5 h-2.5 rounded-full mr-2 ${
                                        columnId === 'pending' ? 'bg-[#C0C0C0]' : 
                                        columnId === 'ongoing' ? 'bg-[#0055B3]' : 
                                        columnId === 'review' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                                      }`}></span>
                                      {column.title} 
                                    </h3>
                                    <Badge 
                                      count={columnTasks.length} 
                                      size="small"
                                      style={{ 
                                        backgroundColor: 
                                          columnId === 'pending' ? '#C0C0C0' : 
                                          columnId === 'ongoing' ? '#0055B3' : 
                                          columnId === 'review' ? '#F59E0B' : '#10B981'
                                      }} 
                                    />
                                  </div>

                                  <div className="px-2">
                                    <div className="flex justify-between items-center py-2 px-1 text-xs text-[#666666]">
                                      <span>{columnTasks.length === 0 ? 'No tasks' : `${columnTasks.length} task${columnTasks.length !== 1 ? 's' : ''}`}</span>
                                      <Button 
                                        type="link" 
                                        size="small" 
                                        className="text-[#003366] hover:bg-transparent p-0 h-auto flex items-center"
                                        onClick={() => setIsTaskModalVisible(true)}
                                      >
                                        <PlusOutlined className="text-[10px] mr-1" /> Add
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <Droppable droppableId={columnId}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`min-h-[calc(100vh-450px)] p-2 transition-all duration-300 ${
                                          snapshot.isDraggingOver ? 'bg-[#003366]/5' : ''
                                        }`}
                                      >
                                        <AnimatePresence>
                                          {columnTasks.map((task, index) => (
                                            <Draggable 
                                              key={task.id} 
                                              draggableId={task.id.toString()} 
                                              index={index}
                                            >
                                              {(provided, snapshot) => (
                                                <motion.div
                                                  initial={{ opacity: 0, y: 10 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  exit={{ opacity: 0, scale: 0.95 }}
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  className={`bg-white rounded-lg p-3 mb-2 border
                                                    ${
                                                      task.priority === 'high' ? 'border-l-4 border-l-red-500 border-t-[#E5E7EB] border-r-[#E5E7EB] border-b-[#E5E7EB]' : 
                                                      task.priority === 'medium' ? 'border-l-4 border-l-yellow-500 border-t-[#E5E7EB] border-r-[#E5E7EB] border-b-[#E5E7EB]' : 
                                                      'border-l-4 border-l-green-500 border-t-[#E5E7EB] border-r-[#E5E7EB] border-b-[#E5E7EB]'
                                                    }
                                                    ${snapshot.isDragging ? 'shadow-md bg-[#FAFBFC]' : 'shadow-sm hover:shadow-md'}
                                                    transform transition-all duration-200 hover:-translate-y-1`}
                                                >
                                                  {/* Simplified Task Card Layout */}
                                                  <div className="flex justify-between items-start">
                                                    <h4 className="text-[15px] font-medium text-[#333333] line-clamp-2 mb-1">{task.title}</h4>
                                                    <div className="ml-2 flex-shrink-0">
                                                      <Tag 
                                                        className={`text-xs rounded-full px-2 py-0.5 border-0 font-medium ${
                                                          task.status === 'completed' ? 'bg-[#F0FDF4] text-[#10B981]' : 
                                                          task.status === 'ongoing' ? 'bg-[#EFF6FF] text-[#3B82F6]' : 
                                                          task.status === 'review' ? 'bg-[#FFFBEB] text-[#F59E0B]' : 
                                                          'bg-[#F9FAFB] text-[#6B7280]'
                                                        }`}
                                                      >
                                                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                      </Tag>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Task Description - only show if not empty */}
                                                  {task.description && (
                                                    <p className="text-[#666666] text-xs line-clamp-2 mb-2">{task.description}</p>
                                                  )}
                                                  
                                                  {/* Tags in a more compact format */}
                                                  {task.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 my-2">
                                                      {task.tags.map((tag, index) => (
                                                        <span 
                                                          key={index} 
                                                          className="rounded-full text-[10px] px-2 py-0.5 bg-[#F0F4F8] text-[#003366]"
                                                        >
                                                          {tag}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  )}
                                                  
                                                  {/* Task Info Section */}
                                                  <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                                                    <div className="flex items-center text-[#666666]">
                                                      <UserOutlined className="mr-1 text-[#003366]" />
                                                      <span className="truncate">{task.assignedTo.name}</span>
                                                    </div>
                                                    <div className="flex items-center text-[#666666]">
                                                      <CalendarOutlined className="mr-1 text-[#003366]" />
                                                      <span>{task.deadline}</span>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Progress Bar */}
                                                  <div className="mb-2">
                                                    <div className="h-1.5 w-full bg-[#F0F4F8] rounded-full overflow-hidden">
                                                      <div 
                                                        className="h-full bg-gradient-to-r from-[#003366] to-[#0055B3] rounded-full"
                                                        style={{ width: `${task.progress}%` }}  
                                                      ></div>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Footer with hours and actions */}
                                                  <div className="flex justify-between items-center pt-1 mt-1 text-xs border-t border-[#F0F4F8]">
                                                    <div className="flex items-center gap-2 text-[#666666]">
                                                      <span>{task.estimatedHours}h est.</span>
                                                      <span className="text-[#E5E7EB]">|</span>
                                                      <span>{task.loggedHours}h logged</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center">
                                                      {task.status !== 'completed' && (
                                                        <Tooltip title="Track Time">
                                                          <Button
                                                            type="link"
                                                            size="small"
                                                            icon={<ClockCircleOutlined />}
                                                            onClick={() => startTimeTracking(task.id)}
                                                            className="text-[#003366] hover:text-[#0055B3] p-0 h-auto"
                                                          />
                                                        </Tooltip>
                                                      )}
                                                      <Tooltip title="More">
                                                        <Dropdown 
                                                          overlay={
                                                            <Menu>
                                                              <Menu.Item key="edit" icon={<EditOutlined />}>Edit</Menu.Item>
                                                              <Menu.Item key="view" icon={<EyeOutlined />}>View Details</Menu.Item>
                                                              <Menu.Item key="comment" icon={<MessageOutlined />}>Add Comment</Menu.Item>
                                                              <Menu.Divider />
                                                              <Menu.Item key="complete" icon={<CheckOutlined />} disabled={task.status === 'completed'}>
                                                                Mark Complete
                                                              </Menu.Item>
                                                            </Menu>
                                                          }
                                                          trigger={['click']}
                                                          placement="bottomRight"
                                                        >
                                                          <Button
                                                            type="link"
                                                            size="small"
                                                            icon={<EllipsisOutlined />}
                                                            className="text-[#666666] hover:text-[#333333] p-0 h-auto"
                                                          />
                                                        </Dropdown>
                                                      </Tooltip>
                                                    </div>
                                                  </div>
                                                </motion.div>
                                              )}
                                            </Draggable>
                                          ))}
                                        </AnimatePresence>
                                        {provided.placeholder}
                                        
                                        {/* Empty state - simplified */}
                                        {columnTasks.length === 0 && (
                                          <div className="flex flex-col items-center justify-center py-8 text-center text-[#999999] text-sm italic">
                                            No tasks here yet
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Droppable>
                                </div>
                              );
                            })}
                          </div>
                        </DragDropContext>
                      </div>
                    )
                  },
                  {
                    key: 'milestones',
                    label: (
                      <span className="flex items-center gap-2 px-2">
                        <ClockCircleOutlined />
                        Milestones
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        {/* Enhanced Milestones Header */}
                        <div className="mb-8 flex justify-between items-center">
                          <div>
                            <h3 className="text-2xl font-bold text-[#333333] mb-2">Project Milestones</h3>
                            <p className="text-sm text-[#666666] mt-2 font-medium flex items-center">
                              <ClockCircleOutlined className="mr-2 text-[#003366]" />
                              Track project progress, deliverables and payment schedule
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              count={`${milestones.filter(m => m.completed).length}/${milestones.length}`} 
                              style={{ backgroundColor: '#003366', fontWeight: 'medium' }}
                            />
                          <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => setIsMilestoneModalVisible(true)}
                              className="bg-gradient-to-r from-[#003366] to-[#0055B3] border-none shadow-client-button hover:shadow-client-button-hover transition-all duration-300"
                          >
                            Add Milestone
                          </Button>
                          </div>
                        </div>

                        {/* Enhanced Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                          <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003366] to-[#0055B3] flex items-center justify-center mr-3 text-white shadow-sm">
                                <CheckCircleOutlined className="text-lg" />
                              </div>
                              <div>
                                <p className="text-xs text-[#666666] font-medium">Completed</p>
                                <p className="text-xl font-bold text-[#333333]">
                                  {milestones.filter(m => m.completed).length}/{milestones.length}
                                </p>
                              </div>
                              <div className="ml-auto">
                                <Progress 
                                  type="circle" 
                                  percent={milestones.length ? 
                                    Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100) : 0
                                  } 
                                  width={40} 
                                  strokeColor={{
                                    '0%': '#003366',
                                    '100%': '#0055B3'
                                  }}
                                  strokeWidth={10}
                                  trailColor="#F0F4F8"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003366] to-[#0055B3] flex items-center justify-center mr-3 text-white shadow-sm">
                                <DollarOutlined className="text-lg" />
                              </div>
                              <div>
                                <p className="text-xs text-[#666666] font-medium">Payment Status</p>
                                <p className="text-xl font-bold text-[#333333]">
                                  ${milestones.filter(m => m.status === 'paid').reduce((total, m) => total + (m.amount || 0), 0).toLocaleString()}
                                </p>
                              </div>
                              <div className="ml-auto">
                                <div className="text-xs text-[#666666] font-medium text-right">
                                  of ${milestones.reduce((total, m) => total + (m.amount || 0), 0).toLocaleString()}
                                </div>
                                <div className="text-sm font-medium text-[#10B981] mt-1 flex items-center justify-end">
                                  <ArrowUpOutlined className="mr-1" />
                                  {milestones.reduce((total, m) => total + (m.amount || 0), 0) > 0 
                                    ? Math.round((milestones.filter(m => m.status === 'paid').reduce((total, m) => total + (m.amount || 0), 0) / 
                                      milestones.reduce((total, m) => total + (m.amount || 0), 0)) * 100) 
                                    : 0}%
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003366] to-[#0055B3] flex items-center justify-center mr-3 text-white shadow-sm">
                                <CalendarOutlined className="text-lg" />
                              </div>
                              <div>
                                <p className="text-xs text-[#666666] font-medium">Next Milestone</p>
                                {milestones.filter(m => !m.completed).length > 0 ? (
                                  <>
                                    <p className="text-md font-bold text-[#333333] truncate max-w-[120px]">
                                      {milestones.filter(m => !m.completed)[0]?.title}
                                    </p>
                                    <p className="text-xs text-[#666666]">
                                      {milestones.filter(m => !m.completed)[0]?.dueDate}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-md font-medium text-[#666666]">All completed</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Timeline View */}
                        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-client-md overflow-hidden mb-8">
                          {/* Milestone Timeline */}
                          <div className="relative pt-12 pb-8 px-8 bg-[#F8FAFD]">
                            <div className="flex items-center justify-between mb-6">
                              <h4 className="text-lg font-semibold text-[#333333]">Project Timeline</h4>
                              <div className="flex items-center text-sm text-[#666666]">
                                <span className="flex items-center mr-4">
                                  <span className="inline-block w-3 h-3 bg-[#003366] rounded-full mr-2"></span>
                                  Completed
                                </span>
                                <span className="flex items-center">
                                  <span className="inline-block w-3 h-3 bg-[#E5E7EB] rounded-full mr-2"></span>
                                  Pending
                                </span>
                              </div>
                            </div>

                            {/* Enhanced Progress Bar with Gradient and Animation */}
                            <div className="absolute top-28 left-8 right-8 h-2 bg-[#EFF1F5] rounded-full overflow-hidden shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: `${milestones.length ? 
                                    (milestones.filter(m => m.completed).length / milestones.length) * 100 : 0}%` 
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-[#003366] via-[#0055B3] to-[#0074D9] rounded-full shadow-sm"
                              />
                              
                              {/* Milestone Markers on Progress Bar */}
                              {milestones.map((_, index) => (
                                <div 
                                  key={index}
                                  className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full shadow-sm"
                                  style={{ 
                                    left: `${((index + 1) / milestones.length) * 100}%`,
                                    transform: 'translateX(-50%) translateY(-50%)',
                                    zIndex: 1
                                  }}
                                />
                              ))}
                            </div>

                            <div className="flex justify-between relative z-10">
                              {milestones.map((milestone, index) => (
                                <div key={milestone.id} className="flex flex-col items-center">
                                  {/* Enhanced Professional Milestone Icons */}
                                  <motion.div 
                                    whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0, 51, 102, 0.15)' }}
                                    className={`
                                      w-16 h-16 rounded-xl flex items-center justify-center
                                      transition-all duration-300 relative overflow-hidden
                                      ${milestone.completed 
                                        ? 'bg-gradient-to-br from-[#003366] to-[#0055B3]' 
                                        : 'bg-white border-2 border-[#E5E7EB]'}
                                    `}
                                    style={{
                                      boxShadow: milestone.completed 
                                        ? '0 6px 12px rgba(0, 51, 102, 0.15)' 
                                        : '0 4px 8px rgba(0, 0, 0, 0.05)'
                                    }}
                                  >
                                    {/* Decorative Background Pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                      <div className={`
                                        w-24 h-24 rounded-full absolute -top-12 -left-12
                                        ${milestone.completed ? 'bg-white' : 'bg-[#003366]'}
                                      `}></div>
                                      <div className={`
                                        w-16 h-16 rounded-full absolute -bottom-8 -right-8
                                        ${milestone.completed ? 'bg-white' : 'bg-[#003366]'}
                                      `}></div>
                                    </div>
                                    
                                    {/* Icon or Number */}
                                    {milestone.completed ? (
                                      <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        <CheckCircleFilled className="text-2xl text-white" />
                                      </motion.div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center">
                                        <div className="text-lg font-bold text-[#003366]">{index + 1}</div>
                                        <div className="text-[10px] text-[#666666] mt-0.5">
                                          {milestone.milestone_type === 'payment' ? 'PAYMENT' : 
                                          milestone.milestone_type === 'progress' ? 'PROGRESS' : 'HYBRID'}
                                        </div>
                                      </div>
                                    )}
                                  
                                    {/* Status Indicator */}
                                    <div className={`
                                      absolute -bottom-1 -right-1 w-6 h-6 rounded-md
                                      flex items-center justify-center
                                      ${milestone.completed 
                                        ? 'bg-[#10B981] text-white' 
                                        : milestone.status === 'pending' 
                                          ? 'bg-[#F59E0B] text-white' 
                                          : 'bg-[#3B82F6] text-white'}
                                      shadow-sm transform rotate-12
                                    `}>
                                      {milestone.completed ? (
                                        <CheckOutlined className="text-xs" />
                                      ) : milestone.status === 'pending' ? (
                                        <ClockCircleOutlined className="text-xs" />
                                      ) : (
                                        <HourglassOutlined className="text-xs" />
                                      )}
                                    </div>
                                  </motion.div>
                                  
                                  {/* Connection Line to Progress Bar */}
                                  <div className="h-6 w-px bg-gradient-to-b from-transparent via-[#E5E7EB] to-[#E5E7EB] my-1"></div>
                                  
                                  <div className="mt-6 w-48 text-center">
                                    <Badge 
                                      color={milestone.completed ? '#10B981' : '#F59E0B'} 
                                      text={milestone.completed ? 'Completed' : 'Pending'} 
                                      className="mb-2"
                                    />
                                    <p className="font-semibold text-[#333333] mb-1">{milestone.title}</p>
                                    <p className="text-sm text-[#666666] mb-2 flex items-center justify-center">
                                      <CalendarOutlined className="mr-1" /> {milestone.dueDate}
                                    </p>
                                    {milestone.amount > 0 && (
                                      <p className="text-[#003366] font-semibold mb-3">${milestone.amount.toLocaleString()}</p>
                                    )}
                                    <div>
                                      <Button 
                                        type={milestone.completed ? "default" : "primary"} 
                                        size="small"
                                        disabled={milestone.completed}
                                        onClick={() => completeMilestone(milestone.id)}
                                        className={milestone.completed ? 
                                          "bg-[#F0F4F8] text-[#666666]" : 
                                          "bg-gradient-to-r from-[#003366] to-[#0055B3] text-white border-none shadow-client-sm hover:shadow-client-md"
                                        }
                                      >
                                        {milestone.completed ? "Completed" : "Mark Complete"}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Milestone Table View */}
                        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-client-md overflow-hidden">
                          <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                              <h4 className="text-lg font-semibold text-[#333333]">Milestone Details</h4>
                              <div className="flex items-center gap-2">
                                <Select 
                                  defaultValue="all" 
                                  style={{ width: 130 }}
                                  size="small"
                                  className="rounded-lg"
                                >
                                  <Select.Option value="all">All Milestones</Select.Option>
                                  <Select.Option value="pending">Pending</Select.Option>
                                  <Select.Option value="completed">Completed</Select.Option>
                                  <Select.Option value="paid">Paid</Select.Option>
                                </Select>
                                <Tooltip title="Export as CSV">
                                  <Button 
                                    type="default" 
                                    size="small" 
                                    icon={<DownloadOutlined />}
                                    className="border-[#E5E7EB] hover:border-[#003366] hover:text-[#003366]"
                                  />
                                </Tooltip>
                              </div>
                            </div>
                            
                            <table className="w-full">
                              <thead className="bg-[#F8FAFD]">
                                <tr className="border-b border-[#E5E7EB]">
                                  <th className="py-3 px-4 font-semibold text-[#666666] text-left text-sm">Milestone</th>
                                  <th className="py-3 px-4 font-semibold text-[#666666] text-left text-sm">Due Date</th>
                                  <th className="py-3 px-4 font-semibold text-[#666666] text-left text-sm">Amount</th>
                                  <th className="py-3 px-4 font-semibold text-[#666666] text-left text-sm">Status</th>
                                  <th className="py-3 px-4 font-semibold text-[#666666] text-left text-sm">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {milestones.map(milestone => (
                                  <tr key={milestone.id} className="border-b border-[#E5E7EB] hover:bg-[#F8FAFD]/50 transition-colors duration-200">
                                    <td className="py-4 px-4">
                                      <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-white ${
                                          milestone.completed ? 'bg-gradient-to-br from-[#003366] to-[#0055B3]' : 'bg-[#F0F4F8] text-[#666666]'
                                        }`}>
                                          {milestone.completed ? <CheckCircleOutlined /> : (milestones.indexOf(milestone) + 1)}
                                        </div>
                                        <div>
                                          <div className="font-medium text-[#333333]">{milestone.title}</div>
                                          <div className="text-xs text-[#666666] mt-1">
                                            {milestone.milestone_type === 'payment' ? 'Payment Milestone' : 
                                            milestone.milestone_type === 'progress' ? 'Progress Milestone' : 'Hybrid Milestone'}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="flex items-center text-[#666666]">
                                        <CalendarOutlined className="mr-2 text-[#003366]" />
                                        {milestone.dueDate}
                                      </div>
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="font-medium text-[#333333]">
                                        {milestone.amount > 0 ? `$${milestone.amount.toLocaleString()}` : '-'}
                                      </div>
                                      {milestone.amount > 0 && milestone.status === 'paid' && (
                                        <div className="text-xs text-[#10B981] mt-1">Paid</div>
                                      )}
                                    </td>
                                    <td className="py-4 px-4">
                                      <Tag className={`rounded-full px-3 py-1 text-sm font-medium ${
                                        milestone.status === 'paid' ? 'bg-[#F0FDF4] text-[#10B981] border-[#D1FAE5]' :
                                        milestone.status === 'pending' ? 'bg-[#FFFBEB] text-[#F59E0B] border-[#FEF3C7]' :
                                        'bg-[#EFF6FF] text-[#3B82F6] border-[#DBEAFE]'
                                      }`}>
                                        {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                                      </Tag>
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="flex space-x-2">
                                        <Tooltip title="Edit Milestone">
                                          <Button 
                                            type="text" 
                                            icon={<EditOutlined />} 
                                            size="small"
                                            className="hover:text-[#003366] hover:bg-[#F0F4F8]"
                                          />
                                        </Tooltip>
                                        {!milestone.completed && (
                                          <Tooltip title="Mark as Complete">
                                            <Button 
                                              type="text" 
                                              icon={<CheckOutlined />} 
                                              size="small"
                                              onClick={() => completeMilestone(milestone.id)}
                                              className="hover:text-[#10B981] hover:bg-[#F0FDF4]"
                                            />
                                          </Tooltip>
                                        )}
                                        <Tooltip title="Delete">
                                          <Button 
                                            type="text" 
                                            icon={<DeleteOutlined />} 
                                            size="small" 
                                            danger 
                                            className="hover:bg-[#FEF2F2]"
                                          />
                                        </Tooltip>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'files',
                    label: (
                      <span className="flex items-center gap-2 px-2">
                        <FileOutlined />
                        Files
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        {/* Enhanced Files Header */}
                        <div className="mb-8 flex justify-between items-center">
                          <div>
                            <h3 className="text-2xl font-bold text-[#333333] mb-2">Project Documents</h3>
                            <p className="text-sm text-[#666666] mt-2 font-medium flex items-center">
                              <FaRegFileAlt  className="mr-2 text-[#003366]" />
                              Manage, share and organize project files securely
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Select 
                              defaultValue="all" 
                              style={{ width: 120 }}
                              className="rounded-lg border-[#E5E7EB]"
                            >
                              <Select.Option value="all">All Files</Select.Option>
                              <Select.Option value="images">Images</Select.Option>
                              <Select.Option value="documents">Documents</Select.Option>
                              <Select.Option value="spreadsheets">Spreadsheets</Select.Option>
                            </Select>
                            <Button 
                              type="primary" 
                              icon={<UploadOutlined />}
                              className="bg-gradient-to-r from-[#003366] to-[#0055B3] border-none shadow-client-button hover:shadow-client-button-hover transition-all duration-300"
                            >
                              Upload Files
                            </Button>
                          </div>
                        </div>

                        {/* File Storage Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                          <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003366] to-[#0055B3] flex items-center justify-center mr-3 text-white shadow-sm">
                                <InboxOutlined className="text-lg" />
                              </div>
                              <div>
                                <p className="text-xs text-[#666666] font-medium">Total Storage</p>
                                <p className="text-xl font-bold text-[#333333]">
                                  {(projectFiles.reduce((total, file) => total + parseFloat(file.size), 0)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003366] to-[#0055B3] flex items-center justify-center mr-3 text-white shadow-sm">
                                <FaRegFileAlt className="text-lg" />
                              </div>
                              <div>
                                <p className="text-xs text-[#666666] font-medium">Documents</p>
                                <p className="text-xl font-bold text-[#333333]">
                                  {projectFiles.filter(file => file.type === 'document').length}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003366] to-[#0055B3] flex items-center justify-center mr-3 text-white shadow-sm">
                                <SlPicture  className="text-lg" />
                              </div>
                              <div>
                                <p className="text-xs text-[#666666] font-medium">Images</p>
                                <p className="text-xl font-bold text-[#333333]">
                                  {projectFiles.filter(file => file.type === 'image').length}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003366] to-[#0055B3] flex items-center justify-center mr-3 text-white shadow-sm">
                                <TeamOutlined className="text-lg" />
                              </div>
                              <div>
                                <p className="text-xs text-[#666666] font-medium">Contributors</p>
                                <p className="text-xl font-bold text-[#333333]">
                                  {new Set(projectFiles.map(file => file.uploadedBy)).size}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-client-md overflow-hidden">
                          {/* Enhanced File Upload Area */}
                          <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl m-6 p-8 text-center bg-[#F8FAFD] hover:bg-[#F0F4F8] transition-all duration-300 cursor-pointer group">
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="w-16 h-16 bg-gradient-to-br from-[#003366]/10 to-[#0055B3]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-[#003366]/20 group-hover:to-[#0055B3]/20 transition-all duration-300"
                            >
                              <InboxOutlined className="text-3xl text-[#003366]" />
                            </motion.div>
                            <p className="text-[#333333] font-medium mb-1">
                              Drag files here or <span className="text-[#003366] cursor-pointer hover:text-[#0055B3] transition-colors">browse</span> to upload
                            </p>
                            <p className="text-sm text-[#666666]">
                              Supports: Images, PDFs, Word documents, Excel sheets, and more
                            </p>
                            <div className="mt-4 text-xs text-[#666666] flex items-center justify-center">
                              <LockOutlined className="mr-1 text-[#003366]" /> 
                              Files are securely stored and accessible only to project members
                            </div>
                          </div>

                          {/* Enhanced Files List with Tabs */}
                          <Tabs 
                            defaultActiveKey="recent" 
                            className="px-6"
                            tabBarStyle={{ 
                              marginBottom: '16px',
                              borderBottom: '1px solid #E5E7EB'
                            }}
                          >
                            <Tabs.TabPane 
                              tab={<span className="flex items-center"><ClockCircleOutlined className="mr-1" /> Recent</span>} 
                              key="recent"
                            >
                              <div className="pb-6">
                                <div className="flex justify-between items-center mb-4">
                                  <Input.Search 
                                    placeholder="Search files..." 
                                    style={{ width: 250 }} 
                                    className="rounded-lg"
                                  />
                                  <div className="flex items-center gap-2 text-[#666666] text-sm">
                                    <span>Sort by:</span>
                                    <Select 
                                      defaultValue="date" 
                                      style={{ width: 120 }}
                                      size="small"
                                      className="rounded-lg"
                                    >
                                      <Select.Option value="date">Date</Select.Option>
                                      <Select.Option value="name">Name</Select.Option>
                                      <Select.Option value="size">Size</Select.Option>
                                      <Select.Option value="type">Type</Select.Option>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  {projectFiles.map(file => (
                                    <motion.div 
                                      key={file.id} 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="flex items-center p-4 border border-[#E5E7EB] rounded-xl bg-white hover:border-[#003366]/20 hover:shadow-client-sm transition-all duration-300"
                                    >
                                      <div className="relative w-12 h-12 bg-gradient-to-br from-[#003366]/10 to-[#0055B3]/10 rounded-xl flex items-center justify-center mr-4">
                                        {file.type === 'image' ? (
                                          <SlPicture  className="text-xl text-[#003366]" />
                                        ) : file.type === 'document' ? (
                                          <FileTextOutlined className="text-xl text-[#003366]" />
                                        ) : file.type === 'spreadsheet' ? (
                                          <TableOutlined className="text-xl text-[#003366]" />
                                        ) : (
                                          <FileOutlined className="text-xl text-[#003366]" />
                                        )}
                                        
                                        {/* File Type Badge */}
                                        <div className="absolute -bottom-1 -right-1 text-[10px] bg-[#F0F4F8] text-[#003366] px-1 rounded border border-[#E5E7EB] font-medium uppercase">
                                          {file.extension}
                                        </div>
                                      </div>
                                      
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-[#333333] truncate">{file.name}</div>
                                        <div className="text-sm text-[#666666] flex items-center flex-wrap gap-2 mt-1">
                                          <span className="flex items-center">
                                            <FileOutlined className="mr-1 text-[#003366]" /> {file.size} MB
                                          </span>
                                          <span className="text-[#E5E7EB]">•</span>
                                          <span className="flex items-center">
                                            <UserOutlined className="mr-1 text-[#003366]" /> {file.uploadedBy}
                                          </span>
                                          <span className="text-[#E5E7EB]">•</span>
                                          <span className="flex items-center">
                                            <CalendarOutlined className="mr-1 text-[#003366]" /> {file.date}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex space-x-2 ml-4">
                                        <Tooltip title="Preview">
                                          <Button 
                                            type="text" 
                                            icon={<EyeOutlined />} 
                                            size="small"
                                            className="hover:text-[#003366] hover:bg-[#F0F4F8]"
                                          />
                                        </Tooltip>
                                        <Tooltip title="Download">
                                          <Button 
                                            type="text" 
                                            icon={<DownloadOutlined />} 
                                            size="small"
                                            className="hover:text-[#003366] hover:bg-[#F0F4F8]"
                                          />
                                        </Tooltip>
                                        <Tooltip title="Share">
                                          <Button 
                                            type="text" 
                                            icon={<ShareAltOutlined />} 
                                            size="small"
                                            className="hover:text-[#003366] hover:bg-[#F0F4F8]"
                                          />
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                          <Button 
                                            type="text" 
                                            icon={<DeleteOutlined />} 
                                            size="small"
                                            className="hover:text-red-500 hover:bg-red-50"
                                          />
                                        </Tooltip>
                                      </div>
                                    </motion.div>
                                  ))}
                                  
                                  {/* Empty State for Files */}
                                  {projectFiles.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                      <div className="bg-[#F0F4F8] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                        <InboxOutlined className="text-2xl text-[#003366]" />
                                      </div>
                                      <p className="text-[#333333] font-medium">No files uploaded yet</p>
                                      <p className="text-sm text-[#666666] mt-1 mb-4">Upload files to get started</p>
                                      <Button 
                                        type="primary" 
                                        icon={<UploadOutlined />}
                                        className="bg-gradient-to-r from-[#003366] to-[#0055B3] border-none shadow-client-sm hover:shadow-client-md transition-all duration-300"
                                      >
                                        Upload First File
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Pagination for Files */}
                                {projectFiles.length > 0 && (
                                  <div className="flex justify-end mt-6">
                                    <Pagination 
                                      defaultCurrent={1} 
                                      total={projectFiles.length} 
                                      size="small"
                                      pageSize={5}
                                      showSizeChanger={false}
                                    />
                                  </div>
                                )}
                              </div>
                            </Tabs.TabPane>
                            
                            <Tabs.TabPane 
                              tab={<span className="flex items-center"><StarOutlined className="mr-1" /> Favorites</span>} 
                              key="favorites"
                            >
                              <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="bg-[#F0F4F8] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                  <StarOutlined className="text-2xl text-[#003366]" />
                                </div>
                                <p className="text-[#333333] font-medium">No favorite files yet</p>
                                <p className="text-sm text-[#666666] mt-1">
                                  Mark important files as favorites for quick access
                                </p>
                              </div>
                            </Tabs.TabPane>
                            
                            <Tabs.TabPane 
                              tab={<span className="flex items-center"><TeamOutlined className="mr-1" /> Shared</span>} 
                              key="shared"
                            >
                              <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="bg-[#F0F4F8] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                  <TeamOutlined className="text-2xl text-[#003366]" />
                                </div>
                                <p className="text-[#333333] font-medium">No shared files yet</p>
                                <p className="text-sm text-[#666666] mt-1">
                                  Files shared with team members will appear here
                                </p>
                              </div>
                            </Tabs.TabPane>
                          </Tabs>
                        </div>
                      </div>
                    )
                  },
                ]}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Chat Drawer */}
      <AnimatePresence>
      {isChatOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed right-0 top-0 h-screen w-80 bg-white shadow-2xl border-l border-[#E5E7EB] z-50"
        >
            {/* ... chat content with updated styling ... */}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Enhanced Custom Styles */}
      <style jsx global>{`
        .ant-tabs-nav {
          margin-bottom: 0 !important;
        }

        .ant-tabs-tab {
          padding: 12px 0;
          margin: 0 16px;
          transition: all 0.3s ease;
        }

        .ant-tabs-tab-active {
          color: #003366 !important;
        }

        .ant-tabs-ink-bar {
          background: #003366 !important;
        }

        .ant-progress-bg {
          background: linear-gradient(to right, #003366, #0055B3);
        }

        .ant-btn {
          border-radius: 0.75rem;
          height: 2.75rem;
          padding: 0 1.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .ant-btn-primary {
          background: linear-gradient(to right, #003366, #0055B3);
          border: none;
          box-shadow: 0 2px 4px rgba(0, 51, 102, 0.1);
        }

        .ant-btn-primary:hover {
          background: linear-gradient(to right, #002952, #004799);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 51, 102, 0.15);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F8FAFD;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E0;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A0AEC0;
        }
      `}</style>
    </div>
  );
};

export default ProjectWorkSpace;