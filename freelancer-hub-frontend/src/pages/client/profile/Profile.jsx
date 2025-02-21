import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from'axios';
import { Button, Pagination,Table } from "antd";
import { FaEye } from 'react-icons/fa';


const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [clientInfo, setClientInfo] = useState({});
    const [projects, setProjects] = useState([]);
    const [reviewsList, setReviewsList] = useState([]);
    const [connectionCount, setConnectionCount] = useState(0);  // To store connection count
    const [averageRating, setAverageRating] = useState(0);  // To store average rating  
    const [openDropdown, setOpenDropdown] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const paginatedData = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
    const handlePaginationChange = (page) => {
      setCurrentPage(page);
    };
  
    useEffect(() => {
      const fetchProfileDetails = async () => {
        const accessToken = Cookies.get('accessToken');
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/client/get_profile_data', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const data = response.data;
          setClientInfo(data.client_profile);
          setProjects(data.projects);
          setReviewsList(data.reviews_and_ratings.reviews);
          setConnectionCount(data.connection_Count);
          setAverageRating(data.reviews_and_ratings.average_rating);
        } catch (error) {
          console.log(error);
        }
      };
      fetchProfileDetails();
    }, []);
    
  return (
    <div className="flex flex-col items-start space-y-6">
              {/* Profile Overview */}
              <div className="bg-white p-6 rounded-md shadow-md w-full">
                <div className="flex items-center space-x-6">
                
                  <img src={ clientInfo.profile_picture?`http://127.0.0.1:8000${clientInfo.profile_picture}`:"https://www.w3schools.com/howto/img_avatar.png"} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-teal-600">{clientInfo.name}</h2>
                    <p className="text-gray-600 text-sm ">{clientInfo.email}</p>
                    {clientInfo.bio &&
                      <p className="text-gray-600 text-sm my-3">{clientInfo.bio}</p>
                    }
                    
                    <div className="mt-2 text-gray-500">
                      <p>📍 {clientInfo.location}</p>
                      <p onClick={()=>navigate('/client/connections/')}>🔗 {connectionCount} Connections</p>
                    </div>
                    <div className="mt-4 flex space-x-4">
                      <button onClick={()=>navigate('/client/profile/',{state:{profileComponent:'edit_profile'}})} className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-500 transition duration-300">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div className="bg-white p-6 rounded-md shadow-md w-full">
                <h3 className="text-xl font-semibold mb-4 text-teal-600">Projects</h3>
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
                  <div key={project.id} className="mb-4 border border-gray-200 rounded-md">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                      className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none"
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
              <div className="bg-white p-6 rounded-md shadow-md w-full">
                <h3 className="text-xl font-semibold mb-4 text-teal-600">Reviews & Ratings</h3>
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
              </div>

              {/* Call-to-Action Buttons */}
              <div className="mt-6 flex justify-between w-full">
                <Link to="/client/dashboard">
                  <button className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-500 transition duration-300">
                    Go to Dashboard
                  </button>
                </Link>
                <button className="bg-teal-500 text-white py-2 px-6 rounded-md hover:bg-teal-600 transition duration-300">
                  Hire Freelancers
                </button>
              </div>
            </div>
  )
}

export default Profile