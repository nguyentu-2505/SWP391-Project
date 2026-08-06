import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Trash2, Users, CheckCircle, AlertCircle, UserPlus, Filter } from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

interface Mentor {
    id: number;
    username: string;
    role: string;
}

interface Track {
    id: number;
    name: string;
}

const MentorsTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedTrack, setSelectedTrack] = useState<number | ''>('');
    const [selectedMentor, setSelectedMentor] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState<any[]>([]);

    // Confirm Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

    const fetchAssignments = async (tracksData: Track[]) => {
        try {
            const mentorPromises = tracksData.map((t) => api.get(`/tracks/${t.id}/mentors`));
            const mentorResponses = await Promise.all(mentorPromises);
            let allAssignments: any[] = [];
            mentorResponses.forEach((res, index) => {
                const track = tracksData[index];
                const trackMentors = res.data.data;
                trackMentors.forEach((m: any) => {
                    allAssignments.push({
                        id: m.id,
                        trackId: track.id,
                        trackName: track.name,
                        mentorId: m.mentorId,
                        mentorName: m.mentorUsername || m.mentorFullName,
                        mentorRole: m.mentorRole
                    });
                });
            });
            setAssignments(allAssignments);
        } catch (err) {
            console.error("Failed to fetch mentor assignments", err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;
            try {
                const [mentorRes, judgeRes, trackRes] = await Promise.all([
                    api.get(`/users/role/MENTOR`),
                    api.get(`/users/role/JUDGE`),
                    api.get(`/tracks/hackathon/${eventId}`)
                ]);
                
                const allMentors = [...mentorRes.data.data, ...judgeRes.data.data];
                // Remove duplicates if any (e.g., if a user has both somehow, though not possible in our system)
                const uniqueMentors = Array.from(new Map(allMentors.map(item => [item.id, item])).values());
                setMentors(uniqueMentors);
                
                const tracksData = trackRes.data.data;
                setTracks(tracksData);
                
                await fetchAssignments(tracksData);
            } catch (err) {
                toast.error("Failed to load data for mentor assignment.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    const handleUnassign = (trackId: number, mentorId: number) => {
        setConfirmAction(() => async () => {
            try {
                await api.delete(`/tracks/${trackId}/mentors/${mentorId}`);
                toast.success("Mentor unassigned successfully!");
                await fetchAssignments(tracks);
            } catch (err: any) {
                toast.error(err.response?.data?.error?.message || "Failed to unassign mentor.");
            }
            setConfirmOpen(false);
        });
        setConfirmOpen(true);
    };

    const handleAssignMentor = async () => {
        if (!selectedTrack || !selectedMentor) {
            toast.error("Please select a track and a mentor.");
            return;
        }
        try {
            await api.post(`/tracks/${selectedTrack}/mentors/${selectedMentor}`);
            toast.success("Mentor assigned successfully!");
            await fetchAssignments(tracks);
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || "Failed to assign mentor.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-container"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Total Track Mentors</p>
                        <p className="text-2xl font-black text-slate-800">{assignments.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Tracks with Mentors</p>
                        <p className="text-2xl font-black text-slate-800">
                            {new Set(assignments.map(a => a.trackId)).size} / {tracks.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Assignment Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <UserPlus size={20} className="text-primary-container" />
                        Assign Mentor to Track
                    </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                            <Filter size={14} className="text-slate-400" /> Select Track
                        </label>
                        <select
                            value={selectedTrack}
                            onChange={(e) => setSelectedTrack(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-colors shadow-sm"
                        >
                            <option value="">-- Choose Track --</option>
                            {tracks.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                            <Users size={14} className="text-slate-400" /> Select Mentor
                        </label>
                        <select
                            value={selectedMentor}
                            onChange={(e) => setSelectedMentor(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-colors shadow-sm"
                        >
                            <option value="">-- Choose Mentor --</option>
                            {mentors.map(m => (
                                <option key={m.id} value={m.id}>{m.username} ({m.role})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button onClick={handleAssignMentor} className="w-full py-2.5 bg-primary-container text-white font-bold rounded-lg hover:bg-[#d9611b] transition-colors shadow-sm flex items-center justify-center gap-2">
                            <UserPlus size={18} /> Assign Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Assignments List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Users size={20} className="text-slate-500" />
                        Current Mentor Assignments
                    </h3>
                    <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {assignments.length} Total
                    </span>
                </div>
                {assignments.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                        No mentors have been assigned to any tracks yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="py-4 px-6">Mentor Name</th>
                                    <th className="py-4 px-6">Role</th>
                                    <th className="py-4 px-6">Assigned Track</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {assignments.map(a => (
                                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                    {a.mentorName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-slate-800">{a.mentorName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                {a.mentorRole}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {a.trackName}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleUnassign(a.trackId, a.mentorId)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                                                title="Unassign Mentor"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmOpen}
                title="Unassign Mentor"
                message="Are you sure you want to unassign this mentor from the track? They will no longer receive mentorship requests from teams in this track."
                isDanger={true}
                confirmText="Unassign"
                onConfirm={confirmAction}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default MentorsTab;
