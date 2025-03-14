import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Button, Table, Badge, Tooltip, Empty, Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaEye, 
  FaUsers, 
  FaUsersCog,
  FaHistory,
  FaPause,
  FaCheckCircle,
  FaComments,
  FaBell,
  FaPlus
} from "react-icons/fa";
import { BsChatDots, BsThreeDots } from "react-icons/bs";
import "./Collaboration.css";

const Collaborations = () => {
  const navigate = useNavigate();
  const [collaborations, setCollaborations] = useState({
    ongoing: [],
    inactive: [],
    previous: [],
    admin: [],
  });
  const [groups, setGroups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [loading, setLoading] = useState(true);

  // Pagination Handler
  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  // Fetch collaboration data
  const fetchCollaborationData = async () => {
    setLoading(true);
    const accessToken = Cookies.get("accessToken");
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/client/get_collaborations",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = response.data;
      setCollaborations({
        ongoing: data.active_collaborations,
        inactive: data.inactive_collaborations,
        previous: data.completed_collaborations,
        admin: data.admin_collaborations,
      });
      setGroups(data.groups);
    } catch (error) {
      console.error("Error fetching collaborations data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborationData();
  }, []);

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      active: { color: "bg-green-500", text: "Active" },
      inactive: { color: "bg-yellow-500", text: "Inactive" },
      completed: { color: "bg-blue-500", text: "Completed" },
      pending: { color: "bg-orange-500", text: "Pending" }
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-white text-sm ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const CollaborationCard = ({ title, data = [], icon, type }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <div className="bg-gradient-to-r from-teal-500/10 to-charcolBlue/10 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-lg font-semibold text-charcolBlue">{title}</h3>
          </div>
          {type === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => navigate('/create-collaboration')}
            >
              <FaPlus className="text-sm" />
              New Collaboration
            </motion.button>
          )}
        </div>
      </div>

      <div className="p-6">
        {data.length > 0 ? (
          <div className="space-y-4">
            {data.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl p-6 flex items-center justify-between group border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    {type === 'group' ? <FaUsers className="text-xl" /> : <BsChatDots className="text-xl" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcolBlue text-lg">
                      {item.collaboration_name || item.name}
                    </h4>
                    {type !== 'group' && (
                      <div className="mt-2">
                        <StatusBadge status={item.STATUS} />
                      </div>
                    )}
                    {type === 'group' && (
                      <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <FaUsers className="text-teal-500" />
                        {item.participants} participants
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {type === 'group' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/group-chat/${item.id}`)}
                      className="bg-teal-50 text-teal-600 p-3 rounded-lg hover:bg-teal-100 transition-all duration-300"
                    >
                      <BsChatDots className="text-xl" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/${type}/${item.id}`)}
                    className="bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600 transition-all duration-300"
                  >
                    <FaEye className="text-xl" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <img
              src="/assets/empty-state.svg" // Add your empty state illustration
              alt="No data"
              className="w-48 h-48 mb-4 opacity-50"
            />
            <p className="text-gray-500 text-center">
              No {title.toLowerCase()} found. 
              {type === 'admin' && (
                <button
                  onClick={() => navigate('/create-collaboration')}
                  className="text-teal-500 hover:text-teal-600 font-medium ml-1"
                >
                  Create one now
                </button>
              )}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  // Add safe array length check
  const getArrayLength = (arr) => {
    return Array.isArray(arr) ? arr.length : 0;
  };

  // Quick Stats with safe checks
  const statsData = [
    {
      title: "Active Collaborations",
      value: getArrayLength(collaborations?.ongoing),
      icon: <FaUsers className="text-teal-500" />,
      color: "bg-teal-50"
    },
    {
      title: "Groups",
      value: getArrayLength(groups),
      icon: <FaComments className="text-blue-500" />,
      color: "bg-blue-50"
    },
    {
      title: "Completed Projects",
      value: getArrayLength(collaborations?.previous),
      icon: <FaCheckCircle className="text-green-500" />,
      color: "bg-green-50"
    },
    {
      title: "Pending Actions",
      value: getArrayLength(collaborations?.inactive),
      icon: <FaPause className="text-yellow-500" />,
      color: "bg-yellow-50"
    }
  ];

  // Add loading state for the component
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] min-w-[320px] min-h-fit mx-auto p-6 space-y-6">
      {/* Simplified Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-teal-500/5 to-charcolBlue/5 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-charcolBlue mb-2">
                Collaboration Hub
              </h1>
              <p className="text-gray-600">
                Manage your active collaborations and group activities
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/create-collaboration')}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-600 transition-all duration-300"
              >
                <FaPlus className="text-sm" />
                New Collaboration
              </motion.button>
              <Tooltip title="View Settings">
                <Button
                  icon={<BsThreeDots />}
                  className="border-gray-200 hover:border-teal-500 hover:text-teal-500"
                />
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          {[
            {
              title: "Active",
              value: getArrayLength(collaborations?.ongoing),
              icon: <FaUsers />,
              color: "text-teal-500",
              bgColor: "bg-teal-50"
            },
            {
              title: "Groups",
              value: getArrayLength(groups),
              icon: <FaComments />,
              color: "text-blue-500",
              bgColor: "bg-blue-50"
            },
            {
              title: "Completed",
              value: getArrayLength(collaborations?.previous),
              icon: <FaCheckCircle />,
              color: "text-green-500",
              bgColor: "bg-green-50"
            },
            {
              title: "Pending",
              value: getArrayLength(collaborations?.inactive),
              icon: <FaPause />,
              color: "text-yellow-500",
              bgColor: "bg-yellow-50"
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-all duration-300"
            >
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <span className={`text-lg ${stat.color}`}>{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-xl font-semibold text-charcolBlue">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="space-y-6">
        {collaborations?.admin && collaborations.admin.length > 0 && (
          <CollaborationCard
            title="Admin Collaborations"
            data={collaborations.admin}
            icon={<FaUsersCog className="text-xl text-teal-500" />}
            type="admin"
          />
        )}

        <CollaborationCard
          title="Active Collaborations"
          data={collaborations?.ongoing || []}
          icon={<FaUsers className="text-xl text-teal-500" />}
          type="collaboration"
        />

        <CollaborationCard
          title="Groups"
          data={groups || []}
          icon={<BsChatDots className="text-xl text-teal-500" />}
          type="group"
        />

        <CollaborationCard
          title="Previous Collaborations"
          data={collaborations?.previous || []}
          icon={<FaHistory className="text-xl text-teal-500" />}
          type="collaboration"
          />
        </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default Collaborations;
