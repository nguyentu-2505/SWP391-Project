import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PlusCircle, Eye, Calendar, Loader2, Edit2, Trash2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { HackathonEventService, HackathonEvent, CreateHackathonEventRequest, UpdateHackathonEventRequest } from '../../services/HackathonEventService';
import Authorizable from '../../components/Authorizable';
import { Role } from '../../services/authUtils';

const formatDateTimeLocal = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
};

const OrganizerEventsPage: React.FC = () => {
    const [events, setEvents] = useState<HackathonEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<HackathonEvent | null>(null);

    const fetchMyEvents = async () => {
        try {
            const response = await api.get('/hackathon-events/my-events');
            setEvents(response.data.data);
        } catch (err: any) {
            setError('Failed to fetch your events.');
            toast.error(err.response?.data?.error?.message || 'Failed to fetch events.');
        }
    };

    useEffect(() => {
        const load = async () => {
            await fetchMyEvents();
            setLoading(false);
        };
        load();
    }, []);

    const handleUpdateEvent = async () => {
        if (!selectedEvent) return;
        const loadingToast = toast.loading('Updating event...');
        try {
            const updateRequest: UpdateHackathonEventRequest = {
                name: selectedEvent.name,
                description: selectedEvent.description,
                startTime: selectedEvent.startTime,
                endTime: selectedEvent.endTime,
                registrationStart: selectedEvent.registrationStart,
                registrationEnd: selectedEvent.registrationEnd,
                minTeamSize: selectedEvent.minTeamSize,
                maxTeamSize: selectedEvent.maxTeamSize,
            };
            await HackathonEventService.updateHackathonEvent(selectedEvent.id, updateRequest);
            await fetchMyEvents();
            setIsEditModalOpen(false);
            setSelectedEvent(null);
            toast.success('Event updated successfully', { id: loadingToast });
        } catch (error: any) {
            console.error('Failed to update hackathon event:', error);
            const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
            toast.error('Failed to update event: ' + errorMessage, { id: loadingToast });
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        const loadingToast = toast.loading('Updating status...');
        try {
            await HackathonEventService.updateHackathonEventStatus(id, newStatus);
            await fetchMyEvents();
            toast.success('Status updated successfully', { id: loadingToast });
        } catch (error: any) {
            console.error('Failed to update status:', error);
            const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
            toast.error('Failed to update status: ' + errorMessage, { id: loadingToast });
        }
    };

    const renderStatusActionButtons = (eventId: number, currentStatus: string) => {
        switch (currentStatus) {
            case 'DRAFT':
                return (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                        <button
                            onClick={() => handleStatusChange(eventId, 'PUBLISHED')}
                            className="px-2 py-1 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-700 transition-colors cursor-pointer shadow-sm"
                        >
                            Publish
                        </button>
                        <button
                            onClick={() => handleStatusChange(eventId, 'CANCELLED')}
                            className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
                        >
                            Cancel
                        </button>
                    </div>
                );
            case 'PUBLISHED':
                return (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                        <button
                            onClick={() => handleStatusChange(eventId, 'IN_PROGRESS')}
                            className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm"
                        >
                            Start Event
                        </button>
                        <button
                            onClick={() => handleStatusChange(eventId, 'CANCELLED')}
                            className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
                        >
                            Cancel
                        </button>
                    </div>
                );
            case 'IN_PROGRESS':
                return (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                        <button
                            onClick={() => handleStatusChange(eventId, 'COMPLETED')}
                            className="px-2 py-1 bg-teal-600 text-white text-[10px] font-bold rounded-lg hover:bg-teal-700 transition-colors cursor-pointer shadow-sm"
                        >
                            Complete
                        </button>
                        <button
                            onClick={() => handleStatusChange(eventId, 'CANCELLED')}
                            className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
                        >
                            Cancel
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const openEditModal = (event: HackathonEvent) => {
        setSelectedEvent({
            ...event,
            startTime: formatDateTimeLocal(event.startTime),
            endTime: formatDateTimeLocal(event.endTime),
            registrationStart: formatDateTimeLocal(event.registrationStart),
            registrationEnd: formatDateTimeLocal(event.registrationEnd),
        });
        setIsEditModalOpen(true);
    };

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
            </div>

            {events.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900">No events yet</h3>
                    <p className="text-sm text-gray-500 mt-1">No events have been assigned to you yet. Please contact the administrator.</p>
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
                                            {renderStatusActionButtons(event.id, event.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(event.startTime).toLocaleDateString()} — {new Date(event.endTime).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {event.registrationStart
                                                ? `${new Date(event.registrationStart).toLocaleDateString()} — ${new Date(event.registrationEnd || '').toLocaleDateString()}`
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex space-x-3 items-center justify-end">
                                                <button
                                                    onClick={() => openEditModal(event)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                    title="Edit Event"
                                                >
                                                    <Edit2 size={14} />
                                                    Edit
                                                </button>
                                                <Link
                                                    to={`/organizer/events/${event.id}/dashboard`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                    title="Manage Event"
                                                >
                                                    <Eye size={14} />
                                                    Dashboard
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}



            {selectedEvent && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                    <div className="p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Edit2 size={20} className="text-blue-600" />
                            Edit Hackathon Event
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                                <input
                                    type="text"
                                    value={selectedEvent.name}
                                    onChange={(e) => setSelectedEvent({ ...selectedEvent, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={selectedEvent.description}
                                    onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Start</label>
                                    <input
                                        type="datetime-local"
                                        value={selectedEvent.registrationStart || ''}
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, registrationStart: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration End</label>
                                    <input
                                        type="datetime-local"
                                        value={selectedEvent.registrationEnd || ''}
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, registrationEnd: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={selectedEvent.startTime}
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, startTime: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={selectedEvent.endTime}
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, endTime: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Team Size</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={selectedEvent.minTeamSize}
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, minTeamSize: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Size</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={selectedEvent.maxTeamSize}
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, maxTeamSize: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateEvent}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default OrganizerEventsPage;

