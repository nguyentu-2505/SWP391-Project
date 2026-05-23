import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PlusCircle, Eye, Calendar, Loader2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

interface MyEvent {
    id: number;
    name: string;
    status: string;
    startTime: string;
    endTime: string;
    registrationStart: string;
    registrationEnd: string;
}

const OrganizerEventsPage: React.FC = () => {
    const [events, setEvents] = useState<MyEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const response = await api.get('/hackathon-events/my-events');
                setEvents(response.data.data);
            } catch (err) {
                setError('Failed to fetch your events.');
                toast.error('Failed to fetch events.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyEvents();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    if (error) return (
        <div className="text-center p-8 text-red-500">{error}</div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Your Hackathon Events</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and monitor events you organize.</p>
                </div>
                <Link
                    to="/organizer/events/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <PlusCircle size={18} />
                    Create New Event
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900">No events yet</h3>
                    <p className="text-sm text-gray-500 mt-1">Create your first hackathon event to get started.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {events.map(event => (
                                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{event.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={event.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(event.startTime).toLocaleDateString()} — {new Date(event.endTime).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {event.registrationStart
                                                ? `${new Date(event.registrationStart).toLocaleDateString()} — ${new Date(event.registrationEnd).toLocaleDateString()}`
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Link
                                                to={`/organizer/events/${event.id}/dashboard`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                title="Manage Event"
                                            >
                                                <Eye size={14} />
                                                Manage
                                            </Link>
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

export default OrganizerEventsPage;
