import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface JudgeAssignment {
    id: number;
    roundId: number;
    roundName: string;
    trackId: number | null;
    trackName: string | null;
    status: string;
    assignedAt: string;
}

const JudgeDashboardPage: React.FC = () => {
    const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await api.get('/judge-assignments/my-assignments');
                setAssignments(response.data.data);
            } catch (err) {
                setError('Failed to fetch your assignments.');
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    if (loading) return <div className="text-center p-8">Loading your assignments...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Judging Assignments</h1>
            {assignments.length === 0 ? (
                <p className="text-gray-500">You have no pending assignments.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Round</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Track</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Assigned Date</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map(ass => (
                                <tr key={ass.id} className="border-b">
                                    <td className="py-3 px-4">{ass.roundName}</td>
                                    <td className="py-3 px-4">{ass.trackName || 'All Tracks'}</td>
                                    <td className="py-3 px-4">{new Date(ass.assignedAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            ass.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {ass.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Link 
                                            to={`/judge/assignments/${ass.id}/submissions`}
                                            className="text-blue-600 hover:text-blue-800 font-semibold"
                                        >
                                            View Submissions
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default JudgeDashboardPage;
