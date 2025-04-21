import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Button, Tabs, Upload, Form, Input, Modal, Select, Tag, Empty, Image, Tooltip } from "antd";
import { FaPlus, FaEdit, FaTrash, FaLink, FaGithub, FaEye, FaProjectDiagram } from "react-icons/fa";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const Portfolio = () => {
  const { userId, isEditable } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();
  
  // Dummy data for portfolio
  const [portfolioData, setPortfolioData] = useState({
    projects: [
      {
        id: 1,
        title: "E-commerce Website",
        description: "A full-featured online store with payment integration, product management, and customer dashboard.",
        image: "https://via.placeholder.com/600x400",
        tags: ["React", "Node.js", "MongoDB", "Stripe"],
        links: {
          live: "https://example-ecommerce.com",
          github: "https://github.com/username/ecommerce-project"
        },
        featured: true
      },
      {
        id: 2,
        title: "Task Management App",
        description: "A productivity tool for teams with real-time updates, task assignment, and progress tracking.",
        image: "https://via.placeholder.com/600x400",
        tags: ["React", "Firebase", "Material UI"],
        links: {
          live: "https://task-app-example.com",
          github: "https://github.com/username/task-management"
        },
        featured: true
      },
      {
        id: 3,
        title: "Social Media Dashboard",
        description: "Analytics dashboard for social media management with data visualization and reporting features.",
        image: "https://via.placeholder.com/600x400",
        tags: ["Vue.js", "D3.js", "Express", "PostgreSQL"],
        links: {
          live: "https://social-dashboard-example.com",
          github: "https://github.com/username/social-dashboard"
        },
        featured: false
      }
    ],
    skills: [
      { name: "React", level: "Advanced", years: 3 },
      { name: "Node.js", level: "Advanced", years: 4 },
      { name: "JavaScript", level: "Expert", years: 5 },
      { name: "TypeScript", level: "Intermediate", years: 2 },
      { name: "MongoDB", level: "Advanced", years: 3 },
      { name: "PostgreSQL", level: "Intermediate", years: 2 },
      { name: "AWS", level: "Intermediate", years: 2 },
      { name: "Docker", level: "Beginner", years: 1 },
    ],
    certifications: [
      { 
        id: 1,
        name: "AWS Certified Developer", 
        issuer: "Amazon Web Services", 
        date: "2022-05-15",
        expires: "2025-05-15",
        credentialId: "AWS-DEV-12345",
        url: "https://aws.amazon.com/certification/verify"
      },
      { 
        id: 2,
        name: "MongoDB Certified Developer", 
        issuer: "MongoDB University", 
        date: "2021-11-10",
        expires: null,
        credentialId: "MDB-DEV-67890",
        url: "https://university.mongodb.com/certification/verify"
      }
    ]
  });

  useEffect(() => {
    // In a real app, you would fetch the portfolio data here
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [userId]);

  const showAddModal = (type) => {
    setModalType("add");
    setActiveTab(type);
    setIsModalVisible(true);
    form.resetFields();
  };

  const showEditModal = (type, item) => {
    setModalType("edit");
    setActiveTab(type);
    setSelectedItem(item);
    setIsModalVisible(true);
    
    if (type === "projects") {
      form.setFieldsValue({
        title: item.title,
        description: item.description,
        tags: item.tags,
        liveLink: item.links.live,
        githubLink: item.links.github,
        featured: item.featured
      });
    } else if (type === "skills") {
      form.setFieldsValue({
        name: item.name,
        level: item.level,
        years: item.years
      });
    } else if (type === "certifications") {
      form.setFieldsValue({
        name: item.name,
        issuer: item.issuer,
        date: item.date,
        expires: item.expires,
        credentialId: item.credentialId,
        url: item.url
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = (values) => {
    // In a real app, you would send this data to your backend
    console.log("Submitted values:", values);
    setIsModalVisible(false);
    
    // For demo purposes, update the local state
    if (modalType === "add") {
      if (activeTab === "projects") {
        const newProject = {
          id: portfolioData.projects.length + 1,
          title: values.title,
          description: values.description,
          image: "https://via.placeholder.com/600x400", // In a real app, this would be the uploaded image
          tags: values.tags,
          links: {
            live: values.liveLink,
            github: values.githubLink
          },
          featured: values.featured
        };
        setPortfolioData({
          ...portfolioData,
          projects: [...portfolioData.projects, newProject]
        });
      } else if (activeTab === "skills") {
        const newSkill = {
          name: values.name,
          level: values.level,
          years: values.years
        };
        setPortfolioData({
          ...portfolioData,
          skills: [...portfolioData.skills, newSkill]
        });
      } else if (activeTab === "certifications") {
        const newCertification = {
          id: portfolioData.certifications.length + 1,
          name: values.name,
          issuer: values.issuer,
          date: values.date,
          expires: values.expires,
          credentialId: values.credentialId,
          url: values.url
        };
        setPortfolioData({
          ...portfolioData,
          certifications: [...portfolioData.certifications, newCertification]
        });
      }
    } else if (modalType === "edit" && selectedItem) {
      if (activeTab === "projects") {
        const updatedProjects = portfolioData.projects.map(project => 
          project.id === selectedItem.id 
            ? {
                ...project,
                title: values.title,
                description: values.description,
                tags: values.tags,
                links: {
                  live: values.liveLink,
                  github: values.githubLink
                },
                featured: values.featured
              } 
            : project
        );
        setPortfolioData({
          ...portfolioData,
          projects: updatedProjects
        });
      } else if (activeTab === "skills") {
        const updatedSkills = portfolioData.skills.map(skill => 
          skill.name === selectedItem.name 
            ? {
                name: values.name,
                level: values.level,
                years: values.years
              } 
            : skill
        );
        setPortfolioData({
          ...portfolioData,
          skills: updatedSkills
        });
      } else if (activeTab === "certifications") {
        const updatedCertifications = portfolioData.certifications.map(cert => 
          cert.id === selectedItem.id 
            ? {
                ...cert,
                name: values.name,
                issuer: values.issuer,
                date: values.date,
                expires: values.expires,
                credentialId: values.credentialId,
                url: values.url
              } 
            : cert
        );
        setPortfolioData({
          ...portfolioData,
          certifications: updatedCertifications
        });
      }
    }
  };

  const handleDelete = (type, item) => {
    if (type === "projects") {
      setPortfolioData({
        ...portfolioData,
        projects: portfolioData.projects.filter(project => project.id !== item.id)
      });
    } else if (type === "skills") {
      setPortfolioData({
        ...portfolioData,
        skills: portfolioData.skills.filter(skill => skill.name !== item.name)
      });
    } else if (type === "certifications") {
      setPortfolioData({
        ...portfolioData,
        certifications: portfolioData.certifications.filter(cert => cert.id !== item.id)
      });
    }
  };

  const renderModalContent = () => {
    if (activeTab === "projects") {
      return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Project Title"
            rules={[{ required: true, message: 'Please enter the project title' }]}
          >
            <Input placeholder="E.g., E-commerce Website" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={4} placeholder="Describe your project..." />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="Technologies Used"
            rules={[{ required: true, message: 'Please add at least one technology' }]}
          >
            <Select mode="tags" placeholder="Add technologies">
              <Option value="React">React</Option>
              <Option value="Vue.js">Vue.js</Option>
              <Option value="Angular">Angular</Option>
              <Option value="Node.js">Node.js</Option>
              <Option value="Express">Express</Option>
              <Option value="MongoDB">MongoDB</Option>
              <Option value="PostgreSQL">PostgreSQL</Option>
              <Option value="AWS">AWS</Option>
              <Option value="Firebase">Firebase</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="liveLink"
            label="Live Demo URL"
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          
          <Form.Item
            name="githubLink"
            label="GitHub Repository"
          >
            <Input placeholder="https://github.com/username/repo" />
          </Form.Item>
          
          <Form.Item
            name="featured"
            valuePropName="checked"
          >
            <input type="checkbox" className="mr-2" />
            <span>Feature this project (shown at the top)</span>
          </Form.Item>
          
          <Form.Item
            name="image"
            label="Project Image"
          >
            <Upload
              listType="picture-card"
              showUploadList={true}
              beforeUpload={() => false}
            >
              <div>
                <FaPlus />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      );
    } else if (activeTab === "skills") {
      return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Skill Name"
            rules={[{ required: true, message: 'Please enter the skill name' }]}
          >
            <Input placeholder="E.g., React, Python, AWS" />
          </Form.Item>
          
          <Form.Item
            name="level"
            label="Proficiency Level"
            rules={[{ required: true, message: 'Please select a level' }]}
          >
            <Select placeholder="Select level">
              <Option value="Beginner">Beginner</Option>
              <Option value="Intermediate">Intermediate</Option>
              <Option value="Advanced">Advanced</Option>
              <Option value="Expert">Expert</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="years"
            label="Years of Experience"
            rules={[{ required: true, message: 'Please enter years of experience' }]}
          >
            <Input type="number" min={0} max={50} />
          </Form.Item>
        </Form>
      );
    } else if (activeTab === "certifications") {
      return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Certification Name"
            rules={[{ required: true, message: 'Please enter the certification name' }]}
          >
            <Input placeholder="E.g., AWS Certified Developer" />
          </Form.Item>
          
          <Form.Item
            name="issuer"
            label="Issuing Organization"
            rules={[{ required: true, message: 'Please enter the issuer' }]}
          >
            <Input placeholder="E.g., Amazon Web Services" />
          </Form.Item>
          
          <Form.Item
            name="date"
            label="Issue Date"
            rules={[{ required: true, message: 'Please enter the issue date' }]}
          >
            <Input type="date" />
          </Form.Item>
          
          <Form.Item
            name="expires"
            label="Expiration Date (if applicable)"
          >
            <Input type="date" />
          </Form.Item>
          
          <Form.Item
            name="credentialId"
            label="Credential ID"
          >
            <Input placeholder="E.g., AWS-DEV-12345" />
          </Form.Item>
          
          <Form.Item
            name="url"
            label="Verification URL"
          >
            <Input placeholder="https://example.com/verify" />
          </Form.Item>
        </Form>
      );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <FaProjectDiagram className="text-violet-600 text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">My Portfolio</h1>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="font-medium"
          tabBarExtraContent={
            isEditable && (
              <Button 
                type="primary" 
                icon={<FaPlus />} 
                onClick={() => showAddModal(activeTab)}
                className="bg-violet-600 hover:bg-violet-700 border-none"
              >
                Add {activeTab === "projects" ? "Project" : activeTab === "skills" ? "Skill" : "Certification"}
              </Button>
            )
          }
        >
          <TabPane tab="Projects" key="projects">
            {portfolioData.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioData.projects.map(project => (
                  <Card
                    key={project.id}
                    cover={
                      <div className="relative overflow-hidden h-48">
                        <img 
                          alt={project.title} 
                          src={project.image} 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        {project.featured && (
                          <div className="absolute top-2 right-2 bg-violet-600 text-white text-xs px-2 py-1 rounded-full">
                            Featured
                          </div>
                        )}
                      </div>
                    }
                    actions={isEditable ? [
                      <Tooltip title="View Project">
                        <FaEye className="text-gray-500 hover:text-violet-600" />
                      </Tooltip>,
                      <Tooltip title="Edit Project">
                        <FaEdit 
                          className="text-gray-500 hover:text-violet-600" 
                          onClick={() => showEditModal("projects", project)}
                        />
                      </Tooltip>,
                      <Tooltip title="Delete Project">
                        <FaTrash 
                          className="text-gray-500 hover:text-red-600" 
                          onClick={() => handleDelete("projects", project)}
                        />
                      </Tooltip>
                    ] : [
                      <Tooltip title="View Project">
                        <FaEye className="text-gray-500 hover:text-violet-600" />
                      </Tooltip>
                    ]}
                    className="shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <Card.Meta
                      title={project.title}
                      description={
                        <div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.tags.map(tag => (
                              <Tag key={tag} color="purple" className="mb-1">{tag}</Tag>
                            ))}
                          </div>
                          <div className="flex space-x-3">
                            {project.links.live && (
                              <a 
                                href={project.links.live} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-violet-600 hover:text-violet-800 flex items-center"
                              >
                                <FaLink className="mr-1" /> Demo
                              </a>
                            )}
                            {project.links.github && (
                              <a 
                                href={project.links.github} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-violet-600 hover:text-violet-800 flex items-center"
                              >
                                <FaGithub className="mr-1" /> Code
                              </a>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                ))}
              </div>
            ) : (
              <Empty 
                description={
                  <span>
                    No projects found. {isEditable && "Click the button above to add your first project."}
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </TabPane>
          
          <TabPane tab="Skills" key="skills">
            {portfolioData.skills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioData.skills.map(skill => (
                  <Card key={skill.name} className="shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{skill.name}</h3>
                        <div className="flex items-center mt-1">
                          <Tag 
                            color={
                              skill.level === "Expert" ? "gold" :
                              skill.level === "Advanced" ? "purple" :
                              skill.level === "Intermediate" ? "blue" :
                              "green"
                            }
                          >
                            {skill.level}
                          </Tag>
                          <span className="ml-2 text-gray-600">{skill.years} {skill.years === 1 ? 'year' : 'years'}</span>
                        </div>
                      </div>
                      
                      {isEditable && (
                        <div className="flex space-x-2">
                          <Button 
                            type="text" 
                            icon={<FaEdit />} 
                            onClick={() => showEditModal("skills", skill)}
                            className="text-gray-500 hover:text-violet-600"
                          />
                          <Button 
                            type="text" 
                            icon={<FaTrash />} 
                            onClick={() => handleDelete("skills", skill)}
                            className="text-gray-500 hover:text-red-600"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty 
                description={
                  <span>
                    No skills found. {isEditable && "Click the button above to add your skills."}
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </TabPane>
          
          <TabPane tab="Certifications" key="certifications">
            {portfolioData.certifications.length > 0 ? (
              <div className="space-y-4">
                {portfolioData.certifications.map(cert => (
                  <Card key={cert.id} className="shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{cert.name}</h3>
                        <p className="text-gray-600">Issued by {cert.issuer}</p>
                        <p className="text-gray-600">
                          Issued: {new Date(cert.date).toLocaleDateString()}
                          {cert.expires && ` • Expires: ${new Date(cert.expires).toLocaleDateString()}`}
                        </p>
                        {cert.credentialId && (
                          <p className="text-gray-600">Credential ID: {cert.credentialId}</p>
                        )}
                        {cert.url && (
                          <a 
                            href={cert.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-violet-600 hover:text-violet-800 flex items-center mt-2"
                          >
                            <FaLink className="mr-1" /> Verify Credential
                          </a>
                        )}
                      </div>
                      
                      {isEditable && (
                        <div className="flex space-x-2">
                          <Button 
                            type="text" 
                            icon={<FaEdit />} 
                            onClick={() => showEditModal("certifications", cert)}
                            className="text-gray-500 hover:text-violet-600"
                          />
                          <Button 
                            type="text" 
                            icon={<FaTrash />} 
                            onClick={() => handleDelete("certifications", cert)}
                            className="text-gray-500 hover:text-red-600"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty 
                description={
                  <span>
                    No certifications found. {isEditable && "Click the button above to add your certifications."}
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </TabPane>
        </Tabs>
        
        <Modal
          title={`${modalType === "add" ? "Add" : "Edit"} ${
            activeTab === "projects" ? "Project" : 
            activeTab === "skills" ? "Skill" : 
            "Certification"
          }`}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={() => form.submit()}
              className="bg-violet-600 hover:bg-violet-700 border-none"
            >
              {modalType === "add" ? "Add" : "Save"}
            </Button>
          ]}
        >
          {renderModalContent()}
        </Modal>
      </motion.div>
    </div>
  );
};

export default Portfolio;
