import React, { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Card, Statistic, Tooltip as AntTooltip, Badge, Divider, Tag } from 'antd';
import { 
  DollarCircleOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  CalendarOutlined,
  WalletOutlined
} from '@ant-design/icons';
import Cookies from 'js-cookie';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useMediaQuery } from 'react-responsive';

// Register Chart.js components properly
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Spendings = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
          {
            label: 'Spend Over Time',
            data: [],
            borderColor: 'rgba(75,192,192,1)',
            fill: false,
          },
        ],
      });

      const [spentOnProjects,setSpentOnProjects] = useState([]);
      const [pieChartData, setPieChartData] = useState(null);

      
      const [timeFrame, setTimeFrame] = useState('monthly'); 
      const fetchSpendingData = async (timeFrame) => {
        try {
          const accessToken = Cookies.get('accessToken');
          const csrftoken = Cookies.get('csrftoken');
          
          const response = await axios.get(`http://127.0.0.1:8000/api/client/spending_data/`, {
            params: { time_frame: timeFrame },
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-CSRFToken': csrftoken,
            },
          });
          
          setChartData(response.data);
          
        } catch (error) {
          console.error('Error fetching spending data:', error);
        }
      };
      
      useEffect(() => {
        fetchSpendingData(timeFrame); // Fetch data based on the current time frame
      }, [timeFrame]);

    useEffect(() => {
        const fetchSpendingDistributionByProject = async () => {
            try {
                const accessToken = Cookies.get('accessToken');
                const csrftoken = Cookies.get('csrftoken');
                const response = await axios.get('http://127.0.0.1:8000/api/client/spending_distribution_by_project/', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-CSRFToken': csrftoken,
                    },
                });
                setSpentOnProjects(response.data);

                const paymentMethods = [];
                const paymentAmount = [];

                // Process the fetched data to calculate totals by payment method
                response.data.forEach((project) => {
                    const method = project.payment_method;
                    const amount = parseFloat(project.amount);

                    if (paymentMethods.includes(method)) {
                        const index = paymentMethods.indexOf(method);
                        paymentAmount[index] += amount;
                    } else {
                        paymentMethods.push(method);
                        paymentAmount.push(amount);
                    }
                });

                setPieChartData({
                    labels: paymentMethods,
                    datasets: [
                        {
                            label: 'Payments by Method',
                            data: paymentAmount,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.6)', 
                                'rgba(54, 162, 235, 0.6)', 
                                'rgba(255, 206, 86, 0.6)', 
                                'rgba(75, 192, 192, 0.6)', 
                                'rgba(153, 102, 255, 0.6)',
                            ].slice(0, paymentMethods.length),
                            borderColor: 'rgba(255, 255, 255, 1)',
                            borderWidth: 1,
                        },
                    ],
                });
            } catch (error) {
                console.log(error);
            }
        };

        fetchSpendingDistributionByProject();
    }, []);
      
      const handleTimeFrameChange = (newTimeFrame) => {
        setTimeFrame(newTimeFrame);
      };

      const format_timeStamp = (date)=>{
        const dateObject = new Date(date);
        return dateObject.toLocaleString();
      }

      const [currentPage, setCurrentPage] = useState(1);
      const itemsPerPage = 5;
      
      const indexOfLastProject = currentPage * itemsPerPage;
      const indexOfFirstProject = indexOfLastProject - itemsPerPage;
      const currentProjects = spentOnProjects.slice(indexOfFirstProject, indexOfLastProject);
      
      const handlePageChange = (pageNumber) => {
          setCurrentPage(pageNumber);
      };
      
      const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(spentOnProjects.length / itemsPerPage); i++) {
          pageNumbers.push(i);
      }
      
      // Add new states for summary statistics
      const [spendingSummary, setSpendingSummary] = useState({
        totalSpent: 0,
        averageSpending: 0,
        highestSpending: 0,
        mostUsedPaymentMethod: '',
      });
      

      // Calculate summary when spentOnProjects changes
      useEffect(() => {
        if (spentOnProjects.length > 0) {
          const total = spentOnProjects.reduce((sum, project) => sum + parseFloat(project.amount), 0);
          const average = total / spentOnProjects.length;
          const highest = Math.max(...spentOnProjects.map(project => project.amount));
          
          // Calculate most used payment method
          const methodCounts = spentOnProjects.reduce((acc, project) => {
            acc[project.payment_method] = (acc[project.payment_method] || 0) + 1;
            return acc;
          }, {});
          const mostUsed = Object.entries(methodCounts)
            .sort(([,a], [,b]) => b - a)[0][0];

          setSpendingSummary({
            totalSpent: total,
            averageSpending: average,
            highestSpending: highest,
            mostUsedPaymentMethod: mostUsed,
          });
        }
      }, [spentOnProjects]);

    return (
        <div className={`
          min-h-screen bg-gray-50 
          ${isMobile ? 'p-4' : 'p-6'}
        `}>
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "Total Spent",
            value: spendingSummary.totalSpent,
            icon: <DollarCircleOutlined className="text-2xl" />,
            color: '#3f8600',
            bgColor: 'bg-green-50'
          },
          {
            title: "Average per Project",
            value: spendingSummary.averageSpending,
            icon: <WalletOutlined className="text-2xl" />,
            color: '#1890ff',
            bgColor: 'bg-blue-50'
          },
          {
            title: "Highest Payment",
            value: spendingSummary.highestSpending,
            icon: <ArrowUpOutlined className="text-2xl" />,
            color: '#cf1322',
            bgColor: 'bg-red-50'
          },
          {
            title: "Preferred Payment",
            value: spendingSummary.mostUsedPaymentMethod,
            icon: <CalendarOutlined className="text-2xl" />,
            color: '#722ed1',
            bgColor: 'bg-purple-50'
          }
        ].map((stat, index) => (
          <Card 
            key={index}
            className={`
              transform transition-all duration-300 hover:scale-105
              shadow-sm hover:shadow-xl ${stat.bgColor} border-none
            `}
          >
            <div className="flex items-center gap-4">
              <div 
                className={`p-3 rounded-full`}
                style={{ backgroundColor: `${stat.color}20` }}
              >
                {React.cloneElement(stat.icon, { style: { color: stat.color } })}
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-xl font-semibold mt-1" style={{ color: stat.color }}>
                  {typeof stat.value === 'number' 
                    ? `₹${stat.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` 
                    : stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Spending Trend Chart */}
      <Card className="mb-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className={`
          ${isMobile ? 'flex-col' : 'flex justify-between'} 
          items-center mb-6
        `}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
            Spending Trends
          </h2>
          <div className="flex flex-wrap gap-2">
            {['weekly', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                onClick={() => handleTimeFrameChange(period)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${timeFrame === period 
                    ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className={`${isMobile ? 'h-[250px]' : 'h-[300px]'}`}>
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: isMobile ? 'bottom' : 'top',
                  labels: {
                    boxWidth: 20,
                    padding: 15,
                    font: {
                      size: isMobile ? 10 : 12
                    }
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  titleColor: '#000',
                  bodyColor: '#666',
                  borderColor: '#ddd',
                  borderWidth: 1,
                  padding: 10,
                  boxPadding: 4
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            }}
          />
        </div>
      </Card>

      {/* Spending Distribution */}
      <Card className="shadow-sm hover:shadow-md transition-all duration-300">
        <div className={`
          grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 lg:grid-cols-5 gap-8'}
        `}>
          {/* Payment History Table */}
          <div className={`${isMobile ? 'w-full' : 'lg:col-span-3'}`}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Payment History
            </h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Project', 'Amount', 'Date', 'Mode'].map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProjects.map((project, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {project.task_id ? project.task_title : project.project_name}
                          </span>
                          {project.task_id && (
                            <span className="text-xs text-gray-500">
                              Project: {project.project_name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ₹{project.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {format_timeStamp(project.payment_date)}
                      </td>
                      <td className="px-6 py-4">
                        <Tag 
                          color="blue"
                          className="px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {project.payment_method}
                        </Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                  px-4 py-2 rounded-md transition-all duration-300
                  ${currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'}
                `}
              >
                Previous
              </button>
              {pageNumbers.map(number => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`
                    px-4 py-2 rounded-md transition-all duration-300
                    ${currentPage === number 
                      ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pageNumbers.length}
                className={`
                  px-4 py-2 rounded-md transition-all duration-300
                  ${currentPage === pageNumbers.length 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'}
                `}
              >
                Next
              </button>
            </div>
          </div>

          {/* Pie Chart */}
          <div className={`${isMobile ? 'w-full' : 'lg:col-span-2'}`}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Payment Methods
            </h2>
            <div className={`
              ${isMobile ? 'h-[250px]' : 'h-[300px]'}
              flex items-center justify-center
            `}>
              {pieChartData ? (
                <Pie 
                  data={pieChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: isMobile ? 'bottom' : 'right',
                        labels: {
                          padding: isMobile ? 10 : 15,
                          font: {
                            size: isMobile ? 10 : 12
                          }
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#000',
                        bodyColor: '#666',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        padding: 10
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-gray-500 animate-pulse">
                  Loading chart...
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Spendings;