import React from 'react';

const ChatSettings = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-gray-800">Chat Settings</h1>
      
      <div className="mt-6 space-y-6">
        <section>
          <h2 className="text-lg font-medium text-gray-700">Notification Settings</h2>
        </section>

        <section>
          <h2 className="text-lg font-medium text-gray-700">Permissions Management</h2>
        </section>

        <section>
          <h2 className="text-lg font-medium text-gray-700">Chat Appearance</h2>
        </section>
      </div>
    </div>
  );
};

export default ChatSettings; 