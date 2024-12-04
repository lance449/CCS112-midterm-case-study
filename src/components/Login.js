// login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../AuthForm';
import { login } from '../api';

const Login = () => {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const fields = [
    { name: 'email', label: 'Email address', type: 'email', placeholder: 'Enter email' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Password' },
  ];

  const validateForm = (formData) => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    return errors;
  };

  const handleLogin = async (formData) => {
    const validationErrors = validateForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      const response = await login(formData.email, formData.password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('userRole', response.user.role);

      if (response.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/products');
      }

    } catch (error) {
      if (error.message) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'An unexpected error occurred during login' });
      }
    }
  };

  return (
    <AuthForm
      title="Login"
      fields={fields}
      submitText="Login"
      altLink="/signup"
      altText="Need an account? Sign up"
      onSubmit={handleLogin}
      errors={errors}
      isLoginPage={true}
    />
  );
};

export default Login;
