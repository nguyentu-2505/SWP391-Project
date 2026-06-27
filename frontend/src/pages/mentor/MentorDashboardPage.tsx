import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import Modal from '../../components/Modal';

interface MentorshipRequest {
    id: number;
    teamName: string;
    title: string;
    status: string;
    createdAt: string;
}

const MentorDashboardPage: React.FC = () => {
    const [myRequests, setMyRequests] = useState<MentorshipRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<MentorshipRequest | null>(null);

    useEffect(() => {
        const fetchMyRequests = async () => {
            try {
                const response = await api.get('/mentorship-requests/my-requests');
                setMyRequests(response.data.data);
            } catch (err) {
                setError('Failed to fetch your mentorship sessions.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyRequests();
    }, []);

    if (loading) return <div className="text-center p-8">Loading your mentorship sessions...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Your Mentorship Sessions</h1>
                <Link to="/mentor/requests" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    View Open Requests
                </Link>
            </div>
            {myRequests.length === 0 ? (
                <p className="text-gray-500">You have no active mentorship sessions.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Team</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Request Title</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myRequests.map(req => (
                                <tr key={req.id} className="border-b">
                                    <td className="py-3 px-4">{req.teamName}</td>
                                    <td className="py-3 px-4">{req.title}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            req.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <button 
                                            className="text-blue-600 hover:text-blue-800 font-semibold"
                                            onClick={() => setSelectedRequest(req)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                title="Mentorship Session Details"
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Team Name</p>
                            <p className="text-gray-900 font-medium">{selectedRequest.teamName}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Request Title</p>
                            <p className="text-gray-900 font-medium">{selectedRequest.title}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Status</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                selectedRequest.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {selectedRequest.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Created At</p>
                            <p className="text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MentorDashboardPage;
