import axios from 'axios';

const API_URL = '/users';

// We need to define the User type based on the backend's UserResponse
export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
}

const getUsers = async (): Promise<User[]> => {
    const response = await axios.get(API_URL, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const approveUser = async (id: number): Promise<User> => {
    const response = await axios.patch(`${API_URL}/${id}/approve`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getPendingUsers = async (): Promise<User[]> => {
    const response = await axios.get(`${API_URL}/pending`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};


export const UserService = {
    getUsers,
    approveUser,
    getPendingUsers,
};