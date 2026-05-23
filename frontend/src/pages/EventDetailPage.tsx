import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, Info, Trophy, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';

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
                const response = await api.get(`/event-registrations/status/${eventId}`);
                setIsRegistered(response.data.data.isRegistered);
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
            await api.post('/event-registrations', { eventId: event.id });
            setIsRegistered(true);
            toast.success('Successfully registered for the event!');
        } catch (err) {
            toast.error('Failed to register for the event.');
        } finally {
            setIsRegistering(false);
        }
    };

    if (loading) return <div className="text-center p-8">Loading event details...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!event) return <div className="text-center p-8">Event not found.</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <img className="w-full h-64 object-cover" src={event.imageUrl || 'https://via.placeholder.com/800x300'} alt={event.name} />
                <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 md:mb-0">{event.name}</h1>
                        <StatusBadge status={event.status} size="md" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-gray-600">
                        <div className="flex items-center">
                            <Calendar size={20} className="mr-3 text-blue-500" />
                            <div>
                                <p className="font-semibold">Event Dates</p>
                                <p>{new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Clock size={20} className="mr-3 text-blue-500" />
                            <div>
                                <p className="font-semibold">Registration</p>
                                <p>{new Date(event.registrationStart).toLocaleString()} - {new Date(event.registrationEnd).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="prose max-w-none">
                        <h2 className="text-2xl font-semibold text-gray-800 flex items-center"><Info size={24} className="mr-2" />About this Event</h2>
                        <p>{event.description}</p>

                        <h2 className="text-2xl font-semibold text-gray-800 mt-8 flex items-center"><Trophy size={24} className="mr-2" />Rules & Regulations</h2>
                        <div dangerouslySetInnerHTML={{ __html: event.rules || '<p>No rules specified.</p>' }} />
                    </div>
                    
                    {event.status === 'REGISTRATION_OPEN' && (
                         <div className="mt-8 text-center">
                            <button 
                                className="px-8 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                                onClick={handleRegister}
                                disabled={isRegistered || isRegistering}
                            >
                                {isRegistered ? 'Registered' : (isRegistering ? 'Registering...' : 'Register Now')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;