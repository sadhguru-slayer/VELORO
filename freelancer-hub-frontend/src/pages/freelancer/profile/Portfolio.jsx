import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Button, Tabs, Upload, Form, Input, Modal, Select, Tag, Empty, Image, Tooltip } from "antd";
import { FaPlus, FaEdit, FaTrash, FaLink, FaGithub, FaEye, FaProjectDiagram } from "react-icons/fa";
import { Modal as AntModal } from 'antd';

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
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewProject, setPreviewProject] = useState(null);
  
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

  const handlePreview = (project) => {
    setPreviewProject(project);
    setPreviewVisible(true);
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

  const ProjectPreviewModal = ({ project, visible, onClose }) => {
    if (!project) return null;
    
    return (
      <AntModal
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        className="[&_.ant-modal-content]:rounded-xl"
      >
        <div className="space-y-6">
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
            {project.featured && (
              <div className="absolute top-4 right-4 bg-violet-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured Project
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">{project.title}</h2>
            
            <p className="text-gray-600 leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <Tag 
                  key={tag} 
                  className="bg-violet-50 text-violet-600 border-violet-100 rounded-full px-4 py-1"
                >
                  {tag}
                </Tag>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              {project.links.live && (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  <FaLink className="mr-2" /> View Live Demo
                </a>
              )}
              {project.links.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-violet-200 text-violet-600 rounded-lg hover:bg-violet-50 transition-colors"
                >
                  <FaGithub className="mr-2" /> View Source Code
                </a>
              )}
            </div>
          </div>
        </div>
      </AntModal>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-violet-100">
          <div className="flex items-center">
            <div className="bg-violet-100 p-4 rounded-xl mr-4">
              <FaProjectDiagram className="text-violet-600 text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-violet-800 mb-1">Professional Portfolio</h1>
              <p className="text-violet-600">Showcase your best work and professional achievements</p>
            </div>
          </div>
        </div>

        <Card className="shadow-sm border-0 rounded-xl overflow-hidden">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="[&_.ant-tabs-tab]:text-violet-600 [&_.ant-tabs-ink-bar]:bg-violet-500"
            tabBarExtraContent={
              isEditable && (
                <Button 
                  type="primary" 
                  icon={<FaPlus className="mr-2" />}
                  onClick={() => showAddModal(activeTab)}
                  className="bg-violet-500 hover:bg-violet-600 text-white border-0"
                >
                  Add {activeTab === "projects" ? "Project" : activeTab === "skills" ? "Skill" : "Certification"}
                </Button>
              )
            }
          >
            <TabPane tab="Featured Projects" key="projects">
              {portfolioData.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolioData.projects.map(project => (
                    <motion.div
                      key={project.id}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className="group hover:shadow-lg transition-all duration-300 border-violet-100 rounded-xl overflow-hidden bg-white"
                        cover={
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              alt={project.title} 
                              src={project.image} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {project.featured && (
                              <div className="absolute top-3 right-3 bg-violet-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                                Featured
                              </div>
                            )}
                          </div>
                        }
                        actions={isEditable ? [
                          <Tooltip title="Preview Project">
                            <Button 
                              type="text" 
                              icon={<FaEye className="text-violet-500 hover:text-violet-700" />}
                              onClick={() => handlePreview(project)}
                            />
                          </Tooltip>,
                          <Tooltip title="Edit Project">
                            <Button 
                              type="text" 
                              icon={<FaEdit className="text-violet-500 hover:text-violet-700" />}
                              onClick={() => showEditModal("projects", project)}
                            />
                          </Tooltip>,
                          <Tooltip title="Delete Project">
                            <Button 
                              type="text" 
                              icon={<FaTrash className="text-red-400 hover:text-red-600" />}
                              onClick={() => handleDelete("projects", project)}
                            />
                          </Tooltip>
                        ] : [
                          <Tooltip title="Preview Project">
                            <Button 
                              type="text" 
                              icon={<FaEye className="text-violet-500 hover:text-violet-700" />}
                              onClick={() => handlePreview(project)}
                            />
                          </Tooltip>
                        ]}
                      >
                        <div className="px-1 space-y-3">
                          <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map(tag => (
                              <Tag 
                                key={tag} 
                                className="bg-violet-50 text-violet-600 border-violet-100 rounded-full px-3"
                              >
                                {tag}
                              </Tag>
                            ))}
                          </div>
                          <div className="flex space-x-4 pt-2">
                            {project.links.live && (
                              <a 
                                href={project.links.live}
                                target="_blank"
                                rel="noopener noreferrer" 
                                className="text-violet-600 hover:text-violet-800 flex items-center text-sm font-medium"
                              >
                                <FaLink className="mr-1.5" /> Live Demo
                              </a>
                            )}
                            {project.links.github && (
                              <a 
                                href={project.links.github}
                                target="_blank"
                                rel="noopener noreferrer" 
                                className="text-violet-600 hover:text-violet-800 flex items-center text-sm font-medium"
                              >
                                <FaGithub className="mr-1.5" /> Source Code
                              </a>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Empty 
                  description={
                    <span className="text-violet-600">
                      No projects yet. {isEditable && "Showcase your work by adding your first project!"}
                    </span>
                  }
                  className="my-12"
                />
              )}
            </TabPane>

            <TabPane tab="Technical Skills" key="skills">
              {portfolioData.skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioData.skills.map(skill => (
                    <motion.div
                      key={skill.name}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="hover:shadow-md transition-all duration-300 border-violet-100 rounded-xl bg-white">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-800">{skill.name}</h3>
                            <div className="flex items-center gap-3">
                              <Tag className={`rounded-full px-3 ${
                                skill.level === 'Expert' ? 'bg-green-50 text-green-600 border-green-100' :
                                skill.level === 'Advanced' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                skill.level === 'Intermediate' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                                'bg-gray-50 text-gray-600 border-gray-100'
                              }`}>
                                {skill.level}
                              </Tag>
                              <span className="text-sm text-gray-600">
                                {skill.years} {skill.years === 1 ? 'year' : 'years'}
                              </span>
                            </div>
                          </div>
                          {isEditable && (
                            <div className="flex gap-2">
                              <Button 
                                type="text" 
                                icon={<FaEdit className="text-violet-500 hover:text-violet-700" />}
                                onClick={() => showEditModal("skills", skill)}
                              />
                              <Button 
                                type="text" 
                                icon={<FaTrash className="text-red-400 hover:text-red-600" />}
                                onClick={() => handleDelete("skills", skill)}
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Empty 
                  description={
                    <span className="text-violet-600">
                      No skills added. {isEditable && "Highlight your technical expertise!"}
                    </span>
                  }
                  className="my-12"
                />
              )}
            </TabPane>

            <TabPane tab="Certifications" key="certifications">
              {portfolioData.certifications.length > 0 ? (
                <div className="space-y-4">
                  {portfolioData.certifications.map(cert => (
                    <motion.div
                      key={cert.id}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="hover:shadow-md transition-all duration-300 border-violet-100 rounded-xl bg-white">
                        <div className="flex justify-between items-start">
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{cert.name}</h3>
                              <p className="text-gray-600">Issued by {cert.issuer}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Tag className="bg-violet-50 text-violet-600 border-violet-100 rounded-full px-3">
                                Issued: {new Date(cert.date).toLocaleDateString()}
                              </Tag>
                              {cert.expires && (
                                <Tag className="bg-orange-50 text-orange-600 border-orange-100 rounded-full px-3">
                                  Expires: {new Date(cert.expires).toLocaleDateString()}
                                </Tag>
                              )}
                            </div>
                            {cert.credentialId && (
                              <p className="text-sm text-gray-600">
                                Credential ID: {cert.credentialId}
                              </p>
                            )}
                            {cert.url && (
                              <a
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-violet-600 hover:text-violet-800 font-medium"
                              >
                                <FaLink className="mr-1.5" /> Verify Credential
                              </a>
                            )}
                          </div>
                          {isEditable && (
                            <div className="flex gap-2">
                              <Button 
                                type="text" 
                                icon={<FaEdit className="text-violet-500 hover:text-violet-700" />}
                                onClick={() => showEditModal("certifications", cert)}
                              />
                              <Button 
                                type="text" 
                                icon={<FaTrash className="text-red-400 hover:text-red-600" />}
                                onClick={() => handleDelete("certifications", cert)}
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Empty 
                  description={
                    <span className="text-violet-600">
                      No certifications yet. {isEditable && "Add your professional certifications!"}
                    </span>
                  }
                  className="my-12"
                />
              )}
            </TabPane>
          </Tabs>
        </Card>

        <Modal
          title={
            <span className="text-lg font-semibold text-violet-800">
              {modalType === "add" ? "Add New" : "Edit"} {
                activeTab === "projects" ? "Project" : 
                activeTab === "skills" ? "Skill" : 
                "Certification"
              }
            </span>
          }
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
              className="bg-violet-500 hover:bg-violet-600 border-0"
            >
              {modalType === "add" ? "Add" : "Save Changes"}
            </Button>
          ]}
          className="[&_.ant-modal-content]:rounded-xl [&_.ant-modal-header]:bg-violet-50"
        >
          {renderModalContent()}
        </Modal>

        <ProjectPreviewModal
          project={previewProject}
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
        />
      </motion.div>
    </div>
  );
};

export default Portfolio;
