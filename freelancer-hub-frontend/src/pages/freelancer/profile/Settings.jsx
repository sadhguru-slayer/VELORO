import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Tabs, Form, Input, Button, Switch, Select, Divider, message, Upload, Avatar } from "antd";
import { FaCog, FaLock, FaBell, FaGlobe, FaUserCircle, FaUpload, FaCheck } from "react-icons/fa";

const { TabPane } = Tabs;
const { Option } = Select;

const Settings = () => {
  const { userId, isEditable } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [preferencesForm] = Form.useForm();
  
  // Dummy data for settings
  const [settingsData, setSettingsData] = useState({
    profile: {
      firstName: "Alex",
      lastName: "Johnson",
      email: "alex.johnson@example.com",
      phone: "+1 (555) 123-4567",
      title: "Full Stack Developer",
      bio: "Experienced full stack developer with 5+ years of experience in React, Node.js, and Python.",
      location: "San Francisco, CA",
      website: "https://alexjohnson.dev",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      hourlyRate: 45,
      availability: "Part-time",
      languages: ["English", "Spanish"]
    },
    security: {
      twoFactorEnabled: true,
      lastPasswordChange: "2023-09-15",
      loginNotifications: true,
      sessionTimeout: 30
    },
    notifications: {
      email: {
        projectMessages: true,
        projectUpdates: true,
        newProjects: true,
        marketingEmails: false
      },
      push: {
        projectMessages: true,
        projectUpdates: true,
        newProjects: false,
        marketingNotifications: false
      }
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "America/Los_Angeles",
      currency: "USD",
      projectVisibility: "public"
    }
  });

  useEffect(() => {
    // In a real app, you would fetch the settings data here
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      // Set form values
      profileForm.setFieldsValue({
        firstName: settingsData.profile.firstName,
        lastName: settingsData.profile.lastName,
        email: settingsData.profile.email,
        phone: settingsData.profile.phone,
        title: settingsData.profile.title,
        bio: settingsData.profile.bio,
        location: settingsData.profile.location,
        website: settingsData.profile.website,
        hourlyRate: settingsData.profile.hourlyRate,
        availability: settingsData.profile.availability,
        languages: settingsData.profile.languages
      });
      
      securityForm.setFieldsValue({
        twoFactorEnabled: settingsData.security.twoFactorEnabled,
        loginNotifications: settingsData.security.loginNotifications,
        sessionTimeout: settingsData.security.sessionTimeout
      });
      
      notificationForm.setFieldsValue({
        emailProjectMessages: settingsData.notifications.email.projectMessages,
        emailProjectUpdates: settingsData.notifications.email.projectUpdates,
        emailNewProjects: settingsData.notifications.email.newProjects,
        emailMarketingEmails: settingsData.notifications.email.marketingEmails,
        pushProjectMessages: settingsData.notifications.push.projectMessages,
        pushProjectUpdates: settingsData.notifications.push.projectUpdates,
        pushNewProjects: settingsData.notifications.push.newProjects,
        pushMarketingNotifications: settingsData.notifications.push.marketingNotifications
      });
      
      preferencesForm.setFieldsValue({
        theme: settingsData.preferences.theme,
        language: settingsData.preferences.language,
        timezone: settingsData.preferences.timezone,
        currency: settingsData.preferences.currency,
        projectVisibility: settingsData.preferences.projectVisibility
      });
    }, 1000);
  }, [userId, profileForm, securityForm, notificationForm, preferencesForm, settingsData]);

  const handleProfileSubmit = (values) => {
    console.log("Profile values:", values);
    message.success("Profile settings updated successfully!");
  };

  const handleSecuritySubmit = (values) => {
    console.log("Security values:", values);
    message.success("Security settings updated successfully!");
  };

  const handleNotificationSubmit = (values) => {
    console.log("Notification values:", values);
    message.success("Notification preferences updated successfully!");
  };

  const handlePreferencesSubmit = (values) => {
    console.log("Preferences values:", values);
    message.success("Preferences updated successfully!");
  };

  const handlePasswordChange = (values) => {
    console.log("Password change:", values);
    message.success("Password changed successfully!");
    securityForm.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <FaCog className="text-violet-600 text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="font-medium"
        >
          <TabPane 
            tab={
              <span className="flex items-center">
                <FaUserCircle className="mr-2" />
                Profile
              </span>
            } 
            key="profile"
          >
            <Card className="shadow-sm">
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleProfileSubmit}
                disabled={!isEditable}
              >
                <div className="flex flex-col md:flex-row gap-8 mb-6">
                  <div className="flex flex-col items-center">
                    <Avatar 
                      src={settingsData.profile.avatar} 
                      size={120} 
                      className="mb-4"
                    />
                    {isEditable && (
                      <Upload
                        showUploadList={false}
                        beforeUpload={() => false}
                      >
                        <Button 
                          icon={<FaUpload className="mr-2" />}
                          className="text-violet-600 border-violet-600 hover:text-violet-700 hover:border-violet-700"
                        >
                          Change Photo
                        </Button>
                      </Upload>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name="firstName"
                        label="First Name"
                        rules={[{ required: true, message: 'Please enter your first name' }]}
                      >
                        <Input placeholder="First Name" />
                      </Form.Item>
                      
                      <Form.Item
                        name="lastName"
                        label="Last Name"
                        rules={[{ required: true, message: 'Please enter your last name' }]}
                      >
                        <Input placeholder="Last Name" />
                      </Form.Item>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input placeholder="Email" />
                      </Form.Item>
                      
                      <Form.Item
                        name="phone"
                        label="Phone Number"
                      >
                        <Input placeholder="Phone Number" />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                
                <Divider />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="title"
                    label="Professional Title"
                    rules={[{ required: true, message: 'Please enter your professional title' }]}
                  >
                    <Input placeholder="E.g., Full Stack Developer" />
                  </Form.Item>
                  
                  <Form.Item
                    name="location"
                    label="Location"
                  >
                    <Input placeholder="E.g., San Francisco, CA" />
                  </Form.Item>
                </div>
                
                <Form.Item
                  name="bio"
                  label="Bio"
                  rules={[{ required: true, message: 'Please enter your bio' }]}
                >
                  <Input.TextArea rows={4} placeholder="Tell clients about yourself..." />
                </Form.Item>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="website"
                    label="Website"
                  >
                    <Input placeholder="https://yourwebsite.com" />
                  </Form.Item>
                  
                  <Form.Item
                    name="hourlyRate"
                    label="Hourly Rate (USD)"
                    rules={[{ required: true, message: 'Please enter your hourly rate' }]}
                  >
                    <Input type="number" min={0} placeholder="Hourly Rate" />
                  </Form.Item>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="availability"
                    label="Availability"
                    rules={[{ required: true, message: 'Please select your availability' }]}
                  >
                    <Select placeholder="Select availability">
                      <Option value="Full-time">Full-time</Option>
                      <Option value="Part-time">Part-time</Option>
                      <Option value="Weekends">Weekends</Option>
                      <Option value="Not Available">Not Available</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="languages"
                    label="Languages"
                    rules={[{ required: true, message: 'Please select at least one language' }]}
                  >
                    <Select mode="multiple" placeholder="Select languages">
                      <Option value="English">English</Option>
                      <Option value="Spanish">Spanish</Option>
                      <Option value="French">French</Option>
                      <Option value="German">German</Option>
                      <Option value="Chinese">Chinese</Option>
                      <Option value="Japanese">Japanese</Option>
                      <Option value="Russian">Russian</Option>
                      <Option value="Arabic">Arabic</Option>
                    </Select>
                  </Form.Item>
                </div>
                
                {isEditable && (
                  <div className="flex justify-end mt-4">
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      className="bg-violet-600 hover:bg-violet-700 border-none"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </Form>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span className="flex items-center">
                <FaLock className="mr-2" />
                Security
              </span>
            } 
            key="security"
          >
            <Card className="shadow-sm mb-6">
              <h2 className="text-lg font-medium mb-4">Change Password</h2>
              <Form
                layout="vertical"
                onFinish={handlePasswordChange}
                disabled={!isEditable}
              >
                <Form.Item
                  name="currentPassword"
                  label="Current Password"
                  rules={[{ required: true, message: 'Please enter your current password' }]}
                >
                  <Input.Password placeholder="Current Password" />
                </Form.Item>
                
                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    { required: true, message: 'Please enter your new password' },
                    { min: 8, message: 'Password must be at least 8 characters' }
                  ]}
                >
                  <Input.Password placeholder="New Password" />
                </Form.Item>
                
                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm your new password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm New Password" />
                </Form.Item>
                
                {isEditable && (
                  <div className="flex justify-end mt-4">
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      className="bg-violet-600 hover:bg-violet-700 border-none"
                    >
                      Update Password
                    </Button>
                  </div>
                )}
              </Form>
            </Card>
            
            <Card className="shadow-sm">
              <h2 className="text-lg font-medium mb-4">Security Settings</h2>
              <Form
                form={securityForm}
                layout="vertical"
                onFinish={handleSecuritySubmit}
                disabled={!isEditable}
              >
                <Form.Item
                  name="twoFactorEnabled"
                  valuePropName="checked"
                  label="Two-Factor Authentication"
                >
                  <Switch />
                </Form.Item>
                
                <p className="text-gray-600 text-sm mb-4">
                  Last password change: {new Date(settingsData.security.lastPasswordChange).toLocaleDateString()}
                </p>
                
                <Form.Item
                  name="loginNotifications"
                  valuePropName="checked"
                  label="Login Notifications"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="sessionTimeout"
                  label="Session Timeout (minutes)"
                >
                  <Select>
                    <Option value={15}>15 minutes</Option>
                    <Option value={30}>30 minutes</Option>
                    <Option value={60}>1 hour</Option>
                    <Option value={120}>2 hours</Option>
                    <Option value={240}>4 hours</Option>
                  </Select>
                </Form.Item>
                
                {isEditable && (
                  <div className="flex justify-end mt-4">
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      className="bg-violet-600 hover:bg-violet-700 border-none"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </Form>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span className="flex items-center">
                <FaBell className="mr-2" />
                Notifications
              </span>
            } 
            key="notifications"
          >
            <Card className="shadow-sm">
              <Form
                form={notificationForm}
                layout="vertical"
                onFinish={handleNotificationSubmit}
                disabled={!isEditable}
              >
                <h2 className="text-lg font-medium mb-4">Email Notifications</h2>
                
                <Form.Item
                  name="emailProjectMessages"
                  valuePropName="checked"
                  label="Project Messages"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="emailProjectUpdates"
                  valuePropName="checked"
                  label="Project Updates"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="emailNewProjects"
                  valuePropName="checked"
                  label="New Project Matches"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="emailMarketingEmails"
                  valuePropName="checked"
                  label="Marketing Emails"
                >
                  <Switch />
                </Form.Item>
                
                <Divider />
                
                <h2 className="text-lg font-medium mb-4">Push Notifications</h2>
                
                <Form.Item
                  name="pushProjectMessages"
                  valuePropName="checked"
                  label="Project Messages"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="pushProjectUpdates"
                  valuePropName="checked"
                  label="Project Updates"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="pushNewProjects"
                  valuePropName="checked"
                  label="New Project Matches"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="pushMarketingNotifications"
                  valuePropName="checked"
                  label="Marketing Notifications"
                >
                  <Switch />
                </Form.Item>
                
                {isEditable && (
                  <div className="flex justify-end mt-4">
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      className="bg-violet-600 hover:bg-violet-700 border-none"
                    >
                      Save Changes
                    </Button>
    </div>
                )}
              </Form>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span className="flex items-center">
                <FaGlobe className="mr-2" />
                Preferences
              </span>
            } 
            key="preferences"
          >
            <Card className="shadow-sm">
              <Form
                form={preferencesForm}
                layout="vertical"
                onFinish={handlePreferencesSubmit}
                disabled={!isEditable}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="theme"
                    label="Theme"
                  >
                    <Select>
                      <Option value="light">Light</Option>
                      <Option value="dark">Dark</Option>
                      <Option value="system">System Default</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="language"
                    label="Language"
                  >
                    <Select>
                      <Option value="en">English</Option>
                      <Option value="es">Spanish</Option>
                      <Option value="fr">French</Option>
                      <Option value="de">German</Option>
                      <Option value="zh">Chinese</Option>
                    </Select>
                  </Form.Item>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="timezone"
                    label="Timezone"
                  >
                    <Select>
                      <Option value="America/Los_Angeles">Pacific Time (US & Canada)</Option>
                      <Option value="America/Denver">Mountain Time (US & Canada)</Option>
                      <Option value="America/Chicago">Central Time (US & Canada)</Option>
                      <Option value="America/New_York">Eastern Time (US & Canada)</Option>
                      <Option value="Europe/London">London</Option>
                      <Option value="Europe/Paris">Paris</Option>
                      <Option value="Asia/Tokyo">Tokyo</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="currency"
                    label="Currency"
                  >
                    <Select>
                      <Option value="USD">USD ($)</Option>
                      <Option value="EUR">EUR (€)</Option>
                      <Option value="GBP">GBP (£)</Option>
                      <Option value="JPY">JPY (¥)</Option>
                      <Option value="CAD">CAD ($)</Option>
                      <Option value="AUD">AUD ($)</Option>
                    </Select>
                  </Form.Item>
                </div>
                
                <Form.Item
                  name="projectVisibility"
                  label="Project Visibility"
                >
                  <Select>
                    <Option value="public">Public (Visible to everyone)</Option>
                    <Option value="private">Private (Visible only to clients you work with)</Option>
                    <Option value="hidden">Hidden (Visible only to you)</Option>
                  </Select>
                </Form.Item>
                
                {isEditable && (
                  <div className="flex justify-end mt-4">
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      className="bg-violet-600 hover:bg-violet-700 border-none"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Settings;
