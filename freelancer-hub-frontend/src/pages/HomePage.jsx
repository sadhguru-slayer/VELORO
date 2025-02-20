import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import LoadingComponent from '../components/LoadingComponent';
import { verifyToken, refreshToken } from '../utils/auth';

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTokens = async () => {
      try {
        const token = Cookies.get('accessToken');
        const rToken = Cookies.get('refreshToken');

        if (!token || !rToken) {
          return;
        }

        const isTokenValid = await verifyToken(token);

        if (!isTokenValid) {
          const newToken = await refreshToken(rToken);
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

        if (!is_profiled && role !== 'client') {
          navigate('/profiling');
        } else if (role === 'client') {
          navigate('/client/dashboard');
        } else {
          navigate('/freelancer/homepage');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkTokens();
  }, [navigate]);

  if (loading) {
    return <LoadingComponent text="Please wait while we verify your session..." />;
  }

  return (
    <div className="bg-background text-textPrimary">
      <section className="flex flex-col items-center justify-center min-h-screen text-center p-lg">
        <h1 className="text-4xl font-semibold text-primary mb-md">Welcome to Freelancer Collaboration Hub</h1>
        <p className="text-md text-textSecondary mb-lg max-w-lg mx-auto">
          Connect with clients or freelancers, collaborate on projects, and take your business to the next level with seamless project management, real-time communication, and secure payments.
        </p>
        <div className="flex gap-4">
          <a href="/register">
            <button className="bg-primary text-white py-md px-lg rounded-md shadow-buttonHover hover:bg-secondary transition duration-300">
              Get Started
            </button>
          </a>
          <a href="/login">
            <button className="border-2 border-primary text-primary py-md px-lg rounded-md shadow-buttonHover hover:bg-primary hover:text-white transition duration-300">
              Login
            </button>
          </a>
        </div>
      </section>

      <section className="py-lg bg-card">
        <div className="max-w-7xl mx-auto px-md">
          <h2 className="text-3xl font-semibold text-primary text-center mb-lg">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
            <div className="p-lg text-center bg-white shadow-lg rounded-md">
              <h3 className="text-xl font-semibold text-primary mb-md">Project Bidding</h3>
              <p className="text-textSecondary">Freelancers can bid on projects that match their skills.</p>
            </div>
            <div className="p-lg text-center bg-white shadow-lg rounded-md">
              <h3 className="text-xl font-semibold text-primary mb-md">Real-Time Collaboration</h3>
              <p className="text-textSecondary">Chat, share files, and collaborate in real-time with your team.</p>
            </div>
            <div className="p-lg text-center bg-white shadow-lg rounded-md">
              <h3 className="text-xl font-semibold text-primary mb-md">Secure Payments</h3>
              <p className="text-textSecondary">Complete your projects with secure payment methods.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-lg bg-background">
        <div className="max-w-7xl mx-auto px-md">
          <h2 className="text-3xl font-semibold text-primary text-center mb-lg">About Us</h2>
          <p className="text-md text-textSecondary text-center max-w-3xl mx-auto">
            Freelancer Collaboration Hub is the perfect platform for clients and freelancers to work together. Whether you're looking to get a project done or searching for new opportunities, we have a space for you to succeed.
          </p>
        </div>
      </section>

      <section className="py-lg bg-card">
        <div className="max-w-7xl mx-auto px-md">
          <h2 className="text-3xl font-semibold text-primary text-center mb-lg">What Our Users Say</h2>
          <div className="flex flex-wrap gap-lg justify-center">
            <div className="w-full sm:w-1/3 p-md text-center bg-white shadow-lg rounded-md">
              <p className="text-textSecondary mb-md">"This platform helped me find the right freelancers for my project in no time. Highly recommended!"</p>
              <strong className="text-primary">John Doe</strong>
            </div>
            <div className="w-full sm:w-1/3 p-md text-center bg-white shadow-lg rounded-md">
              <p className="text-textSecondary mb-md">"As a freelancer, I've secured multiple projects and collaborated effectively with clients. Love it!"</p>
              <strong className="text-primary">Jane Smith</strong>
            </div>
            <div className="w-full sm:w-1/3 p-md text-center bg-white shadow-lg rounded-md">
              <p className="text-textSecondary mb-md">"A seamless experience from start to finish. Very happy with the platform!"</p>
              <strong className="text-primary">Mark Wilson</strong>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-primary text-white py-lg text-center">
        <div className="max-w-7xl mx-auto px-md">
          <p>&copy; 2024 Freelancer Collaboration Hub. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-md">
            <a href="#" className="text-white hover:text-secondary">Facebook</a>
            <a href="#" className="text-white hover:text-secondary">Twitter</a>
            <a href="#" className="text-white hover:text-secondary">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
