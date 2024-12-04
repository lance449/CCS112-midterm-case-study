import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Add interceptor for token handling
axios.interceptors.response.use(
  response => response,
  error => {
    // Don't redirect on 401 during login attempts
    if (error.response?.status === 401 && !error.config.url.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const register = async (name, email, password, password_confirmation) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
      password_confirmation
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 422) {
      throw error.response.data;
    }
    throw new Error('An unexpected error occurred during registration');
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    // Create a consistent error structure
    const errorMessage = 
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Invalid email or password';

    // Throw a standardized error object
    throw {
      message: errorMessage,
      status: error.response?.status || 500,
      timestamp: new Date().getTime()
    };
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    await axios.post(`${API_URL}/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    // Clear local storage regardless of API response
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    
  } catch (error) {
    console.error('Error during logout:', error);
    // Still clear local storage even if API call fails
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    throw error;
  }
};

class ApiService {
  static async getProducts() {
    try {
      const response = await axios.get(`${API_URL}/products`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
