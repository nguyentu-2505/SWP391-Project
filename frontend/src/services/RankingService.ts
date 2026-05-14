import axios from 'axios';

const API_URL = '/rankings';

export interface Ranking {
    teamId: number;
    teamName: string;
    totalScore: number;
    rank: number;
}

const getRankingForRound = async (roundId: number): Promise<Ranking[]> => {
    const response = await axios.get(`${API_URL}/round/${roundId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

export const RankingService = {
    getRankingForRound,
};