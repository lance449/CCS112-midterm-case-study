import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Eye, EyeSlash, BoxSeam } from 'react-bootstrap-icons';
import zxcvbn from 'zxcvbn'; // Import zxcvbn
import './components/AuthForm.css';

const AuthForm = ({ title, fields, submitText, altLink, altText, onSubmit, errors = {}, isLoginPage }) => {
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // If it's the password field, calculate strength
    if (name === 'password') {
      setPasswordStrength(zxcvbn(value));  // Assuming you are using zxcvbn for password strength
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-logo">
            <BoxSeam size={48} />
          </div>
          <h2 className="auth-title">{title}</h2>
          <Form onSubmit={handleSubmit}>
            {fields.map((field, index) => (
              <Form.Group className="auth-form-group" controlId={`form${field.name}`} key={index}>
                <Form.Label>{field.label}</Form.Label>
                <div className="auth-input-wrapper">
                  <Form.Control
                    type={field.name.includes('password') ? (field.name === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')) : field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    isInvalid={!!errors[field.name]}
                  />
                  {field.name.includes('password') && (
                    <div className="password-toggle" onClick={field.name === 'password' ? togglePasswordVisibility : toggleConfirmPasswordVisibility}>
                      {(field.name === 'password' ? showPassword : showConfirmPassword) ? <Eye /> : <EyeSlash />}
                    </div>
                  )}
                </div>
                {errors[field.name] && <div className="auth-error">{errors[field.name]}</div>}
              </Form.Group>
            ))}

            {errors.general && (
              <Alert variant="danger" className="auth-alert">{errors.general}</Alert>
            )}

            {/* Conditionally render the password strength checker only if it's not the login page */}
            {!isLoginPage && (
              <div className="password-strength">
                <Form.Text className="password-strength-text">
                  Password Strength: 
                </Form.Text>
                {formData.password ? (
                  passwordStrength && passwordStrength.score !== -1 && (
                    <Form.Text className={`password-strength-text strength-${Math.min(passwordStrength.score, 3)}`}>
                    {[' Weak', ' Fair', ' Good', ' Strong'][Math.min(passwordStrength.score, 3)]}
                    </Form.Text>
                  )
                ) : (
                  <Form.Text className="password-strength-text strength-none">
                    {' None'}
                  </Form.Text>
                )}
              </div>
            )}

            <Button variant="primary" type="submit" className="auth-submit-btn">
              {submitText}
            </Button>
          </Form>
          <div className="auth-alt-link">
            <Link to={altLink}>{altText}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
