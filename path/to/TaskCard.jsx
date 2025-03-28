// Add this function to calculate total milestone budget for a task
const calculateTaskMilestoneBudget = (milestones) => {
  return milestones.reduce((total, milestone) => {
    if (milestone.milestone_type === 'hybrid' || milestone.milestone_type === 'payment') {
      return total + Number(milestone.amount || 0);
    }
    return total;
  }, 0);
};

// Update the handleTaskMilestoneChange function
const handleTaskMilestoneChange = (taskIndex, milestoneIndex, field, value) => {
  const updatedTasks = [...formValues.tasks];
  const task = updatedTasks[taskIndex];
  
  // Update the milestone field
  task.milestones[milestoneIndex][field] = value;
  
  // If changing amount or milestone type, recalculate automated payment status
  if (field === 'amount' || field === 'milestone_type') {
    const totalMilestoneBudget = calculateTaskMilestoneBudget(task.milestones);
    const taskBudget = Number(task.budget);
    
    // Set automated_payment based on milestone total
    // If milestone budget is less than task budget, keep automated payment true
    // If milestone budget equals task budget, set automated payment to false
    task.automated_payment = totalMilestoneBudget < taskBudget;
  }
  
  setFormValues(prev => ({ ...prev, tasks: updatedTasks }));
  
  // ... rest of the existing validation code ...
};

// Also update the handleTaskChange function to recalculate when task budget changes
const handleTaskChange = (taskIndex, name, value) => {
  const updatedTasks = [...formValues.tasks];
  const task = updatedTasks[taskIndex];
  
  task[name] = value;
  
  // If budget is changing, recalculate automated payment status
  if (name === 'budget') {
    const totalMilestoneBudget = calculateTaskMilestoneBudget(task.milestones);
    const taskBudget = Number(value);
    
    // Set automated_payment based on milestone total
    task.automated_payment = totalMilestoneBudget < taskBudget;
  }
  
  setFormValues(prev => ({
    ...prev,
    tasks: updatedTasks,
  }));
  
  // ... rest of the existing validation code ...
}; 