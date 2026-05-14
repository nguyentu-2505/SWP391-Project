import React, { useEffect, useState } from 'react';
import { TrackService, Track } from '../services/TrackService';

const TracksPage: React.FC = () => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                // For now, fetching tracks for hackathon event 1.
                const allTracks = await TrackService.getTracksByHackathonEvent(1);
                setTracks(allTracks);
            } catch (err) {
                setError('Failed to fetch tracks.');
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Tracks</h1>
            <div className="bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tracks.map((track) => (
                            <tr key={track.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{track.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{track.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{track.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TracksPage;