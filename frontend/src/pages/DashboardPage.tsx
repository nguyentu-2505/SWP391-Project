import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Users, FileText, Calendar, Trophy, CheckCircle, 
    UserPlus, Megaphone, ArrowRight, CalendarRange, Upload, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserRole, Role } from '../services/authUtils';
import { DashboardService, DashboardStats } from '../services/DashboardService';
import { NotificationService } from '../services/NotificationService';
import Skeleton from '../components/Skeleton';
import Button from '../components/ui/Button';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const role = getUserRole();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeEvent, setActiveEvent] = useState<any>(null);
    const [activeRound, setActiveRound] = useState<any>(null);
    const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

    useEffect(() => {
        const fetchStatsAndEvent = async () => {
            try {
                // Fetch stats from DashboardService
                const statsData = await DashboardService.getStats();
                setStats(statsData);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                // Simple fallback in case of backend failure during development
                setStats({ activeTeams: 0, submissionsReceived: 0, pendingReviews: 0, daysRemaining: 0 });
            } finally {
                setLoading(false);
            }

            try {
                // Fetch active event
                const { data: eventsData } = await api.get('/hackathon-events');
                const events = eventsData.data ?? eventsData;
                const currentEvent = events.find((e: any) => e.status === 'REGISTRATION' || e.status === 'IN_PROGRESS');
                
                if (currentEvent) {
                    setActiveEvent(currentEvent);
                    // Fetch rounds for this event
                    const { data: roundsData } = await api.get(`/rounds/event/${currentEvent.id}`);
                    const rounds = roundsData.data ?? roundsData;
                    
                    const now = new Date();
                    const currentRound = rounds.find((r: any) => {
                        if (r.gradingEnded) return false;
                        const start = new Date(r.startTime);
                        const end = new Date(r.endTime);
                        return now >= start && now <= end;
                    });
                    
                    if (currentRound) {
                        setActiveRound(currentRound);
                    } else {
                        // Find the next upcoming round
                        const upcomingRounds = rounds.filter((r: any) => new Date(r.startTime) > now)
                                                     .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                        if (upcomingRounds.length > 0) setActiveRound(upcomingRounds[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch active event details", error);
            }

            try {
                const notifs = await NotificationService.getMyNotifications();
                // Take top 5 recent notifications
                setRecentNotifications(notifs.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };
        fetchStatsAndEvent();
    }, []);



    return (
        <div className="space-y-8 max-w-[1440px] mx-auto">
            {/* Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">Overview</h2>
                    <p className="text-sm md:text-base text-on-surface-variant mt-1">
                        Here's what's happening in the SEAL Hackathon. Logged in as <span className="font-semibold text-primary">{role}</span>.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {role === Role.PARTICIPANT && (
                        <Button 
                            variant="secondary" 
                            leftIcon={<CalendarRange size={16} />}
                            onClick={() => navigate('/my-mentorship-requests')}
                        >
                            Schedule Session
                        </Button>
                    )}
                    <Button 
                        variant="secondary" 
                        leftIcon={<Trophy size={16} />}
                        onClick={() => navigate('/events')}
                    >
                        View Leaderboard
                    </Button>

                </div>
            </div>

            {/* Stats Bento Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} type="card" lines={2} className="h-32" />)}
                </div>
            ) : stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat Card 1: Active Teams */}
                    <div className="bg-white border border-outline-variant rounded-xl p-6 hover:border-primary-container/50 transition-colors flex flex-col justify-between shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-brand-orange/10 rounded-lg">
                                <Users className="text-brand-orange" size={24} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest font-bold">Active Teams</p>
                            <h3 className="text-4xl font-bold text-on-surface">{stats.activeTeams}</h3>
                        </div>
                    </div>

                    {/* Stat Card 2: Submissions Received */}
                    <div className="bg-white border border-outline-variant rounded-xl p-6 hover:border-primary-container/50 transition-colors flex flex-col justify-between shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <FileText className="text-blue-600" size={24} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest font-bold">Submissions Received</p>
                            <h3 className="text-4xl font-bold text-on-surface">{stats.submissionsReceived}</h3>
                        </div>
                    </div>

                    {/* Stat Card 3: Pending Reviews */}
                    <div className="bg-white border border-outline-variant rounded-xl p-6 hover:border-primary-container/50 transition-colors flex flex-col justify-between shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <CheckCircle className="text-purple-600" size={24} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest font-bold">Pending Reviews</p>
                            <h3 className="text-4xl font-bold text-on-surface">{stats.pendingReviews}</h3>
                        </div>
                    </div>

                    {/* Stat Card 4: Days Remaining */}
                    <div className="bg-white border border-outline-variant rounded-xl p-6 hover:border-primary-container/50 transition-colors flex flex-col justify-between shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <Calendar className="text-red-500" size={24} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest font-bold">Days Remaining</p>
                            <h3 className="text-4xl font-bold text-on-surface mb-2">{stats.daysRemaining}</h3>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full progress-wave rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Layout: Feed & Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area (Spans 2 cols) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Informational Card */}
                    <div className="bg-white border border-outline-variant rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-fixed to-transparent opacity-30 rounded-bl-full -z-0"></div>
                        <div className="flex-grow z-10">
                            {activeEvent ? (
                                <>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 mb-4">
                                        <span className="w-2 h-2 rounded-full bg-green-500 radar-dot"></span>
                                        <span className="text-xs font-bold">{activeEvent.status === 'IN_PROGRESS' ? 'Event is Live' : 'Registration Open'}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-on-surface mb-2">{activeEvent.name}</h3>
                                    {activeRound ? (
                                        <p className="text-sm text-on-surface-variant mb-6 max-w-lg">
                                            Current Phase: <span className="font-semibold text-brand-navy">{activeRound.name}</span>.<br />
                                            {new Date() < new Date(activeRound.startTime) ? 'Starts at: ' + new Date(activeRound.startTime).toLocaleString() : 'Ends at: ' + new Date(activeRound.endTime).toLocaleString()}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-on-surface-variant mb-6 max-w-lg">
                                            {activeEvent.description || 'Welcome to the Hackathon!'}
                                        </p>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="pl-0 text-primary hover:bg-transparent hover:underline"
                                        rightIcon={<ArrowRight size={16} />}
                                        onClick={() => {
                                            if (role === Role.PARTICIPANT || role === Role.MENTOR || role === Role.JUDGE || role === Role.GUEST_JUDGE) {
                                                navigate(`/events/${activeEvent.slug}`);
                                            } else if (role === Role.ORGANIZER) {
                                                navigate(`/organizer/events/${activeEvent.id}/dashboard`);
                                            } else {
                                                navigate('/hackathon-events');
                                            }
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 mb-4">
                                        <span className="text-xs font-bold">No Active Events</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-on-surface mb-2">Welcome to SEAL Hackathon</h3>
                                    <p className="text-sm text-on-surface-variant mb-6 max-w-lg">
                                        There are currently no active hackathons. Please check back later.
                                    </p>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="pl-0 text-primary hover:bg-transparent hover:underline"
                                        rightIcon={<ArrowRight size={16} />}
                                        onClick={() => navigate(role === Role.PARTICIPANT ? '/events' : '/hackathon-events')}
                                    >
                                        Browse Events
                                    </Button>
                                </>
                            )}
                        </div>
                        <div className="w-full md:w-48 aspect-[4/3] rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center z-10 overflow-hidden relative">
                            {activeEvent?.imageUrl ? (
                                <img 
                                    alt="Event Thumbnail" 
                                    className="w-full h-full object-cover" 
                                    src={activeEvent.imageUrl}
                                />
                            ) : (
                                <Trophy size={48} className="text-brand-orange opacity-50" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Notifications Feed (Spans 1 col) */}
                <div className="bg-white border border-outline-variant rounded-xl flex flex-col h-full shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-on-surface">Recent Notifications</h3>
                    </div>
                    {recentNotifications.length > 0 ? (
                        <div className="flex-grow p-6 flex flex-col gap-6 relative">
                            {/* Vertical line for timeline */}
                            <div className="absolute left-[39px] top-6 bottom-6 w-px bg-outline-variant"></div>
                            {recentNotifications.map((notif: any) => (
                                <div key={notif.id} className="relative z-10 flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                        <Bell size={14} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-on-surface">{notif.message}</p>
                                        <p className="text-xs text-on-surface-variant mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-grow p-8 flex flex-col items-center justify-center text-center text-slate-500 text-sm">
                            <p>No recent notifications.</p>
                        </div>
                    )}
                    <div className="p-4 border-t border-slate-100 text-center bg-slate-50 flex justify-center">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:bg-primary/5 w-full"
                            onClick={() => navigate('/notifications')}
                        >
                            View All Notifications
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;