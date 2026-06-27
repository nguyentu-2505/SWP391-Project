import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { JudgeAssignmentService } from '../../../services/JudgeAssignmentService';

interface Round {
    id: number;
    name: string;
    description: string;
}

interface Judge {
    id: number;
    username: string;
}

interface Track {
    id: number;
    name: string;
}

const JudgesTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [rounds, setRounds] = useState<Round[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedRound, setSelectedRound] = useState<number | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
    const [selectedJudge, setSelectedJudge] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;
            try {
                const [roundRes, judgeRes, trackRes] = await Promise.all([
                    api.get(`/rounds/hackathon/${eventId}`),
                    api.get(`/users/role/JUDGE`),
                    api.get(`/tracks/hackathon/${eventId}`)
                ]);
                setRounds(roundRes.data.data);
                setJudges(judgeRes.data.data);
                setTracks(trackRes.data.data);
            } catch (err) {
                toast.error("Failed to load data for judge assignment.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    const handleAssignJudge = async () => {
        if (!selectedRound || !selectedJudge) {
            toast.error("Please select a round and a judge.");
            return;
        }
        try {
            await JudgeAssignmentService.assignJudge({
                roundId: selectedRound,
                judgeId: selectedJudge,
                trackId: selectedTrack || undefined
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
                    <label className="block text-sm font-medium text-gray-700">1. Select Round</label>
                    <select 
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
                        onChange={(e) => setSelectedTrack(e.target.value ? Number(e.target.value) : null)}
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
