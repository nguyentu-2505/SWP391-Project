import React, { useEffect, useState } from 'react';
import { RoundService, Round } from '../services/RoundService';
import { Layers, Loader2, Plus, Calendar, Clock, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Authorizable from '../components/Authorizable';
import { Role } from '../services/authUtils';

const RoundsPage: React.FC = () => {
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRounds();
    }, []);

    const fetchRounds = async () => {
        setLoading(true);
        try {
            // For now, fetching rounds for hackathon event 1.
            const allRounds = await RoundService.getRoundsByHackathonEvent(1);
            setRounds(allRounds);
        } catch (err) {
            console.error('Failed to fetch rounds:', err);
            toast.error('Failed to fetch rounds.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Layers className="text-purple-600" />
                        Event Rounds
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage competition rounds and schedules.</p>
                </div>
                
                <Authorizable allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
                    <button
                        onClick={() => toast('Create functionality coming soon!', { icon: '🚧' })}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <Plus size={18} />
                        Add Round
                    </button>
                </Authorizable>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : rounds.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Layers className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No rounds</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no rounds scheduled for this event.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rounds.map((round) => {
                                    const now = new Date();
                                    const start = new Date(round.startTime);
                                    const end = new Date(round.endTime);
                                    let status = "Upcoming";
                                    let statusClass = "bg-blue-100 text-blue-800";
                                    
                                    if (now > end) {
                                        status = "Completed";
                                        statusClass = "bg-gray-100 text-gray-800";
                                    } else if (now >= start && now <= end) {
                                        status = "Active";
                                        statusClass = "bg-green-100 text-green-800";
                                    }

                                    return (
                                        <tr key={round.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{round.name}</div>
                                                <div className="text-sm text-gray-500 max-w-xs truncate">{round.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs text-gray-900 flex flex-col gap-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} className="text-gray-400" />
                                                        {start.toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} className="text-gray-400" />
                                                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                <Authorizable allowedRoles={[Role.ADMIN, Role.ORGANIZER]} fallback={<span className="text-gray-400 italic text-xs">View Only</span>}>
                                                    <button onClick={() => toast('Edit functionality coming soon!', { icon: '🚧' })} className="hover:text-blue-900 flex items-center gap-1">
                                                        <Edit2 size={14} />
                                                        Edit
                                                    </button>
                                                </Authorizable>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoundsPage;