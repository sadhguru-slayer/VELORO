import React from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';

const Earnings = () => {
    // Data for the line chart (monthly earnings)
    const lineChartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
            {
                label: 'Total Earnings',
                data: [
                    20000, // January
                    19500, // February (slight decrease)
                    21000, // March (increase)
                    22000, // April (increase)
                    21500, // May (decrease)
                    23000, // June (increase)
                    22500, // July (slight decrease)
                    24000, // August (increase)
                    23500, // September (slight decrease)
                    25000, // October (increase)
                    24500, // November (slight decrease)
                    26000, // December (increase)
                ],
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
            },
        ],
    };
    

    // Data for the pie chart (earnings by project)
    const pieChartData = {
        labels: ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta', 'Project Epsilon'],
        datasets: [
            {
                label: 'Earnings by Project',
                data: [35000, 30000, 25000, 15000, 20000], // Example earning data for each project
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Sample project data (earning-related)
    const projects = [
        { name: 'Project Alpha', amount: 35000, date: '2023-01-15' },
        { name: 'Project Beta', amount: 30000, date: '2023-02-20' },
        { name: 'Project Gamma', amount: 25000, date: '2023-03-10' },
        { name: 'Project Delta', amount: 15000, date: '2023-04-05' },
        { name: 'Project Epsilon', amount: 20000, date: '2023-05-25' },
    ];

    return (
        <div className="p-6 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h2 className="text-2xl font-bold text-violet-900 mb-2">Earnings Overview</h2>
            </motion.div>
            <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">Monthly Earnings Overview</h2>
                <Line data={lineChartData} />
            </div>
            <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">Earnings Distribution by Project</h2>
                <div className="flex w-full gap-3 h-full">
                    <div className="project_list flex flex-col w-full">
                        <table className="min-w-full border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-2 text-left">Project Name</th>
                                    <th className="border border-gray-300 p-2 text-left">Amount</th>
                                    <th className="border border-gray-300 p-2 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-2">{project.name}</td>
                                        <td className="border border-gray-300 p-2">${project.amount.toLocaleString()}</td>
                                        <td className="border border-gray-300 p-2">{project.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="chart-container w-full flex justify-center items-center">
                        <Pie data={pieChartData} width={"20rem"} height={"20rem"} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Earnings;
