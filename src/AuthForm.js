import React, { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Check password strength when password field changes
    if (name === 'password' && !isLoginPage) {
      const result = zxcvbn(value);
      setPasswordStrength(result.score);
    }

    // Check password matching when either password field changes
    if (!isLoginPage && (name === 'password' || name === 'password_confirmation')) {
      if (name === 'password_confirmation') {
        if (value !== formData.password) {
          setPasswordError('Passwords do not match');
        } else {
          setPasswordError('');
        }
      } else if (name === 'password') {
        if (formData.password_confirmation && value !== formData.password_confirmation) {
          setPasswordError('Passwords do not match');
        } else if (formData.password_confirmation && value === formData.password_confirmation) {
          setPasswordError('');
        }
      }
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return { text: 'Very Weak', class: 'strength-weak' };
      case 1: return { text: 'Weak', class: 'strength-weak' };
      case 2: return { text: 'Fair', class: 'strength-fair' };
      case 3: return { text: 'Good', class: 'strength-good' };
      case 4: return { text: 'Strong', class: 'strength-strong' };
      default: return { text: 'No Password', class: 'strength-none' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match before submission
    if (!isLoginPage && formData.password !== formData.password_confirmation) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-logo">
            <BoxSeam size={24} />
          </div>
          <h2 className="auth-title">{title}</h2>
          
          {error && (
            <Alert variant="danger" className="auth-alert">
              <ExclamationTriangleFill className="alert-icon" />
              <span className="alert-message">{error}</span>
              <button 
                className="close-btn"
                onClick={() => setError(null)}
                aria-label="Close alert"
              >
                ×
              </button>
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {fields.map(field => (
              <Form.Group key={field.name} className="auth-form-group">
                <Form.Label>{field.label}</Form.Label>
                <div className="auth-input-wrapper">
                  <Form.Control
                    type={
                      field.type === 'password' 
                        ? (field.name === 'password' ? (showPassword ? 'text' : 'password') 
                          : (showConfirmPassword ? 'text' : 'password'))
                        : field.type
                    }
                    name={field.name}
                    placeholder={field.placeholder}
                    onChange={handleChange}
                    required
                    isInvalid={field.name === 'password_confirmation' && passwordError}
                  />
                  {field.type === 'password' && (
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => field.name === 'password' 
                        ? setShowPassword(!showPassword)
                        : setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {field.name === 'password' 
                        ? (showPassword ? <EyeSlash /> : <Eye />)
                        : (showConfirmPassword ? <EyeSlash /> : <Eye />)
                      }
                    </button>
                  )}
                </div>
                {field.name === 'password' && !isLoginPage && (
                  <div className="password-strength">
                    <span className={getPasswordStrengthText().class}>
                      Password Strength: {getPasswordStrengthText().text}
                    </span>
                  </div>
                )}
                {field.name === 'password_confirmation' && passwordError && (
                  <Form.Control.Feedback type="invalid">
                    {passwordError}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            ))}
            
            <Button 
              type="submit" 
              className="auth-submit-btn"
              disabled={isSubmitting || (!isLoginPage && passwordError)}
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
