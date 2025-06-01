import React from 'react';
import { GoogleLogin as GoogleOAuthLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const GoogleLogin: React.FC = () => {
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      // Send the token to your backend
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });

      // Handle the response from your backend
      const { data } = response;
      login(data);
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <GoogleOAuthLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
      />
    </div>
  );
};

export default GoogleLogin; 