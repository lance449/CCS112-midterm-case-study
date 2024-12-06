import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../AuthForm';
import { register } from '../api';

const SignUp = () => {
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const validateSignupData = (formData) => {
    const errors = {};
    
    // Check fields individually
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    }
    if (!formData.password?.trim()) {
      errors.password = 'Password is required';
    }
    if (!formData.password_confirmation?.trim()) {
      errors.password_confirmation = 'Password confirmation is required';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }
    
    return errors;
  };

  const handleSignup = async (formData) => {
    try {
      // Validate all fields
      const validationErrors = validateSignupData(formData);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors); // Set field-specific errors
        return;
      }

      const response = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.password_confirmation
      );

      if (response) {
        navigate('/login');
      }
    } catch (error) {
      if (error.email) {
        setFieldErrors({ email: error.email });
      } else {
        setError(error.message || 'Registration failed');
      }
    }
  };

  const fields = [
    { 
      name: 'name', 
      label: 'Name', 
      type: 'text', 
      placeholder: 'Enter your name',
      error: fieldErrors.name 
    },
    { 
      name: 'email', 
      label: 'Email address', 
      type: 'email', 
      placeholder: 'Enter email',
      error: fieldErrors.email 
    },
    { 
      name: 'password', 
      label: 'Password', 
      type: 'password', 
      placeholder: 'Password',
      error: fieldErrors.password 
    },
    { 
      name: 'password_confirmation', 
      label: 'Confirm Password', 
      type: 'password', 
      placeholder: 'Confirm password',
      error: fieldErrors.password_confirmation 
    }
  ];

  return (
    <AuthForm
      title="Sign Up"
      fields={fields}
      submitText="Sign Up"
      altLink="/login"
      altText="Already have an account? Login"
      onSubmit={handleSignup}
      error={error}
      setError={setError}
      fieldErrors={fieldErrors}
      setFieldErrors={setFieldErrors}
      isLoginPage={false}
    />
  );
};

export default SignUp;
