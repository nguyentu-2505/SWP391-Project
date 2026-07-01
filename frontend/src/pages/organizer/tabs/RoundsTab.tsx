import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { Clock, Plus, Trash2, Loader2, CalendarDays, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/Modal';

// trigger re-check

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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRound, setEditingRound] = useState<Round | null>(null);
    const [eventDetails, setEventDetails] = useState<any>(null);

    const fetchRounds = async () => {
        if (!eventId) return;
        try {
            const res = await api.get(`/rounds/hackathon/${eventId}`);
            // Handle both array and wrapped responses
            const data = res.data.data ?? res.data;
            setRounds(Array.isArray(data) ? data : []);
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to load rounds.');
        } finally {
            setLoading(false);
        }
    };

    const fetchEventDetails = async () => {
        if (!eventId) return;
        try {
            const res = await api.get(`/hackathon-events/id/${eventId}`);
            setEventDetails(res.data.data ?? res.data);
        } catch (err) {
            console.error('Failed to fetch event details', err);
        }
    };

    useEffect(() => {
        fetchRounds();
        fetchEventDetails();
    }, [eventId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Round name cannot be empty.'); return; }
        if (!form.startTime || !form.endTime) { toast.error('Start and end times are required.'); return; }
        if (form.startTime >= form.endTime) { toast.error('End time must be after start time.'); return; }

        setSaving(true);
        try {
            await api.post('/rounds', { ...form, hackathonEventId: Number(eventId) });
            toast.success('Round created successfully!');
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
        if (!confirm('Are you sure you want to delete this round? This action will also delete all submissions and scores in this round.')) return;
        try {
            await api.delete(`/rounds/${id}`);
            toast.success('Round deleted successfully.');
            setRounds(prev => prev.filter(r => r.id !== id));
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to delete round.');
        }
    };

    const openEditModal = (round: Round) => {
        setEditingRound({ ...round });
        setIsEditModalOpen(true);
    };

    const handleUpdateRound = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRound || !editingRound.name.trim()) {
            toast.error('Round name is required.');
            return;
        }
        if (!editingRound.startTime || !editingRound.endTime) {
            toast.error('Start and end times are required.');
            return;
        }
        if (editingRound.startTime >= editingRound.endTime) {
            toast.error('End time must be after start time.');
            return;
        }
        const loadingToast = toast.loading('Updating round...');
        try {
            await api.put(`/rounds/${editingRound.id}`, {
                name: editingRound.name,
                description: editingRound.description,
                startTime: editingRound.startTime,
                endTime: editingRound.endTime,
                hackathonEventId: Number(eventId),
            });
            toast.success('Round updated successfully!', { id: loadingToast });
            setIsEditModalOpen(false);
            setEditingRound(null);
            fetchRounds();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update round.', { id: loadingToast });
        }
    };

    if (loading) return (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
    );

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={20} className="text-gray-600" />
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800">Rounds</h2>
                    {eventDetails && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            Event Duration: <span className="font-semibold text-blue-600">{new Date(eventDetails.startTime).toLocaleString()}</span> to <span className="font-semibold text-blue-600">{new Date(eventDetails.endTime).toLocaleString()}</span>
                        </p>
                    )}
                </div>
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
                    {eventDetails && (
                        <div className="text-xs text-blue-700 bg-blue-100/50 p-2.5 rounded-lg border border-blue-200/50">
                            <strong>Event Duration:</strong> {new Date(eventDetails.startTime).toLocaleString()} to {new Date(eventDetails.endTime).toLocaleString()}
                            <p className="text-gray-500 mt-0.5">Please choose start and end times for the round within this timeframe.</p>
                        </div>
                    )}
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
                            <div className="flex items-center gap-1">                                 <button
                                    onClick={() => openEditModal(round)}
                                    className="text-blue-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                                    title="Edit round"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(round.id)}
                                    className="text-red-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                                    title="Delete round"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isEditModalOpen && editingRound && (
                <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingRound(null); }}>
                    <form onSubmit={handleUpdateRound} className="p-6 max-w-lg space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-blue-600" />
                            Edit Round
                        </h3>
                        {eventDetails && (
                            <div className="text-xs text-blue-700 bg-blue-100/50 p-2.5 rounded-lg border border-blue-200/50">
                                <strong>Event Duration:</strong> {new Date(eventDetails.startTime).toLocaleString()} to {new Date(eventDetails.endTime).toLocaleString()}
                                <p className="text-gray-500 mt-0.5">Please choose start and end times for the round within this timeframe.</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Round Name *</label>
                            <input
                                type="text"
                                value={editingRound.name}
                                onChange={e => setEditingRound({ ...editingRound, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={editingRound.description || ''}
                                onChange={e => setEditingRound({ ...editingRound, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                                <input
                                    type="datetime-local"
                                    value={editingRound.startTime ? editingRound.startTime.slice(0, 16) : ''}
                                    onChange={e => setEditingRound({ ...editingRound, startTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                                <input
                                    type="datetime-local"
                                    value={editingRound.endTime ? editingRound.endTime.slice(0, 16) : ''}
                                    onChange={e => setEditingRound({ ...editingRound, endTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => { setIsEditModalOpen(false); setEditingRound(null); }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default RoundsTab;
