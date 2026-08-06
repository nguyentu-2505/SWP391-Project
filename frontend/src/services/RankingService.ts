import api from './api';

const API_URL = '/rankings';

export interface Ranking {
    teamId: number;
    teamName: string;
    totalScore: number;
    rank: number;
}

const getRankingForRound = async (roundId: number): Promise<Ranking[]> => {
    const response = await api.get(`${API_URL}/round/${roundId}`);
    const data = response.data?.data ?? response.data ?? [];
    return data.map((item: any) => ({
        teamId: item.teamId,
        teamName: item.teamName,
        totalScore: item.finalScore ?? 0,
        rank: item.rank
    }));
};

export const RankingService = {
    getRankingForRound,
};