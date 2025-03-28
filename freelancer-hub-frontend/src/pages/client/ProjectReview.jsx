import React from 'react';
import { motion } from 'framer-motion';

const ProjectReview = ({ project, isCollaborative }) => {
  // Helper function to calculate total milestone amount
  const calculateTotalMilestoneAmount = (milestones) => {
    return milestones.reduce((total, milestone) => {
      if (milestone.milestone_type === 'hybrid' || milestone.milestone_type === 'payment') {
        return total + Number(milestone.amount || 0);
      }
      return total;
    }, 0);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Project Overview */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Project Type</p>
            <p className="font-medium">{isCollaborative ? 'Collaborative' : 'Single Freelancer'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="font-medium">₹{project.budget}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Deadline</p>
            <p className="font-medium">{formatDate(project.deadline)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Domain</p>
            <p className="font-medium">{project.domain}</p>
          </div>
        </div>
      </div>

      {/* Project Description */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: project.description }} />
      </div>

      {/* Skills Required */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
        <div className="flex flex-wrap gap-2">
          {project.skills_required.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
              {skill.label}
            </span>
          ))}
        </div>
      </div>

      {/* Project Milestones */}
      {project.milestones.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Milestones</h3>
          <div className="space-y-4">
            {project.milestones.map((milestone, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                    <p className="text-sm text-gray-500">Due: {formatDate(milestone.due_date)}</p>
                  </div>
                  {(milestone.milestone_type === 'hybrid' || milestone.milestone_type === 'payment') && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium">₹{milestone.amount}</p>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    milestone.milestone_type === 'progress' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {milestone.milestone_type === 'progress' ? 'Progress Only' : 'Progress & Payment'}
                  </span>
                  {milestone.is_automated && (
                    <span className="ml-2 px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">
                      Automated Payment
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Section (for collaborative projects) */}
      {isCollaborative && project.tasks.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h3>
          <div className="space-y-6">
            {project.tasks.map((task, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-500">Due: {formatDate(task.deadline)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-medium">₹{task.budget}</p>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none mb-4" 
                  dangerouslySetInnerHTML={{ __html: task.description }} 
                />

                {/* Task Skills */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {task.skills_required_for_task.map((skill, skillIndex) => (
                      <span key={skillIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {skill.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Task Milestones */}
                {task.milestones.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Milestones:</p>
                    <div className="space-y-3">
                      {task.milestones.map((milestone, mIndex) => (
                        <div key={mIndex} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{milestone.title}</p>
                              <p className="text-xs text-gray-500">Due: {formatDate(milestone.due_date)}</p>
                            </div>
                            {(milestone.milestone_type === 'hybrid' || milestone.milestone_type === 'payment') && (
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Amount</p>
                                <p className="font-medium">₹{milestone.amount}</p>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              milestone.milestone_type === 'progress' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                            }`}>
                              {milestone.milestone_type === 'progress' ? 'Progress Only' : 'Progress & Payment'}
                            </span>
                            {milestone.is_automated && (
                              <span className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">
                                Automated Payment
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Project Budget</span>
            <span className="font-medium">₹{project.budget}</span>
          </div>
          {project.milestones.length > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Project Milestone Payments</span>
              <span className="font-medium">₹{calculateTotalMilestoneAmount(project.milestones)}</span>
            </div>
          )}
          {isCollaborative && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Task Budgets Total</span>
              <span className="font-medium">
                ₹{project.tasks.reduce((total, task) => total + Number(task.budget), 0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectReview;