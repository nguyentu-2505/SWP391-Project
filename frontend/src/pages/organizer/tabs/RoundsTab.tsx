import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { Clock, Plus, Trash2, Loader2, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

interface Round {
    id: number;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
}

interface RoundForm {
    name: string;
    description: string;
    startTime: string;
    endTime: string;
}

const emptyForm: RoundForm = { name: '', description: '', startTime: '', endTime: '' };

const RoundsTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<RoundForm>(emptyForm);
    const [saving, setSaving] = useState(false);

    const fetchRounds = async () => {
        if (!eventId) return;
        try {
            const res = await api.get(`/rounds/hackathon/${eventId}`);
            // Handle both array and wrapped responses
            const data = res.data.data ?? res.data;
            setRounds(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Failed to load rounds.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRounds(); }, [eventId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Round name is required.'); return; }
        if (!form.startTime || !form.endTime) { toast.error('Start and end time are required.'); return; }
        if (form.startTime >= form.endTime) { toast.error('End time must be after start time.'); return; }

        setSaving(true);
        try {
            await api.post('/rounds', { ...form, hackathonEventId: Number(eventId) });
            toast.success('Round created!');
            setForm(emptyForm);
            setShowForm(false);
            fetchRounds();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to create round.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this round? This will also remove its submissions.')) return;
        try {
            await api.delete(`/rounds/${id}`);
            toast.success('Round deleted.');
            setRounds(prev => prev.filter(r => r.id !== id));
        } catch {
            toast.error('Failed to delete round.');
        }
    };

    if (loading) return (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
    );

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={20} className="text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Rounds</h2>
                <button
                    onClick={() => setShowForm(s => !s)}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={14} />
                    Add Round
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="mb-6 border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-blue-800">New Round</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Round Name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Qualification Round"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <input
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Optional description"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Start Time *</label>
                            <input
                                type="datetime-local"
                                value={form.startTime}
                                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">End Time *</label>
                            <input
                                type="datetime-local"
                                value={form.endTime}
                                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Create Round'}
                        </button>
                    </div>
                </form>
            )}

            {rounds.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <Clock className="mx-auto mb-2" size={36} />
                    <p className="text-sm">No rounds yet. Add the first round above.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {rounds.map((round, idx) => (
                        <div key={round.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{round.name}</p>
                                {round.description && <p className="text-xs text-gray-500 mt-0.5">{round.description}</p>}
                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                    <Clock size={12} />
                                    {new Date(round.startTime).toLocaleString()} → {new Date(round.endTime).toLocaleString()}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(round.id)}
                                className="text-red-400 hover:text-red-600 transition-colors p-1"
                                title="Delete round"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoundsTab;
