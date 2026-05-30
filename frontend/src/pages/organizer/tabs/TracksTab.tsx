import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { Tag, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Track {
    id: number;
    name: string;
    description: string;
}

interface TrackForm {
    name: string;
    description: string;
}

const emptyForm: TrackForm = { name: '', description: '' };

const TracksTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<TrackForm>(emptyForm);
    const [saving, setSaving] = useState(false);

    const fetchTracks = async () => {
        if (!eventId) return;
        try {
            const res = await api.get(`/tracks/event/${eventId}`);
            const data = res.data.data ?? res.data;
            setTracks(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Failed to load tracks.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTracks(); }, [eventId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Track name is required.'); return; }

        setSaving(true);
        try {
            await api.post('/tracks', { ...form, hackathonEventId: Number(eventId) });
            toast.success('Track created!');
            setForm(emptyForm);
            setShowForm(false);
            fetchTracks();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to create track.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this track? Teams in this track will become untracked.')) return;
        try {
            await api.delete(`/tracks/${id}`);
            toast.success('Track deleted.');
            setTracks(prev => prev.filter(t => t.id !== id));
        } catch {
            toast.error('Failed to delete track.');
        }
    };

    if (loading) return (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
    );

    const tagColors = [
        'bg-purple-50 border-purple-200 text-purple-700',
        'bg-indigo-50 border-indigo-200 text-indigo-700',
        'bg-pink-50 border-pink-200 text-pink-700',
        'bg-teal-50 border-teal-200 text-teal-700',
        'bg-orange-50 border-orange-200 text-orange-700',
    ];

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Tag size={20} className="text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Competition Tracks</h2>
                <button
                    onClick={() => setShowForm(s => !s)}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={14} />
                    Add Track
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="mb-6 border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-blue-800">New Track</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Track Name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. AI & ML, FinTech, Social Impact"
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
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Create Track'}
                        </button>
                    </div>
                </form>
            )}

            {tracks.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <Tag className="mx-auto mb-2" size={36} />
                    <p className="text-sm">No tracks yet. Tracks allow teams to compete in specific categories.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tracks.map((track, idx) => (
                        <div
                            key={track.id}
                            className={`flex items-start gap-3 p-4 border rounded-lg ${tagColors[idx % tagColors.length]}`}
                        >
                            <Tag size={18} className="flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{track.name}</p>
                                {track.description && <p className="text-xs opacity-80 mt-0.5">{track.description}</p>}
                            </div>
                            <button
                                onClick={() => handleDelete(track.id)}
                                className="opacity-60 hover:opacity-100 transition-opacity p-1"
                                title="Delete track"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TracksTab;
