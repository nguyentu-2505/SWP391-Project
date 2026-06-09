import api from './api';

const API_URL = '/teams';

export interface Team {
    id: number;
    name: string;
    description: string;
    trackId: number;
    // Add other fields from TeamResponse as needed
}

export interface CreateTeamRequest {
    name: string;
    description: string;
    trackId: number;
}

const createTeam = async (team: CreateTeamRequest): Promise<Team> => {
    const response = await api.post(API_URL, team);
    return response.data.data;
};

const getTeamById = async (id: number): Promise<Team> => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data.data;
};

const getTeamsByTrack = async (trackId: number): Promise<Team[]> => {
    const response = await api.get(`${API_URL}/track/${trackId}`);
    return response.data.data;
};

export const TeamService = {
    createTeam,
    getTeamById,
    getTeamsByTrack,
};