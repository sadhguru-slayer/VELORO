import React from 'react';

const SharedFiles = ({ chat }) => {
  // Dummy data - replace with real data from your backend
  const files = [
    {
      id: 1,
      name: 'project_document.pdf',
      size: '2.3 MB',
      date: '2024-01-20'
    },
    {
      id: 2,
      name: 'design_specs.docx',
      size: '1.1 MB',
      date: '2024-01-18'
    }
  ];

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Shared Files</h3>
      <div className="space-y-2">
        {files.length > 0 ? (
          files.map(file => (
            <div key={file.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-violet-50 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/s"
                    className="h-5 w-5 text-violet-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.size} • {file.date}</p>
                </div>
              </div>
              <button className="p-2 text-gray-500 hover:text-violet-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/s"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 text-center">No files shared yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedFiles; 