import React, { useState } from 'react';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import { Link } from 'react-router-dom';

const CConnectionRequests = () => {
  // Sample connection requests data for the client
  const [connectionRequests, setConnectionRequests] = useState([
    {
      id: 1,
      name: 'Freelancer A',
      title: 'Freelancer',
      description: 'Hey, I would like to connect with you regarding some opportunities.',
      timestamp: '1 hour ago',
      status: 'pending', // 'accepted', 'rejected', 'pending'
    },
    {
      id: 2,
      name: 'Freelancer B',
      title: 'Graphic Designer',
      description: 'Interested in collaborating on a project together.',
      timestamp: '2 hours ago',
      status: 'accepted',
    },
    {
      id: 3,
      name: 'Freelancer C',
      title: 'Web Developer',
      description: 'Looking forward to working with you on some freelance tasks.',
      timestamp: '1 day ago',
      status: 'pending',
    },
  ]);

  // Accept a connection request
  const acceptConnectionRequest = (id) => {
    setConnectionRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status: 'accepted' } : request
      )
    );
  };

  // Reject a connection request
  const rejectConnectionRequest = (id) => {
    setConnectionRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status: 'rejected' } : request
      )
    );
  };

  // Filter connection requests by status
  const [filter, setFilter] = useState('all');
  const filteredRequests = connectionRequests.filter((request) => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <CSider dropdown={true} collapsed={true} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-16 md:ml-16 lg:ml-22">
        {/* Header */}
        <CHeader />

        {/* Connection Requests Content */}
        <div className="flex-1 overflow-auto bg-gray-200 p-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Connection Requests Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-teal-600">Connection Requests</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'all'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'pending'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('accepted')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'accepted'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setFilter('rejected')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'rejected'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>

            {/* Connection Requests List */}
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 rounded-lg ${request.status === 'accepted' ? 'bg-gray-50' : request.status === 'rejected' ? 'bg-red-50' : 'bg-teal-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-teal-600">{request.name}</h3>
                      <p className="text-sm text-gray-600">{request.title}</p>
                      <p className="text-sm text-gray-600">{request.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{request.timestamp}</p>
                    </div>
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => acceptConnectionRequest(request.id)}
                            className="px-3 py-1 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectConnectionRequest(request.id)}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {request.status === 'accepted' && (
                        <span className="text-sm text-green-600">Accepted</span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="text-sm text-red-600">Rejected</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Requests Message */}
            {filteredRequests.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-600">No connection requests found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CConnectionRequests;
