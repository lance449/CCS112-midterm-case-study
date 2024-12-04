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
      // Here you would typically save settings to your backend
      // await settingsService.updateSettings(settings);
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
    <Container className="settings-container mt-5 pt-4">
      <Button 
        className="back-button mb-3"
        onClick={handleBack}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
        Back to Products
      </Button>

      <Card className="settings-card">
        <Card.Header as="h4" className="text-center">
          <FontAwesomeIcon icon={faCog} className="me-2" />
          Settings
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="settings-label">Notifications</Form.Label>
              <Form.Check
                type="switch"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
                label="Enable push notifications"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="settings-label">Email Updates</Form.Label>
              <Form.Check
                type="switch"
                name="emailUpdates"
                checked={settings.emailUpdates}
                onChange={handleChange}
                label="Receive email updates about orders and promotions"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="settings-label">Theme</Form.Label>
              <Form.Check
                type="switch"
                name="darkMode"
                checked={darkMode}
                onChange={handleChange}
                label="Dark mode"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="settings-label">Language</Form.Label>
              <Form.Select
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="settings-select"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="success" type="submit" className="settings-save-button">
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Save Changes
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Settings; 