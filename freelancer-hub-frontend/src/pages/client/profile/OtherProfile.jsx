import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from'axios';
import { Button, message, Pagination,Table } from "antd";
import { FaEye } from 'react-icons/fa';
import { GrConnect } from "react-icons/gr";
import { BiSolidMessageRounded } from "react-icons/bi";
import { FaUserClock } from "react-icons/fa6";
import { FaTimes,FaCheck } from "react-icons/fa";


const OtherProfile = ({userId, role,editable}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [clientInfo, setClientInfo] = useState({});
    const [projects, setProjects] = useState([]);
    const [reviewsList, setReviewsList] = useState([]);
    const [connectionCount, setConnectionCount] = useState(0);  // To store connection count
    const [averageRating, setAverageRating] = useState(0);  // To store average rating  
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connection_id, seConnection_id] = useState(null);
    const [connection_status, setConnection_status] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const paginatedData = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const [loading, setLoading] = useState(true);
  
    const handlePaginationChange = (page) => {
      setCurrentPage(page);
    };
  
    useEffect(() => {
      const fetchProfileDetails = async () => {
        const accessToken = Cookies.get('accessToken');
        if (!userId || !accessToken) {
            console.log("Waiting for userId or accessToken...");
            return; 
          }
          setLoading(true);
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/client/get_profile_data',
            {
                params: { userId: userId }, // Passing userId as query parameter
                headers: {
                  Authorization: `Bearer ${accessToken}`, // Passing the access token as Authorization header
                },
              });
          const data = response.data;
          
          seConnection_id(data.client_profile.connection_id)
          setConnection_status(data.connection_status);
          setIsConnected(data.is_connected);
          setClientInfo(data.client_profile);
          setProjects(data.projects);
          setReviewsList(data.reviews_and_ratings.reviews);
          setConnectionCount(data.connection_Count);
          setAverageRating(data.reviews_and_ratings.average_rating);
        } catch (error) {
          console.log(error);
        }finally {
            setLoading(false); // Stop loading after request is completed
          }

      };
      fetchProfileDetails();
    }, [userId]);

    const handleConnect = async (user_id)=>{
      try {
        const token = Cookies.get('accessToken');
        if (!token) {
          console.log('No access token available');
          return;
        }
        const response = await axios.post(
          `http://127.0.0.1:8000/api/client/connections/${user_id}/establish_connection/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`, // Correct token format
            },
          }
        );
        setConnection_status(response.data.status);
      } catch (error) {
        console.error('Error accepting connection:', error);
      }
    }

    const handleAccept = async (connectionId) => {
        try {
          const token = Cookies.get('accessToken');
          if (!token) {
            console.log('No access token available');
            return;
          }
          const response = await axios.post(
            `http://127.0.0.1:8000/api/client/connections/${connectionId}/accept_connection/`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`, // Correct token format
              },
            }
          );
          setConnection_status(response.data.status);
          setIsConnected(true)
        } catch (error) {
          console.error('Error accepting connection:', error);
        }
      };
      
      
      const handleReject = async (connectionId) => {
        try {
          const response = await axios.post(
            `http://127.0.0.1:8000/api/client/connections/${connectionId}/reject_connection/`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${Cookies.get('accessToken')}`, // Include auth token if necessary
              },
            }
          );
          setConnection_status(response.data.status);


        } catch (error) {
          console.error('Error rejecting connection:', error);
        }
      };
    
  return (
    <div className="flex flex-col items-start space-y-6">
  {/* Profile Overview */}
  <div className="bg-white p-6 rounded-lg shadow-md w-full">
  <div className="flex flex-col sm:flex-row md:flex-row items-center space-x-6">
  <img
    src={clientInfo.profile_picture ? `http://127.0.0.1:8000${clientInfo.profile_picture}` : "https://www.w3schools.com/howto/img_avatar.png"}
    alt="Profile"
    className="w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-26 xl:h-26 rounded-full object-cover"
  />
  
  <div className="flex justify-start w-full sm:flex-col md:flex-col flex-wrap">
    <div className="text-xs sm:text-[12px] md:text-xs lg:text-sm text-teal-500 font-[7px] flex flex-col items-start sm:items-start md:justify-center lg:justify-center space-y-2">
      <h2 className="text-2xl font-bold text-teal-600">{clientInfo.name}</h2>
      <span className="text-teal-500 text-xs sm:text-xs md:text-sm">{clientInfo.role}</span>
      <p className="text-gray-600 text-xs sm:text-xs md:text-sm">{clientInfo.email}</p>
      {clientInfo.bio && <p className="text-gray-600 text-sm my-3 font-medium">{clientInfo.bio}</p>}
    </div>

    

    <div className="mt-4 flex flex-col justify-end items-end sm:items-start md:items-start w-full font-medium">
    <div className="mt-2 text-gray-500 text-xs sm:text-xs md:text-sm ">
      <p className='underline'>📍 {clientInfo.location}</p>
      <p onClick={() => navigate('/client/connections/')} className="cursor-pointer hover:text-teal-700">🔗 {connectionCount} Connections</p>
    </div>
    
    <div className="mt-4 flex space-x-4 flex-wrap justify-start">
      {!isConnected && connection_status === 'notset' && (
        <button
          onClick={() => handleConnect(userId)}
          className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-500 transition duration-300 flex gap-2 items-center text-[12px] sm:text-base md:text-sm"
        >
          <GrConnect /> Connect
        </button>
      )}

      {(connection_status === 'pending' || connection_status === 'rejected') && (
        <button
          onClick={() => message.error(`Please wait  
            ${connection_status === 'rejected' ? 'till next week to make' : `until ${clientInfo.name} accepts`} your request`)}
          className="bg-gray-300 text-gray-500 py-2 px-6 rounded-lg transition duration-300 flex gap-2 disabled cursor-no-drop text-[12px] sm:text-base md:text-sm"
        >
          <FaUserClock className='text-lg' /> Pending
        </button>
      )}

      {(connection_status === 'not_accepted') && (
        <span className='flex gap-2'>
          <button
            onClick={() => handleAccept(connection_id)}
            className="bg-teal-700 text-white hover:bg-teal-600 hover:text-gray-100 py-2 px-6 rounded-lg transition duration-300 flex gap-2 items-center cursor-pointer text-[12px] sm:text-base md:text-sm"
          >
            <FaCheck /> Accept
          </button>

          <button
            onClick={() => handleReject(connection_id)}
            className="bg-gray-100 text-black hover:bg-gray-200 hover:text-gray-900 py-2 px-6 rounded-lg transition duration-300 flex gap-2 items-center cursor-pointer text-[12px] sm:text-base md:text-sm"
          >
            <FaTimes /> Reject
          </button>
        </span>
      )}

      {isConnected && connection_status === 'accepted' && (
        <button
          onClick={() => message.success("Message will be set shortly")}
          className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-500 transition duration-300 flex gap-2 items-center text-[12px] sm:text-base md:text-sm"
        >
          <BiSolidMessageRounded /> Message
        </button>
      )}
    </div>
    </div>
  </div>
</div>

  </div>

  {/* Projects */}
  <div className="bg-white p-6 rounded-lg shadow-md w-full">
    <h3 className="text-xl font-semibold mb-4 text-teal-600">Projects</h3>

    {/* Desktop View */}
    <div className="hidden md:block">
      <Table
        dataSource={paginatedData}
        columns={[
          {
            title: "Project Title",
            dataIndex: "title",
            key: "title",
          },
          {
            title: "Action",
            key: "action",
            render: (text, project) => (
              <span
                onClick={() => navigate(`/client/view-bids/posted-project/${project.id}`)}
                className="text-teal-600 hover:text-teal-500 transition duration-300"
              >
                View Project
              </span>
            ),
          },
        ]}
        pagination={false}
        rowKey="id"
      />
    </div>

    {/* Mobile View */}
    <div className="block md:hidden">
      {paginatedData.map((project, index) => (
        <div key={project.id} className="mb-4 border border-gray-200 rounded-lg">
          <button
            onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
            className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none"
          >
            {project.title}
          </button>
          {openDropdown === index && (
            <div className="p-3 bg-white flex flex-wrap justify-center items-center gap-1">
              <p><strong>Deadline:</strong> {project.deadline}</p>
              <p><strong>Status:</strong> {project.status}</p>
              <div className="flex space-x-2 mt-2">
                <Button
                  className="bg-charcolBlue text-teal-400 hover:text-teal-500"
                  onClick={() => navigate(`/client/view-bids/posted-project/${project.id}`, { state: { project } })}
                >
                  View Details
                </Button>
              </div>
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
        total={projects.length} // Total projects count
        onChange={handlePaginationChange}
        showSizeChanger={false}
      />
    </div>
  </div>

  {/* Reviews */}
  <div className="bg-white p-6 rounded-lg shadow-md w-full">
    <h3 className="text-xl font-semibold mb-4 text-teal-600">Reviews & Ratings</h3>
    {reviewsList.length > 0 ? (
      <div className="space-y-4">
        {reviewsList.map((review) => (
          <div key={review.id} className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">{review.from_freelancer_username}</span>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium">{review.from_freelancer_username}</p>
              <div className="flex items-center space-x-1">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
              </div>
              <p className="text-gray-600 text-sm">{review.feedback}</p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="w-full text-center text-gray-400 font-semibold p-4">
        No reviews yet
      </div>
    )}
  </div>

  {/* Call-to-Action Buttons */}
  <div className="mt-6 flex flex-col sm:flex-row justify-between w-full space-y-4 sm:space-y-0">
    <Link to="/client/dashboard">
      <button className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-500 transition duration-300 w-full sm:w-auto">
        Go to Dashboard
      </button>
    </Link>
    <button className="bg-teal-500 text-white py-2 px-6 rounded-lg hover:bg-teal-600 transition duration-300 w-full sm:w-auto">
      Hire Freelancers
    </button>
  </div>
</div>

  )
}

export default OtherProfile;