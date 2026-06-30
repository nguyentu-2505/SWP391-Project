import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

interface Judge {
    id: number;
    username: string;
}

interface JudgeAssignment {
    id: number;
    judgeName: string;
    roundName: string;
    trackName: string;
    status: string;
}

const JudgesTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [rounds, setRounds] = useState<any[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);
    const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
    
    const [selectedRound, setSelectedRound] = useState<number | ''>('');
    const [selectedTrack, setSelectedTrack] = useState<number | ''>('');
    const [selectedJudge, setSelectedJudge] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!eventId) return;
        try {
            const [roundRes, trackRes, judgeRes, assignmentRes] = await Promise.all([
                api.get(`/rounds/hackathon/${eventId}`),
                api.get(`/tracks/hackathon/${eventId}`),
                api.get(`/users/role/JUDGE`),
                api.get(`/judge-assignments/event/${eventId}`)
            ]);
            setRounds(roundRes.data.data || []);
            setTracks(trackRes.data.data || []);
            setJudges(judgeRes.data.data || []);
            setAssignments(assignmentRes.data.data || []);
        } catch (err) {
            toast.error("Failed to load data for judge assignment.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const handleAssignJudge = async () => {
        if (!selectedRound || !selectedJudge) {
            toast.error("Please select a round and a judge.");
            return;
        }
        try {
            await api.post('/judge-assignments', {
                roundId: selectedRound,
                trackId: selectedTrack || null,
                judgeId: selectedJudge
            });
            toast.success("Judge assigned successfully!");
            setSelectedRound('');
            setSelectedTrack('');
            setSelectedJudge('');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || "Failed to assign judge.");
        }
    };

    const handleUnassign = async (id: number) => {
        if (!confirm('Are you sure you want to unassign this judge?')) return;
        try {
            await api.delete(`/judge-assignments/${id}`);
            toast.success("Judge unassigned successfully.");
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || "Failed to unassign judge.");
        }
    };

    if (loading) return <div>Loading judge assignment data...</div>;

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Assign Judges</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 p-4 rounded-lg items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700">1. Select Round</label>
                    <select 
                        value={selectedRound}
                        onChange={(e) => setSelectedRound(Number(e.target.value))}
                        className="w-full mt-1 input-style"
                    >
                        <option value="">-- Select a round --</option>
                        {rounds.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">2. Select Track (Optional)</label>
                    <select 
                        value={selectedTrack}
                        onChange={(e) => setSelectedTrack(Number(e.target.value) || '')}
                        className="w-full mt-1 input-style"
                    >
                        <option value="">-- All Tracks --</option>
                        {tracks.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">3. Select Judge</label>
                    <select
                        value={selectedJudge}
                        onChange={(e) => setSelectedJudge(Number(e.target.value))}
                        className="w-full mt-1 input-style"
                    >
                        <option value="">-- Select a judge --</option>
                        {judges.map(j => (
                            <option key={j.id} value={j.id}>{j.username}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <button onClick={handleAssignJudge} className="w-full btn-primary py-2">
                        Assign Judge
                    </button>
                </div>
            </div>
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Current Assignments</h3>
                {assignments.length === 0 ? (
                    <div className="text-sm text-gray-500">No judges assigned yet.</div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judge</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {assignments.map(a => (
                                    <tr key={a.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.judgeName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.roundName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.trackName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                a.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                a.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                            }`}>
                                                {a.status || 'ASSIGNED'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleUnassign(a.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Unassign"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JudgesTab;
