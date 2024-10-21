import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './AuthForm.css';

const AuthForm = ({ title, fields, submitText, altLink, altText }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your auth logic here
  };

  return (
    <Card className="auth-card">
      <Card.Body className="p-5">
        <h2 className="text-center mb-4">{title}</h2>
        <Form onSubmit={handleSubmit}>
          {fields.map((field, index) => (
            <Form.Group className="mb-3" controlId={`form${field.name}`} key={index}>
              <Form.Label>{field.label}</Form.Label>
              <Form.Control type={field.type} placeholder={field.placeholder} />
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
