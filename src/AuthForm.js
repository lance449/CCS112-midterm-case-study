import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Eye, EyeSlash, BoxSeam, ExclamationTriangleFill } from 'react-bootstrap-icons';
import zxcvbn from 'zxcvbn';
import './components/AuthForm.css';

const AuthForm = ({ 
  title, 
  fields, 
  submitText, 
  altLink, 
  altText, 
  onSubmit, 
  error,
  setError,
  isLoginPage 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(zxcvbn(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-logo">
            <BoxSeam size={48} />
          </div>
          <h2 className="auth-title">{title}</h2>
          
          {error && (
            <div className="auth-alert">
              <ExclamationTriangleFill className="alert-icon" />
              <span className="alert-message">{error}</span>
              <button className="close-btn" onClick={() => setError(null)}>&times;</button>
            </div>
          )}

          <Form noValidate onSubmit={handleSubmit}>
            {fields.map((field, index) => (
              <Form.Group className="auth-form-group" key={index}>
                <Form.Label>{field.label}</Form.Label>
                <div className="auth-input-wrapper">
                  <Form.Control
                    type={field.name.includes('password') ? 
                      (field.name === 'password' ? (showPassword ? 'text' : 'password') : 
                      (showConfirmPassword ? 'text' : 'password')) : 
                      field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    isInvalid={!!error}
                  />
                  {field.name.includes('password') && (
                    <div 
                      className="password-toggle"
                      onClick={() => field.name === 'password' ? 
                        setShowPassword(!showPassword) : 
                        setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {(field.name === 'password' ? showPassword : showConfirmPassword) ? 
                        <Eye /> : <EyeSlash />}
                    </div>
                  )}
                </div>
              </Form.Group>
            ))}

            {/* Password strength indicator */}
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

            <Button 
              variant="primary" 
              type="submit" 
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Please wait...' : submitText}
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
