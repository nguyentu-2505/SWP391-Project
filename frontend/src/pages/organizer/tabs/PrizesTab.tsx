import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { Trophy, Plus, Loader2, Gift, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Prize {
    id: number;
    name: string;
    description: string;
    rank: number;
    winningTeamId?: number;
    winningTeamName?: string;
    trackName?: string;
}

interface Team {
    id: number;
    name: string;
}

interface PrizeForm {
    name: string;
    description: string;
    rank: number;
    trackId: number | '';
}

const PrizesTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<PrizeForm>({ name: '', description: '', rank: 1, trackId: '' });
    const [saving, setSaving] = useState(false);
    const [assigningPrizeId, setAssigningPrizeId] = useState<number | null>(null);
    const [assignTeamId, setAssignTeamId] = useState<number | ''>('');

    const fetchData = async () => {
        if (!eventId) return;
        try {
            const [prizeRes, teamRes] = await Promise.all([
                api.get(`/prizes/event/${eventId}`),
                api.get(`/teams/event/${eventId}`),
            ]);
            // Handle both raw array and wrapped response
            const prizeData = prizeRes.data.data ?? prizeRes.data;
            const teamData = teamRes.data.data ?? teamRes.data;
            setPrizes(Array.isArray(prizeData) ? prizeData : []);
            setTeams(Array.isArray(teamData) ? teamData : []);
        } catch (err: any) {
            console.error('Failed to load prize data', err);
            toast.error(err.response?.data?.error?.message || 'Failed to load prize data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [eventId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Prize name is required.'); return; }

        setSaving(true);
        try {
            await api.post('/prizes', {
                name: form.name,
                description: form.description,
                rank: form.rank,
                hackathonEventId: Number(eventId),
                ...(form.trackId ? { trackId: form.trackId } : {}),
            });
            toast.success('Prize created!');
            setForm({ name: '', description: '', rank: 1, trackId: '' });
            setShowForm(false);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to create prize.');
        } finally {
            setSaving(false);
        }
    };

    const handleAssign = async (prizeId: number) => {
        if (!assignTeamId) { toast.error('Please select a team.'); return; }
        try {
            await api.patch(`/prizes/${prizeId}/assign`, { teamId: assignTeamId });
            toast.success('Prize assigned successfully!');
            setAssigningPrizeId(null);
            setAssignTeamId('');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to assign prize.');
        }
    };

    const [autoAssigning, setAutoAssigning] = useState(false);

    const handleAutoAssign = async () => {
        if (!confirm('Auto-assign will evaluate all completed submissions and award prizes based on score rank. Continue?')) return;
        setAutoAssigning(true);
        try {
            await api.post(`/prizes/event/${eventId}/auto-assign`);
            toast.success('Prizes auto-assigned successfully!');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to auto-assign prizes.');
        } finally {
            setAutoAssigning(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
    );

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Trophy size={20} className="text-yellow-500" />
                <h2 className="text-xl font-semibold text-gray-800">Prizes & Winners</h2>
                
                <div className="ml-auto flex gap-2">
                    {prizes.length > 0 && (
                        <button
                            onClick={handleAutoAssign}
                            disabled={autoAssigning}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            <Trophy size={14} />
                            {autoAssigning ? 'Assigning...' : 'Auto Assign Prizes'}
                        </button>
                    )}
                    <button
                        onClick={() => setShowForm(s => !s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={14} />
                        Add Prize
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="mb-6 border border-yellow-200 bg-yellow-50 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-yellow-800">New Prize</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Prize Name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. 1st Place Grand Prize"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Rank</label>
                            <input
                                type="number" min="1"
                                value={form.rank}
                                onChange={e => setForm(f => ({ ...f, rank: Number(e.target.value) }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <input
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="e.g. $5,000 cash prize + mentorship package"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="px-3 py-1.5 text-xs text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Create Prize'}
                        </button>
                    </div>
                </form>
            )}

            {prizes.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <Gift className="mx-auto mb-2" size={36} />
                    <p className="text-sm">No prizes configured yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {prizes.map(prize => (
                        <div key={prize.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <Trophy size={20} className={
                                        prize.rank === 1 ? 'text-yellow-400' :
                                        prize.rank === 2 ? 'text-gray-400' :
                                        prize.rank === 3 ? 'text-amber-600' : 'text-gray-300'
                                    } />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-900 text-sm">{prize.name}</p>
                                        <span className="text-xs text-gray-400">Rank #{prize.rank}</span>
                                    </div>
                                    {prize.description && (
                                        <p className="text-xs text-gray-500 mt-0.5">{prize.description}</p>
                                    )}
                                    {prize.winningTeamId ? (
                                        <div className="flex items-center gap-1 mt-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            <span className="text-xs font-medium text-green-700">
                                                Awarded to: {prize.winningTeamName || `Team #${prize.winningTeamId}`}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            {assigningPrizeId === prize.id ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={assignTeamId}
                                                        onChange={e => setAssignTeamId(Number(e.target.value))}
                                                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                                    >
                                                        <option value="">-- Select team --</option>
                                                        {teams.map(t => (
                                                            <option key={t.id} value={t.id}>{t.name}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => handleAssign(prize.id)}
                                                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => { setAssigningPrizeId(null); setAssignTeamId(''); }}
                                                        className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setAssigningPrizeId(prize.id)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    + Assign to team
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PrizesTab;

