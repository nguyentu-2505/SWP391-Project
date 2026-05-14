import React, { useEffect, useState } from 'react';
import { RankingService, Ranking } from '../services/RankingService';

const RankingsPage: React.FC = () => {
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                // For now, fetching rankings for round 1.
                const allRankings = await RankingService.getRankingForRound(1);
                setRankings(allRankings);
            } catch (err) {
                setError('Failed to fetch rankings.');
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Rankings</h1>
            <div className="bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rankings.map((ranking) => (
                            <tr key={ranking.teamId}>
                                <td className="px-6 py-4 whitespace-nowrap">{ranking.rank}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{ranking.teamName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{ranking.totalScore}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RankingsPage;