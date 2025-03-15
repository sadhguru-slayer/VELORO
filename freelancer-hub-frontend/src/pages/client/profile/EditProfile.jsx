import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Switch,
  Collapse,
  Row,
  Col,
  Tooltip,
} from "antd";
import { 
  UploadOutlined, 
  UserOutlined, 
  BankOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  NumberOutlined,
  IdcardOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons"; 
import { LuBuilding2 } from "react-icons/lu";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { useMediaQuery } from "react-responsive";

const { Panel } = Collapse;

const EditProfile = ({ userId, role, isSiderCollapsed }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    profilePicture: null,
    bankName: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankVerified: false,
    idProof: null,
    idVerified: false,
    companyName: "",
    companyWebsite: "",
    companyRegistrationNumber: "",
  });

  const [showingProfilePicture, setShowingProfilePicture] = useState(null);
  const [file, setFile] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const fetchProfileDetails = async () => {
      const accessToken = Cookies.get("accessToken");
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/client/get_profile_data', {
          params: { userId: userId },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = response.data.client_profile;
        setClientInfo({
          name: data.name,
          email: data.email,
          bio: data.bio || "",
          location: data.location || "",
          profilePicture: data.profile_picture
            ? `http://127.0.0.1:8000${data.profile_picture}`
            : null,
          bankName: data.bank_name || "",
          bankAccountNumber: data.bank_account_number || "",
          bankIfsc: data.bank_ifsc || "",
          bankVerified: data.bank_verified || false,
          idProof: data.id_proof || null,
          idVerified: data.id_verified || false,
          companyName: data.company_name || "",
          companyWebsite: data.company_website || "",
          companyRegistrationNumber: data.company_registration_number || "",
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileDetails();
  }, [userId]);

  useEffect(() => {
    if (clientInfo.name) {
      form.setFieldsValue(clientInfo);
    }
  }, [clientInfo, form]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setShowingProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (values) => {
    const accessToken = Cookies.get("accessToken");
    const formData = new FormData();
    formData.append("bio", values.bio || "");
    formData.append("location", values.location || "");
    formData.append("bank_name", values.bankName || "");
    formData.append("bank_account_number", values.bankAccountNumber || "");
    formData.append("bank_ifsc", values.bankIfsc || "");
    formData.append("id_verified", values.idVerified || "");
    formData.append("company_name", values.companyName || "");
    formData.append("company_website", values.companyWebsite || "");
    formData.append("company_registration_number", values.companyRegistrationNumber || "");

    if (file) {
      formData.append("profile_picture", file);
    }

    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/api/client/update_profile/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      message.success("Profile updated successfully!");
      navigate(`/client/profile/${userId}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    }
  };

  return (
    <div className={`w-full max-w-[1200px] min-w-[320px] mx-auto p-6 space-y-8  min-h-full h-fit`}>
      {/* Enhanced Header with Gradient Background */}
      <div className="relative bg-gradient-to-r from-teal-500/10 to-charcolBlue/10 rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-charcolBlue">Edit Profile</h2>
            <p className="text-gray-600">Customize your professional presence</p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/client/profile/${userId}`)}
              className="border-teal-500 text-teal-500 hover:text-teal-600 hover:border-teal-600 rounded-lg h-10"
            >
              Back to Profile
            </Button>
          </motion.div>
        </div>
      </div>

      <Form
        form={form}
        onFinish={handleFormSubmit}
        layout="vertical"
        className="space-y-8"
      >
        {/* Enhanced Profile Picture Section */}
        <motion.div 
          className="bg-gradient-to-b from-white to-gray-50 p-10 rounded-2xl shadow-sm"
          whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
        >
          <div className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img
                  src={showingProfilePicture || clientInfo.profilePicture || "https://www.w3schools.com/howto/img_avatar.png"}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300" />
                <Tooltip title="Change Profile Picture">
                  <Button
                    icon={<UploadOutlined className="text-lg" />}
                    className="absolute bottom-2 right-2 rounded-full w-12 h-12 bg-teal-500 text-white border-none hover:bg-teal-600 shadow-lg flex items-center justify-center"
                    onClick={() => document.getElementById('fileInput').click()}
                  />
                </Tooltip>
              </motion.div>
              <input
                id="fileInput"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            <p className="text-gray-500 text-sm">Click the button to upload a new profile picture</p>
          </div>
        </motion.div>

        {/* Enhanced Form Sections */}
        <div className="space-y-6">
          {/* Personal Information */}
          <motion.div 
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
            whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          >
            <div className="bg-gradient-to-r from-teal-500/5 to-charcolBlue/5 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <UserOutlined className="text-xl text-teal-500" />
                <h3 className="text-lg font-semibold text-charcolBlue">Personal Information</h3>
              </div>
            </div>
            <div className="p-6">
              <Row gutter={24} className={isMobile ? "flex-col" : ""}>
                <Col span={24}>
                  <Form.Item
                    label="Name"
                    name="name"
                    initialValue={clientInfo.name}
                  >
                    <Input 
                      disabled 
                      prefix={<UserOutlined className="text-gray-400" />}
                      className="bg-gray-50"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Email"
                    name="email"
                    initialValue={clientInfo.email}
                  >
                    <Input 
                      disabled 
                      type="email" 
                      className="bg-gray-50"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item 
                    label="Bio" 
                    name="bio"
                    tooltip="Tell others about yourself"
                  >
                    <Input.TextArea 
                      rows={4}
                      placeholder="Write a brief description about yourself..."
                      className="resize-none"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item 
                    label="Location" 
                    name="location"
                    tooltip="Your current location"
                  >
                    <Input 
                      prefix={<EnvironmentOutlined className="text-gray-400" />}
                      placeholder="Enter your location"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </motion.div>

          {/* Bank Information */}
          <motion.div 
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
            whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          >
            <div className="bg-gradient-to-r from-teal-500/5 to-charcolBlue/5 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <BankOutlined className="text-xl text-teal-500" />
                <h3 className="text-lg font-semibold text-charcolBlue">Bank Information</h3>
              </div>
            </div>
            <div className="p-6">
              <Row gutter={24} className={isMobile ? "flex-col" : ""}>
                <Col span={24}>
                  <Form.Item 
                    label="Bank Name" 
                    name="bankName"
                    tooltip="Enter your bank name"
                  >
                    <Input 
                      prefix={<BankOutlined className="text-gray-400" />}
                      placeholder="Enter bank name"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item 
                    label="Account Number" 
                    name="bankAccountNumber"
                    tooltip="Your bank account number"
                  >
                    <Input 
                      prefix={<NumberOutlined className="text-gray-400" />}
                      placeholder="Enter account number"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item 
                    label="IFSC Code" 
                    name="bankIfsc"
                    tooltip="Bank IFSC code"
                  >
                    <Input 
                      prefix={<IdcardOutlined className="text-gray-400" />}
                      placeholder="Enter IFSC code"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Bank Verification Status"
                    name="bankVerified"
                    valuePropName="checked"
                  >
                    <Switch className="bg-gray-300" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </motion.div>

          {/* Company Information */}
          <motion.div 
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
            whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          >
            <div className="bg-gradient-to-r from-teal-500/5 to-charcolBlue/5 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <LuBuilding2 className="text-xl text-teal-500" />
                <h3 className="text-lg font-semibold text-charcolBlue">Company Information</h3>
              </div>
            </div>
            <div className="p-6">
              <Row gutter={24} className={isMobile ? "flex-col" : ""}>
                <Col span={24}>
                  <Form.Item 
                    label="Company Name" 
                    name="companyName"
                    tooltip="Your company name"
                  >
                    <Input 
                      prefix={<LuBuilding2 className="text-gray-400" />}
                      placeholder="Enter company name"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item 
                    label="Company Website" 
                    name="companyWebsite"
                    tooltip="Company website URL"
                  >
                    <Input 
                      prefix={<GlobalOutlined className="text-gray-400" />}
                      placeholder="Enter website URL"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item 
                    label="Registration Number" 
                    name="companyRegistrationNumber"
                    tooltip="Company registration number"
                  >
                    <Input 
                      prefix={<NumberOutlined className="text-gray-400" />}
                      placeholder="Enter registration number"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Submit Button */}
        <motion.div 
          className="flex justify-end pt-6"
          whileHover={{ scale: 1.02 }}
        >
          <Button
            icon={<SaveOutlined />}
            htmlType="submit"
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-none hover:from-teal-600 hover:to-teal-700 px-8 h-12 rounded-lg text-base flex items-center gap-2 shadow-lg"
          >
            Save Changes
          </Button>
        </motion.div>
      </Form>

      <style jsx>{`
        .ant-form-item {
          margin-bottom: 24px;
        }

        .ant-form-item-label > label {
          color: #374151;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .ant-input, .ant-input-textarea {
          border-radius: 10px;
          border-color: #e5e7eb;
          padding: 8px 12px;
          transition: all 0.3s ease;
        }

        .ant-input:hover, .ant-input-textarea:hover {
          border-color: #0d9488;
          transform: translateY(-1px);
        }

        .ant-input:focus, .ant-input-textarea:focus {
          border-color: #0d9488;
          box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
          transform: translateY(-1px);
        }

        .ant-switch {
          background-color: #e5e7eb;
        }

        .ant-switch-checked {
          background-color: #0d9488;
        }

        .ant-form-item-tooltip {
          color: #6b7280;
        }

        .ant-input-prefix {
          margin-right: 12px;
          color: #9ca3af;
        }

        .ant-btn {
          border-radius: 10px;
          height: 40px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .ant-btn:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default EditProfile;
