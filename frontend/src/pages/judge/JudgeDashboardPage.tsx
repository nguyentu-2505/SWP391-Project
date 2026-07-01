import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { JudgeAssignmentService, JudgeAssignment } from '../../services/JudgeAssignmentService';
import api from '../../services/api';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { ExportService } from '../../services/ExportService';

const JudgeDashboardPage: React.FC = () => {
    const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedRoundId, setExpandedRoundId] = useState<number | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const data = await JudgeAssignmentService.getMyAssignments();
                setAssignments(data);
            } catch (err) {
                setError('Failed to fetch your assignments.');
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    const toggleRound = async (roundId: number) => {
        if (expandedRoundId === roundId) {
            setExpandedRoundId(null);
            return;
        }
        setExpandedRoundId(roundId);
        setLoadingSubmissions(true);
        try {
            const response = await api.get(`/submissions/round/${roundId}`);
            setSubmissions(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch submissions for round", err);
        } finally {
            setLoadingSubmissions(false);
        }
    };

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
                                <th className="text-left py-3 px-4 font-semibold text-sm">Assigned</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map(ass => (
                                <React.Fragment key={ass.id}>
                                    <tr className="border-b">
                                        <td className="py-3 px-4">{ass.roundName}</td>
                                        <td className="py-3 px-4">{new Date(ass.assignedAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                ass.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {ass.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-3 items-center">
                                                <button
                                                    onClick={() => toggleRound(ass.roundId)}
                                                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                                                >
                                                    {expandedRoundId === ass.roundId ? (
                                                        <><ChevronUp size={16} /> Hide Submissions</>
                                                    ) : (
                                                        <><ChevronDown size={16} /> View Submissions</>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => ExportService.exportRoundScoring(ass.roundId)}
                                                    className="text-green-600 hover:text-green-800 font-semibold flex items-center gap-1"
                                                    title="Export Scoring CSV"
                                                >
                                                    <Download size={16} /> Export
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRoundId === ass.roundId && (
                                        <tr className="bg-gray-50 border-b">
                                            <td colSpan={4} className="py-4 px-6">
                                                {loadingSubmissions ? (
                                                    <p className="text-gray-500">Loading submissions...</p>
                                                ) : submissions.length === 0 ? (
                                                    <p className="text-gray-500">No submissions found for this round.</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <h4 className="font-semibold text-gray-700">Submissions to evaluate:</h4>
                                                        <ul className="space-y-2">
                                                            {submissions.map(sub => (
                                                                <li key={sub.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                                                    <span className="font-medium text-gray-800">{sub.teamName}</span>
                                                                    <Link
                                                                        to={`/judge/score/${sub.id}`}
                                                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                                                                    >
                                                                        Score Now
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default JudgeDashboardPage;
