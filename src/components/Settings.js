import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    language: 'english'
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'darkMode') {
      toggleDarkMode();
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSuccess('Settings updated successfully');
      setError('');
    } catch (error) {
      setError('Failed to update settings');
      setSuccess('');
    }
  };

  const handleBack = () => {
    navigate('/products');
  };

  return (
    <Container className={`settings-container mt-5 pt-4 ${darkMode ? 'dark-mode' : ''}`}>
      <div className="button-wrapper">
        <Button 
          className={`back-button mb-3 ${darkMode ? 'dark-mode' : ''}`}
          onClick={handleBack}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          <span>Back to Products</span>
        </Button>
      </div>

      <Card className={`settings-card ${darkMode ? 'dark-mode' : ''}`}>
        <Card.Header as="h4" className={`text-center ${darkMode ? 'dark-header' : ''}`}>
          <FontAwesomeIcon icon={faCog} className="me-2" />
          Settings
        </Card.Header>
        <Card.Body className={darkMode ? 'dark-body' : ''}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className={`settings-label ${darkMode ? 'dark-label' : ''}`}>
                Notifications
              </Form.Label>
              <Form.Check
                type="switch"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
                label="Enable push notifications"
                className={darkMode ? 'dark-switch' : ''}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className={`settings-label ${darkMode ? 'dark-label' : ''}`}>
                Email Updates
              </Form.Label>
              <Form.Check
                type="switch"
                name="emailUpdates"
                checked={settings.emailUpdates}
                onChange={handleChange}
                label="Receive email updates about orders and promotions"
                className={darkMode ? 'dark-switch' : ''}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className={`settings-label ${darkMode ? 'dark-label' : ''}`}>
                Theme
              </Form.Label>
              <Form.Check
                type="switch"
                name="darkMode"
                checked={darkMode}
                onChange={handleChange}
                label="Dark mode"
                className={darkMode ? 'dark-switch' : ''}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className={`settings-label ${darkMode ? 'dark-label' : ''}`}>
                Language
              </Form.Label>
              <Form.Select
                name="language"
                value={settings.language}
                onChange={handleChange}
                className={`settings-select ${darkMode ? 'dark-select' : ''}`}
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
              </Form.Select>
            </Form.Group>

            <div className="button-wrapper d-flex justify-content-end">
              <Button 
                variant={darkMode ? "outline-light" : "success"} 
                type="submit" 
                className={`settings-save-button ${darkMode ? 'dark-button' : ''}`}
              >
                <FontAwesomeIcon icon={faSave} className="me-2" />
                <span>Save Changes</span>
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Settings; 