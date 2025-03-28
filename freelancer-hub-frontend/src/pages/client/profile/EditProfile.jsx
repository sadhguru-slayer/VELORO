import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Switch,
  Row,
  Col,
  Tooltip,
  Tabs,
  Card,
  Select,
  DatePicker,
  InputNumber,
  Tag,
  Alert,
  Modal,
  Checkbox
} from "antd";
import { 
  UserOutlined, 
  BankOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  NumberOutlined,
  IdcardOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  UploadOutlined
} from "@ant-design/icons"; 
import { LuBuilding2 } from "react-icons/lu";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import moment from "moment";

const customStyles = {
  tabActiveColor: '#0d9488', // teal-600
  tabHoverColor: '#14b8a6', // teal-500
  tabBgColor: '#f0fdfa', // teal-50
};

const EditProfile = () => {
  const { userId, role, isAuthenticated, isEditable, currentUserId } = useOutletContext();
  
  
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [clientInfo, setClientInfo] = useState({
    // Basic Information
    name: "",
    email: "",
    bio: "",
    description: "",
    dob: null,
    gender: "",
    profile_picture: null,
    cover_photo: null,

    // Contact Information
    primary_email: "",
    secondary_email: "",
    phone_number: "",
    alternate_phone: "",

    // Address Information
    addresses: [],

    // Bank Information
    bank_details: {
      id: null,
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      account_holder_name: '',
      branch_name: '',
      swift_code: '',
      primary: false,
      verified: false
    },

    // Company Information
    company: {
      id: null,
      name: "",
      registration_number: "",
      registration_date: null,
      company_type: "",
      industry: "",
      website: "",
      gst_number: "",
      pan_number: "",
      annual_turnover: "",
      employee_count: "",
    },

    // Business Preferences
    preferred_payment_method: "",
    project_preferences: {},
    budget_range: "",

    // Verification Status
    email_verified: false,
    phone_verified: false,
    identity_verified: false,
    id_verified: false,

    // Profile Status
    profile_status: "incomplete",
    account_tier: "basic",

    // Legal Information
    terms_accepted: false,
    privacy_policy_accepted: false,

    verification_documents: [],
  });

  const [showingProfilePicture, setShowingProfilePicture] = useState(null);
  const [file, setFile] = useState(null);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [acceptingTerms, setAcceptingTerms] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      const accessToken = Cookies.get("accessToken");
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/client/get_profile_data', {
          params: { userId: userId },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = response.data.profile;
        console.log("Data",data)
        setClientInfo({
          // Basic Information
          name: data.name,
          email: data.email,
          bio: data.bio || "",
          description: data.description || "",
          dob: data.dob ? moment(data.dob) : null,
          gender: data.gender || "",
          profile_picture: data.profile_picture,
          cover_photo: data.cover_photo,

          // Contact Information
          primary_email: data.contact_info?.primary_email || "",
          secondary_email: data.contact_info?.secondary_email || "",
          phone_number: data.contact_info?.phone_number || "",
          alternate_phone: data.contact_info?.alternate_phone || "",

          // Location Information
          location: data.location?.full_address || "",
          addresses: data.addresses || [],

          // Company Information
          company: {
            id: data.company_details?.id || null,
            name: data.company_details?.name || "",
            registration_number: data.company_details?.registration_number || "",
            registration_date: data.company_details?.registration_date ? moment(data.company_details.registration_date) : null,
            company_type: data.company_details?.company_type || "",
            industry: data.company_details?.industry || "",
            website: data.company_details?.website || "",
            gst_number: data.company_details?.gst_number || "",
            pan_number: data.company_details?.pan_number || "",
            annual_turnover: data.company_details?.annual_turnover || "",
            employee_count: data.company_details?.employee_count || "",
          },

          // Business Preferences
          preferred_payment_method: data.business_preferences?.preferred_payment_method || "",
          project_preferences: data.business_preferences?.project_preferences || {},
          budget_range: data.business_preferences?.budget_range || "",

          // Verification Status
          email_verified: data.verification_status?.email_verified || false,
          phone_verified: data.verification_status?.phone_verified || false,
          identity_verified: data.verification_status?.identity_verified || false,
          id_verified: data.verification_status?.identity_verified || false,

          // Profile Status
          profile_status: data.profile_status || "incomplete",
          account_tier: data.account_tier || "basic",

          // Legal Information
          terms_accepted: data.legal_status?.terms_accepted || false,
          privacy_policy_accepted: data.legal_status?.privacy_policy_accepted || false,

          verification_documents: data.verification_documents ? 
            data.verification_documents.map(doc => ({
              ...doc,
              expiry_date: doc.expiry_date ? moment(doc.expiry_date) : null,
              document_file: doc.document_file ? { 
                url: doc.document_file,
                name: doc.document_file.split('/').pop() 
              } : null
            })) : [],

          bank_details: {
            id: data.bank_details?.id,
            bank_name: data.bank_details?.bank_name || '',
            account_number: data.bank_details?.account_number || '',
            ifsc_code: data.bank_details?.ifsc_code || '',
            account_holder_name: data.bank_details?.account_holder_name || '',
            branch_name: data.bank_details?.branch_name || '',
            swift_code: data.bank_details?.swift_code || '',
            primary: data.bank_details?.primary || false,
            verified: data.bank_details?.verified || false
          },
        });

        // Set form values including bank details
        form.setFieldsValue({
          name: data.name,
          email: data.email,
          bio: data.bio,
          description: data.description,
          dob: data.dob ? moment(data.dob) : null,
          gender: data.gender,
          primary_email: data.contact_info?.primary_email,
          secondary_email: data.contact_info?.secondary_email,
          phone_number: data.contact_info?.phone_number,
          alternate_phone: data.contact_info?.alternate_phone,
          addresses: data.addresses || [],
          company: {
            name: data.company_details?.name,
            registration_number: data.company_details?.registration_number,
            registration_date: data.company_details?.registration_date ? moment(data.company_details.registration_date) : null,
            company_type: data.company_details?.company_type,
            industry: data.company_details?.industry,
            website: data.company_details?.website,
            gst_number: data.company_details?.gst_number,
            pan_number: data.company_details?.pan_number,
            annual_turnover: data.company_details?.annual_turnover,
            employee_count: data.company_details?.employee_count,
          },
          preferred_payment_method: data.business_preferences?.preferred_payment_method,
          budget_range: data.business_preferences?.budget_range,
          bank_details: {
            id: data.bank_details?.id,
            bank_name: data.bank_details?.bank_name || '',
            account_number: data.bank_details?.account_number || '',
            ifsc_code: data.bank_details?.ifsc_code || '',
            account_holder_name: data.bank_details?.account_holder_name || '',
            branch_name: data.bank_details?.branch_name || '',
            swift_code: data.bank_details?.swift_code || '',
            primary: data.bank_details?.primary || false,
            verified: data.bank_details?.verified || false
          },
          verification_documents: data.verification_documents ? 
            data.verification_documents.map(doc => ({
              ...doc,
              expiry_date: doc.expiry_date ? moment(doc.expiry_date) : null,
              document_file: doc.document_file ? { 
                url: doc.document_file,
                name: doc.document_file.split('/').pop() 
              } : null
            })) : []
        });

        // Update formData to include terms_accepted
        setClientInfo(prevData => ({
          ...prevData,
          terms_accepted: data.legal_status?.terms_accepted || false
        }));

      } catch (error) {
        console.error("Error fetching profile data:", error);
        message.error("Failed to load profile data");
      }
    };
    fetchProfileDetails();
  }, [userId, form]);

  useEffect(() => {
    if (clientInfo.name) {
      form.setFieldsValue(clientInfo);
    }
  }, [clientInfo, form]);

  useEffect(() => {
    setIsCheckboxChecked(clientInfo.terms_accepted);
  }, [clientInfo.terms_accepted]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        message.error('Only image files are allowed!');
        return;
      }
      setFile(file);
      setShowingProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleDocumentFileChange = (e, docId) => {
    const file = e.target.files[0];
    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        message.error('Only image files are allowed!');
        return;
      }
      
      const docs = form.getFieldValue('verification_documents') || [];
      const updatedDocs = docs.map(doc => {
        if ((doc.id && doc.id === docId) || (doc.temp_id && doc.temp_id === docId)) {
          return { 
            ...doc, 
            document_file: file,
            document_file_name: file.name 
          };
        }
        return doc;
      });
      form.setFieldsValue({ verification_documents: updatedDocs });
      message.success(`File "${file.name}" attached successfully`);
    }
  };

  const handleFormSubmit = async (values) => {
    const accessToken = Cookies.get("accessToken");
    
    // If terms are being accepted for the first time
    if (isCheckboxChecked && !clientInfo.terms_accepted) {
      try {
        await axios.put(
          'http://127.0.0.1:8000/api/client/update_terms_acceptance',
          { terms_accepted: true },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        setClientInfo(prev => ({
          ...prev,
          terms_accepted: true
        }));
        
        message.success('Terms accepted successfully');
      } catch (error) {
        console.error('Error accepting terms:', error);
        message.error('Failed to accept terms. Please try again.');
        return;
      }
    }

    const formData = new FormData();

    // Basic Information
    formData.append("bio", values.bio || "");
    formData.append("description", values.description || "");
    formData.append("dob", values.dob && moment.isMoment(values.dob) && values.dob.isValid() ? 
      values.dob.format("YYYY-MM-DD") : "");
    formData.append("gender", values.gender || "");

    // Contact Information
    formData.append("primary_email", values.primary_email || "");
    formData.append("secondary_email", values.secondary_email || "");
    formData.append("phone_number", values.phone_number || "");
    formData.append("alternate_phone", values.alternate_phone || "");

    // Fix addresses format - include IDs
    if (values.addresses && values.addresses.length > 0) {
        const validAddresses = values.addresses.filter(addr => 
            addr.street_address && addr.city && addr.state && addr.country && addr.postal_code
        ).map(addr => ({
            id: addr.id || null,  // Include the address ID, default to null if not present
            street_address: addr.street_address,
            city: addr.city,
            state: addr.state,
            country: addr.country,
            postal_code: addr.postal_code,
            address_type: addr.address_type || 'registered',
            is_primary: Boolean(addr.is_primary) || false
        }));
        
        if (validAddresses.length > 0) {
            // Remove the extra array wrapper
            formData.append("addresses", JSON.stringify(validAddresses));
        }
    }

    // Format company - only include if all required fields are present
    if (values.company) {
        const companyData = {
            id: clientInfo.company.id,
            name: values.company.name || '',
            registration_number: values.company.registration_number || '',
            registration_date: values.company.registration_date && moment.isMoment(values.company.registration_date) && values.company.registration_date.isValid() ?
                values.company.registration_date.format("YYYY-MM-DD") : null,
            company_type: values.company.company_type || '',
            industry: values.company.industry || '',
            website: values.company.website || '',
            gst_number: values.company.gst_number || '',
            pan_number: values.company.pan_number || '',
            annual_turnover: values.company.annual_turnover || '',
            employee_count: values.company.employee_count || ''
        };
        console.log("Sending company data:", companyData); // Debug log
        formData.append("company", JSON.stringify(companyData));
    }

    // Format business preferences
    const businessPrefs = {
        preferred_payment_method: values.preferred_payment_method || "",
        budget_range: values.budget_range || "",
        project_preferences: values.project_preferences || {}
    };
    formData.append("business_preferences", JSON.stringify(businessPrefs));

    // Only include bank details if not verified
    if (values.bank_details && !clientInfo.bank_details?.verified) {
        const bankDetails = {
            bank_name: values.bank_details.bank_name,
            account_number: values.bank_details.account_number,
            ifsc_code: values.bank_details.ifsc_code,
            account_holder_name: values.bank_details.account_holder_name,
            branch_name: values.bank_details.branch_name || '',
            swift_code: values.bank_details.swift_code || '',
            primary: Boolean(values.bank_details.primary)
        };
        
        if (values.bank_details.id) {
            bankDetails.id = values.bank_details.id;
        }

        console.log('Sending bank details:', bankDetails); // Debug log
        formData.append("bank_details", JSON.stringify(bankDetails));
    }

    // Handle verification documents
    if (values.verification_documents?.length > 0) {
        const validDocuments = values.verification_documents
            .filter(doc => doc.document_type && doc.document_number)
            .map((doc, index) => {
                const docData = {
                    ...(doc.id ? { id: doc.id } : {}),
                    document_type: doc.document_type,
                    document_number: doc.document_number,
                    expiry_date: doc.expiry_date ? doc.expiry_date.format("YYYY-MM-DD") : null,
                    verification_notes: doc.verification_notes || '',
                };
                
                // For new documents, add a temp_id
                if (!doc.id) {
                    docData.temp_id = doc.temp_id || `temp_${Date.now()}_${index}`;
                }
                
                return docData;
            });

        formData.append("verification_documents", JSON.stringify(validDocuments));

        // Append files separately
        values.verification_documents.forEach((doc, index) => {
            if (doc.document_file instanceof File) {
                const fileKey = `document_file_${doc.id || doc.temp_id || `temp_${Date.now()}_${index}`}`;
                formData.append(fileKey, doc.document_file);
            }
        });
    }

    // Profile Picture
    if (file) {
      formData.append("profile_picture", file);
    }

    try {
        console.log("Submitting form data...");
        
        // Log FormData contents for debugging
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }
        
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
        navigate(`/client/profile/${userId}/view_profile`);
    } catch (error) {
        console.error("Error updating profile:", error.response?.data || error);
        message.error(error.response?.data?.error || "Failed to update profile");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  // Terms and Conditions Modal Component
  const TermsAndConditionsModal = () => {
    return (
      <Modal
        title="Veloro Terms and Conditions"
        open={termsModalVisible}
        onCancel={() => setTermsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setTermsModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <div className="terms-content" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
          <h3>Financial Information Terms</h3>
          <p>
            By accepting these terms, you agree to the following conditions regarding your financial and verification information:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>All financial information provided is accurate and up-to-date.</li>
            <li>You authorize us to verify the bank account information provided.</li>
            <li>You understand that verification documents will be reviewed for authenticity.</li>
            <li>Changes to financial information may require additional verification.</li>
            <li>You acknowledge that providing false information is grounds for account termination.</li>
            <li>We may share your information with regulatory bodies as required by law.</li>
            <li>You understand that bank details are used for payment processing.</li>
            <li>Your information will be stored securely according to our privacy policy.</li>
          </ol>
        </div>
      </Modal>
    );
  };

  // Add this function to handle terms acceptance
  const handleTermsAcceptance = async () => {
    if (!termsAccepted) {
      message.error('You must accept the terms to continue');
      return;
    }
    
    setAcceptingTerms(true);
    try {
      const accessToken = Cookies.get("accessToken");
      await axios.put(
        'http://127.0.0.1:8000/api/client/update_terms_acceptance',
        { terms_accepted: true },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      setAcceptingTerms(false);
      setTermsModalVisible(false);
      
      // Update local state
      setClientInfo(prev => ({
        ...prev,
        terms_accepted: true
      }));
      
      message.success('Terms accepted successfully');
    } catch (error) {
      console.error('Error accepting terms:', error);
      message.error('Failed to accept terms. Please try again.');
      setAcceptingTerms(false);
    }
  };

  // Add this function to check terms before editing sensitive sections
  const checkTermsBeforeEdit = (section) => {
    if (!clientInfo.terms_accepted) {
      setEditingSection(section);
      setTermsModalVisible(true);
      return false;
    }
    return true;
  };

  // Modify bank details click handler
  const handleBankDetailsClick = () => {
    if (checkTermsBeforeEdit('bank')) {
      setActivePanelKey('bank');
    }
  };

  // Modify verification documents click handler
  const handleDocumentsClick = () => {
    if (checkTermsBeforeEdit('documents')) {
      setActivePanelKey('documents');
    }
  };

  const TermsSection = () => {
    if (clientInfo.terms_accepted) {
      return (
        <Alert
          message="Terms and Conditions Accepted"
          description="You have already accepted the terms and conditions for banking and payments."
          type="success"
          showIcon
          className="mb-4"
        />
      );
    }

    return (
      <Form.Item
        name="terms_accepted"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject('You must accept the terms to update bank details'),
          },
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Checkbox 
            onChange={(e) => setIsCheckboxChecked(e.target.checked)}
            checked={isCheckboxChecked}
          >
            I accept Veloro's terms and conditions for banking and payments
          </Checkbox>
          <Button 
            type="link" 
            onClick={() => setTermsModalVisible(true)}
            style={{ padding: 0 }}
          >
            (View Terms)
          </Button>
        </div>
      </Form.Item>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[100vw] mx-auto p-4 space-y-6"
      >
      {/* Enhanced Header with Gradient Background */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-teal-500/10 to-teal-600/10 p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">Edit Profile</h2>
                <p className="text-gray-600">Update your professional information</p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/client/profile/${userId}/view_profile`)}
              className="border-teal-500 text-teal-500 hover:text-teal-600 hover:border-teal-600 rounded-lg h-10"
            >
              Back to Profile
            </Button>
          </motion.div>
        </div>
      </div>
        </motion.div>

      <Form
        form={form}
        onFinish={handleFormSubmit}
        layout="vertical"
          className="space-y-6"
        >
          {/* Profile Picture Section */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img
                src={
                  showingProfilePicture || 
                  (clientInfo.profile_picture ? `http://127.0.0.1:8000${clientInfo.profile_picture}` : "https://www.w3schools.com/howto/img_avatar.png")
                }
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300" />
                <Tooltip title="Change Profile Picture">
                  <Button
                        icon={<EditOutlined className="text-lg" />}
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
                style={{ display: 'none' }}
              />
            </div>
                <p className="text-gray-500 text-sm">Click the edit button to update your profile picture</p>
              </div>
          </div>
        </motion.div>

          {/* Enhanced Tabs Section */}
          <motion.div 
            variants={containerVariants}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <Tabs 
              defaultActiveKey="personal" 
              className="custom-tabs px-6 pt-4"
              type="card"
              tabBarStyle={{
                marginBottom: 0,
                borderBottom: `2px solid ${customStyles.tabActiveColor}`,
              }}
            >
              {[
                {
                  key: 'personal',
                  label: <span className="flex items-center gap-2"><UserOutlined />Personal Info</span>,
                  children: (
                    <motion.div variants={itemVariants} className="p-6 space-y-6">
                      <Row gutter={24}>
                        <Col span={24} md={12}>
                          <Form.Item label="Name" name="name" initialValue={clientInfo.name}>
                            <Input disabled prefix={<UserOutlined />} className="bg-gray-50 rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Primary Email" name="primary_email" rules={[{ type: 'email' }]}>
                            <Input disabled type="email" className="rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Secondary Email" name="secondary_email" rules={[{ type: 'email' }]}>
                            <Input type="email" className="rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Phone Number" name="phone_number">
                            <Input className="rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Alternate Phone" name="alternate_phone">
                            <Input className="rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Gender" name="gender">
                            <Select className="rounded-lg">
                              <Select.Option value="male">Male</Select.Option>
                              <Select.Option value="female">Female</Select.Option>
                              <Select.Option value="other">Other</Select.Option>
                            </Select>
                  </Form.Item>
                </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Date of Birth" name="dob">
                            <DatePicker className="w-full rounded-lg" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                          <Form.Item label="Bio" name="bio">
                            <Input.TextArea rows={3} className="rounded-lg" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                          <Form.Item label="Description" name="description">
                            <Input.TextArea rows={4} className="rounded-lg" />
                  </Form.Item>
                </Col>
              </Row>
          </motion.div>
                  ),
                },
                {
                  key: 'address',
                  label: <span className="flex items-center gap-2"><EnvironmentOutlined />Address</span>,
                  children: (
                    <motion.div variants={itemVariants} className="p-6 space-y-6">
                      <Form.List name="addresses">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Card key={key} className="mb-4">
                                <Row gutter={24}>
                <Col span={24}>
                                        <Form.Item {...restField} name={[name, 'id']} hidden>
                                            <Input type="hidden" />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'street_address']} label="Street Address">
                                            <Input className="rounded-lg" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item {...restField} name={[name, 'city']} label="City">
                                            <Input className="rounded-lg" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item {...restField} name={[name, 'state']} label="State">
                                            <Input className="rounded-lg" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item {...restField} name={[name, 'country']} label="Country">
                                            <Input className="rounded-lg" />
                  </Form.Item>
                </Col>
                                    <Col span={12}>
                                        <Form.Item {...restField} name={[name, 'postal_code']} label="Postal Code">
                                            <Input className="rounded-lg" />
                  </Form.Item>
                </Col>
                                    <Col span={12}>
                                        <Form.Item {...restField} name={[name, 'address_type']} label="Address Type">
                                            <Select className="rounded-lg">
                                                <Select.Option value="registered">Registered</Select.Option>
                                                <Select.Option value="billing">Billing</Select.Option>
                                                <Select.Option value="shipping">Shipping</Select.Option>
                                            </Select>
                  </Form.Item>
                </Col>
                                    <Col span={12}>
                                        <Form.Item {...restField} name={[name, 'is_primary']} valuePropName="checked">
                                            <Switch checkedChildren="Primary" unCheckedChildren="Not Primary" />
                  </Form.Item>
                </Col>
              </Row>
                                <Button danger onClick={() => remove(name)}>Delete Address</Button>
                              </Card>
                            ))}
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Add Address
                            </Button>
                          </>
                        )}
                      </Form.List>
          </motion.div>
                  ),
                },
                {
                  key: 'company',
                  label: <span className="flex items-center gap-2"><LuBuilding2 />Company</span>,
                  children: (
                    <motion.div variants={itemVariants} className="p-6 space-y-6">
                      <Row gutter={24}>
                        <Col span={24} md={12}>
    
                          <Form.Item label="Company Name" name={['company', 'name']} rules={[{ required: true }]}>
                            <Input className="rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Registration Number" name={['company', 'registration_number']} rules={[{ required: true }]}>
                            <Input className="rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Registration Date" name={['company', 'registration_date']} rules={[{ required: true }]}>
                            <DatePicker className="w-full rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Company Type" name={['company', 'company_type']} rules={[{ required: true }]}>
                            <Input className="rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Industry" name={['company', 'industry']} rules={[{ required: true }]}>
                            <Input className="rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Website" name={['company', 'website']}>
                            <Input className="rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="GST Number" name={['company', 'gst_number']}>
                            <Input className="rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="PAN Number" name={['company', 'pan_number']} rules={[{ required: true }]}>
                            <Input className="rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Annual Turnover" name={['company', 'annual_turnover']}>
                            <InputNumber className="w-full rounded-lg" />
                          </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Employee Count" name={['company', 'employee_count']}>
                            <InputNumber className="w-full rounded-lg" />
                  </Form.Item>
                </Col>
                      </Row>
                    </motion.div>
                  ),
                },
                {
                  key: 'preferences',
                  label: <span className="flex items-center gap-2"><SettingOutlined />Preferences</span>,
                  children: (
                    <motion.div variants={itemVariants} className="p-6 space-y-6">
                      <Row gutter={24}>
                        <Col span={24} md={12}>
                          <Form.Item label="Preferred Payment Method" name="preferred_payment_method">
                            <Select className="rounded-lg">
                              <Select.Option value="bank_transfer">Bank Transfer</Select.Option>
                              <Select.Option value="upi">UPI</Select.Option>
                              <Select.Option value="wallet">Digital Wallet</Select.Option>
                            </Select>
                  </Form.Item>
                </Col>
                        <Col span={24} md={12}>
                          <Form.Item label="Budget Range" name="budget_range">
                            <Select className="rounded-lg">
                              <Select.Option value="0-1000">₹0 - ₹1,000</Select.Option>
                              <Select.Option value="1000-5000">₹1,000 - ₹5,000</Select.Option>
                              <Select.Option value="5000-10000">₹5,000 - ₹10,000</Select.Option>
                              <Select.Option value="10000+">₹10,000+</Select.Option>
                            </Select>
                  </Form.Item>
                </Col>
              </Row>
                    </motion.div>
                  ),
                },
                {
                  key: 'banking',
                  label: <span className="flex items-center gap-2"><BankOutlined />Banking & Documents</span>,
                  children: (
                    <motion.div variants={itemVariants} className="p-6 space-y-6">
                      {/* Bank Details */}
                      <Card 
                        className="mb-4"
                        title={
                          clientInfo.bank_details?.verified ? (
                            <div className="flex items-center justify-between">
                              <span>Bank Details</span>
                              <Tag color="success" className="flex items-center gap-1">
                                <CheckCircleOutlined />Verified
                              </Tag>
                            </div>
                          ) : "Bank Details"
                        }
                      >
                        <Row gutter={24}>
                          <Col span={24}>
                            <Form.Item name={['bank_details', 'id']} hidden>
                              <Input type="hidden" />
                            </Form.Item>
                            <Form.Item 
                              name={['bank_details', 'bank_name']} 
                              label="Bank Name"
                              rules={[{ required: !clientInfo.bank_details?.verified }]}
                            >
                              <Input 
                                className={`rounded-lg ${clientInfo.bank_details?.verified ? 'bg-gray-50' : ''}`}
                                readOnly={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item 
                              name={['bank_details', 'account_number']} 
                              label="Account Number"
                              rules={[{ required: !clientInfo.bank_details?.verified }]}
                            >
                              <Input 
                                className={`rounded-lg ${clientInfo.bank_details?.verified ? 'bg-gray-50' : ''}`}
                                readOnly={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item 
                              name={['bank_details', 'ifsc_code']} 
                              label="IFSC Code"
                              rules={[{ required: !clientInfo.bank_details?.verified }]}
                            >
                              <Input 
                                className={`rounded-lg ${clientInfo.bank_details?.verified ? 'bg-gray-50' : ''}`}
                                readOnly={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item 
                              name={['bank_details', 'account_holder_name']} 
                              label="Account Holder Name"
                            >
                              <Input 
                                className={`rounded-lg ${clientInfo.bank_details?.verified ? 'bg-gray-50' : ''}`}
                                readOnly={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item 
                              name={['bank_details', 'branch_name']} 
                              label="Branch Name"
                            >
                              <Input 
                                className={`rounded-lg ${clientInfo.bank_details?.verified ? 'bg-gray-50' : ''}`}
                                readOnly={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item 
                              name={['bank_details', 'swift_code']} 
                              label="SWIFT Code"
                            >
                              <Input 
                                className={`rounded-lg ${clientInfo.bank_details?.verified ? 'bg-gray-50' : ''}`}
                                readOnly={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item 
                              name={['bank_details', 'primary']} 
                              valuePropName="checked"
                            >
                              <Switch 
                                checkedChildren="Primary" 
                                unCheckedChildren="Not Primary"
                                disabled={clientInfo.bank_details?.verified}
                              />
                            </Form.Item>
                          </Col>
                          {clientInfo.bank_details?.verified && (
                            <Col span={24}>
                              <Alert
                                message="Bank Details Verified"
                                description="These bank details have been verified and cannot be modified. Please contact support if you need to make changes."
                                type="info"
                                showIcon
                                className="mt-4"
                              />
                            </Col>
                          )}
                        </Row>
                      </Card>

                      {/* Verification Documents */}
                      <Form.List name="verification_documents">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => {
                              const currentDoc = form.getFieldValue(['verification_documents', name]);
                              const docId = currentDoc?.id || currentDoc?.temp_id || key;
                              const isVerified = currentDoc?.verified;
                              
                              return (
                                <Card key={key} className="mb-4">
                                  <Row gutter={24}>
                                    <Col span={24}>
                                      <Form.Item {...restField} name={[name, 'id']} hidden>
                                        <Input type="hidden" />
                                      </Form.Item>
                                      <Form.Item {...restField} name={[name, 'temp_id']} hidden>
                                        <Input type="hidden" />
                                      </Form.Item>
                                      <Form.Item 
                                        {...restField} 
                                        name={[name, 'document_type']} 
                                        label="Document Type" 
                                        rules={[{ required: !isVerified }]}
                                      >
                                        <Select 
                                          className="rounded-lg" 
                                          disabled={isVerified}
                                        >
                                          <Select.Option value="id_proof">ID Proof</Select.Option>
                                          <Select.Option value="address_proof">Address Proof</Select.Option>
                                          <Select.Option value="pan_card">PAN Card</Select.Option>
                                          <Select.Option value="gst_certificate">GST Certificate</Select.Option>
                                          <Select.Option value="company_registration">Company Registration</Select.Option>
                                          <Select.Option value="bank_statement">Bank Statement</Select.Option>
                                        </Select>
                                      </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                      <Form.Item 
                                        {...restField} 
                                        name={[name, 'document_number']} 
                                        label="Document Number" 
                                        rules={[{ required: !isVerified }]}
                                      >
                                        <Input 
                                          className={`rounded-lg ${isVerified ? 'bg-gray-50' : ''}`}
                                          readOnly={isVerified}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                      <Form.Item 
                                        {...restField} 
                                        name={[name, 'expiry_date']} 
                                        label="Expiry Date"
                                      >
                                        <DatePicker 
                                          className="w-full rounded-lg" 
                                          disabled={isVerified}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                      <Form.Item 
                                        {...restField} 
                                        name={[name, 'verification_notes']} 
                                        label="Verification Notes"
                                      >
                                        <Input.TextArea 
                                          rows={2} 
                                          className={`rounded-lg ${isVerified ? 'bg-gray-50' : ''}`}
                                          readOnly={isVerified}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                      <Form.Item label="Document File" className="mb-2">
                                        <div className="flex items-center space-x-3">
                                          <Button 
                                            onClick={() => document.getElementById(`doc_file_${docId}`).click()}
                                            icon={<UploadOutlined />}
                                            disabled={isVerified}
                                          >
                                            Select File
                                          </Button>
                                          <input
                                            id={`doc_file_${docId}`}
                                            type="file"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleDocumentFileChange(e, docId)}
                                            accept="image/*"
                                            disabled={isVerified}
                                          />
                                          <span className="text-sm text-gray-500">
                                            {currentDoc?.document_file?.name || 
                                            (currentDoc?.document_file?.url ? 
                                              "Current file: " + currentDoc.document_file.url.split('/').pop() : 
                                              "No file selected")}
                                          </span>
                                        </div>
                                        {isVerified && (
                                          <Tag color="success" className="mt-2 flex items-center w-fit gap-1">
                                            <CheckCircleOutlined />Verified
                                          </Tag>
                                        )}
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                  {!isVerified && (
                                    <Button danger onClick={() => remove(name)}>
                                      Delete Document
                                    </Button>
                                  )}
                                </Card>
                              );
                            })}
                            <Button 
                              type="dashed" 
                              onClick={() => {
                                const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                add({ temp_id: tempId });
                              }} 
                              block 
                              icon={<PlusOutlined />}
                            >
                              Add Document
                            </Button>
                          </>
                        )}
                      </Form.List>

                      {/* Terms and Conditions */}
                      <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-medium mb-4">Terms and Conditions</h3>
                        <TermsSection />
                      </div>

                    </motion.div>
                  ),
                },
              ].map(tab => (
                <Tabs.TabPane key={tab.key} tab={tab.label}>
                  {tab.children}
                </Tabs.TabPane>
              ))}
            </Tabs>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="flex justify-end pt-6">
            <Button
              icon={<SaveOutlined />}
              htmlType="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white border-none px-8 h-12 rounded-lg text-base flex items-center gap-2 shadow-lg"
              disabled={!clientInfo.terms_accepted && !isCheckboxChecked}
            >
              {(!clientInfo.terms_accepted && !isCheckboxChecked) 
                ? 'Accept Terms to Save Changes' 
                : 'Save Changes'
              }
            </Button>
          </motion.div>
      </Form>
      </motion.div>

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal />

      <style jsx global>{`
        /* Enhanced Tab Styling */
        .custom-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
        }
        
        .custom-tabs .ant-tabs-tab {
          border-radius: 8px 8px 0 0 !important;
          margin: 0 4px !important;
          padding: 12px 20px !important;
          transition: all 0.3s ease;
          background: ${customStyles.tabBgColor} !important;
          border: 1px solid #e5e7eb !important;
          border-bottom: none !important;
        }

        .custom-tabs .ant-tabs-tab:hover {
          color: ${customStyles.tabHoverColor} !important;
        }

        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active {
          background-color: white !important;
          border-bottom-color: white !important;
        }

        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: ${customStyles.tabActiveColor} !important;
          font-weight: 500;
        }

        .custom-tabs .ant-tabs-ink-bar {
          background: ${customStyles.tabActiveColor} !important;
          height: 3px !important;
        }

        /* Enhanced Form Controls */
        .ant-input, 
        .ant-input-textarea, 
        .ant-select-selector,
        .ant-picker {
          border-radius: 8px !important;
          border-color: #e5e7eb !important;
          padding: 8px 12px !important;
          transition: all 0.3s ease !important;
        }

        .ant-input:hover, 
        .ant-input-textarea:hover,
        .ant-select-selector:hover,
        .ant-picker:hover {
          border-color: ${customStyles.tabHoverColor} !important;
        }

        .ant-input:focus,
        .ant-input-textarea:focus,
        .ant-select-focused .ant-select-selector,
        .ant-picker-focused {
          border-color: ${customStyles.tabActiveColor} !important;
          box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1) !important;
        }

        /* Enhanced Card Styling */
        .ant-card {
          border-radius: 12px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
          transition: all 0.3s ease !important;
        }

        .ant-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        }

        /* Enhanced Button Styling */
        .ant-btn {
          border-radius: 8px !important;
          transition: all 0.3s ease !important;
        }

        .ant-btn-primary {
          background: ${customStyles.tabActiveColor} !important;
          border-color: ${customStyles.tabActiveColor} !important;
        }

        .ant-btn-primary:hover {
          background: ${customStyles.tabHoverColor} !important;
          border-color: ${customStyles.tabHoverColor} !important;
        }

        /* Enhanced Switch Styling */
        .ant-switch.ant-switch-checked {
          background: ${customStyles.tabActiveColor} !important;
        }

        /* Enhanced Form Labels */
        .ant-form-item-label > label {
          color: #374151 !important;
          font-weight: 500 !important;
        }

        /* Enhanced Tab Icons */
        .custom-tabs .ant-tabs-tab .anticon,
        .custom-tabs .ant-tabs-tab .react-icons {
          margin-right: 8px;
          font-size: 16px;
          color: #6b7280;
        }

        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .anticon,
        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .react-icons {
          color: ${customStyles.tabActiveColor};
        }

        /* Enhanced Section Transitions */
        .ant-form-item {
          transition: all 0.3s ease;
        }

        .ant-form-item:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default EditProfile;
