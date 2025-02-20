import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button, Table, Pagination } from 'antd';
import { FaEye } from 'react-icons/fa';
import './Collaboration.css'

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
  const [loading, setLoading] = useState(false);

  // Pagination Handler
  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  // Fetch collaboration data
  const fetchCollaborationData = async () => {
    setLoading(true);
    const accessToken = Cookies.get('accessToken');
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/client/get_collaborations', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
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

  // Collaboration table columns
  const collaborationColumns = [
    {
      title: 'Collaboration Title',
      dataIndex: 'collaboration_name',
      key: 'collaboration_name',
    },
    {
      title: 'Status',
      dataIndex: 'STATUS',
      key: 'STATUS',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, collaboration) => (
        <Button
          onClick={() => navigate(`/collaboration/${collaboration.id}`)}
          icon={<FaEye />}
          type="link"
        >
          View Details
        </Button>
      ),
    },
  ];

  // Group overview (similar to WhatsApp groups)
  const groupColumns = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Participants',
      dataIndex: 'participants',
      key: 'participants',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, group) => (
        <Button
          onClick={() => navigate(`/group/${group.id}`)}
          icon={<FaEye />}
          type="link"
        >
          View Group
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-teal-600 mb-4">Collaboration Overview</h2>
      {collaborations.admin &&
        <div className="bg-white p-6 rounded-md mb-6 shadow-lg border-l-4 border-teal-500">
  <h3 className="text-xl font-semibold text-teal-600 mb-4">Your Collaborations (Admin)</h3>
  <Table
    loading={loading}
    dataSource={collaborations.admin}
    columns={collaborationColumns}
    pagination={false}
    rowKey="id"
    className="custom-table"  // Apply custom class for the table
  />
</div>

             }
      <div className="bg-white p-6 rounded-md lg:ml-22dow-sm mb-6">
      {/* Your Collaborations (Admin) */}
      
      {/* Ongoing Collaborations */}
      <div className="bg-white p-6 rounded-md">
        <h3 className="text-xl font-semibold text-teal-600 mb-4">Ongoing Collaborations</h3>
        <Table
          loading={loading}
          dataSource={collaborations.ongoing}
          columns={collaborationColumns}
          pagination={false}
          rowKey="id"
        />
      </div>

      {/* Inactive Collaborations */}
      <div className="bg-white p-6 rounded-md">
        <h3 className="text-xl font-semibold text-teal-600 mb-4">Inactive Collaborations</h3>
        <Table
          loading={loading}
          dataSource={collaborations.inactive}
          columns={collaborationColumns}
          pagination={false}
          rowKey="id"
        />
      </div>

      {/* Previous Collaborations */}
      <div className="bg-white p-6 rounded-md">
        <h3 className="text-xl font-semibold text-teal-600 mb-4">Previous Collaborations</h3>
        <Table
          loading={loading}
          dataSource={collaborations.previous}
          columns={collaborationColumns}
          pagination={false}
          rowKey="id"
        />
      </div>
</div>
     

      {/* Groups Overview */}
      <div className="bg-white p-6 rounded-md">
        <h3 className="text-xl font-semibold text-teal-600 mb-4">Groups Overview</h3>
        <Table
          dataSource={groups}
          columns={groupColumns}
          pagination={false}
          rowKey="id"
        />
      </div>
    </div>
  );
};

export default Collaborations;
