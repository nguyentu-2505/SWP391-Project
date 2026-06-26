import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { UserCheck, Plus, Trash2, Loader2, Tag, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Round {
    id: number;
    name: string;
}

interface Track {
    id: number;
    name: string;
}

interface Judge {
    id: number;
    username: string;
    fullName?: string;
}

interface JudgeAssignment {
    id: number;
    judgeId: number;
    judgeName: string;
    roundId: number;
    roundName: string;
    trackId: number | null;
    trackName: string | null;
    status: string;
    assignedAt: string;
}

const JudgesTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();

    const [rounds, setRounds] = useState<Round[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);
    const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [selectedRoundId, setSelectedRoundId] = useState<string>('');
    const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
    const [selectedTrackId, setSelectedTrackId] = useState<string>('');

    // Assignments for the currently selected round
    const [roundAssignments, setRoundAssignments] = useState<JudgeAssignment[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);

    const fetchBaseData = async () => {
        if (!eventId) return;
        try {
            const [roundsRes, tracksRes, judgesRes] = await Promise.all([
                api.get(`/rounds/hackathon/${eventId}`),
                api.get(`/tracks/hackathon/${eventId}`),
                api.get('/users/role/JUDGE'),
            ]);
            const roundData = roundsRes.data.data ?? roundsRes.data;
            const trackData = tracksRes.data.data ?? tracksRes.data;
            const judgeData = judgesRes.data.data ?? judgesRes.data;
            setRounds(Array.isArray(roundData) ? roundData : []);
            setTracks(Array.isArray(trackData) ? trackData : []);
            setJudges(Array.isArray(judgeData) ? judgeData : []);
        } catch {
            toast.error('Failed to load judge assignment data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBaseData(); }, [eventId]);

    // When round selection changes, fetch assignments for that round
    useEffect(() => {
        if (!selectedRoundId) {
            setRoundAssignments([]);
            return;
        }
        const fetchAssignments = async () => {
            setLoadingAssignments(true);
            try {
                const res = await api.get(`/judge-assignments/round/${selectedRoundId}`);
                const data = res.data.data ?? res.data;
                setRoundAssignments(Array.isArray(data) ? data : []);
            } catch {
                setRoundAssignments([]);
            } finally {
                setLoadingAssignments(false);
            }
        };
        fetchAssignments();
    }, [selectedRoundId]);

    const handleAssign = async () => {
        if (!selectedRoundId || !selectedJudgeId) {
            toast.error('Please select both a round and a judge.');
            return;
        }
        setSaving(true);
        try {
            await api.post('/judge-assignments', {
                roundId: Number(selectedRoundId),
                judgeId: Number(selectedJudgeId),
                trackId: selectedTrackId ? Number(selectedTrackId) : null,
            });
            toast.success('Judge assigned successfully!');
            // Refresh assignments for the selected round
            const res = await api.get(`/judge-assignments/round/${selectedRoundId}`);
            const data = res.data.data ?? res.data;
            setRoundAssignments(Array.isArray(data) ? data : []);
            // Reset judge & track selection
            setSelectedJudgeId('');
            setSelectedTrackId('');
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to assign judge.';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-500" size={28} />
        </div>
    );

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <UserCheck size={20} className="text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Assign Judges</h2>
            </div>

            {rounds.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                    <AlertCircle size={18} />
                    <span>No rounds available. Please create rounds before assigning judges.</span>
                </div>
            ) : (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-4 mb-6">
                    <h3 className="text-sm font-semibold text-blue-800">New Assignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Round Select */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                <Clock size={12} className="inline mr-1" />
                                Round *
                            </label>
                            <select
                                value={selectedRoundId}
                                onChange={e => setSelectedRoundId(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">-- Select a round --</option>
                                {rounds.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Track Select (optional) */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                <Tag size={12} className="inline mr-1" />
                                Track <span className="text-gray-400">(optional)</span>
                            </label>
                            <select
                                value={selectedTrackId}
                                onChange={e => setSelectedTrackId(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">-- All tracks --</option>
                                {tracks.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-0.5">Leave blank to judge all tracks in the round.</p>
                        </div>

                        {/* Judge Select */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                <UserCheck size={12} className="inline mr-1" />
                                Judge *
                            </label>
                            <select
                                value={selectedJudgeId}
                                onChange={e => setSelectedJudgeId(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">-- Select a judge --</option>
                                {judges.map(j => (
                                    <option key={j.id} value={j.id}>{j.fullName || j.username}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleAssign}
                            disabled={saving || !selectedRoundId || !selectedJudgeId}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            {saving ? 'Assigning...' : 'Assign Judge'}
                        </button>
                    </div>
                </div>
            )}

            {/* Current Assignments for Selected Round */}
            {selectedRoundId && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">
                        Current Assignments — {rounds.find(r => r.id === Number(selectedRoundId))?.name}
                    </h3>

                    {loadingAssignments ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="animate-spin text-blue-500" size={22} />
                        </div>
                    ) : roundAssignments.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            <UserCheck className="mx-auto mb-2" size={32} />
                            <p>No judges assigned to this round yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {roundAssignments.map(assignment => (
                                <div key={assignment.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                                    <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {(assignment.judgeName || '?')[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">{assignment.judgeName}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {assignment.trackName ? (
                                                <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">
                                                    <Tag size={10} />
                                                    {assignment.trackName}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">All tracks</span>
                                            )}
                                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                                assignment.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {assignment.status}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {new Date(assignment.assignedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!selectedRoundId && rounds.length > 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                    <UserCheck className="mx-auto mb-2" size={32} />
                    <p>Select a round above to see and manage judge assignments.</p>
                </div>
            )}
        </div>
    );
};

export default JudgesTab;
