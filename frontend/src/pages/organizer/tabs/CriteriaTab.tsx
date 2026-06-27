import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { Target, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Criterion {
    id: number;
    name: string;
    description: string;
    weight: number;
    maxScore: number;
}

interface CriterionForm {
    name: string;
    description: string;
    weight: number;
    maxScore: number;
}

const emptyForm: CriterionForm = { name: '', description: '', weight: 20, maxScore: 10 };

const CriteriaTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CriterionForm>(emptyForm);
    const [saving, setSaving] = useState(false);

    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

    const fetchCriteria = async () => {
        if (!eventId) return;
        try {
            const res = await api.get(`/criteria/event/${eventId}`);
            const data = res.data.data ?? res.data;
            setCriteria(Array.isArray(data) ? data : []);
        } catch {
            toast.error(err.response?.data?.error?.message || 'Failed to load criteria.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCriteria(); }, [eventId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Criterion name is required.'); return; }
        if (form.weight <= 0 || form.weight > 100) { toast.error('Weight must be between 1 and 100.'); return; }
        if (totalWeight + form.weight > 100) { toast.error(`Total weight would exceed 100%. Current total: ${totalWeight}%.`); return; }
        if (form.maxScore <= 0) { toast.error('Max score must be positive.'); return; }

        setSaving(true);
        try {
            await api.post('/criteria', { ...form, hackathonEventId: Number(eventId) });
            toast.success('Criterion created!');
            setForm(emptyForm);
            setShowForm(false);
            fetchCriteria();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to create criterion.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this criterion? Existing scores for this criterion will be affected.')) return;
        try {
            await api.delete(`/criteria/${id}`);
            toast.success('Criterion deleted.');
            setCriteria(prev => prev.filter(c => c.id !== id));
        } catch {
            toast.error(err.response?.data?.error?.message || 'Failed to delete criterion.');
        }
    };

    if (loading) return (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
    );

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Target size={20} className="text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Scoring Criteria</h2>
                <div className="ml-auto flex items-center gap-3">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                        totalWeight === 100 ? 'bg-green-100 text-green-700' :
                        totalWeight > 100 ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                        Total weight: {totalWeight}%
                    </div>
                    <button
                        onClick={() => setShowForm(s => !s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={14} />
                        Add Criterion
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="mb-6 border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-blue-800">New Criterion</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Innovation"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <input
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="What this criterion evaluates"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Weight (%) *</label>
                            <input
                                type="number" min="1" max="100"
                                value={form.weight}
                                onChange={e => setForm(f => ({ ...f, weight: Number(e.target.value) }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-0.5">Remaining: {100 - totalWeight}%</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Max Score *</label>
                            <input
                                type="number" min="1" max="100"
                                value={form.maxScore}
                                onChange={e => setForm(f => ({ ...f, maxScore: Number(e.target.value) }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Create'}
                        </button>
                    </div>
                </form>
            )}

            {criteria.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <Target className="mx-auto mb-2" size={36} />
                    <p className="text-sm">No scoring criteria yet. Add criteria to enable judging.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {criteria.map(c => (
                        <div key={c.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                                    <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">{c.weight}%</span>
                                    <span className="text-xs text-gray-400">Max: {c.maxScore} pts</span>
                                </div>
                                {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
                            </div>
                            {/* Weight bar */}
                            <div className="hidden md:flex items-center gap-2 w-32">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${c.weight}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400 w-8 text-right">{c.weight}%</span>
                            </div>
                            <button
                                onClick={() => handleDelete(c.id)}
                                className="text-red-400 hover:text-red-600 transition-colors p-1"
                                title="Delete criterion"
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

export default CriteriaTab;

