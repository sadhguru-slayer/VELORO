import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Button, notification } from 'antd';
import { PieChartOutlined, CheckCircleOutlined, ExclamationCircleOutlined,DownloadOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,    // Register PointElement for points in line charts
  LineElement,
  Title,
  Tooltip,
  Legend
);


const ProjectStatusOverview = () => {
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);

  useEffect(() => {
    // Mocking the API call to fetch project status data
    const fetchProjectStatus = async () => {
      setLoading(true);
      try {
        const data = {
          ongoing: 5,
          completed: 3,
          pending: 2,
          milestones: [
            { name: 'Initial Design', status: 'Completed', dueDate: '2024-12-15' },
            { name: 'Development Phase', status: 'In Progress', dueDate: '2024-12-20' },
            { name: 'Testing', status: 'Pending', dueDate: '2024-12-25' },
          ],
          tasks: [
            { name: 'Design Wireframe', status: 'Completed', dueDate: '2024-12-10', priority: 'High' },
            { name: 'Build Frontend', status: 'In Progress', dueDate: '2024-12-18', priority: 'Medium' },
            { name: 'Backend API Integration', status: 'Pending', dueDate: '2024-12-22', priority: 'Low' },
          ],
        };
        setProjectData(data);
      } catch (error) {
        console.error('Error fetching project status', error);
        notification.error({ message: 'Error loading project status.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectStatus();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const { ongoing, completed, pending, milestones, tasks } = projectData;

  // Chart data for project status breakdown
  const projectStatusData = {
    labels: ['Ongoing', 'Completed', 'Pending'],
    datasets: [
      {
        data: [ongoing, completed, pending],
        backgroundColor: ['#1890ff', '#52c41a', '#faad14'],
        hoverBackgroundColor: ['#40a9ff', '#73d13d', '#ffbf00'],
      },
    ],
  };

  return (
    <div className="flex flex-col items-center bg-gray-100">
      <h1 className="text-3xl font-semibold mb-6">Project Status Overview</h1>

      {/* Project Status Dashboard (Pie Chart) */}
      <Card className="w-full sm:w-[90%] md:w-[70%] shadow-sm hover:shadow-md p-6 mb-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Project Status Breakdown</h2>
        <div className="flex justify-center">
          <PieChartOutlined className="text-3xl text-blue-500 mr-4" />
          <Line
            data={projectStatusData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                tooltip: { enabled: true },
              },
            }}
          />
        </div>
      </Card>

      {/* Milestone Tracker */}
      <Card className="w-full sm:w-[90%] md:w-[70%] shadow-sm hover:shadow-md p-6 mb-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Milestone Tracker</h2>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-white shadow-sm rounded-lg border">
              <div className="flex flex-col">
                <span className="font-medium">{milestone.name}</span>
                <span className="text-gray-500 text-sm">Due Date: {milestone.dueDate}</span>
              </div>
              <span
                className={`${
                  milestone.status === 'Completed' ? 'text-green-500' : milestone.status === 'In Progress' ? 'text-yellow-500' : 'text-red-500'
                }`}
              >
                {milestone.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Task Breakdown */}
      <Row gutter={16} className="w-full sm:w-[90%] md:w-[70%]">
        {tasks.map((task, index) => (
          <Col span={24} md={12} key={index}>
            <Card className="shadow-sm hover:shadow-md p-6 mb-6 border rounded-lg">
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

      {/* Alerts Section */}
      <Card className="w-full sm:w-[90%] md:w-[70%] shadow-sm hover:shadow-md p-6 mb-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Alerts & Recommendations</h2>
        <div className="space-y-4">
          {tasks.some((task) => task.status === 'Pending') && (
            <div className="flex items-center p-4 bg-yellow-50 text-yellow-600 rounded-lg border">
              <ExclamationCircleOutlined className="text-xl mr-4" />
              <span>Some tasks are pending. Please review and take action.</span>
            </div>
          )}
          {milestones.some((milestone) => milestone.status === 'In Progress') && (
            <div className="flex items-center p-4 bg-blue-50 text-blue-600 rounded-lg border">
              <CheckCircleOutlined className="text-xl mr-4" />
              <span>Milestone "Development Phase" is in progress. Keep it up!</span>
            </div>
          )}
        </div>
      </Card>

      {/* Export Option */}
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        size="large"
        className="mt-6"
        onClick={() => notification.success({ message: 'Exporting project report...' })}
      >
        Export Report
      </Button>
    </div>
  );
};

export default ProjectStatusOverview;
