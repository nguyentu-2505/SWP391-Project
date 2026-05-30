import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';

interface Submission {
    id: number;
    teamName: string;
    roundName: string;
}

interface Judge {
    id: number;
    username: string;
}

const JudgesTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
    const [selectedJudge, setSelectedJudge] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;
            try {
                const [subRes, judgeRes] = await Promise.all([
                    api.get(`/submissions/event/${eventId}`),
                    api.get(`/users/role/JUDGE`)
                ]);
                setSubmissions(subRes.data.data);
                setJudges(judgeRes.data.data);
            } catch (err) {
                toast.error("Failed to load data for judge assignment.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    const handleAssignJudge = async () => {
        if (!selectedSubmission || !selectedJudge) {
            toast.error("Please select a submission and a judge.");
            return;
        }
        try {
            await api.post('/judge-assignments', {
                submissionId: selectedSubmission,
                judgeId: selectedJudge
            });
            toast.success("Judge assigned successfully!");
            // Optionally, refresh data here
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || "Failed to assign judge.");
        }
    };

    if (loading) return <div>Loading judge assignment data...</div>;

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Assign Judges</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-700">1. Select Submission</label>
                    <select 
                        onChange={(e) => setSelectedSubmission(Number(e.target.value))}
                        className="w-full mt-1 input-style"
                    >
                        <option value="">-- Select a submission --</option>
                        {submissions.map(s => (
                            <option key={s.id} value={s.id}>{s.teamName} - {s.roundName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">2. Select Judge</label>
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
                <div className="self-end">
                    <button onClick={handleAssignJudge} className="w-full btn-primary">
                        Assign Judge
                    </button>
                </div>
            </div>
            <div className="mt-8">
                <h3 className="text-xl font-semibold">Current Assignments</h3>
                {/* TODO: Display a list of current assignments for this event */}
                <p className="text-gray-500 mt-2">(Displaying current assignments is a future improvement)</p>
            </div>
        </div>
    );
};

export default JudgesTab;
