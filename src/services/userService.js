import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class UserService {
  constructor() {
    this.axios = axios.create({
      baseURL: API_URL,
      timeout: 10000
    });

    // Add request interceptor to include auth token
    this.axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Get user profile
  async getUserProfile() {
    try {
      const response = await this.axios.get('/user');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Update profile information
  async updateProfile(userData) {
    try {
      const response = await this.axios.post('/user/update', userData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Update password
  async updatePassword(passwordData) {
    try {
      const response = await this.axios.post('/user/update-password', passwordData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data.message || 'An error occurred';
      if (error.response.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Unable to connect to the server');
    } else {
      // Other errors
      throw error;
    }
  }
}

export default new UserService(); 