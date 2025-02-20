import React, { useState } from "react";
import { Card, Col, Row, Statistic, Table, Tooltip, Pagination } from "antd";
import { Line } from "react-chartjs-2"; // Assuming you have chart.js installed
import { SearchOutlined } from "@ant-design/icons";
import { faker } from "@faker-js/faker"; // For generating random data
import { ResponsiveTable } from "responsive-table-react";

const WeeklyBiddingActivity = () => {
  // Random data for chart and activity log
  const generateRandomData = () => {
    let data = [];
    for (let i = 0; i < 7; i++) {
      data.push({
        date: `Day ${i + 1}`,
        bidsPlaced: faker.number.int({ min: 1, max: 15 }), // Use number.int() instead of datatype.number()
        bidsReceived: faker.number.int({ min: 5, max: 20 }), // Use number.int() instead of datatype.number()
      });
    }
    return data;
  };

  const activityData = generateRandomData();

  const weeklyOverviewData = {
    labels: activityData.map((item) => item.date),
    datasets: [
      {
        label: "Bids Placed",
        data: activityData.map((item) => item.bidsPlaced),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
      {
        label: "Bids Received",
        data: activityData.map((item) => item.bidsReceived),
        borderColor: "rgba(153, 102, 255, 1)",
        fill: false,
      },
    ],
  };

  // Freelancer and client stats
  const freelancerStats = {
    successRate: "75%",
    averageBid: "₹20,000",
    competitorAverage: "₹18,000",
  };

  const clientStats = {
    averageBidsPerProject: 12,
    averageTimeToSelect: "3 days",
  };

  // Activity Log
  const activityLogData = [
    { key: 1, action: "Bid Placed", date: "2024-12-16" },
    { key: 2, action: "Bid Revised", date: "2024-12-15" },
    { key: 3, action: "Bid Accepted", date: "2024-12-14" },
    { key: 4, action: "Bid Placed", date: "2024-12-13" },
    { key: 5, action: "Bid Rejected", date: "2024-12-12" },
  ];
  const columns = [
    { title: "Action", dataIndex: "action", key: "action" },
    { title: "Date", dataIndex: "date", key: "date" },
  ];
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3; // Number of items per page

  // Toggle dropdown for mobile view
  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const paginatedData = activityLogData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  return (
    <div className="p-3 py-6 bg-gray-100 rounded-lg shadow-sm hover:shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Weekly Bidding Activity</h2>

      {/* Weekly Overview Chart */}
      <Card title="Weekly Bidding Overview" bordered={false} className="mb-6">
        <div className="relative h-64">
          {" "}
          {/* Set a fixed height for the chart */}
          <Line
            data={weeklyOverviewData}
            options={{
              responsive: true,

              maintainAspectRatio: false, // Allow the chart to fill the container

              scales: {
                y: {
                  beginAtZero: true,
                },
              },

              plugins: {
                legend: {
                  display: true,

                  position: "top",
                },
              },
            }}
          />
        </div>
      </Card>

      <div className="container mx-auto">
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2">
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
              <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-charcolBlue mb-4">
                Freelancer Stats
              </h2>

              <div className="flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm sm:text-lg text-violet-500">
                    Success Rate
                  </h3>
                  <p className="text-lg sm:text-2xl font-bold text-charcolBlue">
                    {freelancerStats.successRate}%
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm sm:text-lg text-violet-500">
                    Average Bid Amount
                  </h3>
                  <p className="text-lg sm:text-2xl font-bold text-charcolBlue">
                    ${freelancerStats.averageBid}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm sm:text-lg text-violet-500">
                    Competitor Average Bid
                  </h3>
                  <p className="text-lg sm:text-2xl font-bold text-charcolBlue">
                    ${freelancerStats.competitorAverage}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 px-2">
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
              <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-charcolBlue mb-4">
                Client Stats
              </h2>

              <div className="flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm sm:text-lg text-violet-500">
                    Avg Bids Per Project
                  </h3>
                  <p className="text-lg sm:text-2xl font-bold text-charcolBlue">
                    {clientStats.averageBidsPerProject}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm sm:text-lg text-violet-500">
                    Avg Time to Select Freelancer
                  </h3>
                  <p className="text-lg sm:text-2xl font-bold text-charcolBlue">
                    {clientStats.averageTimeToSelect} days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <Card title="Performance Insights" bordered={false} className="mb-6">
        <div className="text-gray-700">
          <Tooltip title="Your bid amount is higher than the average for similar projects. Consider lowering your bid for better chances.">
            <span>
              Your bid amount is higher than the average for similar projects.
            </span>
          </Tooltip>
        </div>
      </Card>

      {/* Activity Log */}
      <Card title="Activity Log" bordered={false}>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                {columns.map((column) => (
                  <th key={column.key} className="p-3 text-left">
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr
                  key={row.key}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="p-3">
                      {row[column.dataIndex]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Dropdown View */}
        <div className="block md:hidden">
          {paginatedData.map((row, index) => (
            <div
              key={row.key}
              className="mb-4 border border-gray-200 rounded-lg"
            >
              <button
                onClick={() => toggleDropdown(index)}
                className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none"
              >
                {row[columns[0].dataIndex]}{" "}
                {/* Use the first column as the dropdown title */}
              </button>
              {openDropdown === index && (
                <div className="p-3 bg-white">
                  {columns.slice(1).map((column) => (
                    <p key={column.key}>
                      <strong>{column.title}:</strong> {row[column.dataIndex]}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={activityLogData.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </Card>
    </div>
  );
};

export default WeeklyBiddingActivity;
