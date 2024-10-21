import React from 'react';
import AuthForm from './AuthForm';

const SignUp = () => {
  const fields = [
    { name: 'email', label: 'Email address', type: 'email', placeholder: 'Enter email' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Password' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Confirm Password' },
  ];

  return (
    <AuthForm
      title="Sign Up"
      fields={fields}
      submitText="Sign Up"
      altLink="/login"
      altText="Already have an account? Login"
    />
  );
};

export default SignUp;
