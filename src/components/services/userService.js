import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const userService = {
    getUserProfile: async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios({
                method: 'GET',
                url: `${API_URL}/user/profile`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }
            
            console.log('Profile data received:', response.data);
            return response.data;
            
        } catch (error) {
            console.error('Profile fetch error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch profile');
        }
    },

    updateProfile: async (profileData) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('Updating profile with data:', profileData);

            const response = await axios({
                method: 'PUT',
                url: `${API_URL}/user/profile`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: profileData
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            console.log('Profile update response:', response.data);
            return response.data;
            
        } catch (error) {
            console.error('Profile update error:', error);
            throw new Error(error.response?.data?.message || 'Failed to update profile');
        }
    }
};

export default userService;