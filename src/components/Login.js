// login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../AuthForm';
import { login } from '../api';

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      const response = await login(formData.email, formData.password);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('userName', response.user.name);
        navigate(response.user.role === 'admin' ? '/dashboard' : '/products');
      }
      
    } catch (err) {
      setError(err.message);
      return false; // Important: return false to prevent form reset
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
