import axios from 'axios';

const API_URL = '/prizes';

export interface Prize {
    id: number;
    name: string;
    description: string;
    quantity: number;
    hackathonEventId: number;
    teamId?: number;
}

export interface CreatePrizeRequest {
    name: string;
    description: string;
    quantity: number;
    hackathonEventId: number;
}

export interface AssignPrizeRequest {
    teamId: number;
}

const createPrize = async (prize: CreatePrizeRequest): Promise<Prize> => {
    const response = await axios.post(API_URL, prize, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const assignPrizeToTeam = async (prizeId: number, request: AssignPrizeRequest): Promise<Prize> => {
    const response = await axios.patch(`${API_URL}/${prizeId}/assign`, request, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getPrizesByEvent = async (hackathonEventId: number): Promise<Prize[]> => {
    const response = await axios.get(`${API_URL}/event/${hackathonEventId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

export const PrizeService = {
    createPrize,
    assignPrizeToTeam,
    getPrizesByEvent,
};