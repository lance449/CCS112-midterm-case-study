// login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loginError, setLoginError] = useState(null); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://your-api-url/login', {
        name: formData.name,
        password: formData.password,
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token); 
        setIsSubmitted(true);
      } else {
        setLoginError('Login failed, please check your credentials.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setLoginError('An error occurred during login. Please try again.');
    }
  };

  const closeModal = () => {
    setIsSubmitted(false);
    navigate('/dashboard');
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="card mt-4" style={{ width: '550px' }}>
        <div className="card-body">
          <h2 className="text-center">Log in</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Username:</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password here"
                required
              />
            </div>
            
            {loginError && <div className="text-danger text-center">{loginError}</div>} {/* Display login errors */}

            <div className="mt-2">
              <p style={{ textAlign: 'center' }}>
                <a href="/SignUp" className="link-primary">Sign up</a>
              </p>
            </div>
          </form>
        </div>

        {/* Modal for successful login */}
        <div className={`modal fade ${isSubmitted ? 'show' : ''}`} style={{ display: isSubmitted ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-labelledby="submissionModalLabel" aria-hidden={!isSubmitted}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header d-flex justify-content-center">
                <h5 className="modal-title" id="submissionModalLabel">Login Success!</h5>
              </div>
              <div className="modal-body">
                You are now logged in
              </div>
              <div className="modal-footer d-flex justify-content-center mt-2">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
