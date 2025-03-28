const TaskAutomationStatus = ({ task }) => {
  return (
    <div className="task-automation-status">
      {task.is_automated_payment ? (
        <span className="automated">Automated Payments Enabled</span>
      ) : (
        <span className="manual">Manual Payments Required</span>
      )}
    </div>
  );
}; 