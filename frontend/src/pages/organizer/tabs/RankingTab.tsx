import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { ListOrdered, Trophy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Round {
    id: number;
    name: string;
}

interface TeamRanking {
    rank: number;
    teamId: number;
    teamName: string;
    projectName: string;
    finalScore: number;
}

const RankingTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [rounds, setRounds] = useState<Round[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState<number | ''>('');
    const [rankings, setRankings] = useState<TeamRanking[]>([]);
    const [loadingRounds, setLoadingRounds] = useState(true);
    const [loadingRankings, setLoadingRankings] = useState(false);

    useEffect(() => {
        if (!eventId) return;
        const fetchRounds = async () => {
            try {
                const res = await api.get(`/rounds/hackathon/${eventId}`);
                const data = res.data.data ?? res.data;
                const list = Array.isArray(data) ? data : [];
                setRounds(list);
                // Auto-select first round
                if (list.length > 0) setSelectedRoundId(list[0].id);
            } catch {
                toast.error('Failed to load rounds.');
            } finally {
                setLoadingRounds(false);
            }
        };
        fetchRounds();
    }, [eventId]);

    useEffect(() => {
        if (!selectedRoundId) return;
        const fetchRankings = async () => {
            setLoadingRankings(true);
            try {
                const res = await api.get(`/rankings/round/${selectedRoundId}`);
                setRankings(res.data.data ?? []);
            } catch {
                toast.error('Failed to load rankings for this round.');
                setRankings([]);
            } finally {
                setLoadingRankings(false);
            }
        };
        fetchRankings();
    }, [selectedRoundId]);

    if (loadingRounds) return (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
    );

    const rankIcons = ['🥇', '🥈', '🥉'];

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <ListOrdered size={20} className="text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Rankings</h2>
            </div>

            {rounds.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">No rounds available. Create rounds first.</p>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Select Round</label>
                        <select
                            value={selectedRoundId}
                            onChange={e => setSelectedRoundId(Number(e.target.value))}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            {rounds.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {loadingRankings ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-blue-500" size={28} />
                        </div>
                    ) : rankings.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <Trophy className="mx-auto mb-2" size={36} />
                            <p className="text-sm">No scores submitted for this round yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Final Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rankings.map((r, idx) => (
                                        <tr key={r.teamId} className={`${idx < 3 ? 'font-semibold' : ''} hover:bg-gray-50`}>
                                            <td className="px-4 py-3 text-sm">
                                                {idx < 3
                                                    ? <span className="text-lg">{rankIcons[idx]}</span>
                                                    : <span className="text-gray-500">#{r.rank}</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{r.teamName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{r.projectName || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-right font-mono font-bold text-blue-700">
                                                {r.finalScore.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RankingTab;
