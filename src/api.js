import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const register = async (name, email, password, password_confirmation, role) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
      password_confirmation,
      role
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
    if (error.response) {
      throw error.response.data;
    }
    throw new Error('An unexpected error occurred during login');
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.post(`${API_URL}/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};
