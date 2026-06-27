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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState<CreateHackathonEventRequest>({ name: '', description: '', startTime: '', endTime: '', minTeamSize: 2, maxTeamSize: 5 });
    const [selectedEvent, setSelectedEvent] = useState<HackathonEvent | null>(null);

    const fetchMyEvents = async () => {
        try {
            const response = await api.get('/hackathon-events/my-events');
            setEvents(response.data.data);
        } catch (err) {
            setError('Failed to fetch your events.');
            toast.error('Failed to fetch events.');
        }
    };

    useEffect(() => {
        const load = async () => {
            await fetchMyEvents();
            setLoading(false);
        };
        load();
    }, []);

    const handleCreateEvent = async () => {
        if (!newEvent.name || !newEvent.startTime || !newEvent.endTime) {
            toast.error('Please fill in all required fields.');
            return;
        }
        const loadingToast = toast.loading('Creating event...');
        try {
            await HackathonEventService.createHackathonEvent(newEvent);
            await fetchMyEvents();
            setIsCreateModalOpen(false);
            setNewEvent({ name: '', description: '', startTime: '', endTime: '', minTeamSize: 2, maxTeamSize: 5 });
            toast.success('Event created successfully', { id: loadingToast });
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || err.message;
            toast.error('Failed to create event: ' + errorMessage, { id: loadingToast });
        }
    };

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
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                >
                    <PlusCircle size={18} />
                    Create New Event
                </button>
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
                                            <select 
                                                value={event.status} 
                                                onChange={(e) => handleStatusChange(event.id, e.target.value)}
                                                className="mt-2 block w-full pl-3 pr-10 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-50"
                                            >
                                                <option value="DRAFT">DRAFT</option>
                                                <option value="PUBLISHED">PUBLISHED</option>
                                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                                <option value="CANCELLED">CANCELLED</option>
                                            </select>
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

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <div className="p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-blue-600" />
                        Create New Hackathon Event
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                            <input
                                type="text"
                                value={newEvent.name}
                                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                placeholder="Enter event name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                placeholder="Enter event description"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Start</label>
                                <input
                                    type="datetime-local"
                                    value={newEvent.registrationStart || ''}
                                    onChange={(e) => setNewEvent({ ...newEvent, registrationStart: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Registration End</label>
                                <input
                                    type="datetime-local"
                                    value={newEvent.registrationEnd || ''}
                                    onChange={(e) => setNewEvent({ ...newEvent, registrationEnd: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                                <input
                                    type="datetime-local"
                                    value={newEvent.startTime}
                                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                                <input
                                    type="datetime-local"
                                    value={newEvent.endTime}
                                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Team Size</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newEvent.minTeamSize}
                                    onChange={(e) => setNewEvent({ ...newEvent, minTeamSize: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Size</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newEvent.maxTeamSize}
                                    onChange={(e) => setNewEvent({ ...newEvent, maxTeamSize: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateEvent}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                            Create Event
                        </button>
                    </div>
                </div>
            </Modal>

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
