import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button, Table, Pagination } from 'antd';
import { FaEye } from 'react-icons/fa';

const Collaborations = () => {
  const navigate = useNavigate();
  const [collaborations, setCollaborations] = useState({
    previous: [],
    pending: [],
    received: [],
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
      const response = await axios.get('http://127.0.0.1:8000/api/collaborations', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = response.data;
      setCollaborations(data.collaborations);
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
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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

      {/* Collaborations */}
      <div className="bg-white p-6 rounded-md lg:ml-22dow-sm mb-6">
        <h3 className="text-xl font-semibold text-teal-600 mb-4">Collaborations</h3>

        {/* Previous Collaborations */}
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Previous Collaborations</h4>
        <Table
          loading={loading}
          dataSource={collaborations.previous}
          columns={collaborationColumns}
          pagination={false}
          rowKey="id"
        />

        {/* Pending Collaborations */}
        <h4 className="text-lg font-semibold text-gray-800 mb-2 mt-4">Pending Collaborations</h4>
        <Table
          loading={loading}
          dataSource={collaborations.pending}
          columns={collaborationColumns}
          pagination={false}
          rowKey="id"
        />

        {/* Received Collaborations */}
        <h4 className="text-lg font-semibold text-gray-800 mb-2 mt-4">Received Collaborations</h4>
        <Table
          loading={loading}
          dataSource={collaborations.received}
          columns={collaborationColumns}
          pagination={false}
          rowKey="id"
        />

        {/* Pagination for Collaborations */}
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={collaborations.previous.length + collaborations.pending.length + collaborations.received.length}
          onChange={handlePaginationChange}
          showSizeChanger={false}
        />
      </div>

      {/* Groups Overview */}
      <div className="bg-white p-6 rounded-md lg:ml-22dow-md">
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
