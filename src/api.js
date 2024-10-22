import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

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
    if (error.response && error.response.status === 422) {
      throw error.response.data;
    }
    throw new Error('An unexpected error occurred during login');
  }
};
