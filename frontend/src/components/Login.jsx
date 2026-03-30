import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      
      // Use relative URL - on Railway the backend serves the frontend so /api/* works.
      // On local dev, you need a Vite proxy or the backend URL.
      const backendUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await axios.post(`${backendUrl}/auth/google`, {
        token: credential,
      });

      const userData = response.data;
      
      // Store user info and token
      localStorage.setItem('user', JSON.stringify(userData));
      
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      
      navigate('/library'); // Redirect after successful login
      
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    console.log('Google Login Failed');
    alert('Google Login Failed');
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to access study materials and mock tests.</p>
        
        <div className="google-auth-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="rectangular"
            theme="filled_blue"
            text="signin_with"
            size="large"
            use_fedcm_for_prompt={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
