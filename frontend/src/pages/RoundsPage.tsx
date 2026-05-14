import React, { useEffect, useState } from 'react';
import { RoundService, Round } from '../services/RoundService';

const RoundsPage: React.FC = () => {
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRounds = async () => {
            try {
                // For now, fetching rounds for hackathon event 1.
                // This should be dynamic in a real app.
                const allRounds = await RoundService.getRoundsByHackathonEvent(1);
                setRounds(allRounds);
            } catch (err) {
                setError('Failed to fetch rounds.');
            } finally {
                setLoading(false);
            }
        };

        fetchRounds();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Rounds</h1>
            <div className="bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rounds.map((round) => (
                            <tr key={round.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{round.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{round.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{round.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(round.startTime).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(round.endTime).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoundsPage;