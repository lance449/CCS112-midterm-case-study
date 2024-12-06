import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit, faSave, faTimes, faEye, faEyeSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import userService from './services/userService';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    newPassword_confirmation: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUserProfile();
      setProfile(prevProfile => ({
        ...prevProfile,
        name: userData.name,
        email: userData.email
      }));
      setError('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userService.updateProfile(profile);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setError('');
    } catch (error) {
      setError(error.message);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <Container className="profile-container mt-5 pt-4">
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  return (
    <Container className="profile-container mt-5 pt-4">
      <div className="button-wrapper">
        <Button 
          className="back-button mb-3"
          onClick={handleBack}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          <span>Back to Products</span>
        </Button>
      </div>

      <Card className="profile-card">
        <Card.Header as="h4" className="text-center">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          My Profile
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <div className="profile-field-container">
              <div className="profile-field-label">Name</div>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-input"
              />
            </div>

            <div className="profile-field-container">
              <div className="profile-field-label">Email</div>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-input"
              />
            </div>

            {isEditing && (
              <div className="password-section">
                <h5 className="section-title">Change Password</h5>
                
                <div className="profile-field-container">
                  <div className="profile-field-label">Current Password</div>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="currentPassword"
                      value={profile.currentPassword}
                      onChange={handleInputChange}
                      className="profile-input"
                    />
                    <Button
                      variant="link"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </Button>
                  </div>
                </div>

                <div className="profile-field-container">
                  <div className="profile-field-label">New Password</div>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={profile.newPassword}
                      onChange={handleInputChange}
                      className="profile-input"
                    />
                    <Button
                      variant="link"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                    </Button>
                  </div>
                </div>

                <div className="profile-field-container">
                  <div className="profile-field-label">Confirm New Password</div>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="newPassword_confirmation"
                      value={profile.newPassword_confirmation}
                      onChange={handleInputChange}
                      className="profile-input"
                    />
                    <Button
                      variant="link"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="button-wrapper d-flex justify-content-between mt-4">
              {!isEditing ? (
                <Button variant="primary" onClick={() => setIsEditing(true)} className="action-button">
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <>
                  <div className="button-wrapper">
                    <Button variant="outline-secondary" onClick={() => setIsEditing(false)} className="action-button">
                      <FontAwesomeIcon icon={faTimes} className="me-2" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                  <div className="button-wrapper">
                    <Button variant="success" type="submit" className="action-button">
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile; 