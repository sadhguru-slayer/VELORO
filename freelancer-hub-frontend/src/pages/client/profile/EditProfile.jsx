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
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";

const { Panel } = Collapse;

const EditProfile = ({userId,role}) => {
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

  useEffect(() => {
    const fetchProfileDetails = async () => {
      const accessToken = Cookies.get("accessToken");
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/client/get_profile_data',
          {
              params: { userId: userId }, // Passing userId as query parameter
              headers: {
                Authorization: `Bearer ${accessToken}`, // Passing the access token as Authorization header
              },
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
  }, []);

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
  
    // Creating FormData to append the file and other form fields
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
  
    // Append the selected file to FormData
    if (file) {
      formData.append("profile_picture", file); // Append the selected file
    }
  
    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/api/client/update_profile/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data", // Ensure that the request is treated as a multipart form
          },
        }
      );
      message.success("Profile updated successfully!");
      navigate(`/client/profile/`);
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    }
  };
  

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-[80rem] min-h-fit">
      <h2 className="text-2xl font-bold text-teal-600 mb-4">Edit Profile</h2>

      <Form
        form={form}
        onFinish={handleFormSubmit}
        layout="vertical"
        encType="multipart/form-data"
        className="flex flex-col gap-3"
      >
        <Collapse defaultActiveKey={["1", "2", "3", "4"]} accordion>
          <Panel header="Personal Information" key="1">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Profile Picture">
                  <div className="flex items-center justify-center">
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={
                      showingProfilePicture ||
                      clientInfo.profilePicture ||
                      "https://www.w3schools.com/howto/img_avatar.png"
                    } // Display the uploaded or default image
                    alt="Profile"
                    className=" rounded-[50%] w-7 h-7 object-cover border-teal-400 border-2"
                    style={{
                      borderRadius: '50%',
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                    }}
                  />
                  
                  <Button
                    className="bg-teal-400"
                    icon={<UploadOutlined />}
                    style={{
                      position: 'absolute',
                      bottom: '5px',
                      right: '5px',
                      padding: '5px',
                      borderRadius: '50%',
                      zIndex: 1,
                    }}
                    onClick={() => document.getElementById('fileInput').click()}
                  />
                  
                  <input
                    id="fileInput"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e)}
                  />
                </div>
                
                  </div>
                  {/*<Button
                    className="bg-teal-400"
                    icon={<UploadOutlined />}
                    style={{ marginTop: 10 }}
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    Edit
                  </Button>
                  <input
                    id="fileInput"
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e)}
                  />*/}
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please enter your name!" },
                  ]}
                  initialValue={clientInfo.name}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email!" },
                  ]}
                  initialValue={clientInfo.email}
                >
                  <Input type="email" disabled />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Bio" name="bio">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Location" name="location">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Panel>

          {/* Bank Information Section */}
          <Panel header="Bank Information" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Bank Name" name="bankName">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Bank Account Number" name="bankAccountNumber">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Bank IFSC" name="bankIfsc">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Bank Verified"
                  name="bankVerified"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Panel>

          {/* Company Information Section */}
          <Panel header="Company Information" key="4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Company Name" name="companyName">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Company Website" name="companyWebsite">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Company Registration Number"
                  name="companyRegistrationNumber"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>

        <div className="flex justify-end">
          <Button
            className="bg-teal-400 border-none hover:border-teal-500"
            htmlType="submit"
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditProfile;
