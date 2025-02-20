import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select, Modal, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const BiddingOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBid, setSelectedBid] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredBids, setFilteredBids] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null); // To manage mobile dropdown state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const navigate = useNavigate();

  // Sample bid history data
  const bids = [
    { id: 1, projectName: "Website Development", bidAmount: "₹50000", status: "Pending", deadline: "2024-12-25" },
    { id: 2, projectName: "Mobile App", bidAmount: "₹30000", status: "Accepted", deadline: "2024-12-15" },
    { id: 3, projectName: "SEO Optimization", bidAmount: "₹15000", status: "Rejected", deadline: "2024-11-30" },
    { id: 4, projectName: "UI/UX Design", bidAmount: "₹25000", status: "Pending", deadline: "2024-12-20" },
    { id: 5, projectName: "Backend Development", bidAmount: "₹40000", status: "Accepted", deadline: "2024-12-10" },
  ];

  // Effect hook for filtering bids whenever searchTerm or statusFilter changes
  useEffect(() => {
    const filtered = bids.filter((bid) => {
      const matchesSearchTerm = bid.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? bid.status.toLowerCase() === statusFilter.toLowerCase() : true;
      return matchesSearchTerm && matchesStatus;
    });
    setFilteredBids(filtered);
  }, [searchTerm, statusFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handlePreview = (bid) => {
    setSelectedBid(bid);
    setShowProposalModal(true);
  };

  const handleViewDetails = (id,project) => {
    navigate(`/freelancer/dashboard/projects/${id}`,{state:{project}});
  };

  const closeModal = () => {
    setShowProposalModal(false);
    setSelectedBid(null);
  };

  const paginatedData = filteredBids.length > 0 ? filteredBids.slice((currentPage - 1) * pageSize, currentPage * pageSize) : bids.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div className="p-3 bg-gray-100 rounded-lg shadow-sm hover:shadow-md">
      {/* Header */}
      <h2 className="text-xl font-semibold mb-4">Bidding Overview</h2>

      {/* Search and Filter */}
      <div className="flex mb-6 space-x-4">
        <Input
          placeholder="Search by project name"
          value={searchTerm}
          onChange={handleSearchChange}
          prefix={<SearchOutlined />}
          className="w-72"
        />
        <Select
          defaultValue=""
          className="w-48"
          onChange={handleFilterChange}
          placeholder="Filter by Status"
        >
          <Option value="">All Statuses</Option>
          <Option value="Pending">Pending</Option>
          <Option value="Accepted">Accepted</Option>
          <Option value="Rejected">Rejected</Option>
        </Select>
      </div>

      {/* Bid History Table */}
      <Card title="Projects">
        <div className="hidden md:block">
          <table className="bg-white w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                {["Project Name", "Bid Amount", "Status", "Deadline", "Actions"].map((title) => (
                  <th key={title} className="p-3 text-left">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3">{row.projectName}</td>
                  <td className="p-3">{row.bidAmount}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">{row.deadline}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button type="primary" onClick={() => handlePreview(row)}>
                        Preview
                      </Button>
                      <Button onClick={() => handleViewDetails(row.id,row)}>View Details</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Dropdown View */}
        <div className="block md:hidden">
          {paginatedData.map((row, index) => (
            <div key={row.id} className="mb-4 border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleDropdown(index)}
                className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none"
              >
                {row.projectName} {/* Use the first column as the dropdown title */}
              </button>
              {openDropdown === index && (
                <div className="p-3 bg-white">
                  <p>
                    <strong>Bid Amount:</strong> {row.bidAmount}
                  </p>
                  <p>
                    <strong>Status:</strong> {row.status}
                  </p>
                  <p>
                    <strong>Deadline:</strong> {row.deadline}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Button type="primary" onClick={() => handlePreview(row)}>
                      Preview
                    </Button>
                    <Button onClick={() => handleViewDetails(row.id,row)}>View Details</Button>
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
            total={filteredBids.length > 0 ? filteredBids.length : bids.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </Card>

      {/* Proposal Review Modal */}
      <Modal
        title={`Proposal for ${selectedBid?.projectName}`}
        open={showProposalModal}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
      >
        {selectedBid && (
          <div>
            <p>
              <strong>Bid Amount:</strong> {selectedBid.bidAmount}
            </p>
            <p>
              <strong>Status:</strong> {selectedBid.status}
            </p>
            <p>
              <strong>Deadline:</strong> {selectedBid.deadline}
            </p>
            <p>
              <strong>Proposal Details:</strong>
            </p>
            <textarea
              className="w-full p-2 border rounded-lg mt-2"
              rows="6"
              placeholder="Add your comments or proposal details here."
            ></textarea>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BiddingOverview;
