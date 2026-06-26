import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { X, Loader2, UserPlus } from 'lucide-react';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

interface Props {
    trackId: number;
    trackName: string;
    assignedMentorIds: number[];
    onClose: () => void;
    onSuccess: () => void;
}

const AssignMentorModal: React.FC<Props> = ({ trackId, trackName, assignedMentorIds, onClose, onSuccess }) => {
    const [mentors, setMentors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMentorId, setSelectedMentorId] = useState<number | ''>('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                // Fetch all users with MENTOR or JUDGE role
                const mentorRes = await api.get('/users/role/MENTOR');
                const judgeRes = await api.get('/users/role/JUDGE');
                
                const mentorList = mentorRes.data.data ?? [];
                const judgeList = judgeRes.data.data ?? [];

                const allPotentialMentors = [...mentorList, ...judgeList];
                
                // Filter out mentors who are already assigned to this track
                const availableMentors = allPotentialMentors.filter(
                    (m) => !assignedMentorIds.includes(m.id)
                );

                setMentors(availableMentors);
            } catch {
                toast.error("Failed to load available mentors.");
            } finally {
                setLoading(false);
            }
        };
        fetchMentors();
    }, [assignedMentorIds]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMentorId) {
            toast.error("Please select a mentor to assign.");
            return;
        }
        setIsSaving(true);
        try {
            await api.post('/track-mentors', {
                trackId: trackId,
                mentorId: selectedMentorId,
            });
            toast.success("Mentor assigned successfully!");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to assign mentor.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Assign Mentor</h2>
                        <p className="text-sm text-gray-500">To track: <span className="font-semibold text-blue-600">{trackName}</span></p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-24">
                                <Loader2 className="animate-spin text-blue-500" />
                            </div>
                        ) : mentors.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 text-sm">
                                <UserPlus size={32} className="mx-auto mb-2 text-gray-400" />
                                No available mentors/judges found to assign.
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="mentor-select" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select a Mentor or Judge
                                </label>
                                <select
                                    id="mentor-select"
                                    value={selectedMentorId}
                                    onChange={(e) => setSelectedMentorId(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="" disabled>-- Choose a user --</option>
                                    {mentors.map((mentor) => (
                                        <option key={mentor.id} value={mentor.id}>
                                            {mentor.username} ({mentor.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || loading || mentors.length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSaving ? 'Assigning...' : 'Assign Mentor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignMentorModal;
