import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, User, Shield, Crown, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

interface TeamMemberInfo {
    userId: number;
    username: string;
    isLeader: boolean;
}

interface TeamDetails {
    id: number;
    name: string;
    projectName: string;
    projectDescription: string;
    trackName: string;
    status: string;
    members: TeamMemberInfo[];
}

const MyTeamPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [team, setTeam] = useState<TeamDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        const fetchMyTeam = async () => {
            if (!slug) return;
            try {
                const response = await api.get(`/teams/my-team/event/${slug}`);
                setTeam(response.data.data);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setError("You are not part of a team for this event yet.");
                } else {
                    setError('Failed to fetch your team information.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchMyTeam();
    }, [slug]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!team || !inviteEmail) return;

        if (!/\S+@\S+\.\S+/.test(inviteEmail)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        setIsInviting(true);
        try {
            await api.post('/team-invitations', {
                teamId: team.id,
                inviteeEmail: inviteEmail,
            });
            toast.success(`Invitation sent to ${inviteEmail}`);
            setInviteEmail('');
            setInviteModalOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send invitation.');
        } finally {
            setIsInviting(false);
        }
    };

    if (loading) return <div className="text-center p-8">Loading your team...</div>;

    if (error) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Link to={`/events/${slug}/create-team`} className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Create a Team
                </Link>
            </div>
        );
    }
    
    if (!team) return null;

    const leader = team.members.find(m => m.isLeader);

    return (
        <>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                        <Users className="mr-3 text-blue-500" />
                        {team.name}
                    </h1>
                    <span className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">{team.trackName}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Project Details</h2>
                        <p className="font-bold text-lg">{team.projectName || 'Not set'}</p>
                        <p className="text-gray-600">{team.projectDescription || 'No description provided.'}</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Members ({team.members.length})</h2>
                        <ul className="space-y-2">
                            {team.members.map(member => (
                                <li key={member.userId} className="flex items-center bg-gray-50 p-2 rounded-md">
                                    <User size={18} className="mr-2 text-gray-500" />
                                    <span className="flex-grow">{member.username}</span>
                                    {member.isLeader && <Crown size={18} className="text-yellow-500" title="Team Leader" />}
                                </li>
                            ))}
                        </ul>
                        {leader && (
                            <button 
                                onClick={() => setInviteModalOpen(true)}
                                className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800"
                            >
                                Invite Members
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Invite a New Member</h2>
                            <button onClick={() => setInviteModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleInvite}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Member's Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                    disabled={isInviting}
                                >
                                    {isInviting ? 'Sending...' : 'Send Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyTeamPage;