
import { ThreeDot } from 'react-loading-indicators';

const IndividualLoadingComponent = ({ text,role }) => {
  const dotColor = role === 'freelancer' ? '#8B5CF6' : '#14B8A6';  // violet-500 and teal-500 hex codes
  const textColor = role === 'freelancer' ? '#8B5CF6' : '#14B8A6'; // violet-500 and teal-500 hex codes

  return (
    <div className="h-[100%] flex flex-col items-center justify-center space-y-4">
    <ThreeDot
    variant="bounce"
    color={dotColor} // Use hex color codes
    size="medium"
    text={text || 'Loading...'}
    textColor={textColor} // Use hex color codes
  />
    </div>
  );
};

export default IndividualLoadingComponent;
