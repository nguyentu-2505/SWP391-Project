import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, Info, Trophy, ChevronLeft, CalendarRange, Tag, Target } from 'lucide-react';
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
    const [tracks, setTracks] = useState<any[]>([]);
    const [rounds, setRounds] = useState<any[]>([]);
    const [criteria, setCriteria] = useState<any[]>([]);
    const [prizes, setPrizes] = useState<any[]>([]);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!slug) return;
            try {
                const response = await api.get(`/hackathon-events/${slug}`);
                const eventData = response.data.data;
                setEvent(eventData);
                checkRegistrationStatus(eventData.id);
                
                try {
                    const [tracksRes, roundsRes, criteriaRes, prizesRes] = await Promise.all([
                        api.get(`/tracks/hackathon/${eventData.id}`),
                        api.get(`/rounds/hackathon/${eventData.id}`),
                        api.get(`/criteria/event/${eventData.id}`),
                        api.get(`/prizes/event/${eventData.id}`)
                    ]);
                    setTracks(tracksRes.data.data || []);
                    setRounds(roundsRes.data.data || []);
                    setCriteria(criteriaRes.data.data || []);
                    setPrizes(prizesRes.data || []);
                } catch (fetchErr) {
                    console.error("Failed to fetch detailed event information:", fetchErr);
                }
            } catch (err) {
                setError('Failed to fetch event details.');
            } finally {
                setLoading(false);
            }
        };

        const checkRegistrationStatus = async (eventId: number) => {
            try {
                const response = await api.get(`/event-registrations/my-registration/event/${eventId}`);
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
            const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to register for the event.';
            toast.error(errorMessage);
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

                            {tracks.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Tag size={20} className="text-primary-container" />
                                        Competition Tracks
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tracks.map(t => (
                                            <div key={t.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <h3 className="font-bold text-blue-700 text-sm">{t.name}</h3>
                                                <p className="text-xs text-on-surface-variant mt-1.5">{t.description || 'No description provided.'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {rounds.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Clock size={20} className="text-primary-container" />
                                        Rounds & Timeline
                                    </h2>
                                    <div className="relative border-l border-blue-200 ml-3 pl-6 space-y-6">
                                        {rounds.map((r, index) => (
                                            <div key={r.id} className="relative">
                                                <div className="absolute -left-[31px] top-0.5 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                                                    {index + 1}
                                                </div>
                                                <h3 className="font-bold text-sm text-gray-900">{r.name}</h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Timeline: {new Date(r.startTime).toLocaleString()} - {new Date(r.endTime).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-blue-700 font-semibold mt-1">
                                                    Advancement Slots: {r.advancementSlots ? `${r.advancementSlots} teams` : 'Unlimited'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {criteria.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Target size={20} className="text-primary-container" />
                                        Evaluation Criteria
                                    </h2>
                                    <div className="space-y-3">
                                        {criteria.map(c => (
                                            <div key={c.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                                                <div>
                                                    <h3 className="font-semibold text-sm text-gray-900">{c.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">{c.description || 'No description.'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                                                        Weight: {c.weight}%
                                                    </span>
                                                    <p className="text-[10px] text-gray-400 mt-1">Max Score: {c.maxScore}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {prizes.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Trophy size={20} className="text-primary-container" />
                                        Prizes
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {prizes.map(p => (
                                            <div key={p.id} className="p-4 rounded-xl border border-yellow-200 bg-amber-50/30 shadow-sm flex items-start gap-3">
                                                <Trophy className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                                                <div>
                                                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 flex-wrap">
                                                        {p.name}
                                                        {p.trackName && (
                                                            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                {p.trackName}
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {p.cash !== undefined && p.cash !== null && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                💵 {p.cash.toLocaleString()} VNĐ
                                                            </span>
                                                        )}
                                                        {p.hasCup && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                                                                🏆 Cúp
                                                            </span>
                                                        )}
                                                        {p.hasCertificate && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                                📜 Giấy khen
                                                            </span>
                                                        )}
                                                        {!p.cash && !p.hasCup && !p.hasCertificate && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-100">
                                                                Special Prize
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1.5">{p.description || 'Awarded to top performers.'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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

                                {event.status === 'PUBLISHED' && (
                                    <div className="pt-2">
                                        <button 
                                            className="w-full py-2.5 text-sm font-bold text-white bg-primary-container hover:bg-[#d9611b] rounded-lg shadow-sm transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                                            onClick={handleRegister}
                                            disabled={isRegistered || isRegistering}
                                        >
                                            {isRegistered ? 'Successfully Registered' : (isRegistering ? 'Registering...' : 'Register Now')}
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