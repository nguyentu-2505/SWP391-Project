import React, { useEffect, useState } from 'react';
import { SubmissionService, Submission } from '../services/SubmissionService';

const SubmissionsPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                // For now, fetching submissions for round 1.
                // This should be dynamic in a real app.
                const allSubmissions = await SubmissionService.getSubmissionsByRound(1);
                setSubmissions(allSubmissions);
            } catch (err) {
                setError('Failed to fetch submissions.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Submissions</h1>
            <div className="bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {submissions.map((submission) => (
                            <tr key={submission.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{submission.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{submission.content}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{submission.teamId}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{submission.roundId}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(submission.submittedAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubmissionsPage;