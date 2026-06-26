import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, Info, Trophy, ChevronLeft, CalendarRange } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import Skeleton from '../components/Skeleton';

interface EventDetails {
    id: number;
    name: string;
    slug: string;
    description: string;
    startTime: string;
    endTime: string;
    registrationStart: string;
    registrationEnd: string;
    status: string;
    rules: string;
    imageUrl: string;
}

const EventDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!slug) return;
            try {
                const response = await api.get(`/hackathon-events/${slug}`);
                setEvent(response.data.data);
                checkRegistrationStatus(response.data.data.id);
            } catch (err) {
                setError('Failed to fetch event details.');
            } finally {
                setLoading(false);
            }
        };

        const checkRegistrationStatus = async (eventId: number) => {
            try {
                const response = await api.get(`/event-registrations/event/${eventId}/my-status`);
                setIsRegistered(response.data.data);
            } catch (err) {
                // Ignore error, maybe the user is not logged in
            }
        };

        fetchEvent();
    }, [slug]);

    const handleRegister = async () => {
        if (!event) return;
        setIsRegistering(true);
        try {
            await api.post('/event-registrations', null, { params: { eventId: event.id } });
            setIsRegistered(true);
            toast.success('Successfully registered for the event!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to register for the event.');
        } finally {
            setIsRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-[1440px] mx-auto space-y-6">
                <Skeleton type="card" lines={4} className="h-96" />
            </div>
        );
    }
    
    if (error || !event) {
        return (
            <div className="max-w-xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-center text-sm text-red-600">
                {error || 'Event not found.'}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto">
            <Link to="/events" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors mb-2">
                <ChevronLeft size={16} />
                Back to All Hackathons
            </Link>

            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                {/* Cover Image */}
                <div className="h-80 w-full relative bg-slate-100">
                    <img 
                        className="w-full h-full object-cover" 
                        src={event.imageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200'} 
                        alt={event.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 md:left-8 flex flex-col md:flex-row md:items-end justify-between right-6 gap-4">
                        <div className="space-y-2 text-white">
                            <StatusBadge status={event.status} />
                            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">{event.name}</h1>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Event Details Description (Spans 2 cols) */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Info size={20} className="text-primary-container" />
                                    About the Hackathon
                                </h2>
                                <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                                    {event.description}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Trophy size={20} className="text-primary-container" />
                                    Rules & Regulations
                                </h2>
                                <div 
                                    className="text-sm text-on-surface-variant leading-relaxed prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: event.rules || '<p>No specific rules defined for this event.</p>' }} 
                                />
                            </div>
                        </div>

                        {/* Timeline & Actions sidebar */}
                        <div className="space-y-6">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 space-y-5">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                                    <CalendarRange size={16} className="text-primary-container" />
                                    Event Timeline
                                </h3>
                                
                                <div className="space-y-4 divide-y divide-slate-100">
                                    {/* Reg Dates */}
                                    <div className="pt-0 flex items-start gap-3">
                                        <Clock size={16} className="text-on-surface-variant shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold text-on-surface">Registration Period</p>
                                            <p className="text-xs text-on-surface-variant mt-0.5">
                                                {new Date(event.registrationStart).toLocaleDateString()} - {new Date(event.registrationEnd).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Event Dates */}
                                    <div className="pt-4 flex items-start gap-3">
                                        <Calendar size={16} className="text-on-surface-variant shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold text-on-surface">Hackathon Dates</p>
                                            <p className="text-xs text-on-surface-variant mt-0.5">
                                                {new Date(event.startTime).toLocaleDateString()} - {new Date(event.endTime).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {event.status === 'PUBLISHED' ? (
                                    <div className="pt-2">
                                        <button 
                                            className="w-full py-2.5 text-sm font-bold text-white bg-primary-container hover:bg-[#d9611b] rounded-lg shadow-sm transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
                                            onClick={handleRegister}
                                            disabled={isRegistered || isRegistering}
                                        >
                                            {isRegistered ? 'Successfully Registered' : (isRegistering ? 'Registering...' : 'Register Now')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-2">
                                        <button 
                                            className="w-full py-2.5 text-sm font-bold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed border border-slate-200"
                                            disabled
                                        >
                                            {event.status === 'DRAFT' ? 'Registration Not Open (Draft)' : 
                                             event.status === 'IN_PROGRESS' ? 'Registration Closed (In Progress)' : 
                                             event.status === 'COMPLETED' ? 'Event Ended (Completed)' : 
                                             event.status === 'CANCELLED' ? 'Event Cancelled' : 'Registration Closed'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;