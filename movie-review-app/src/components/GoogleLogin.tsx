import React, { useState } from 'react';
import { GoogleLogin as GoogleOAuthLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import api from '../config/api';

const GoogleLogin: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const handleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      const response = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });

      // If the user exists, log them in
      if (response.data.user) {
        login(response.data);
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error during Google login:', error);
      
      // If the error is 404 (user not found), redirect to registration
      if (error.response?.status === 404) {
        try {
          // Get the decoded token data from the backend response
          const googleData = error.response.data.googleData;
          
          // Redirect to register page with the Google account data
          navigate('/register', {
            state: {
              email: googleData.email,
              googleData: googleData
            }
          });
        } catch (navError) {
          setError('Error processing Google login data. Please try again.');
        }
      } else {
        setError(
          error.response?.data?.message || 
          error.message || 
          'Google login failed. Please try again.'
        );
      }
    }
  };

  const handleError = () => {
    setError('Google Login Failed. Please try again.');
  };

  const handleCloseError = () => {
    setError('');
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <GoogleOAuthLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          theme="filled_blue"
          size="large"
          shape="rectangular"
          text="continue_with"
          locale="en"
        />
      </div>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GoogleLogin; 