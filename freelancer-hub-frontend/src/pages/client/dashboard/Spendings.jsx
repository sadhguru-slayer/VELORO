import React, { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import Cookies from 'js-cookie';
import axios from 'axios';

const Spendings = () => {
  
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
      


    return (
        <div className='h-full flex flex-col'>
      <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
                <h2 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-semibold">
                    <span>Spending Overview</span>
                    <span
                      className="underline text-teal-600 cursor-pointer text-md"
                      onClick={() =>
                        handleTimeFrameChange(
                          timeFrame === 'monthly'
                            ? 'weekly'
                            : timeFrame === 'weekly'
                            ? 'yearly'
                            : 'monthly'
                        )
                      }
                    >
                     
                    </span>
                  </h2>
                
                  <Line data={chartData} /> {/* Displaying the chart with the fetched data */}
                
                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={() => handleTimeFrameChange('weekly')}
                      className={`px-4 py-2 rounded-md text-white ${
                        timeFrame === 'weekly' ? 'bg-charcolBlue' : 'bg-teal-400'
                      } hover:bg-charcolBlue transition duration-300`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => handleTimeFrameChange('monthly')}
                      className={`px-4 py-2 rounded-md text-white ${
                        timeFrame === 'monthly' ? 'bg-charcolBlue' : 'bg-teal-400'
                      } hover:bg-charcolBlue transition duration-300`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => handleTimeFrameChange('yearly')}
                      className={`px-4 py-2 rounded-md text-white ${
                        timeFrame === 'yearly' ? 'bg-charcolBlue' : 'bg-teal-400'
                      } hover:bg-charcolBlue transition duration-300`}
                    >
                      Yearly
                    </button>
                </div>
            </div>
            <div className="bg-white p-6 mt-6 flex flex-col gap-4 rounded-lg shadow-md">
                <h2 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-semibold">Spending Distribution by Project</h2>
                <div className="flex w-full gap-3 h-full flex-wrap sm:flex-wrap md:flex-nowrap lg:flex-none">
                    <div className="project_list flex flex-col w-full">
                        <table className="min-w-full border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-2 text-left">Project Name</th>
                                    <th className="border border-gray-300 p-2 text-left">Amount</th>
                                    <th className="border border-gray-300 p-2 text-left">Date</th>
                                    <th className="border border-gray-300 p-2 text-left">Mode</th>
                                </tr>
                            </thead>
                            <tbody>
    {currentProjects.map((project, index) => (
        <tr key={index} className="hover:bg-gray-50">
            {project.task_id == null ? (
                <td className="border border-gray-300 p-2">{project.project_name}</td>
            ) : (
                <td className="border border-gray-300 p-2 flex flex-col">
                    {project.task_title}
                    <span className="text-xs">Project: {project.project_name}</span>
                </td>
            )}
            <td className="border border-gray-300 p-2">&#8377;{project.amount.toLocaleString()}</td>
            <td className="border border-gray-300 p-2">{format_timeStamp(project.payment_date)}</td>
            <td className="border border-gray-300 p-2">{project.payment_method}</td>
        </tr>
    ))}
</tbody>

                        </table>
                        <div className="pagination flex justify-center mt-4">
    <button 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        className="px-4 py-2 mx-2 bg-gray-200 rounded"
    >
        Prev
    </button>
    
    {pageNumbers.map(number => (
        <button 
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-4 py-2 mx-2 ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
            {number}
        </button>
    ))}
    
    <button 
        onClick={() => handlePageChange(currentPage + 1)} 
        disabled={currentPage === pageNumbers.length}
        className="px-4 py-2 mx-2 bg-gray-200 rounded"
    >
        Next
    </button>
</div>

                    </div>
                    <div className="chart-container w-full h-fit p-3 flex justify-center items-center">
            
            {pieChartData ? (
                <Pie data={pieChartData} className='w-auto h-auto lg:w-[30rem] lg:h-[30rem] md:w-[30rem] md:h-[30rem]' />
            ) : (
                <p>Loading chart...</p>
            )}
        </div>
                </div>
            </div>
        </div>
    );
};

export default Spendings;