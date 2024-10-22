import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Envelope, Lock, Eye, EyeSlash } from 'react-bootstrap-icons';
import axios from 'axios';
import './AuthForm.css';

const AuthForm = ({ title, fields, submitText, altLink, altText }) => {
  const [formData, setFormData] = useState({});
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    // Add your auth logic here
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <Card className="auth-card">
      <Card.Body className="p-5">
        <h2 className="text-center mb-4">{title}</h2>
        <Form onSubmit={handleSubmit}>
          {fields.map((field, index) => (
            <Form.Group className="mb-3" controlId={`form${field.name}`} key={index}>
              <Form.Label>
                {field.name === 'email' && <Envelope className="me-2" />}
                {field.name.includes('password') && <Lock className="me-2" />}
                {field.label}
              </Form.Label>
              <div className="position-relative">
                {field.name === 'email' ? (
                  <Form.Control
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    isInvalid={!isEmailValid}
                  />
                ) : field.name === 'password' ? (
                  <>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                    />
                    <div
                      className="position-absolute top-50 end-0 translate-middle-y me-2"
                      style={{ cursor: 'pointer' }}
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <Eye /> : <EyeSlash />}
                    </div>
                  </>
                ) : field.name === 'confirmPassword' ? (
                  <>
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                    />
                    <div
                      className="position-absolute top-50 end-0 translate-middle-y me-2"
                      style={{ cursor: 'pointer' }}
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? <Eye /> : <EyeSlash />}
                    </div>
                  </>
                ) : (
                  <Form.Control 
                    type={field.type} 
                    name={field.name}
                    placeholder={field.placeholder} 
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                  />
                )}
              </div>
              {field.name === 'email' && !isEmailValid && (
                <Form.Text className="text-danger">
                  Please enter a valid email address.
                </Form.Text>
              )}
            </Form.Group>
          ))}
          <Button variant="primary" type="submit" className="w-100 mb-3">
            {submitText}
          </Button>
        </Form>
        <div className="text-center">
          <Link to={altLink} className="btn btn-link">{altText}</Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AuthForm;
