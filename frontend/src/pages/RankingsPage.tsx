import React, { useEffect, useState } from 'react';
import { RankingService, Ranking } from '../services/RankingService';
import { Trophy, Loader2, Medal, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const RankingsPage: React.FC = () => {
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRankings();
    }, []);

    const fetchRankings = async () => {
        setLoading(true);
        try {
            // For now, fetching rankings for round 1.
            const allRankings = await RankingService.getRankingForRound(1);
            setRankings(allRankings);
        } catch (err: any) {
            console.error('Failed to fetch rankings:', err);
            toast.error(err.response?.data?.message || 'No rankings found for this round.');
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="text-yellow-500" size={20} />;
        if (rank === 2) return <Medal className="text-gray-400" size={20} />;
        if (rank === 3) return <Medal className="text-orange-400" size={20} />;
        return <span className="text-gray-400 font-bold ml-1">{rank}</span>;
    };

    return (
        <div className="container mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" />
                    Leaderboard
                </h1>
                <p className="text-gray-500 text-sm mt-1">Real-time team standings based on judge scores.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : rankings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Trophy className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No rankings</h3>
                    <p className="mt-1 text-sm text-gray-500">Wait for judges to finish scoring to see the results.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Rank</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rankings.map((ranking) => (
                                    <tr key={ranking.teamId} className={`${ranking.rank <= 3 ? 'bg-blue-50/30' : ''} hover:bg-gray-50 transition-colors`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100">
                                                {getRankIcon(ranking.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{ranking.teamName}</div>
                                            <div className="text-xs text-gray-400">Team ID: {ranking.teamId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-lg font-bold text-blue-600">{ranking.totalScore.toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full ${ranking.rank === 1 ? 'bg-yellow-400' : 'bg-blue-500'}`} 
                                                    style={{ width: `${Math.min(ranking.totalScore, 100)}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RankingsPage;