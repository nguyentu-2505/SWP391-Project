import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HelpCircle, Check } from 'lucide-react';

interface OpenRequest {
    id: number;
    teamName: string;
    title: string;
    description: string;
    createdAt: string;
}

const MentorRequestsPage: React.FC = () => {
    const [openRequests, setOpenRequests] = useState<OpenRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOpenRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/mentorship-requests/open');
            setOpenRequests(response.data.data);
        } catch (err) {
            setError('Failed to fetch open mentorship requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpenRequests();
    }, []);

    const handleAccept = async (requestId: number) => {
        try {
            await api.patch(`/mentorship-requests/${requestId}/accept`);
            toast.success('Request accepted! It has been added to your dashboard.');
            fetchOpenRequests(); // Refresh the list
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to accept the request.');
        }
    };

    if (loading) return <div className="text-center p-8">Loading open requests...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <HelpCircle className="mr-3 text-blue-500" />
                Open Mentorship Requests
            </h1>
            {openRequests.length === 0 ? (
                <p className="text-gray-500">There are no open requests for mentorship at the moment.</p>
            ) : (
                <ul className="space-y-4">
                    {openRequests.map(req => (
                        <li key={req.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="font-semibold text-lg">{req.title}</p>
                                <p className="text-sm text-gray-600">
                                    From team <span className="font-bold">{req.teamName}</span>
                                </p>
                                <p className="mt-2 text-gray-700">{req.description}</p>
                            </div>
                            <div className="flex items-center">
                                <button 
                                    onClick={() => handleAccept(req.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                    title="Accept Request"
                                >
                                    <Check size={16} />
                                    Accept
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MentorRequestsPage;
