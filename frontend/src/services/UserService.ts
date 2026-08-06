import api from './api';

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
}

export interface PageResponse<T> {
    content: T[];
    pageable: any;
    last: boolean;
    totalElements: number;
    totalPages: number;
    first: boolean;
    size: number;
    number: number;
    sort: any;
    numberOfElements: number;
    empty: boolean;
}

const getUsers = async (page: number = 0, size: number = 10): Promise<PageResponse<User>> => {
    const response = await api.get(`/users?page=${page}&size=${size}&sort=id,desc`);
    const apiResponse = response.data;

    if (apiResponse.pagination) {
        return {
            content: apiResponse.data,
            totalPages: apiResponse.pagination.totalPages,
            totalElements: apiResponse.pagination.totalElements,
        } as PageResponse<User>;
    }
    return apiResponse.data;
};

const approveUser = async (id: number): Promise<User> => {
    const response = await api.patch(`/users/${id}/approve`);
    return response.data.data;
};

const getPendingUsers = async (page: number = 0, size: number = 10): Promise<PageResponse<User>> => {
    const response = await api.get(`/users/pending?page=${page}&size=${size}&sort=id,desc`);
    const apiResponse = response.data;
    
    if (apiResponse.pagination) {
        return {
            content: apiResponse.data,
            totalPages: apiResponse.pagination.totalPages,
            totalElements: apiResponse.pagination.totalElements,
        } as PageResponse<User>;
    }
    return apiResponse.data;
};

const createUser = async (userData: any): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data.data;
};

const getUsersByRole = async (role: string): Promise<User[]> => {
    const response = await api.get(`/users/role/${role}`);
    return response.data.data;
};

export const UserService = {
    getUsers,
    approveUser,
    getPendingUsers,
    createUser,
    getUsersByRole,
};