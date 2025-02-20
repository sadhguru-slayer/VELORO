import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { verifyToken, refreshToken } from '../utils/auth';
import LoadingComponent from '../components/LoadingComponent';
import Cookies from 'js-cookie';
const ProfilingPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [dob, setDob] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [currentStep, setCurrentStep] = useState(1);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkTokens = async () => {
      setLoading(true); // Start loading
      try {
        const token = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');

        if (!token || !refreshToken) {
          return null;
        }

        // Step 1: Verify token validity
        const isTokenValid = await verifyToken(token);

        // Step 2: Refresh token if invalid
        if (!isTokenValid) {
          const newToken = await refreshToken(refreshToken);
          if (newToken) {
            Cookies.set('accessToken', newToken);
          } else {
            throw new Error('Token refresh failed');
          }
        }
        const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        });
        const { is_profiled, role } = response.data.user;
        // Step 3: Navigate based on profile status and role
        if (!is_profiled && role !== 'client') {
          return;
        } else if (role === 'client') {
          navigate('/client/dashboard');
        } else {
          navigate('/freelancer/homepage');
        }
      } catch (error) {
        console.error('Authentication error:', error);

        // Clear tokens and redirect to login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      } finally {
        setLoading(false); // End loading
      }
    };

    checkTokens();
  }, [navigate]);


  useEffect(() => {
    const fetchCategories = async () => {
      const token = Cookies.get('accessToken');
      const isTokenValid = await verifyToken(token);
      if (!isTokenValid) {
        const newToken = await refreshToken();
        if (newToken) {
          Cookies.set('accessToken', newToken);
        } else {
          navigate('/login');
          return;
        }
      }
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/categories/', {
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [navigate]);

  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedSkills([]);
    if (categoryName) {
      axios.get(`http://127.0.0.1:8000/api/categories/${categoryName}/skills/`, {
        headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
      }).then((response) => {
        setSkills(response.data);
      }).catch(console.error);
    } else {
      setSkills([]);
    }
  };

  const handleSkillChange = (skillId, checked) => {
    setSelectedSkills((prevSelected) => checked
      ? [...prevSelected, skillId]
      : prevSelected.filter(id => id !== skillId));
  };

  const handleProfilePicChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handlePaymentInfoChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleExpiryDateChange = (e) => {
    const { value } = e.target;
    let formattedValue = value.replace(/[^\d]/g, ""); // Remove any non-digit characters
    if (formattedValue.length > 2) {
      formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}`;
    }
    setPaymentInfo((prevState) => ({
      ...prevState,
      expiryDate: formattedValue,
    }));
  };

  const handleNext = (currentStep) => {
    if (currentStep === 1) {
      const payload = {
        category: selectedCategory,
        skills: selectedSkills,
      };
      axios.post('http://127.0.0.1:8000/api/save_skills/', payload, {
        headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
      })
        .then(() => {
          setCurrentStep(2);
        })
        .catch((error) => console.error('Error saving skills:', error));
    } else if (currentStep === 2) {
      const formData = new FormData();
      formData.append('firstname', firstname);
      formData.append('lastname', lastname);
      formData.append('bio', bio);
      formData.append('location', location);
      formData.append('dob', dob);
      formData.append('profile_picture', profilePic);

      axios.post('http://127.0.0.1:8000/api/save_additional_details/', formData, {
        headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
      })
        .then(() => {
          setCurrentStep(3);
        })
        .catch((error) => console.error('Error saving additional details:', error));
    } else if (currentStep === 3) {
      const paymentData = {
        cardNumber: paymentInfo.cardNumber,
        expiryDate: paymentInfo.expiryDate,
        cvv: paymentInfo.cvv,
      };
      console.log(paymentData);
      axios.post('http://127.0.0.1:8000/api/save_payment_info/', paymentData, {
        headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
      })
        .then(() => {
          navigate('/freelancer/homepage');
        })
        .catch((error) => console.error('Error saving payment info:', error));
    }
  };
  if (loading) {
    return <LoadingComponent text="Please wait while we verify your session..." />;
  }
  return (
    <div className="h-screen flex justify-center items-center px-4 lg:px-0">
      <div className="w-full max-w-4xl bg-white border rounded-lg shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-blue-900">Complete Your Profile</h2>
          <p className="text-gray-500 text-sm mt-2">Please provide your details to complete your profile.</p>
        </div>
        
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Step 1: Select Category and Skills</h3>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full p-4 border rounded-lg"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            {skills.length > 0 && (
              <div className="space-y-2">
                {skills.map((skill) => (
                  <label key={skill.id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={skill.id}
                      onChange={(e) => handleSkillChange(skill.id, e.target.checked)}
                      className="mr-2"
                    />
                    {skill.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Step 2: Additional Details</h3>
            <input
              type="text"
              placeholder="First Name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="w-full p-4 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="w-full p-4 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-4 border rounded-lg"
            />
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-4 border rounded-lg"
            />
            <input
              type="file"
              onChange={handleProfilePicChange}
              className="w-full p-4 border rounded-lg"
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Step 3: Payment Information</h3>
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={paymentInfo.cardNumber}
              onChange={handlePaymentInfoChange}
              className="w-full p-4 border rounded-lg"
            />
            <input
              type="text"
              name="expiryDate"
              placeholder="Expiry Date (MM/YY)"
              value={paymentInfo.expiryDate}
              onChange={handleExpiryDateChange}
              maxLength={5}
              className="w-full p-4 border rounded-lg"
            />
            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              value={paymentInfo.cvv}
              onChange={handlePaymentInfoChange}
              className="w-full p-4 border rounded-lg"
            />
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={() => handleNext(currentStep)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {currentStep === 3 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilingPage;
