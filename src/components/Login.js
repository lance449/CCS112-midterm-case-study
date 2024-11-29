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

  const handleLogin = async (formData) => {
    try {
      const response = await login(formData.email, formData.password);
      localStorage.setItem('token', response.token);

      navigate(response.dashboard_redirect_url); // Redirect to the dashboard, link is on authcontroller.php on backend

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
      isLoginPage={true}  // Pass isLoginPage as true for login page
    />
  );
};

export default Login;
