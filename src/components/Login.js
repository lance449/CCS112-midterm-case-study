// login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../AuthForm';
import { login, API_URL } from '../api';

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      console.log('Attempting login to:', `${API_URL}/login`);
      const response = await login(formData.email, formData.password);
      
      if (response && response.token) {
        navigate(response.user.role === 'admin' ? '/dashboard' : '/products');
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
    }
  };

  const fields = [
    { name: 'email', label: 'Email address', type: 'email', placeholder: 'Enter email' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Password' },
  ];

  return (
    <AuthForm
      title="Login"
      fields={fields}
      submitText="Login"
      altLink="/signup"
      altText="Need an account? Sign up"
      onSubmit={handleLogin}
      error={error}
      setError={setError}
      isLoginPage={true}
    />
  );
};

export default Login;
