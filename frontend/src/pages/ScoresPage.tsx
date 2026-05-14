import React, { useEffect, useState } from 'react';
import { ScoreService, Score } from '../services/ScoreService';

const ScoresPage: React.FC = () => {
    const [scores, setScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                // For now, fetching scores for submission 1.
                const allScores = await ScoreService.getScoresForSubmission(1);
                setScores(allScores);
            } catch (err) {
                setError('Failed to fetch scores.');
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Scores</h1>
            <div className="bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criterion ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judge ID</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {scores.map((score) => (
                            <tr key={score.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{score.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{score.value}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{score.criterionId}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{score.submissionId}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{score.judgeId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScoresPage;