import React, { useEffect, useState } from 'react';
import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Award, ListOrdered, Target, Tag, Clock, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

interface EventSummary {
    id: number;
    name: string;
    status: string;
    startTime: string;
    endTime: string;
}

const EventDashboardPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!eventId) return;
        const fetchEvent = async () => {
            try {
                const res = await api.get('/hackathon-events/my-events');
                const list: EventSummary[] = res.data.data ?? res.data;
                const found = Array.isArray(list) ? list.find(e => String(e.id) === eventId) : null;
                setEvent(found || null);
            } catch {
                // silently ignore — header info is non-critical
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    const navLinks = [
        { to: `/organizer/events/${eventId}/dashboard/submissions`, icon: <FileText size={16} />, label: 'Submissions' },
        { to: `/organizer/events/${eventId}/dashboard/teams`, icon: <Users size={16} />, label: 'Teams' },
        { to: `/organizer/events/${eventId}/dashboard/rounds`, icon: <Clock size={16} />, label: 'Rounds' },
        { to: `/organizer/events/${eventId}/dashboard/criteria`, icon: <Target size={16} />, label: 'Criteria' },
        { to: `/organizer/events/${eventId}/dashboard/tracks`, icon: <Tag size={16} />, label: 'Tracks' },
        { to: `/organizer/events/${eventId}/dashboard/judges`, icon: <LayoutDashboard size={16} />, label: 'Judges' },
        { to: `/organizer/events/${eventId}/dashboard/ranking`, icon: <ListOrdered size={16} />, label: 'Ranking' },
        { to: `/organizer/events/${eventId}/dashboard/prizes`, icon: <Award size={16} />, label: 'Prizes' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/organizer/events')}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
                >
                    <ArrowLeft size={15} />
                    Back to Events
                </button>

                {loading ? (
                    <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin text-blue-500" size={20} />
                        <span className="text-gray-400 text-sm">Loading event info...</span>
                    </div>
                ) : event ? (
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                            <div className="flex items-center gap-3 mt-1.5">
                                <StatusBadge status={event.status} />
                                <span className="text-xs text-gray-400">
                                    {new Date(event.startTime).toLocaleDateString()} — {new Date(event.endTime).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <h1 className="text-2xl font-bold text-gray-900">Event Dashboard</h1>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center overflow-x-auto border-b border-gray-200 mb-6 gap-1">
                {navLinks.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap text-sm font-medium ${
                                isActive
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        {link.icon}
                        {link.label}
                    </NavLink>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <Outlet />
            </div>
        </div>
    );
};

export default EventDashboardPage;
