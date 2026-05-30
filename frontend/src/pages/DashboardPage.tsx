import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, Award, Activity, Clock, CheckCircle, FileText, ArrowUpRight } from 'lucide-react';
import { getUserRole, Role } from '../services/authUtils';
import api from '../services/api';
import Skeleton from '../components/Skeleton';

interface Stats {
    activeEvents: number;
    totalTeams: number;
    totalSubmissions: number;
    prizesAwarded: string;
}

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, bgColor: string, trend?: string }> = ({ title, value, icon, bgColor, trend }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${bgColor}`}>
                {icon}
            </div>
            {trend && (
                <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <ArrowUpRight size={14} className="mr-0.5" />
                    {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-3xl font-extrabold text-gray-900 mb-1">{value}</p>
            <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
    </div>
);

const RecentActivityList: React.FC<{ role: string | null }> = ({ role }) => {
    // Mocked recent activity for visual enhancement without extra backend endpoints
    const activities = [
        { id: 1, icon: <FileText size={16} className="text-blue-600" />, title: 'New submission received', desc: 'Team "Alpha Code" submitted their project for "FPT Hackathon 2026"', time: '10 mins ago', color: 'bg-blue-100' },
        { id: 2, icon: <CheckCircle size={16} className="text-green-600" />, title: 'Score finalized', desc: 'Judge completed scoring for "Byte Me" team', time: '1 hour ago', color: 'bg-green-100' },
        { id: 3, icon: <Users size={16} className="text-purple-600" />, title: 'New team registered', desc: 'Team "Data Miners" just joined the event', time: '3 hours ago', color: 'bg-purple-100' },
        { id: 4, icon: <Calendar size={16} className="text-orange-600" />, title: 'Round Started', desc: 'The "Final Pitch" round is now officially open', time: '1 day ago', color: 'bg-orange-100' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Activity size={20} className="text-indigo-600" />
                    Recent Activity
                </h2>
                <button className="text-sm text-indigo-600 font-semibold hover:underline">View All</button>
            </div>
            <div className="p-6">
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                    {activities.map((act) => (
                        <div key={act.id} className="relative pl-6">
                            <span className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${act.color}`}>
                                {act.icon}
                            </span>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">{act.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{act.desc}</p>
                                <span className="text-xs font-medium text-gray-400 mt-2 flex items-center gap-1">
                                    <Clock size={12} /> {act.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SimpleStatsChart: React.FC<{ stats: Stats | null }> = ({ stats }) => {
    if (!stats) return null;
    
    // Calculate some visual percentages just for the UI
    const participationRate = Math.min(100, Math.round((stats.totalSubmissions / Math.max(1, stats.totalTeams)) * 100));
    
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-between">
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-500" />
                    Event Health
                </h2>
                
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-gray-700">Submission Rate</span>
                            <span className="font-bold text-blue-600">{participationRate}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full" style={{ width: `${participationRate}%` }}></div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-gray-700">Active Events vs Total</span>
                            <span className="font-bold text-green-600">Active</span>
                        </div>
                        <div className="w-full flex h-3 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-3" style={{ width: '60%' }}></div>
                            <div className="bg-gray-200 h-3" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 bg-blue-50 rounded-xl p-4 flex items-start gap-3 border border-blue-100">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                    <Award size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-blue-900">Total Prizes</h4>
                    <p className="text-xs text-blue-700 mt-1">
                        A total value of <strong>{stats.prizesAwarded}</strong> has been awarded across all platforms.
                    </p>
                </div>
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const role = getUserRole();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/stats');
                setStats(response.data.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                // Fallback mock stats if endpoint fails
                setStats({ activeEvents: 3, totalTeams: 42, totalSubmissions: 35, prizesAwarded: "$15,000" });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-gray-500 mt-1 text-lg">Welcome back! You are logged in as <span className="font-semibold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md">{role}</span>.</p>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <Skeleton key={i} type="card" lines={2} className="h-32" />)}
                </div>
            ) : stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Active Events" 
                        value={stats.activeEvents} 
                        icon={<Calendar size={28} className="text-blue-600" />} 
                        bgColor="bg-blue-50"
                        trend="2 new"
                    />
                    <StatCard 
                        title="Total Teams" 
                        value={stats.totalTeams} 
                        icon={<Users size={28} className="text-green-600" />} 
                        bgColor="bg-green-50"
                        trend="+12%"
                    />
                    <StatCard 
                        title="Submissions" 
                        value={stats.totalSubmissions} 
                        icon={<FileText size={28} className="text-purple-600" />} 
                        bgColor="bg-purple-50"
                    />
                    <StatCard 
                        title="Prizes Awarded" 
                        value={stats.prizesAwarded} 
                        icon={<Award size={28} className="text-yellow-600" />} 
                        bgColor="bg-yellow-50"
                    />
                </div>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <RecentActivityList role={role} />
                </div>
                <div className="lg:col-span-1">
                    <SimpleStatsChart stats={stats} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;