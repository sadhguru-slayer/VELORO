import React, { useState } from 'react';
import { Avatar, Button, List, Tooltip, Modal, Input, message } from 'antd';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';

const MAX_MEMBERS = 5; // Starter tier limit

const GroupMembers = ({ chatId }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const role = Cookies.get('role');
  const isClient = role === 'client';
  const themeColor = isClient ? 'teal' : 'violet';

  // Mock members for demo
  const [members, setMembers] = useState([
    { id: 1, name: 'John Doe', role: 'client', avatar: 'JD' },
    { id: 2, name: 'Alice Smith', role: 'freelancer', avatar: 'AS' }
  ]);

  const handleAddMember = () => {
    if (members.length >= MAX_MEMBERS) {
      message.error('Maximum group size reached (5 members for Starter tier)');
      return;
    }
    setIsModalVisible(true);
  };

  const handleRemoveMember = (memberId) => {
    // <!-- BACKEND_TODO: Implement member removal from group -->
    setMembers(members.filter(m => m.id !== memberId));
    message.success('Member removed from group');
  };

  const handleModalOk = () => {
    if (members.length >= MAX_MEMBERS) {
      message.error('Maximum group size reached');
      return;
    }

    // Mock adding a new member
    const newMember = {
      id: Date.now(),
      name: searchText,
      role: 'freelancer',
      avatar: searchText.split(' ').map(n => n[0]).join('')
    };

    setMembers([...members, newMember]);
    setIsModalVisible(false);
    setSearchText('');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-${themeColor}-600 font-medium`}>Group Members</h3>
        <Tooltip title={members.length >= MAX_MEMBERS ? 'Group size limit reached' : 'Add member'}>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleAddMember}
            disabled={members.length >= MAX_MEMBERS}
            className={`bg-${themeColor}-500 hover:bg-${themeColor}-600 border-none`}
          >
            Add Member
          </Button>
        </Tooltip>
      </div>

      <List
        className="bg-white rounded-lg shadow-sm"
        itemLayout="horizontal"
        dataSource={members}
        renderItem={item => (
          <List.Item
            actions={[
              <Tooltip title="Remove member">
                <Button
                  type="text"
                  danger
                  icon={<UserDeleteOutlined />}
                  onClick={() => handleRemoveMember(item.id)}
                />
              </Tooltip>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar>{item.avatar}</Avatar>}
              title={
                <span className={`text-${themeColor}-600`}>
                  {item.name}
                </span>
              }
              description={
                <span className="capitalize text-gray-500">
                  {item.role}
                </span>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title="Add Group Member"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          setSearchText('');
        }}
        okButtonProps={{
          className: `bg-${themeColor}-500 hover:bg-${themeColor}-600 border-none`
        }}
      >
        <Input
          placeholder="Enter member name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className={`border-${themeColor}-200 hover:border-${themeColor}-400`}
        />
        <p className="mt-2 text-gray-500">
          {members.length}/{MAX_MEMBERS} members (Starter tier limit)
        </p>
      </Modal>
    </div>
  );
};

export default GroupMembers;
