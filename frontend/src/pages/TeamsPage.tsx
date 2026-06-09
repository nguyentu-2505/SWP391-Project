import React, { useEffect, useState } from 'react';
import { TeamService } from '../services/TeamService';
import type { Team } from '../services/TeamService';
import { Users, Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Authorizable from '../components/Authorizable';
import { Role } from '../services/authUtils';

const TeamsPage: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            // For now, fetching teams for track 1.
            // This should be dynamic in a real app.
            const allTeams = await TeamService.getTeamsByTrack(1);
            setTeams(allTeams);
        } catch (err) {
            console.error('Failed to fetch teams:', err);
            toast.error('Failed to fetch teams.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-outline-variant rounded-xl shadow-sm">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight flex items-center gap-2">
                        <Users className="text-primary-container" />
                        Teams
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-1">Manage competing teams and their members.</p>
                </div>
                
                <Authorizable allowedRoles={[Role.PARTICIPANT]}>
                    <button
                        onClick={() => toast('Create functionality coming soon!', { icon: '🚧' })}
                        className="bg-primary-container hover:bg-[#d9611b] text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer text-sm"
                    >
                        <Plus size={16} />
                        Create Team
                    </button>
                </Authorizable>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-primary-container" size={32} />
                </div>
            ) : teams.length === 0 ? (
                <div className="bg-white border border-outline-variant rounded-xl p-16 text-center max-w-2xl mx-auto shadow-sm">
                    <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-on-surface mb-1">No Teams Registered</h3>
                    <p className="text-sm text-on-surface-variant">There are no teams registered yet for this track.</p>
                </div>
            ) : (
                <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {teams.map((team) => (
                                    <tr key={team.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-on-surface-variant">{team.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-on-surface">{team.name}</td>
                                        <td className="px-6 py-4 text-sm text-on-surface-variant max-w-xs truncate">{team.description || 'No description provided'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Authorizable 
                                                allowedRoles={[Role.ADMIN, Role.ORGANIZER]} 
                                                fallback={<span className="text-slate-400 text-xs italic">View Only</span>}
                                            >
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => toast('Edit functionality coming soon!', { icon: '🚧' })}
                                                        className="text-primary-container hover:text-primary transition-colors cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => toast('Delete functionality coming soon!', { icon: '🚧' })}
                                                        className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </Authorizable>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamsPage;