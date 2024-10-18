import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords don't match!");
      return;
    }

    setErrorMessage('');

    // Make an API request using Axios
    try {
      const response = await axios.post('http://your-api-url/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        console.log('Form submitted:', formData);
        setIsSubmitted(true);  // Show success modal
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error signing up', error);
      setErrorMessage('Sign up failed. Please try again.');
    }
  };

  const closeModal = () => {
    setIsSubmitted(false);
    setErrorMessage('');
    navigate('/');
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="card mt-4" style={{ width: '550px' }}>
        <div className="card-body">
          <h2 className="text-center">Sign Up</h2>
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
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
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password:</label>
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
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Re-Enter your Password:</label>
              <input 
                type="password" 
                className="form-control" 
                id="confirmPassword" 
                name="confirmPassword" 
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password here"                
                required 
              />
            </div>            
            <div className='d-flex justify-content-center'>
              <button className="btn btn-primary btn-md mt-2">Sign Up</button>
            </div>
            <div className="mt-2">
              <p style={{ textAlign: 'center' }}>
                <a href="/" className="link-primary">Return to Log In page</a>
              </p>          
            </div>  
          </form>
        </div>

        {/* Success Modal */}
        <div className={`modal fade ${isSubmitted ? 'show' : ''}`} style={{ display: isSubmitted ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-labelledby="submissionModalLabel" aria-hidden={!isSubmitted}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header d-flex justify-content-center">
                <h5 className="modal-title" id="submissionModalLabel">Sign Up Success!</h5>
              </div>
              <div className="modal-body">
                You are now signed up.
              </div>
              <div className="modal-footer d-flex justify-content-center mt-2">
                <button type="button" className="btn btn-secondary" onClick={closeModal}> Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
