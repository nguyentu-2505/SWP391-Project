import api from './api';
import { Team } from './TeamService';
import { User } from './UserService';

export interface MentorshipRequest {
    id: number;
    team: Team;
    mentor: User | null;
    title: string;
    description: string;
    status: string;
}

export interface CreateMentorshipRequest {
    teamId: number;
    title: string;
    description: string;
}

const createRequest = async (request: CreateMentorshipRequest): Promise<MentorshipRequest> => {
    const response = await api.post('/mentorship-requests', request);
    return response.data.data;
};

const getOpenRequests = async (): Promise<MentorshipRequest[]> => {
    const response = await api.get('/mentorship-requests/open');
    return response.data.data;
};

const getMyRequests = async (): Promise<MentorshipRequest[]> => {
    const response = await api.get('/mentorship-requests/my-requests');
    return response.data.data;
};

const acceptRequest = async (id: number): Promise<MentorshipRequest> => {
    const response = await api.patch(`/mentorship-requests/${id}/accept`);
    return response.data.data;
};

const resolveRequest = async (id: number): Promise<MentorshipRequest> => {
    const response = await api.patch(`/mentorship-requests/${id}/resolve`);
    return response.data.data;
};

export const MentorshipRequestService = {
    createRequest,
    getOpenRequests,
    getMyRequests,
    acceptRequest,
    resolveRequest,
};
