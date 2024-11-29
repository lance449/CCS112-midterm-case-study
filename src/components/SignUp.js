import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../AuthForm';
import { register } from '../api';

const SignUp = () => {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const fields = [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Enter your name' },
    { name: 'email', label: 'Email address', type: 'email', placeholder: 'Enter email' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Password' },
    { name: 'password_confirmation', label: 'Confirm Password', type: 'password', placeholder: 'Confirm Password' },
  ];

  const handleSignUp = async (formData) => {
    try {
      await register(formData.name, formData.email, formData.password, formData.password_confirmation, formData.role);
      navigate('/login');
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ general: 'An unexpected error occurred during registration' });
      }
    }
  };

  return (
    <AuthForm
      title="Sign Up"
      fields={fields}
      submitText="Sign Up"
      altLink="/login"
      altText="Already have an account? Login"
      onSubmit={handleSignUp}
      errors={errors}
    />
  );
};

export default SignUp;
