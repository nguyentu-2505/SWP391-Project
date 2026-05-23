import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Filter, Search, CalendarOff } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

interface Event {
    id: number;
    name: string;
    slug: string;
    description: string;
    startTime: string;
    endTime: string;
    status: string;
    imageUrl: string;
}

const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <Link to={`/events/${event.slug}`} className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <img className="w-full h-48 object-cover" src={event.imageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800'} alt={event.name} />
        <div className="p-6 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-3 gap-2">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{event.name}</h3>
                <StatusBadge status={event.status} />
            </div>
            <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">{event.description}</p>
            <div className="flex items-center text-sm text-gray-500 font-medium bg-gray-50 p-3 rounded-lg mt-auto">
                <Calendar size={16} className="mr-2 text-blue-600" />
                <span>{new Date(event.startTime).toLocaleDateString()} - {new Date(event.endTime).toLocaleDateString()}</span>
            </div>
        </div>
    </Link>
);


const EventListPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/hackathon-events');
                setEvents(response.data.data ?? []);
            } catch (err) {
                console.error('Failed to fetch events', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  event.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter ? event.status === statusFilter : true;
            return matchesSearch && matchesStatus;
        });
    }, [events, searchTerm, statusFilter]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Hackathons</h1>
                    <p className="text-gray-500 mt-2 text-lg">Discover and join upcoming events.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Status Filter */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter size={18} className="text-gray-400" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-48 appearance-none bg-white font-medium text-gray-700 shadow-sm"
                        >
                            <option value="">All Statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="REGISTRATION_OPEN">Registration Open</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="ENDED">Ended</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-64 font-medium text-gray-900 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <Skeleton key={i} type="card" lines={4} className="h-96" />)}
                </div>
            ) : filteredEvents.length === 0 ? (
                <EmptyState 
                    icon={<CalendarOff size={48} className="text-gray-300" />}
                    title={searchTerm || statusFilter ? "No events found" : "No upcoming events"}
                    description={searchTerm || statusFilter ? "Try adjusting your filters or search terms." : "Check back later for new hackathons!"}
                    className="py-20"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventListPage;
