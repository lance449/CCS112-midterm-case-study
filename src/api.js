import axios from 'axios';

// Define base URL without /api suffix
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const API_URL = `${BASE_URL}/api`;

// Add request interceptor to include token
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token && !config.url.includes('/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !error.config.url.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
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
    // Explicitly construct the full URL
    const loginUrl = `${API_URL}/login`;
    console.log('Making login request to:', loginUrl); // Debug log
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login response:', response.data); // Debug log
    
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      localStorage.setItem('userName', response.data.user.name);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error details:', {
      message: error.response?.data?.message,
      status: error.response?.status,
      url: error.config?.url
    });
    throw {
      message: error.response?.data?.message || 'Login failed',
      status: error.response?.status || 500
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

// Add timeout and maxContentLength settings for large file uploads
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  maxContentLength: Infinity,
  maxBodyLength: Infinity
});

// Use this instance for your API calls
export const uploadFile = async (formData) => {
  try {
    const response = await axiosInstance.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // You can use this to show upload progress
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
