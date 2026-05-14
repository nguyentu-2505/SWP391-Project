import React, { useEffect, useState } from 'react';
import { TeamService, Team } from '../services/TeamService';

const TeamsPage: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                // For now, fetching teams for track 1.
                // This should be dynamic in a real app.
                const allTeams = await TeamService.getTeamsByTrack(1);
                setTeams(allTeams);
            } catch (err) {
                setError('Failed to fetch teams.');
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Teams</h1>
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
                        {teams.map((team) => (
                            <tr key={team.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{team.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{team.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{team.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamsPage;