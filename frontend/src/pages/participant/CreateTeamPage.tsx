import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Track {
    id: number;
    name: string;
}

const CreateTeamPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();

    const [teamName, setTeamName] = useState('');
    const [trackId, setTrackId] = useState<number | ''>('');
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTracks = async () => {
            if (!eventId) return;
            try {
                const response = await api.get(`/tracks/hackathon/${eventId}`);
                const data = response.data.data ?? response.data;
                setTracks(Array.isArray(data) ? data : []); 
            } catch (err) {
                setError('Failed to load tracks for this event.');
            }
        };
        fetchTracks();
    }, [eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackId) {
            setError('Please select a track.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            await api.post('/teams', {
                name: teamName,
                eventId: Number(eventId),
                trackId: trackId,
            });
            toast.success('Team created successfully!');
            navigate('/my-team');
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to create team.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create a New Team</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">Team Name</label>
                    <input
                        id="teamName"
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="track" className="block text-sm font-medium text-gray-700">Select Track</label>
                    <select
                        id="track"
                        required
                        value={trackId}
                        onChange={(e) => setTrackId(Number(e.target.value))}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="" disabled>-- Select a track --</option>
                        {tracks.map(track => (
                            <option key={track.id} value={track.id}>{track.name}</option>
                        ))}
                    </select>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Creating Team...' : 'Create Team'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTeamPage;
