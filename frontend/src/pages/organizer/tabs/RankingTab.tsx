// Checked and verified: No Vietnamese UI texts present in RankingTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { ListOrdered, Trophy, Loader2, Download, Edit2, X, RotateCcw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ExportService } from '../../../services/ExportService';

interface Round {
    id: number;
    name: string;
}

interface TeamRanking {
    rank: number;
    teamId: number;
    teamName: string;
    projectName: string;
    trackId: number;
    trackName: string;
    finalScore: number;
    manuallyAdjusted?: boolean;
    overrideReason?: string;
}

interface OverrideModalState {
    open: boolean;
    teamId: number | null;
    teamName: string;
    currentRank: number;
    newRank: string;
    reason: string;
}

const RankingTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [rounds, setRounds] = useState<Round[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState<number | ''>('');
    const [rankings, setRankings] = useState<TeamRanking[]>([]);
    const [loadingRounds, setLoadingRounds] = useState(true);
    const [loadingRankings, setLoadingRankings] = useState(false);
    const [selectedTrackId, setSelectedTrackId] = useState<number | 'all'>('all');

    // Override modal state
    const [overrideModal, setOverrideModal] = useState<OverrideModalState>({
        open: false, teamId: null, teamName: '', currentRank: 0, newRank: '', reason: ''
    });
    const [overrideLoading, setOverrideLoading] = useState(false);

    useEffect(() => {
        if (!eventId) return;
        const fetchRounds = async () => {
            try {
                const res = await api.get(`/rounds/hackathon/${eventId}`);
                const data = res.data.data ?? res.data;
                const list = Array.isArray(data) ? data : [];
                setRounds(list);
                if (list.length > 0) setSelectedRoundId(list[0].id);
            } catch {
                toast.error('Failed to load rounds.');
            } finally {
                setLoadingRounds(false);
            }
        };
        fetchRounds();
    }, [eventId]);

    const fetchRankings = async () => {
        if (!selectedRoundId) return;
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

    useEffect(() => {
        fetchRankings();
    }, [selectedRoundId]);

    // Open override modal
    const openOverrideModal = (team: TeamRanking) => {
        setOverrideModal({
            open: true,
            teamId: team.teamId,
            teamName: team.teamName,
            currentRank: team.rank,
            newRank: String(team.rank),
            reason: ''
        });
    };

    // Submit override
    const handleOverrideSubmit = async () => {
        if (!overrideModal.teamId || !selectedRoundId) return;
        if (!overrideModal.reason.trim()) {
            toast.error('Reason is required!');
            return;
        }
        const newRankNum = Number(overrideModal.newRank);
        if (!newRankNum || newRankNum < 1) {
            toast.error('New rank must be at least 1!');
            return;
        }
        setOverrideLoading(true);
        try {
            await api.post(`/rankings/round/${selectedRoundId}/override`, {
                teamId: overrideModal.teamId,
                overrideRank: newRankNum,
                reason: overrideModal.reason.trim()
            });
            toast.success(`⚠️ Rank override applied for "${overrideModal.teamName}"!`);
            setOverrideModal({ open: false, teamId: null, teamName: '', currentRank: 0, newRank: '', reason: '' });
            await fetchRankings();
        } catch {
            toast.error('Failed to apply rank override.');
        } finally {
            setOverrideLoading(false);
        }
    };

    // Remove override — restore auto ranking
    const handleRemoveOverride = async (team: TeamRanking) => {
        if (!selectedRoundId) return;
        const confirmed = window.confirm(`Remove manual override for "${team.teamName}"? Ranking will revert to auto.`);
        if (!confirmed) return;
        try {
            await api.delete(`/rankings/round/${selectedRoundId}/override/${team.teamId}`);
            toast.success(`Auto-ranking restored for "${team.teamName}"`);
            await fetchRankings();
        } catch {
            toast.error('Failed to remove override.');
        }
    };

    const handleExport = async () => {
        if (!selectedRoundId) return;
        const loadingToast = toast.loading('Exporting ranking to CSV...');
        try {
            const response = await api.get(`/export/ranking/round/${selectedRoundId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ranking-round-${selectedRoundId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success('Export successful!', { id: loadingToast });
        } catch (err) {
            console.error('Failed to export:', err);
            toast.error('Failed to export ranking.', { id: loadingToast });
        }
    };

    const uniqueTracks = useMemo(() => {
        const tracksMap = new Map<number, string>();
        rankings.forEach(r => {
            if (r.trackId && r.trackName) tracksMap.set(r.trackId, r.trackName);
        });
        return Array.from(tracksMap.entries()).map(([id, name]) => ({ id, name }));
    }, [rankings]);

    const rankingsByTrack = useMemo(() => {
        const groups = new Map<number, TeamRanking[]>();
        rankings.forEach(r => {
            const tId = r.trackId || 0;
            if (!groups.has(tId)) groups.set(tId, []);
            groups.get(tId)!.push(r);
        });
        groups.forEach(group => group.sort((a, b) => a.rank - b.rank));
        return groups;
    }, [rankings]);

    if (loadingRounds) return (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
    );

    const rankIcons = ['🥇', '🥈', '🥉'];

    const renderRankingTable = (trackRankings: TeamRanking[], trackName?: string) => (
        <div key={trackName || 'unassigned'} className="mb-8">
            {trackName && (
                <h3 className="text-lg font-bold text-gray-800 mb-3 px-1 border-l-4 border-blue-500 pl-3">
                    {trackName} Track
                </h3>
            )}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Final Score</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Override</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {trackRankings.map((r, idx) => (
                            <tr key={r.teamId} className={`${r.manuallyAdjusted ? 'bg-amber-50' : idx < 3 ? '' : ''} hover:bg-gray-50 transition-colors`}>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        {idx < 3
                                            ? <span className="text-lg">{rankIcons[idx]}</span>
                                            : <span className="text-gray-500">#{r.rank}</span>
                                        }
                                        {r.manuallyAdjusted && (
                                            <span title={`Override reason: ${r.overrideReason}`}
                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 cursor-help">
                                                <AlertTriangle size={10} /> Adjusted
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                                    {r.teamName}
                                    {r.manuallyAdjusted && r.overrideReason && (
                                        <p className="text-xs font-normal text-amber-600 mt-0.5 italic">
                                            "{r.overrideReason}"
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{r.projectName || '—'}</td>
                                <td className="px-4 py-3 text-sm text-right font-mono font-bold text-blue-700">
                                    {Number(r.finalScore).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        {r.manuallyAdjusted ? (
                                            <button
                                                onClick={() => handleRemoveOverride(r)}
                                                title="Remove override — restore auto ranking"
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200 transition-colors cursor-pointer"
                                            >
                                                <RotateCcw size={12} /> Restore
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => openOverrideModal(r)}
                                                title="Manually override this team's rank"
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-white text-gray-500 hover:bg-amber-50 hover:text-amber-700 border border-gray-200 hover:border-amber-300 transition-colors cursor-pointer"
                                            >
                                                <Edit2 size={12} /> Override
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ListOrdered size={20} className="text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Rankings</h2>
                </div>
                {selectedRoundId !== '' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => ExportService.exportRoundScoring(Number(selectedRoundId))}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                        >
                            <Download size={14} /> Export Scoring
                        </button>
                        <button
                            onClick={() => ExportService.exportRoundRanking(Number(selectedRoundId))}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                        >
                            <Download size={14} /> Export Ranking
                        </button>
                    </div>
                )}
            </div>

            {rounds.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">No rounds available. Create rounds first.</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Select Round</label>
                            <select
                                value={selectedRoundId}
                                onChange={e => setSelectedRoundId(Number(e.target.value))}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                            >
                                {rounds.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        {uniqueTracks.length > 0 && (
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Track</label>
                                <select
                                    value={selectedTrackId}
                                    onChange={e => setSelectedTrackId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                                >
                                    <option value="all">All Tracks</option>
                                    {uniqueTracks.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {rankings.length > 0 && (
                            <div className="flex items-end">
                                <button
                                    onClick={handleExport}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                                >
                                    <Download size={16} />
                                    Export CSV
                                </button>
                            </div>
                        )}
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
                        <div>
                            {selectedTrackId === 'all' ? (
                                Array.from(rankingsByTrack.entries()).map(([tId, groupRanks]) => {
                                    const trackName = uniqueTracks.find(t => t.id === tId)?.name;
                                    return renderRankingTable(groupRanks, trackName);
                                })
                            ) : (
                                renderRankingTable(
                                    rankingsByTrack.get(selectedTrackId) || [],
                                    uniqueTracks.find(t => t.id === selectedTrackId)?.name
                                )
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ===== ADMIN OVERRIDE MODAL ===== */}
            {overrideModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-amber-50">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={18} className="text-amber-600" />
                                <h3 className="text-base font-bold text-gray-800">Manual Rank Override</h3>
                            </div>
                            <button onClick={() => setOverrideModal(s => ({ ...s, open: false }))}
                                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-4">
                            <p className="text-sm text-gray-600">
                                You are manually overriding the rank for{' '}
                                <span className="font-bold text-gray-900">"{overrideModal.teamName}"</span>.
                                This action will be recorded in the Audit Log.
                            </p>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
                                ⚠️ Current auto rank: <strong>#{overrideModal.currentRank}</strong> — Use with caution. A <strong>reason is required</strong>.
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">New Rank *</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={overrideModal.newRank}
                                    onChange={e => setOverrideModal(s => ({ ...s, newRank: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    placeholder="e.g. 1"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Reason <span className="text-red-500">*</span>
                                    <span className="text-gray-400 font-normal ml-1">(required — will be saved in Audit Log)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={overrideModal.reason}
                                    onChange={e => setOverrideModal(s => ({ ...s, reason: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                    placeholder="Explain why you are manually adjusting this rank..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => setOverrideModal(s => ({ ...s, open: false }))}
                                className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleOverrideSubmit}
                                disabled={overrideLoading || !overrideModal.reason.trim()}
                                className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
                            >
                                {overrideLoading ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                                Apply Override
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RankingTab;
