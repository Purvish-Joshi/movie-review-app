import React, { useState } from 'react';
import { GoogleLogin as GoogleOAuthLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import api from '../config/api';

interface GoogleResponse {
  token: string;
  user: {
    id: string;
    username?: string;
    email: string;
    picture?: string;
  };
}

const GoogleLogin: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        console.error('No credential received from Google');
        setError('Failed to receive credentials from Google. Please try again.');
        return;
      }

      console.log('Received Google credential, sending to backend...');
      
      const response = await api.post<GoogleResponse>('/auth/google', {
        token: credentialResponse.credential,
      });

      console.log('Received response from backend:', response.data);

      if (!response.data.user || !response.data.token) {
        console.error('Invalid response from server:', response.data);
        setError('Invalid response from server. Please try again.');
        return;
      }

      // Log successful response
      console.log('Login successful, user data:', {
        id: response.data.user.id,
        email: response.data.user.email,
        username: response.data.user.username,
        hasToken: !!response.data.token
      });

      login(response.data);
      navigate('/');
    } catch (error: any) {
      console.error('Error during Google login:', error);
      console.error('Error response:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error
          || error.message 
          || 'Google login failed. Please try again.';
        setError(errorMessage);
      }
    }
  };

  const handleError = () => {
    console.error('Google login error callback triggered');
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
          type="standard"
          theme="filled_blue"
          size="large"
          shape="rectangular"
          width="300"
        />
      </div>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GoogleLogin; 