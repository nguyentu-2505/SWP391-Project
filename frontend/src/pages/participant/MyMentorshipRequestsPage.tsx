import React, { useState, useEffect } from 'react';
import { MentorshipRequestService, MentorshipRequest } from '../../services/MentorshipRequestService';
import Modal from '../../components/Modal';
import { HelpCircle } from 'lucide-react';

const MyMentorshipRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<MentorshipRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<MentorshipRequest | null>(null);

    const fetchMyRequests = async () => {
        try {
            setLoading(true);
            const response = await MentorshipRequestService.getMyRequests();
            setRequests(response);
        } catch (err) {
            setError('Failed to fetch your mentorship requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-yellow-100 text-yellow-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="text-center p-8">Loading your mentorship requests...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <HelpCircle className="mr-3 text-blue-500" />
                Team's Mentorship Requests
            </h1>
            {requests.length === 0 ? (
                <p className="text-gray-500">Your team has not made any mentorship requests yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Title</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Mentor</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Created At</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} className="border-b">
                                    <td className="py-3 px-4 max-w-xs truncate">{req.title}</td>
                                    <td className="py-3 px-4">{req.mentorName || 'Unassigned'}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">{new Date(req.createdAt).toLocaleDateString()}</td>
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
                title="Mentorship Request Details"
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Title</p>
                            <p className="text-gray-900 font-medium">{selectedRequest.title}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Description</p>
                            <p className="text-gray-900">{selectedRequest.description}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Status</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                                {selectedRequest.status}
                            </span>
                        </div>
                        {selectedRequest.mentorName && (
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase">Mentor</p>
                                <p className="text-gray-900">{selectedRequest.mentorName}</p>
                            </div>
                        )}
                        {selectedRequest.status === 'RESOLVED' && selectedRequest.answer && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-semibold text-green-800 uppercase mb-2">Mentor's Answer</p>
                                <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.answer}</p>
                            </div>
                        )}
                        {selectedRequest.status === 'REJECTED' && selectedRequest.rejectReason && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm font-semibold text-red-800 uppercase mb-2">Reason for Decline</p>
                                <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.rejectReason}</p>
                            </div>
                        )}
                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                onClick={() => setSelectedRequest(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyMentorshipRequestsPage;
