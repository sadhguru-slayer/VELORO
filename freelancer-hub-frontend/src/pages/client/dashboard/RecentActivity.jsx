import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select, Pagination,message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import axios from "axios";
import {useNavigate} from 'react-router-dom';

const { Option } = Select;

const RecentActivity = () => {
  const navigate = useNavigate();
  const [paymentSearchTerm, setPaymentSearchTerm] = useState("");
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [statusPaymentFilter, setStatusPaymentFilter] = useState("");
  const [statusProjectFilter, setStatusProjectFilter] = useState("");
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [currentPaymentPage, setCurrentPaymentPage] = useState(1);
  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const [currentOtherActivitiesPage, setCurrentOtherActivitiesPage] = useState(1);
  const [openPaymentDropdown, setOpenPaymentDropdown] = useState(null);
  const [openProjectDropdown, setOpenProjectDropdown] = useState(null);
  const [openOtheractivitiesDropdown, setOpenOtheractivitiesDropdown] = useState(null); 
  const [paymentData, setPaymentData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [otherActivitiesData, setOtherActivitiesData] = useState([]); 
  const paymentPageSize = 4;
  const projectPageSize = 4;
  const otherPageSize =6;

  useEffect(() => {
    const fetchPaymentData = async () => {
      const accessTokens = Cookies.get("accessToken");
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/client/specified_recent_activity",
          {
            params: { activity_type: "payment" },
            headers: { Authorization: `Bearer ${accessTokens}` },
          }
        );
        
        setPaymentData(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    const fetcthProjectData = async () => {
      const accessTokens = Cookies.get("accessToken");
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/client/specified_recent_activity",
          {
            params: { activity_type: "project" },
            headers: { Authorization: `Bearer ${accessTokens}` },
          }
        );
        setProjectData(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchOtherActivities= async ()=>{
      const accessTokens = Cookies.get("accessToken");
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/client/other_recent_activity",
          {
            params: { activity_type: "other" },
            headers: { Authorization: `Bearer ${accessTokens}` },
            }
            );
            setOtherActivitiesData(response.data);
            } catch (error) {
              console.log(error);
              }
    }
    fetchPaymentData();
    fetcthProjectData();
    fetchOtherActivities();
  }, []);

  // Filter payment data based on search term and status
  useEffect(() => {
    const filtered = paymentData.filter((payment) => {
      const matchesSearchTerm = payment.description
        .toLowerCase()
        .includes(paymentSearchTerm.toLowerCase());
      const matchesStatus = statusPaymentFilter
        ? payment.activity_type.toLowerCase() ===
          statusPaymentFilter.toLowerCase()
        : true;
      return matchesSearchTerm && matchesStatus;
    });
    setFilteredPayments(filtered);
  }, [paymentData, paymentSearchTerm, statusPaymentFilter]);

  // Filter project data based on search term and status
  useEffect(() => {
    const filtered = projectData.filter((project) => {
      const matchesSearchTerm = project.description
        .toLowerCase()
        .includes(projectSearchTerm.toLowerCase());
      const matchesStatus = statusProjectFilter
        ? project.activity_type.toLowerCase() ===
          statusProjectFilter.toLowerCase()
        : true;
      return matchesSearchTerm && matchesStatus;
    });
    setFilteredProjects(filtered);
  }, [projectData, projectSearchTerm, statusProjectFilter]);

  // Paginated payment data
  const paginatedPaymentData =
    filteredPayments.length > 0
      ? filteredPayments.slice(
          (currentPaymentPage - 1) * paymentPageSize,
          currentPaymentPage * paymentPageSize
        )
      : paymentData.slice(
          (currentPaymentPage - 1) * paymentPageSize,
          currentPaymentPage * paymentPageSize
        );

  // Paginated project data
  const paginatedProjectData =
    filteredProjects.length > 0
      ? filteredProjects.slice(
          (currentProjectPage - 1) * projectPageSize,
          currentProjectPage * projectPageSize
        )
      : projectData.slice(
          (currentProjectPage - 1) * projectPageSize,
          currentProjectPage * projectPageSize
        );

  const paginatedOtherActivitiesData = 
        otherActivitiesData.length > 0
          ? otherActivitiesData.slice(
              (currentOtherActivitiesPage - 1) * otherPageSize,
              currentOtherActivitiesPage * otherPageSize
            )
          : [];
      
        

  // Toggle dropdown for mobile view
  const togglePaymentDropdown = (index) => {
    setOpenPaymentDropdown(openPaymentDropdown === index ? null : index);
  };

  const toggleProjectDropdown = (index) => {
    setOpenProjectDropdown(openProjectDropdown === index ? null : index);
  };
  const toggleOtherActivitiesDropdown = (index) => {
    setOpenOtheractivitiesDropdown(openOtheractivitiesDropdown === index ? null : index);
  };

  const format_activity_type = (activity_type) => {
    return activity_type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const format_timeStamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const showMessages = (msg,type)=>{
    if(type === 'error'){
      message.error(msg);
    }else{
      message.success(msg);
    }
  }

  return (
    <div className=" shadow-sm hover:shadow-md gap-5 flex flex-col">
      {/* Header */}
      <h2 className="text-xl font-semibold">Recent Activity</h2>

      {/* Payment Activity */}
      <Card title="Payment Activity">
        <div className="flex mb-6 space-x-4">
          <Input
            placeholder="Search by freelancer"
            value={paymentSearchTerm}
            onChange={(e) => setPaymentSearchTerm(e.target.value)}
            prefix={<SearchOutlined />}
            className="w-72"
          />
          <Select
            defaultValue=""
            className="w-48"
            onChange={(value) => setStatusPaymentFilter(value)}
            placeholder="Filter by Status"
          >
            <Option value="">All Statuses</Option>
            <Option value="payment_sent">Sent</Option>
            <Option value="payment_received">Received</Option>
            <Option value="payment_failed">Failed</Option>
          </Select>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="bg-white w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Activity</th>
                <th className="p-3 text-left">Time Stamp</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPaymentData.length > 0 ? (
                paginatedPaymentData.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3">{row.description}</td>
                    <td className="p-3">{format_timeStamp(row.timestamp)}</td>
                    <td className="p-3">
                      {format_activity_type(row.activity_type)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-3 text-center">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Dropdown View */}
        <div className="block md:hidden">
          <h3 className="my-2 font-semibold">Freelancers:</h3>
          {paginatedPaymentData.length > 0 ? (
            paginatedPaymentData.map((row, index) => (
              <div
                key={row.id}
                className="mb-4 border border-gray-200 rounded-md"
              >
                <button
                  onClick={() => togglePaymentDropdown(index)}
                  className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none"
                >
                  <strong>Activity:</strong> {row.description}
                </button>
                {openPaymentDropdown === index && (
                  <div className="p-3 bg-white">
                    <p>
                      <strong>TimeStamp:</strong>{" "}
                      {format_timeStamp(row.timestamp)}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {format_activity_type(row.activity_type)}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-center">No payments found</div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-end">
          <Pagination
            current={currentPaymentPage}
            pageSize={paymentPageSize}
            total={
              filteredPayments.length > 0
                ? filteredPayments.length
                : paymentData.length
            }
            onChange={(page) => setCurrentPaymentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </Card>

      {/* Project Activity */}
      <Card title="Project Activity">
        <div className="flex mb-6 space-x-4">
          <Input
            placeholder="Search by project name"
            value={projectSearchTerm}
            onChange={(e) => setProjectSearchTerm(e.target.value)}
            prefix={<SearchOutlined />}
            className="w-72"
          />
          <Select
            defaultValue=""
            className="w-48"
            onChange={(value) => setStatusProjectFilter(value)}
            placeholder="Filter by Status"
          >
            <Option value="">All Statuses</Option>
            <Option value="project_created">Project Created</Option>
            <Option value="project_updated">Project Updated</Option>
            <Option value="project_deleted">Project Deleted</Option>
          </Select>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="bg-white w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Activity</th>
                <th className="p-3 text-left">Time Stamp</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {
                // Rendering paginated project data
                paginatedProjectData.length > 0 ? (
                  paginatedProjectData.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${!row.activity_type.includes('deleted') ?
                        'cursor-pointer':'cursor-default'
                        }`}
                    >
                    <td 
                    className="p-3" 
                    onClick={() => !row.activity_type.includes('deleted') ? navigate(`/client/view-bids/posted-project/${row.related_object_id}`):showMessages("Cannot show deleted project","error")}
                  >
                    {row.description}
                  </td>
                  
                      <td className="p-3">{format_timeStamp(row.timestamp)}</td>
                      <td className="p-3">
                        {format_activity_type(row.activity_type)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-3 text-center">
                      No projects found
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>

        {/* Mobile Dropdown View */}
        <div className="block md:hidden">
          {paginatedProjectData.length > 0 ? (
            paginatedProjectData.map((row, index) => (
              <div
                key={row.id}
                className="mb-4 border border-gray-200 rounded-md"
              >
              <div className="flex bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none items-center">
                <button
                  onClick={() => toggleProjectDropdown(index)}
                  className="w-full p-3 text-left  "
                >
                  <strong>Activity:</strong> {row.description}
                </button>

                {!row.activity_type.includes('deleted') &&
                  <Button
                              className="bg-charcolBlue text-teal-400 hover:text-teal-500"
                              onClick={() => navigate(`/client/view-bids/posted-project/${row.related_object_id}`)}
                            >
                              View Details
                            </Button>
                }
                </div>
                {openProjectDropdown === index && (
                  <div className="p-3 bg-white">
                    <p>
                      <strong>TimeStamp:</strong>{" "}
                      {format_timeStamp(row.timestamp)}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {format_activity_type(row.activity_type)}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-center">No projects found</div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-end">
          <Pagination
            current={currentProjectPage}
            pageSize={projectPageSize}
            total={
              filteredProjects.length > 0
                ? filteredProjects.length
                : projectData.length
            }
            onChange={(page) => setCurrentProjectPage(page)}
            showSizeChanger={false}
          />
        </div>
      </Card>

      <Card title="Other Activities">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="bg-white w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Activity</th>
                <th className="p-3 text-left">Time Stamp</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {
                // Rendering paginated project data
                paginatedOtherActivitiesData.length > 0 ? (
                  paginatedOtherActivitiesData.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-3">{row.description}</td>
                      <td className="p-3">{format_timeStamp(row.timestamp)}</td>
                      <td className="p-3">
                        {format_activity_type(row.activity_type)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-3 text-center">
                      No projects found
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>

        {/* Mobile Dropdown View */}
        <div className="block md:hidden">
          {paginatedOtherActivitiesData.length > 0 ? (
            paginatedOtherActivitiesData.map((row, index) => (
              <div
                key={row.id}
                className="mb-4 border border-gray-200 rounded-md"
              >
                <button
                  onClick={() => toggleOtherActivitiesDropdown(index)}
                  className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none"
                >
                  <strong>Activity:</strong> {row.description}
                </button>
                {openOtheractivitiesDropdown === index && (
                  <div className="p-3 bg-white">
                    <p>
                      <strong>TimeStamp:</strong>{" "}
                      {format_timeStamp(row.timestamp)}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {format_activity_type(row.activity_type)}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-center">No projects found</div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-end">
        <Pagination
        current={currentOtherActivitiesPage}
        pageSize={otherPageSize}
        total={otherActivitiesData.length}
        onChange={(page) => setCurrentOtherActivitiesPage(page)}
        showSizeChanger={false}
      />
      
        </div>
      </Card>
    </div>
  );
};

export default RecentActivity;
