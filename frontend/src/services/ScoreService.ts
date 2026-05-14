import axios from 'axios';

const API_URL = '/scores';

export interface Score {
    id: number;
    value: number;
    criterionId: number;
    submissionId: number;
    judgeId: number;
}

export interface ScoreDetail {
    criterionId: number;
    value: number;
}

export interface CreateScoreRequest {
    submissionId: number;
    judgeId: number;
    scores: ScoreDetail[];
}

const saveScores = async (request: CreateScoreRequest): Promise<Score[]> => {
    const response = await axios.post(API_URL, request, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getScoresForSubmission = async (submissionId: number): Promise<Score[]> => {
    const response = await axios.get(`${API_URL}/submission/${submissionId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getScoresForSubmissionByJudge = async (submissionId: number, judgeId: number): Promise<Score[]> => {
    const response = await axios.get(`${API_URL}/submission/${submissionId}/judge/${judgeId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

export const ScoreService = {
    saveScores,
    getScoresForSubmission,
    getScoresForSubmissionByJudge,
};