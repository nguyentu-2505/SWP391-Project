import axios from 'axios';

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
    const response = await axios.post(API_URL, team, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getTeamById = async (id: number): Promise<Team> => {
    const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getTeamsByTrack = async (trackId: number): Promise<Team[]> => {
    const response = await axios.get(`${API_URL}/track/${trackId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

export const TeamService = {
    createTeam,
    getTeamById,
    getTeamsByTrack,
};