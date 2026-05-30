import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, Check, X } from 'lucide-react';

interface Invitation {
    id: number;
    teamName: string;
    inviterName: string;
    createdAt: string;
}

const InvitationsPage: React.FC = () => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/team-invitations/pending');
            setInvitations(response.data.data);
        } catch (err) {
            setError('Failed to fetch invitations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    const handleResponse = async (invitationId: number, response: 'ACCEPTED' | 'DECLINED') => {
        try {
            await api.post(`/team-invitations/${invitationId}/respond`, { response });
            toast.success(`Invitation ${response.toLowerCase()}!`);
            fetchInvitations(); // Refresh the list
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to respond to invitation.');
        }
    };

    if (loading) return <div className="text-center p-8">Loading invitations...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Mail className="mr-3 text-blue-500" />
                Your Invitations
            </h1>
            {invitations.length === 0 ? (
                <p className="text-gray-500">You have no pending invitations.</p>
            ) : (
                <ul className="space-y-4">
                    {invitations.map(inv => (
                        <li key={inv.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="font-semibold">
                                    <span className="text-blue-600">{inv.inviterName}</span> has invited you to join <span className="text-blue-600">{inv.teamName}</span>.
                                </p>
                                <p className="text-sm text-gray-500">
                                    Received on {new Date(inv.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleResponse(inv.id, 'ACCEPTED')}
                                    className="p-2 text-white bg-green-500 rounded-full hover:bg-green-600"
                                    title="Accept"
                                >
                                    <Check size={20} />
                                </button>
                                <button 
                                    onClick={() => handleResponse(inv.id, 'DECLINED')}
                                    className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600"
                                    title="Decline"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default InvitationsPage;
