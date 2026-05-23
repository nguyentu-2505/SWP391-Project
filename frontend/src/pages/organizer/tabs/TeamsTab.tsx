import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { Users, Crown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../../../components/Skeleton';
import EmptyState from '../../../components/EmptyState';

interface TeamMemberInfo {
    userId: number;
    username: string;
    isLeader: boolean;
}

interface Team {
    id: number;
    name: string;
    projectName: string;
    trackName: string;
    status: string;
    members: TeamMemberInfo[];
}

const TeamsTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const size = 10;

    useEffect(() => {
        if (!eventId) return;
        const fetchTeams = async () => {
            try {
                const response = await api.get(`/teams/event/${eventId}`);
                setTeams(response.data.data);
            } catch {
                toast.error('Failed to load teams for this event.');
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, [eventId]);

    // Client-side filtering and pagination
    const filteredTeams = useMemo(() => {
        return teams.filter(t => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (t.projectName && t.projectName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [teams, searchTerm]);

    const totalPages = Math.ceil(filteredTeams.length / size) || 1;
    
    // Reset to page 0 when search changes
    useEffect(() => {
        setPage(0);
    }, [searchTerm]);

    const paginatedTeams = useMemo(() => {
        const start = page * size;
        return filteredTeams.slice(start, start + size);
    }, [filteredTeams, page, size]);

    if (loading) return (
        <div className="py-6">
            <Skeleton type="card" lines={3} className="mb-4" />
            <Skeleton type="card" lines={3} />
        </div>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Users size={20} className="text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Registered Teams</h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{teams.length}</span>
                </div>
                
                {/* Search Bar */}
                <div className="relative md:ml-auto w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search teams or projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                    />
                </div>
            </div>

            {filteredTeams.length === 0 ? (
                <EmptyState 
                    icon={<Users size={40} className="text-gray-300" />}
                    title={searchTerm ? "No matching teams" : "No teams yet"}
                    description={searchTerm ? `No teams match "${searchTerm}"` : "No teams have been created for this event yet."}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedTeams.map(team => (
                            <div key={team.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-semibold text-gray-900">{team.name}</p>
                                        <p className="text-xs text-gray-500">{team.projectName || 'No project name'}</p>
                                    </div>
                                    {team.trackName && (
                                        <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                                            {team.trackName}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {team.members?.map(m => (
                                        <span
                                            key={m.userId}
                                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                                m.isLeader
                                                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {m.isLeader && <Crown size={12} />}
                                            {m.username}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                            <span className="text-sm text-gray-500">
                                Showing {page * size + 1} to {Math.min((page + 1) * size, filteredTeams.length)} of {filteredTeams.length} teams
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                    className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TeamsTab;
