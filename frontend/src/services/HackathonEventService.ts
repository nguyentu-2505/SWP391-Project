import axios from 'axios';

const API_URL = '/hackathon-events';

export interface HackathonEvent {
    id: number;
    name: string;
    description: string;
    slug: string;
    startTime: string;
    endTime: string;
}

export interface CreateHackathonEventRequest {
    name: string;
    description: string;
    startTime: string;
    endTime: string;
}

export interface UpdateHackathonEventRequest {
    name?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
}

const createHackathonEvent = async (event: CreateHackathonEventRequest): Promise<HackathonEvent> => {
    const response = await axios.post(API_URL, event, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getHackathonEvents = async (): Promise<HackathonEvent[]> => {
    const response = await axios.get(API_URL, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getHackathonEventBySlug = async (slug: string): Promise<HackathonEvent> => {
    const response = await axios.get(`${API_URL}/${slug}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const updateHackathonEvent = async (id: number, event: UpdateHackathonEventRequest): Promise<HackathonEvent> => {
    const response = await axios.put(`${API_URL}/${id}`, event, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const deleteHackathonEvent = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
};

export const HackathonEventService = {
    createHackathonEvent,
    getHackathonEvents,
    getHackathonEventBySlug,
    updateHackathonEvent,
    deleteHackathonEvent,
};
