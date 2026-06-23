import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Crown, X, Plus, AlertCircle, Mail, Info, CheckCircle, Lock, Send } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Skeleton from '../../components/Skeleton';
import { getDecodedToken } from '../../services/authUtils';

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

interface HackathonEvent {
    id: number;
    name: string;
    status: string;
}

const MyTeamPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    
    const [events, setEvents] = useState<HackathonEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
    const [team, setTeam] = useState<TeamDetails | null>(null);
    
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingTeam, setLoadingTeam] = useState(false);
    
    const [error, setError] = useState('');
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    // Step 1: Fetch all events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/hackathon-events');
                const list = response.data.data ?? [];
                setEvents(list);
                
                if (list.length > 0) {
                    // Default to first event
                    setSelectedEventId(list[0].id);
                } else {
                    setLoadingEvents(false);
                }
            } catch (err) {
                console.error("Failed to load events", err);
                setError('Failed to fetch hackathon events.');
                setLoadingEvents(false);
            }
        };
        fetchEvents();
    }, []);

    // Step 2: Fetch team when selected event changes
    const fetchMyTeam = async () => {
        if (!selectedEventId) return;
        setLoadingTeam(true);
        setError('');
        setTeam(null);
        
        try {
            const response = await api.get(`/teams/my-team/event/${selectedEventId}`);
            setTeam(response.data.data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError("You are not part of a team for this event yet.");
            } else {
                setError('Failed to fetch your team information.');
            }
        } finally {
            setLoadingTeam(false);
            setLoadingEvents(false);
        }
    };

    useEffect(() => {
        fetchMyTeam();
    }, [selectedEventId]);

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
            toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to send invitation.');
        } finally {
            setIsInviting(false);
        }
    };

    const handleFinalize = async () => {
        if (!team) return;
        if (!window.confirm("Are you sure you want to finalize this team? You will not be able to change track or members after this.")) {
            return;
        }

        setIsFinalizing(true);
        try {
            await api.post(`/teams/${team.id}/finalize`);
            toast.success("Team finalized successfully!");
            await fetchMyTeam(); // reload data
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to finalize team.');
        } finally {
            setIsFinalizing(false);
        }
    };

    if (loadingEvents) {
        return (
            <div className="max-w-[1440px] mx-auto space-y-6">
                <Skeleton type="card" lines={3} className="h-48" />
            </div>
        );
    }

    const currentUsername = getDecodedToken()?.sub;
    const isCurrentUserLeader = team?.members.some(m => m.username === currentUsername && m.isLeader) || false;
    const isFinalized = team?.status === 'FINALIZED';
    const isDisqualified = team?.status === 'DISQUALIFIED';
    const isActive = team?.status === 'ACTIVE' || (!isFinalized && !isDisqualified);

    const statusBadgeClass = isDisqualified
        ? "bg-red-50 text-red-700 border-red-200"
        : isFinalized
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-green-50 text-green-700 border-green-200";

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto">
            {/* Header & Event Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-outline-variant rounded-xl shadow-sm">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight flex items-center gap-2">
                        <Users size={28} className="text-primary-container" />
                        My Team
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-1">Manage your hackathon team, project details, and invitations.</p>
                </div>
                
                {events.length > 0 && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant whitespace-nowrap">Event:</span>
                        <div className="relative w-full md:w-64">
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(Number(e.target.value))}
                                className="w-full pl-3 pr-10 py-2 bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all appearance-none cursor-pointer"
                            >
                                {events.map(ev => (
                                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {loadingTeam ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Skeleton type="card" lines={4} className="h-64" />
                    </div>
                    <div>
                        <Skeleton type="card" lines={3} className="h-64" />
                    </div>
                </div>
            ) : error || !team ? (
                <div className="bg-white border border-outline-variant rounded-xl p-12 text-center shadow-sm max-w-2xl mx-auto">
                    <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-on-surface mb-2">No Team Found</h3>
                    <p className="text-sm text-on-surface-variant mb-6 max-w-md mx-auto">
                        {error || "You have not registered for any active events or formed a team."}
                    </p>
                    {selectedEventId && (
                        <Link 
                            to={`/events/${selectedEventId}/create-team`} 
                            className="inline-flex items-center gap-2 bg-primary-container hover:bg-[#d9611b] text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm transition-colors text-sm"
                        >
                            <Plus size={18} />
                            Create a Team
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Project & Team Details (Spans 2 cols) */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-primary-container px-2.5 py-1 bg-primary-container/10 rounded-full">
                                        {team.trackName}
                                    </span>
                                    <h2 className="text-xl md:text-2xl font-bold text-on-surface mt-3">{team.name}</h2>
                                </div>
                                <span className={`text-xs font-semibold px-3 py-1 border rounded-full ${statusBadgeClass}`}>
                                    {team.status || 'ACTIVE'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                                    <Info size={16} /> Project Details
                                </h3>
                                <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 space-y-2">
                                    <p className="font-bold text-base md:text-lg text-on-surface">{team.projectName || 'Project Name Not Defined'}</p>
                                    <p className="text-sm text-on-surface-variant leading-relaxed">
                                        {team.projectDescription || 'No project description provided yet. Ask your team leader to define the project details.'}
                                    </p>
                                </div>
                            </div>

                            {/* Actions area based on team status */}
                            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                                {isActive && isCurrentUserLeader && (
                                    <button
                                        onClick={handleFinalize}
                                        disabled={isFinalizing}
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle size={16} />
                                        {isFinalizing ? 'Finalizing...' : 'Finalize Team'}
                                    </button>
                                )}
                                
                                {isFinalized && isCurrentUserLeader && (
                                    <button
                                        onClick={() => navigate(`/events/${selectedEventId}/submissions/new`)}
                                        className="inline-flex items-center gap-2 bg-primary-container hover:bg-[#d9611b] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors"
                                    >
                                        <Send size={16} />
                                        Submit Project
                                    </button>
                                )}

                                {isFinalized && (
                                    <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                        <Lock size={16} /> Team is finalized. Edits are locked.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Team Members List (Spans 1 col) */}
                    <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col h-fit">
                        <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-on-surface">Members ({team.members.length})</h2>
                        </div>
                        <ul className="space-y-3">
                            {team.members.map(member => (
                                <li key={member.userId} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0 uppercase">
                                        {member.username?.[0] || 'U'}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-semibold text-on-surface truncate">{member.username}</p>
                                        <p className="text-xs text-on-surface-variant">{member.isLeader ? 'Leader' : 'Member'}</p>
                                    </div>
                                    {member.isLeader && <Crown size={16} className="text-yellow-500 fill-yellow-500 shrink-0" />}
                                </li>
                            ))}
                        </ul>

                        {/* Invitation trigger for team leaders */}
                        {isActive && isCurrentUserLeader && (
                            <button 
                                onClick={() => setInviteModalOpen(true)}
                                className="mt-5 w-full flex items-center justify-center gap-2 border border-outline-variant hover:bg-slate-50 text-sm font-semibold text-on-surface py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                            >
                                <Mail size={16} />
                                Invite Members
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white border border-outline-variant rounded-xl p-6 md:p-8 shadow-xl w-full max-w-md relative">
                        <button 
                            onClick={() => setInviteModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-on-surface transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="p-2 bg-primary-container/10 rounded-lg text-primary-container">
                                <Mail size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-on-surface">Invite a New Member</h2>
                        </div>
                        
                        <form onSubmit={handleInvite} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                    Invitee's Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all placeholder-slate-400"
                                    placeholder="name@example.com"
                                    required
                                />
                                <p className="text-xs text-on-surface-variant mt-1">Invitee must be registered as a Participant on the system.</p>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setInviteModalOpen(false)}
                                    className="px-4 py-2 border border-outline-variant hover:bg-slate-50 rounded-lg text-sm font-semibold text-on-surface transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-white bg-primary-container hover:bg-[#d9611b] rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                                    disabled={isInviting}
                                >
                                    {isInviting ? 'Sending...' : 'Send Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTeamPage;