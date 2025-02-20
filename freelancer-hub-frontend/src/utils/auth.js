import axios from 'axios';
import Cookies from 'js-cookie';

// Check if the token is valid
export const verifyToken = async (token) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/token_verify/', {token:token}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data; // Token is valid
  } catch (error) {
    return null; // Token is invalid or expired
  }
};



// Refresh the token if expired
export const refreshToken = async () => {
  try {
    const refreshToken = Cookies.get('refreshToken');  // Get refresh token from cookies
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
      refresh: refreshToken,
    });
    
    // Save the new access and refresh tokens in cookies
    Cookies.set('accessToken', response.data.access, {
      expires: 1,    // Token expires in 1 day (adjust as needed)
      secure: true,  // Ensure cookies are sent over HTTPS
      sameSite: 'Strict', // CSRF protection
    });

    Cookies.set('refreshToken', response.data.refresh, {
      expires: 1,    // Token expires in 1 day (adjust as needed)
      secure: true,  // Ensure cookies are sent over HTTPS
      sameSite: 'Strict', // CSRF protection
    });

    return response.data.access;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null; // Return null if refresh failed
  }
};

