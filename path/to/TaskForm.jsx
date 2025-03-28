const calculateAutomatedPayment = (taskBudget, milestones) => {
  if (!milestones || milestones.length === 0) return false;

  const totalMilestoneAmount = milestones.reduce((sum, milestone) => {
    // Only consider payment and hybrid milestones
    if (milestone.milestone_type === 'progress') return sum;
    return sum + parseFloat(milestone.amount);
  }, 0);

  // If any milestone amount is less than task budget, set automated payment to true
  // If total milestone amount equals task budget, set to false
  return totalMilestoneAmount < parseFloat(taskBudget);
};

const handleSubmit = async (values) => {
  // ... existing form submission code ...

  const formData = {
    ...values,
    is_automated_payment: calculateAutomatedPayment(values.budget, values.milestones),
    // ... other form fields
  };

  // Submit the form data
  try {
    await submitTask(formData);
  } catch (error) {
    console.error('Error submitting task:', error);
  }
};

const validateMilestones = (values) => {
  const errors = {};
  
  if (values.milestones && values.milestones.length > 0) {
    const totalMilestoneAmount = values.milestones.reduce((sum, milestone) => {
      if (milestone.milestone_type === 'progress') return sum;
      return sum + parseFloat(milestone.amount || 0);
    }, 0);

    if (totalMilestoneAmount > parseFloat(values.budget)) {
      errors.milestones = 'Total milestone amounts cannot exceed task budget';
    }
  }

  return errors;
};

// Use in your form component
const formik = useFormik({
  // ... other formik config
  validate: validateMilestones,
  onSubmit: handleSubmit,
}); 