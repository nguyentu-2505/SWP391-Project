import api from './api';

const API_URL = '/criteria';

export interface Criterion {
    id: number;
    name: string;
    description: string;
    weight: number;
}

export interface CreateCriterionRequest {
    name: string;
    description: string;
    weight: number;
    hackathonEventId?: number;
}

export interface UpdateCriterionRequest {
    name?: string;
    description?: string;
    weight?: number;
}

const createCriterion = async (criterion: CreateCriterionRequest): Promise<Criterion> => {
    const response = await api.post(API_URL, criterion);
    return response.data;
};

const getCriteriaForEvent = async (hackathonEventId: number): Promise<Criterion[]> => {
    const response = await api.get(`${API_URL}/event/${hackathonEventId}`);
    return response.data;
};

const getDefaultCriteria = async (): Promise<Criterion[]> => {
    const response = await api.get(`${API_URL}/default`);
    return response.data;
};

const updateCriterion = async (id: number, criterion: UpdateCriterionRequest): Promise<Criterion> => {
    const response = await api.put(`${API_URL}/${id}`, criterion);
    return response.data;
};

const deleteCriterion = async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
};

export const CriterionService = {
    createCriterion,
    getCriteriaForEvent,
    getDefaultCriteria,
    updateCriterion,
    deleteCriterion,
};
