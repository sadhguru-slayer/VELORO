import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Input, InputNumber, DatePicker, Form, Badge, 
  Tag, Divider, Alert, Tabs, Collapse, Space, Avatar, Empty, Checkbox, Radio, Upload,
  List, Tooltip, Switch, Modal, Progress } from 'antd';
import { DollarOutlined, CalendarOutlined, FileTextOutlined, CheckCircleOutlined, 
  RightOutlined, SendOutlined, LockOutlined, UploadOutlined, LinkOutlined,
  PaperClipOutlined, ClockCircleOutlined, DeleteOutlined, EyeOutlined,
  ArrowRightOutlined, StarOutlined, InfoCircleOutlined, TrophyOutlined, DownloadOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import { useMediaQuery } from 'react-responsive';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Dragger } = Upload;

// Dummy data based on models
const dummyProject = {
  id: 1,
  title: "E-commerce Platform Development",
  description: "Build a full-stack e-commerce platform with React frontend and Node.js backend",
  budget: 250000,
  deadline: "2024-03-15",
  is_collaborative: true,
  allowsHourly: true,
  clientRating: 4.8,
  clientCompletedProjects: 15,
  tasks: [
    {
      id: 1,
      title: "Frontend Development",
      budget: 120000,
      estimatedHours: 120,
      description: "Develop responsive UI components with React and implement state management",
      skills: ["React", "TailwindCSS", "Redux"],
      milestones: [
        { title: "UI Design Approval", amount: 30000 },
        { title: "Core Functionality Complete", amount: 60000 },
        { title: "Final Delivery", amount: 30000 }
      ]
    },
    {
      id: 2,
      title: "Backend Development",
      budget: 130000,
      estimatedHours: 140,
      description: "Build RESTful APIs and integrate with database and payment gateways",
      skills: ["Node.js", "Express", "MongoDB"],
      milestones: [
        { title: "API Design Finalized", amount: 40000 },
        { title: "Payment Integration", amount: 60000 },
        { title: "Deployment Ready", amount: 30000 }
      ]
    },
    {
      id: 3,
      title: "Database Architecture",
      budget: 80000,
      estimatedHours: 90,
      description: "Design and implement efficient database schema with proper indexing",
      skills: ["MongoDB", "SQL", "Database Design"],
      milestones: [
        { title: "Schema Design", amount: 30000 },
        { title: "Indexing & Optimization", amount: 30000 },
        { title: "Final Implementation", amount: 20000 }
      ]
    },
    {
      id: 4,
      title: "DevOps Setup",
      budget: 70000,
      estimatedHours: 70,
      description: "Configure CI/CD pipeline and setup cloud infrastructure",
      skills: ["Docker", "Kubernetes", "AWS"],
      milestones: [
        { title: "CI/CD Pipeline", amount: 25000 },
        { title: "Kubernetes Configuration", amount: 25000 },
        { title: "Monitoring Setup", amount: 20000 }
      ]
    }
  ]
};

