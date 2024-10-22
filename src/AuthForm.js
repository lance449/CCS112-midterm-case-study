import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Envelope, Lock, Eye, EyeSlash } from 'react-bootstrap-icons';
import axios from 'axios';
import './components/AuthForm.css';

const AuthForm = ({ title, fields, submitText, altLink, altText, onSubmit, errors = {} }) => {
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
                <Form.Control
                  type={field.name.includes('password') ? (field.name === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')) : field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                  isInvalid={!!errors[field.name]}
                />
                {field.name.includes('password') && (
                  <div
                    className="position-absolute top-50 end-0 translate-middle-y me-2"
                    style={{ cursor: 'pointer' }}
                    onClick={field.name === 'password' ? togglePasswordVisibility : toggleConfirmPasswordVisibility}
                  >
                    {(field.name === 'password' ? showPassword : showConfirmPassword) ? <Eye /> : <EyeSlash />}
                  </div>
                )}
                <Form.Control.Feedback type="invalid">
                  {errors[field.name]}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          ))}
          {errors.general && (
            <Alert variant="danger">{errors.general}</Alert>
          )}
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
