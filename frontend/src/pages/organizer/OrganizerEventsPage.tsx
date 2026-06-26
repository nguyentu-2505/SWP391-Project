import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PlusCircle, Eye, Calendar, Loader2, Edit } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { HackathonEventService } from '../../services/HackathonEventService';

interface MyEvent {
    id: number;
    name: string;
    description?: string;
    status: string;
    startTime: string;
    endTime: string;
    registrationStart: string;
    registrationEnd: string;
    allowedStatusTransitions?: string[];
}

const formatDateTimeLocal = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch {
        return '';
    }
};

const OrganizerEventsPage: React.FC = () => {
    const [events, setEvents] = useState<MyEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ name: '', description: '', startTime: '', endTime: '', registrationStart: '', registrationEnd: '' });
    const [editingEvent, setEditingEvent] = useState<MyEvent | null>(null);

    const fetchMyEvents = async () => {
        try {
            const response = await api.get('/hackathon-events/my-events');
            setEvents(response.data.data);
        } catch (err) {
            setError('Failed to fetch your events.');
            toast.error('Failed to fetch events.');
        }
    };

    const handleStatusChange = async (eventId: number, newStatus: string) => {
        if (!window.confirm(`Are you sure you want to change this event status to ${newStatus}?`)) {
            return;
        }
        const loadingToast = toast.loading(`Updating event status to ${newStatus}...`);
        try {
            await api.patch(`/hackathon-events/${eventId}/status?status=${newStatus}`);
            toast.success(`Event status updated to ${newStatus} successfully!`, { id: loadingToast });
            await fetchMyEvents();
        } catch (err: any) {
            console.error('Failed to update event status:', err);
            toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update event status.', { id: loadingToast });
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

        const start = new Date(newEvent.startTime);
        const end = new Date(newEvent.endTime);
        if (start >= end) {
            toast.error('Event end time must be after start time.');
            return;
        }

        if (newEvent.registrationStart && newEvent.registrationEnd) {
            const regStart = new Date(newEvent.registrationStart);
            const regEnd = new Date(newEvent.registrationEnd);
            if (regStart >= regEnd) {
                toast.error('Registration end time must be after registration start time.');
                return;
            }
        }

        if (newEvent.registrationStart) {
            const regStart = new Date(newEvent.registrationStart);
            if (regStart >= start) {
                toast.error('Registration start time must be before event start time.');
                return;
            }
        }

        if (newEvent.registrationEnd) {
            const regEnd = new Date(newEvent.registrationEnd);
            if (regEnd >= end) {
                toast.error('Registration end time must be before event end time.');
                return;
            }
        }

        const loadingToast = toast.loading('Creating event...');
        try {
            await HackathonEventService.createHackathonEvent(newEvent);
            await fetchMyEvents();
            setIsCreateModalOpen(false);
            setNewEvent({ name: '', description: '', startTime: '', endTime: '', registrationStart: '', registrationEnd: '' });
            toast.success('Event created successfully', { id: loadingToast });
        } catch (err: any) {
            console.error('Failed to create hackathon event:', err);
            toast.error('Failed to create event: ' + (err.response?.data?.message || err.message), { id: loadingToast });
        }
    };

    const handleUpdateEvent = async () => {
        if (!editingEvent) return;

        if (!editingEvent.name || !editingEvent.startTime || !editingEvent.endTime) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const start = new Date(editingEvent.startTime);
        const end = new Date(editingEvent.endTime);
        if (start >= end) {
            toast.error('Event end time must be after start time.');
            return;
        }

        if (editingEvent.registrationStart && editingEvent.registrationEnd) {
            const regStart = new Date(editingEvent.registrationStart);
            const regEnd = new Date(editingEvent.registrationEnd);
            if (regStart >= regEnd) {
                toast.error('Registration end time must be after registration start time.');
                return;
            }
        }

        if (editingEvent.registrationStart) {
            const regStart = new Date(editingEvent.registrationStart);
            if (regStart >= start) {
                toast.error('Registration start time must be before event start time.');
                return;
            }
        }

        if (editingEvent.registrationEnd) {
            const regEnd = new Date(editingEvent.registrationEnd);
            if (regEnd >= end) {
                toast.error('Registration end time must be before event end time.');
                return;
            }
        }

        const loadingToast = toast.loading('Updating event...');
        try {
            await HackathonEventService.updateHackathonEvent(editingEvent.id, {
                name: editingEvent.name,
                description: editingEvent.description,
                startTime: editingEvent.startTime,
                endTime: editingEvent.endTime,
                registrationStart: editingEvent.registrationStart || undefined,
                registrationEnd: editingEvent.registrationEnd || undefined,
            });
            await fetchMyEvents();
            setIsEditModalOpen(false);
            setEditingEvent(null);
            toast.success('Event updated successfully', { id: loadingToast });
        } catch (err: any) {
            console.error('Failed to update event:', err);
            toast.error('Failed to update event: ' + (err.response?.data?.message || err.message), { id: loadingToast });
        }
    };

    const openEditModal = (event: MyEvent) => {
        setEditingEvent({
            ...event,
            startTime: formatDateTimeLocal(event.startTime),
            endTime: formatDateTimeLocal(event.endTime),
            registrationStart: formatDateTimeLocal(event.registrationStart),
            registrationEnd: formatDateTimeLocal(event.registrationEnd)
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
                                            <div className="flex items-center justify-end gap-2">
                                                {event.allowedStatusTransitions?.map((nextStatus) => (
                                                    <button
                                                        key={nextStatus}
                                                        onClick={() => handleStatusChange(event.id, nextStatus)}
                                                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer ${
                                                            nextStatus === 'PUBLISHED' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                                            nextStatus === 'IN_PROGRESS' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                                            nextStatus === 'COMPLETED' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                                                            nextStatus === 'CANCELLED' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                                            'bg-gray-600 hover:bg-gray-700 text-white'
                                                        }`}
                                                    >
                                                        {nextStatus === 'PUBLISHED' ? 'Publish' :
                                                         nextStatus === 'IN_PROGRESS' ? 'Start' :
                                                         nextStatus === 'COMPLETED' ? 'Complete' :
                                                         nextStatus === 'CANCELLED' ? 'Cancel' : nextStatus}
                                                    </button>
                                                ))}
                                                {(event.status === 'DRAFT' || event.status === 'PUBLISHED') && (
                                                    <button
                                                        onClick={() => openEditModal(event)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                                        title="Edit Event"
                                                    >
                                                        <Edit size={14} />
                                                        Edit
                                                    </button>
                                                )}
                                                <Link
                                                    to={`/organizer/events/${event.id}/dashboard`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                    title="Manage Event"
                                                >
                                                    <Eye size={14} />
                                                    Manage
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
                <div className="p-6">
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
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                placeholder="Enter event description"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Start</label>
                                <input
                                    type="datetime-local"
                                    value={newEvent.registrationStart}
                                    onChange={(e) => setNewEvent({ ...newEvent, registrationStart: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Registration End</label>
                                <input
                                    type="datetime-local"
                                    value={newEvent.registrationEnd}
                                    onChange={(e) => setNewEvent({ ...newEvent, registrationEnd: e.target.value })}
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

            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingEvent(null); }}>
                {editingEvent && (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-blue-600" />
                            Edit Hackathon Event
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                                <input
                                    type="text"
                                    value={editingEvent.name}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    placeholder="Enter event name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editingEvent.description || ''}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    placeholder="Enter event description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={editingEvent.startTime}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={editingEvent.endTime}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Start</label>
                                    <input
                                        type="datetime-local"
                                        value={editingEvent.registrationStart}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, registrationStart: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration End</label>
                                    <input
                                        type="datetime-local"
                                        value={editingEvent.registrationEnd}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, registrationEnd: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => { setIsEditModalOpen(false); setEditingEvent(null); }}
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
                )}
            </Modal>
        </div>
    );
};

export default OrganizerEventsPage;