const ProjectPageForBidding = ({userId, role, isAuthenticated, isEditable}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userTier = 'pro';
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  
  const { projectId } = useParams();
  const [project, setProject] = useState(dummyProject);
  const [biddedTasks, setBiddedTasks] = useState([]);
  const [activeBidTask, setActiveBidTask] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("tasks");
  
  // Get maximum biddable tasks based on user tier
  const getMaxTasksByTier = () => {
    switch(userTier) {
      case 'starter': return Math.min(2, project.tasks.length);
      case 'pro': return Math.min(4, project.tasks.length);
      case 'elite': return project.tasks.length;
      default: return 2;
    }
  };
  
  const canBidOnMoreTasks = biddedTasks.length < getMaxTasksByTier();
  
  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== "/freelancer/profile") {
      navigate("/freelancer/profile", { state: { profileComponent } });
    }
  };

  // Calculate bidding progress
  const getBiddingProgress = () => {
    return Math.round((biddedTasks.length / getMaxTasksByTier()) * 100);
  };

  // Handle submitting a bid for a specific task
  const handleTaskBid = (taskId, values) => {
    const task = project.tasks.find(t => t.id === taskId);
    
    // Process file attachments
    const fileList = values.attachments ? values.attachments.fileList.map(file => ({
      uid: file.uid,
      name: file.name,
      status: 'done',
      url: file.response?.url || URL.createObjectURL(file.originFileObj)
    })) : [];
    
    // Create bid data object with appropriate pricing model
    const bidData = {
      taskId,
      bidType: values.bidType,
      hourlyRate: values.bidType === 'hourly' ? values.hourlyRate : null,
      estimatedHours: values.bidType === 'hourly' ? values.estimatedHours : null,
      amount: values.bidType === 'fixed' ? values.amount : values.hourlyRate * values.estimatedHours,
      proposedStart: values.timeline[0].format('YYYY-MM-DD'),
      proposedEnd: values.timeline[1].format('YYYY-MM-DD'),
      notes: values.notes,
      attachments: fileList,
      portfolioLinks: values.portfolioLinks || []
    };
    
    setBiddedTasks(prev => [...prev, {
      ...task,
      bid: bidData
    }]);
    
    setActiveBidTask(null);
    
    // Show new bid notification
    setTimeout(() => {
      setActiveTab("mybids");
    }, 1000);
  };

  // Preview uploaded file
  const handlePreview = (file) => {
    setPreviewFile(file);
    setPreviewVisible(true);
  };

  // Individual Task Bid Form Component
  const TaskBidForm = ({ task, onSubmit }) => {
    const [form] = Form.useForm();
    const [bidType, setBidType] = useState('fixed');
    const [portfolioLinks, setPortfolioLinks] = useState(['']);
    const [estimatedTotal, setEstimatedTotal] = useState(0);
    
    // Calculate estimated total for hourly bids
    useEffect(() => {
      if (bidType === 'hourly') {
        const rate = form.getFieldValue('hourlyRate') || 0;
        const hours = form.getFieldValue('estimatedHours') || 0;
        setEstimatedTotal(rate * hours);
      }
    }, [bidType, form]);
    
    const handleValuesChange = (changedValues, allValues) => {
      if (bidType === 'hourly' && (changedValues.hourlyRate || changedValues.estimatedHours)) {
        const rate = allValues.hourlyRate || 0;
        const hours = allValues.estimatedHours || 0;
        setEstimatedTotal(rate * hours);
      }
    };
    
    // Handle adding/removing portfolio links
    const handleAddLink = () => {
      setPortfolioLinks([...portfolioLinks, '']);
    };
    
    const handleRemoveLink = (index) => {
      const newLinks = [...portfolioLinks];
      newLinks.splice(index, 1);
      setPortfolioLinks(newLinks);
      
      // Update form values
      const currentLinks = form.getFieldValue('portfolioLinks') || [];
      currentLinks.splice(index, 1);
      form.setFieldsValue({ portfolioLinks: currentLinks });
    };
    
    const handleLinkChange = (index, value) => {
      const newLinks = [...portfolioLinks];
      newLinks[index] = value;
      setPortfolioLinks(newLinks);
    };
    
    const onFinish = (values) => {
      // Filter out empty portfolio links
      values.portfolioLinks = (values.portfolioLinks || []).filter(link => link && link.trim() !== '');
      onSubmit(task.id, values);
      form.resetFields();
      setPortfolioLinks(['']);
    };
    
    // File upload props
    const uploadProps = {
      name: 'file',
      multiple: true,
      listType: 'picture',
      maxCount: 5,
      accept: '.jpg,.jpeg,.png,.pdf,.doc,.docx',
      beforeUpload: (file) => {
        return false;
      },
      onPreview: handlePreview,
    };
    
    return (
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish} 
        initialValues={{ bidType: 'fixed' }}
        onValuesChange={handleValuesChange}
        className="bid-form"
      >
        {/* Bid Progress Steps */}
        <div className="relative mb-10 px-2">
          <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
              style={{ width: '33%' }}
            />
          </div>
          <div className="flex justify-between">
            {['Pricing', 'Details', 'Attachments'].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full
                  ${idx === 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                >
                  {idx + 1}
                </div>
                <span className="mt-2 text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-violet-50 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileTextOutlined className="text-violet-500" />
            <Text strong className="text-violet-700">Bidding for: {task.title}</Text>
          </div>
          <Text type="secondary" className="block mb-2">{task.description}</Text>
          <div className="flex flex-wrap gap-2 mt-2">
            {task.skills.map(skill => (
              <Tag key={skill} color="purple" className="rounded-full px-3 py-1">
                {skill}
              </Tag>
            ))}
          </div>
        </motion.div>
        
        {/* Bid Type Selection */}
        <Form.Item
          name="bidType"
          label={
            <span className="text-lg font-medium text-gray-700 flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white"
              >
                1
              </motion.div>
              How would you like to bill for this task?
            </span>
          }
          rules={[{ required: true }]}
        >
          <Radio.Group 
            onChange={(e) => setBidType(e.target.value)}
            className="w-full flex gap-4 mt-2"
          >
            <motion.div whileHover={{ scale: 1.02 }} className="w-1/2">
              <Radio.Button 
                value="fixed" 
                className="w-full h-20 flex items-center justify-center rounded-xl border-2 
                  hover:border-violet-400 hover:shadow-md overflow-hidden"
                style={{ 
                  borderColor: bidType === 'fixed' ? '#8b5cf6' : '#e5e7eb',
                  backgroundColor: bidType === 'fixed' ? '#f5f3ff' : 'white'
                }}
              >
                <div className="flex flex-col items-center">
                  <DollarOutlined className="text-xl mb-1" style={{ color: bidType === 'fixed' ? '#8b5cf6' : '#6b7280' }} />
                  <span className={bidType === 'fixed' ? 'text-violet-700 font-medium' : 'text-gray-600'}>
                    Fixed Price
                  </span>
                </div>
              </Radio.Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} className="w-1/2">
              <Radio.Button 
                value="hourly" 
                className="w-full h-20 flex items-center justify-center rounded-xl border-2 
                  hover:border-violet-400 hover:shadow-md overflow-hidden"
                style={{ 
                  borderColor: bidType === 'hourly' ? '#8b5cf6' : '#e5e7eb',
                  backgroundColor: bidType === 'hourly' ? '#f5f3ff' : 'white'
                }}
              >
                <div className="flex flex-col items-center">
                  <ClockCircleOutlined className="text-xl mb-1" style={{ color: bidType === 'hourly' ? '#8b5cf6' : '#6b7280' }} />
                  <span className={bidType === 'hourly' ? 'text-violet-700 font-medium' : 'text-gray-600'}>
                    Hourly Rate
                  </span>
                </div>
              </Radio.Button>
            </motion.div>
          </Radio.Group>
        </Form.Item>
        
        {/* Conditional Bid Amount Fields */}
        <AnimatePresence mode="wait">
          {bidType === 'fixed' ? (
            <motion.div
              key="fixed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Form.Item
                label={
                  <span className="text-gray-700">Your Fixed Price Bid</span>
                }
                name="amount"
                rules={[{ required: true, message: 'Please enter your bid amount!' }]}
              >
                <InputNumber
                  prefix="₹"
                  min={1}
                  max={task.budget * 1.5}
                  step={1000}
                  className="w-full h-12 text-lg rounded-xl"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                  placeholder={`Budget: ₹${task.budget.toLocaleString()}`}
                />
              </Form.Item>
              
              <div className="mb-6 flex gap-2 items-center p-3 bg-violet-50 rounded-lg">
                <InfoCircleOutlined className="text-violet-500" />
                <Text type="secondary">
                  The project budget is ₹{task.budget.toLocaleString()}. Reasonable bids have higher chances of acceptance.
                </Text>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="hourly"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700">Your Hourly Rate</span>}
                    name="hourlyRate"
                    rules={[{ required: true, message: 'Please enter your hourly rate!' }]}
                  >
                    <InputNumber
                      prefix="₹"
                      min={100}
                      step={100}
                      className="w-full h-12 rounded-xl"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                      placeholder="Your hourly rate"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700">Estimated Hours</span>}
                    name="estimatedHours"
                    rules={[{ required: true, message: 'Please enter estimated hours!' }]}
                  >
                    <InputNumber
                      min={1}
                      className="w-full h-12 rounded-xl"
                      placeholder={`Est: ${task.estimatedHours || 100} hours`}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100">
                <div className="flex justify-between items-center mb-1">
                  <Text strong className="text-violet-700">Estimated Total</Text>
                  <Text strong className="text-lg text-violet-800">
                    ₹{estimatedTotal.toLocaleString()}
                  </Text>
                </div>
                <Progress 
                  percent={Math.min(100, Math.round((estimatedTotal / task.budget) * 100))} 
                  showInfo={false}
                  strokeColor={{
                    '0%': '#8b5cf6',
                    '100%': '#6366f1'
                  }}
                  className="mb-2"
                />
                <Text type="secondary" className="text-sm">
                  <InfoCircleOutlined className="mr-1" /> 
                  Final payment will be based on actual hours worked. The task budget is ₹{task.budget.toLocaleString()}.
                </Text>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Divider>
          <div className="flex items-center gap-2 text-violet-600">
            <ArrowRightOutlined />
            <span>Timeline & Approach</span>
          </div>
        </Divider>

        <Form.Item
          label={
            <span className="text-lg font-medium text-gray-700 flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white"
              >
                2
              </motion.div>
              When can you complete this task?
            </span>
          }
          name="timeline"
          rules={[{ required: true, message: 'Please select timeline!' }]}
        >
          <RangePicker
            className="w-full h-12 rounded-xl mt-2"
            disabledDate={current => current && current < moment().startOf('day')}
            ranges={{
              'Next Week': [moment().add(1, 'day'), moment().add(1, 'week')],
              'Next Month': [moment().add(1, 'day'), moment().add(1, 'month')],
              'Custom Timeline': [moment().add(1, 'day'), moment().add(3, 'month')],
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-gray-700">Your Approach & Notes</span>
          }
          name="notes"
          rules={[{ required: true, message: 'Please add some notes!' }]}
        >
          <Input.TextArea 
            rows={4}
            className="rounded-xl resize-none"
            placeholder="Describe your approach, experience with similar tasks, and why you're a good fit..."
          />
        </Form.Item>
        
        {/* Work Samples Section */}
        <Divider>
          <div className="flex items-center gap-2 text-violet-600">
            <ArrowRightOutlined />
            <span>Work Samples & Portfolio</span>
          </div>
        </Divider>
        
        {/* File Attachments - Fixed UI disturbance */}
        <Form.Item
          name="attachments"
          label={
            <div className="flex items-center gap-2 text-violet-700 font-medium mb-2">
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                <PaperClipOutlined className="text-violet-600 text-sm" />
              </div>
              Work Samples (Max 5)
            </div>
          }
          tooltip={{
            title: "Supported formats: JPG, PNG, PDF, DOC, DOCX (10MB max per file)",
            color: "#8b5cf6"
          }}
        >
          <Dragger 
            {...uploadProps}
            className="relative bg-white border-0 rounded-2xl py-1 px-6 overflow-hidden
              shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Background gradient without backdrop blur */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/90 to-indigo-50/90 pointer-events-none"></div>
            
            {/* Dashed border as separate element */}
            <div className="absolute inset-0 border-2 border-dashed border-violet-200 
              rounded-2xl pointer-events-none hover:border-violet-500 transition-all duration-300"></div>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="text-center relative z-10"
            >
              <motion.div 
                className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 
                  flex items-center justify-center mx-auto mb-4 shadow-inner"
                animate={{ 
                  boxShadow: ["0 2px 10px rgba(139, 92, 246, 0.1)", "0 2px 20px rgba(139, 92, 246, 0.3)"],
                }}
                transition={{ 
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 2
                }}
              >
                <UploadOutlined className="text-3xl text-violet-600" />
              </motion.div>
              <p className="text-violet-800 font-medium text-lg">
                Drag files here or click to upload
              </p>
              <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                Showcase your best relevant work to increase your chances of winning this bid
              </p>
              <div className="flex justify-center gap-3 mt-4">
                {['JPG', 'PNG', 'PDF', 'DOC'].map(format => (
                  <Tag key={format} color="purple" className="rounded-full px-3 py-1">
                    {format}
                  </Tag>
                ))}
              </div>
            </motion.div>
          </Dragger>
        </Form.Item>
        
        {/* Portfolio Links */}
        <Form.Item
          label={
            <div className="flex items-center gap-2 text-violet-700 font-medium mb-2">
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                <LinkOutlined className="text-violet-600 text-sm" />
              </div>
              Portfolio & Project Links
            </div>
          }
          tooltip={{
            title: "Add GitHub, Dribbble, Behance or other relevant work showcases",
            color: "#8b5cf6"
          }}
        >
          <div className="border border-violet-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-violet-600 text-white text-sm py-2 px-4">
              <div className="flex justify-between items-center">
                <span>Add up to 5 relevant links to your work</span>
                <Button 
                  type="text" 
                  icon={<LinkOutlined />}
                  className="text-white hover:text-white hover:bg-violet-500"
                  onClick={handleAddLink}
                  disabled={portfolioLinks.length >= 5}
                >
                  Add Link
                </Button>
              </div>
            </div>
            
            <List
              size="small"
              dataSource={portfolioLinks}
              renderItem={(link, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <List.Item 
                    className={`p-1 ${index % 2 === 0 ? 'bg-violet-50/50' : 'bg-white'} hover:bg-violet-100/50 transition-colors duration-200`}
                  >
                    <div className="flex items-center w-full pr-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-violet-500 mr-2 shadow-sm">
                        {index + 1}
                      </div>
                      <Form.Item
                        name={['portfolioLinks', index]}
                        noStyle
                        className="w-full"
                      >
                        <Input 
                          placeholder="https://github.com/yourusername/project"
                          prefix={<LinkOutlined className="text-violet-400" />}
                          value={link}
                          onChange={(e) => handleLinkChange(index, e.target.value)}
                          className="border-none bg-transparent flex-1"
                        />
                      </Form.Item>
                      
                      {portfolioLinks.length > 1 && (
                        <Button 
                          type="text"
                          shape="circle"
                          danger
                          icon={<DeleteOutlined />} 
                          onClick={() => handleRemoveLink(index)}
                          className="ml-2 hover:bg-red-50"
                        />
                      )}
                    </div>
                  </List.Item>
                </motion.div>
              )}
              locale={{
                emptyText: (
                  <div className="text-center py-6 text-gray-400">
                    <LinkOutlined className="text-2xl mb-2" />
                    <p>No links added yet</p>
                  </div>
                )
              }}
              className="links-list"
            />
          </div>
          
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <InfoCircleOutlined />
            <span>Adding portfolio links significantly increases your chances of winning this bid</span>
          </div>
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[{ required: true, message: 'You must agree to terms!' }]}
          className="mt-8"
        >
          <Checkbox className="text-gray-600">
            I agree to the project terms and conditions
          </Checkbox>
        </Form.Item>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-full h-14 text-lg font-medium rounded-xl
              bg-gradient-to-r from-violet-600 to-indigo-600 border-none
              hover:from-violet-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
            icon={<SendOutlined />}
          >
            Submit Bid for {task.title}
          </Button>
        </motion.div>
      </Form>
    );
  };

  // For bid card display
  const renderBidInfo = (task) => {
    if (!task.bid) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100"
      >
        <div className="flex items-center gap-2 text-green-600 mb-2">
          <CheckCircleOutlined className="text-lg" />
          <Text strong className="text-green-700">Bid Submitted Successfully</Text>
        </div>
        
        <div className="mt-3 space-y-2">
          {task.bid.bidType === 'hourly' ? (
            <>
              <div className="flex justify-between">
                <Text className="text-gray-600">Hourly Rate:</Text>
                <Text strong className="text-violet-700">₹{task.bid.hourlyRate.toLocaleString()}/hr</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-600">Estimated Hours:</Text>
                <Text strong>{task.bid.estimatedHours} hours</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-600">Estimated Total:</Text>
                <Text strong className="text-violet-800 text-lg">
                  ₹{(task.bid.hourlyRate * task.bid.estimatedHours).toLocaleString()}
                </Text>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <Text className="text-gray-600">Fixed Price:</Text>
              <Text strong className="text-violet-800 text-lg">₹{task.bid.amount.toLocaleString()}</Text>
            </div>
          )}
          
          <div className="flex justify-between">
            <Text className="text-gray-600">Timeline:</Text>
            <Text strong>{task.bid.proposedStart} to {task.bid.proposedEnd}</Text>
          </div>
          
          {/* Show attachments if any */}
          {task.bid.attachments && task.bid.attachments.length > 0 && (
            <div className="flex justify-between">
              <Text className="text-gray-600">Attachments:</Text>
              <Text strong>{task.bid.attachments.length} file(s)</Text>
            </div>
          )}
          
          {/* Show portfolio links if any */}
          {task.bid.portfolioLinks && task.bid.portfolioLinks.length > 0 && (
            <div className="flex justify-between">
              <Text className="text-gray-600">Portfolio Links:</Text>
              <Text strong>{task.bid.portfolioLinks.length} URL(s)</Text>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // In My Bids tab, show files and links
  const renderDetailedBidView = (task) => {
    if (!task.bid) return null;
    
    return (
      <>
        <Divider />
        <div className="bg-violet-50 p-4 rounded-xl">
          <Text strong className="text-violet-800 block mb-2">Your Approach:</Text>
          <Paragraph className="text-gray-700">{task.bid.notes}</Paragraph>
        </div>
        
        {/* Attachments Section */}
        {task.bid.attachments && task.bid.attachments.length > 0 && (
          <div className="mt-4">
            <Text strong className="text-violet-800 block mb-2">Attachments:</Text>
            <div className="p-4 bg-gray-50 rounded-xl">
              <Upload
                listType="picture-card"
                fileList={task.bid.attachments}
                onPreview={handlePreview}
                disabled={true}
                className="attachment-gallery"
              />
            </div>
          </div>
        )}
        
        {/* Portfolio Links Section */}
        {task.bid.portfolioLinks && task.bid.portfolioLinks.length > 0 && (
          <div className="mt-4">
            <Text strong className="text-violet-800 block mb-2">Portfolio Links:</Text>
            <div className="p-4 bg-gray-50 rounded-xl">
              <List
                size="small"
                dataSource={task.bid.portfolioLinks}
                renderItem={(link) => (
                  <List.Item>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </a>
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <FSider 
        userId={userId}
        role={role}
        isAuthenticated={isAuthenticated}
        isEditable={isEditable}
        dropdown={true} 
        collapsed={true} 
        handleProfileMenu={handleProfileMenu}
      />
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'ml-0 pb-16' : 'ml-14'}`}>
        <FHeader 
          userId={userId}
          role={role}
          isAuthenticated={isAuthenticated}
          isEditable={isEditable}
        />
        <div className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-gray-50 min-h-screen"
          >
            {/* Project Header */}
            <Card className="mb-6 overflow-hidden relative border-0 rounded-2xl">
              {/* Background gradient with animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-600 opacity-90">
                <motion.div 
                  className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/20 blur-3xl"
                  animate={{ 
                    y: [0, 15, 0],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"
                  animate={{ 
                    y: [0, -20, 0],
                    opacity: [0.1, 0.15, 0.1],
                  }}
                  transition={{ 
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                />
              </div>

              <div className="relative z-10 p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="text-white">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Title level={2} className="text-white mb-2 drop-shadow-md">
                        {project.title}
                      </Title>
                      <Text className="text-white/80 text-lg max-w-2xl">{project.description}</Text>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="flex items-center gap-3 mt-4"
                    >
                      <div className="flex items-center gap-1">
                        <StarOutlined className="text-yellow-300" />
                        <span className="text-white font-medium">{project.clientRating}</span>
                      </div>
                      <div className="h-4 w-px bg-white/20" />
                      <div className="flex items-center gap-1">
                        <TrophyOutlined className="text-yellow-300" />
                        <span className="text-white/90">{project.clientCompletedProjects} completed projects</span>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3"
                  >
                    <Tag color="white" className="text-lg px-5 py-2 rounded-full border-0 bg-white/20 backdrop-blur-sm text-white">
                      <DollarOutlined className="mr-1" /> ₹{project.budget.toLocaleString()}
                    </Tag>
                    <Tag color="white" className="text-lg px-5 py-2 rounded-full border-0 bg-white/20 backdrop-blur-sm text-white">
                      <CalendarOutlined className="mr-1" /> {moment(project.deadline).format('DD MMM YYYY')}
                    </Tag>
                    {project.allowsHourly && (
                      <Tag color="white" className="text-lg px-5 py-2 rounded-full border-0 bg-white/20 backdrop-blur-sm text-white">
                        <ClockCircleOutlined className="mr-1" /> Hourly Allowed
                      </Tag>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Tier Information with visual progress */}
              <div className="mt-2 backdrop-blur-md bg-white/10 p-6 border-t border-white/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="text-white">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-md bg-white/20">
                        <TrophyOutlined className="text-yellow-300 text-lg" />
                      </div>
                      <Text strong className="text-white text-lg">
                        {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier Benefits
                      </Text>
                    </div>
                    <Text className="text-white/80 block mt-1">
                      You can bid on up to {getMaxTasksByTier()} tasks in this project
                    </Text>
                  </div>
                  
                  <div className="w-full md:w-1/3">
                    <div className="flex justify-between mb-1">
                      <Text className="text-white/80">Bidding Capacity</Text>
                      <Text className="text-white font-medium">{biddedTasks.length}/{getMaxTasksByTier()}</Text>
                    </div>
                    <Progress 
                      percent={getBiddingProgress()} 
                      showInfo={false}
                      strokeColor={{
                        '0%': '#d8b4fe',
                        '100%': '#818cf8'
                      }}
                      trailColor="rgba(255,255,255,0.2)"
                      className="custom-progress"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Main Content: Tasks and Bidding */}
            <Tabs defaultActiveKey="tasks" type="card">
              <TabPane tab="Available Tasks" key="tasks">
                <Row gutter={[24, 24]}>
                  {project.tasks.map(task => {
                    const isTaskBidded = biddedTasks.some(t => t.id === task.id);
                    const isTaskLocked = !canBidOnMoreTasks && !isTaskBidded;
                    const isActiveForBidding = activeBidTask === task.id;
                    
                    return (
                      <Col xs={24} lg={12} key={task.id}>
                        <motion.div
                          whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.2)" }}
                          className="relative rounded-2xl overflow-hidden bg-white border-0 shadow-lg"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full transform translate-x-16 -translate-y-16"></div>
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 rounded-full transform -translate-x-16 translate-y-16"></div>
                          
                          <div className="relative z-10 p-6">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                                  {task.id}
                                </div>
                                <Text strong className="text-xl">{task.title}</Text>
                              </div>
                              {isTaskBidded ? (
                                <Tag color="success" className="rounded-full px-3 py-1 text-sm border-0">
                                  <CheckCircleOutlined className="mr-1" /> Bid Submitted
                                </Tag>
                              ) : isTaskLocked ? (
                                <Tag color="error" icon={<LockOutlined />} className="rounded-full px-3 py-1 text-sm border-0">
                                  Tier Limit Reached
                                </Tag>
                              ) : (
                                <Tag color="processing" className="rounded-full px-3 py-1 text-sm border-0">
                                  Available
                                </Tag>
                              )}
                            </div>
                            
                            <Paragraph className="text-gray-600 mb-4">{task.description}</Paragraph>
                            
                            <div className="flex flex-wrap gap-2 mb-5">
                              {task.skills.map(skill => (
                                <Tag key={skill} color="purple" className="rounded-full text-sm px-3 py-1">
                                  {skill}
                                </Tag>
                              ))}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="p-3 bg-violet-50 rounded-xl">
                                <Text type="secondary" className="text-xs">Budget</Text>
                                <div className="text-violet-700 font-semibold text-lg">₹{task.budget.toLocaleString()}</div>
                              </div>
                              {task.estimatedHours && (
                                <div className="p-3 bg-indigo-50 rounded-xl">
                                  <Text type="secondary" className="text-xs">Est. Hours</Text>
                                  <div className="text-indigo-700 font-semibold text-lg">{task.estimatedHours} hrs</div>
                                </div>
                              )}
                            </div>
                            
                            <Collapse 
                              ghost 
                              className="custom-collapse mb-4"
                              expandIcon={({ isActive }) => (
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                  isActive ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  <RightOutlined rotate={isActive ? 90 : 0} className="text-xs" />
                                </div>
                              )}
                            >
                              <Panel 
                                header={<Text strong className="text-violet-600">View Milestones</Text>} 
                                key="1"
                              >
                                <div className="space-y-2 mt-2">
                                  {task.milestones.map((milestone, idx) => (
                                    <motion.div 
                                      key={idx} 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.1 }}
                                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                                    >
                                      <Text>{milestone.title}</Text>
                                      <Text strong className="text-violet-700">₹{milestone.amount.toLocaleString()}</Text>
                                    </motion.div>
                                  ))}
                                </div>
                              </Panel>
                            </Collapse>
                            
                            {isTaskBidded ? (
                              renderBidInfo(biddedTasks.find(t => t.id === task.id))
                            ) : isTaskLocked ? (
                              <div className="text-center p-6 bg-gray-50 rounded-xl">
                                <LockOutlined className="text-xl text-gray-400 mb-2" />
                                <Text type="secondary" className="block">
                                  Upgrade your tier or complete existing bids to unlock more tasks
                                </Text>
                                <Button 
                                  type="default"
                                  className="mt-3 border-violet-200 text-violet-600" 
                                  shape="round"
                                >
                                  Upgrade Tier
                                </Button>
                              </div>
                            ) : isActiveForBidding ? (
                              <Button 
                                type="default" 
                                block 
                                onClick={() => setActiveBidTask(null)}
                                className="border-violet-200 text-violet-600 h-10 rounded-xl"
                              >
                                Cancel Bidding
                              </Button>
                            ) : (
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button 
                                  type="primary" 
                                  block 
                                  onClick={() => setActiveBidTask(task.id)}
                                  className="bg-gradient-to-r from-violet-600 to-indigo-600 border-none h-12 rounded-xl 
                                    hover:from-violet-700 hover:to-indigo-700 shadow-lg"
                                  icon={<SendOutlined />}
                                >
                                  Bid on This Task
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                        
                        {/* Expandable Bid Form */}
                        <AnimatePresence>
                          {isActiveForBidding && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden mt-4"
                            >
                              <Card 
                                className="border-t-4 border-violet-500 shadow-xl rounded-2xl overflow-hidden
                                  backdrop-filter backdrop-blur-sm"
                              >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-400"></div>
                                
                                <div className="pt-6">
                                  <TaskBidForm 
                                    task={task} 
                                    onSubmit={handleTaskBid} 
                                  />
                                </div>
                              </Card>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Col>
                    );
                  })}
                </Row>
              </TabPane>
              
              <TabPane tab={`My Bids (${biddedTasks.length})`} key="mybids">
                {biddedTasks.length > 0 ? (
                  <div className="space-y-4">
                    {biddedTasks.map(task => (
                      <Card key={task.id} className="shadow-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <Text strong className="text-lg">{task.title}</Text>
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {task.bid.bidType === 'hourly' ? (
                                <>
                                  <Tag color="cyan">Hourly: ₹{task.bid.hourlyRate.toLocaleString()}/hr</Tag>
                                  <Tag color="blue">Hours: {task.bid.estimatedHours}</Tag>
                                  <Tag color="green">Est. Total: ₹{(task.bid.hourlyRate * task.bid.estimatedHours).toLocaleString()}</Tag>
                                </>
                              ) : (
                                <Tag color="green">Bid Amount: ₹{task.bid.amount.toLocaleString()}</Tag>
                              )}
                              <Tag color="blue">Timeline: {task.bid.proposedStart} to {task.bid.proposedEnd}</Tag>
                            </div>
                          </div>
                          <Button 
                            danger 
                            onClick={() => setBiddedTasks(prev => prev.filter(t => t.id !== task.id))}
                          >
                            Withdraw Bid
                          </Button>
                        </div>

                        {renderDetailedBidView(task)}
                      </Card>
                    ))}
                    
                    <Card className="shadow-md bg-violet-50">
                      <div className="text-center">
                        <Title level={4} className="text-violet-700">Ready to Submit All Bids?</Title>
                        <Text className="block mb-4">You've bid on {biddedTasks.length} task(s). Submit all to complete your application.</Text>
                        <Button 
                          type="primary" 
                          size="large"
                          className="bg-violet-600 hover:bg-violet-700 border-none h-12 px-8"
                          onClick={() => {
                            console.log('Final submission of all bids:', biddedTasks);
                            // Here you would call your API to submit all bids
                            // Then navigate or show success
                          }}
                        >
                          Submit All Bids
                        </Button>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Empty
                    description="You haven't placed any bids yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </TabPane>
            </Tabs>
          </motion.div>
        </div>
        
        {/* File Preview Modal */}
        <Modal
          visible={previewVisible}
          title={
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <FileTextOutlined className="text-violet-600" />
              </div>
              <span>
                {previewFile?.name || 'File Preview'}
              </span>
            </div>
          }
          footer={
            <div className="flex justify-between items-center">
              <Text type="secondary" className="text-sm">
                Added to your bid for {project.tasks.find(t => t.id === activeBidTask)?.title || 'this task'}
              </Text>
              <Button type="primary" onClick={() => setPreviewVisible(false)}>
                Close
              </Button>
            </div>
          }
          onCancel={() => setPreviewVisible(false)}
          width={800}
          centered
          className="file-preview-modal"
          bodyStyle={{ padding: '24px', backgroundColor: '#f9fafb' }}
        >
          <div className="bg-white rounded-lg p-4 shadow-sm">
            {previewFile && (
              previewFile.type?.includes('image') ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center"
                >
                  <img 
                    alt="preview" 
                    style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} 
                    src={previewFile.url || previewFile.preview} 
                    className="rounded-lg shadow-md"
                  />
                </motion.div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <FileTextOutlined className="text-4xl text-violet-500 mb-4" />
                  <Title level={4}>{previewFile.name}</Title>
                  <Text type="secondary">
                    {previewFile.type || 'Unknown file type'}
                  </Text>
                  <div className="mt-6">
                    <Button type="primary" icon={<DownloadOutlined />}>
                      Download File
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </Modal>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 right-8"
        >
          <Button
            type="primary"
            size="large"
            className="h-16 w-16 rounded-full shadow-lg bg-gradient-to-r 
              from-freelancer-primary-500 to-freelancer-accent-teal-DEFAULT
              hover:shadow-xl hover:from-freelancer-primary-600 hover:to-freelancer-accent-teal-dark
              transition-all duration-300"
            icon={<SendOutlined className="text-xl" />}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectPageForBidding;
