import React, { useEffect, useState } from 'react';
import { HackathonEvent, HackathonEventService, CreateHackathonEventRequest, UpdateHackathonEventRequest } from '../services/HackathonEventService';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Calendar, Loader2 } from 'lucide-react';
import Authorizable from '../components/Authorizable';
import { Role } from '../services/authUtils';

const HackathonEventPage: React.FC = () => {
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<CreateHackathonEventRequest>({ name: '', description: '', startTime: '', endTime: '' });
  const [selectedEvent, setSelectedEvent] = useState<HackathonEvent | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await HackathonEventService.getAllEventsForAdmin();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch hackathon events:', error);
      toast.error('Failed to load hackathon events.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.name || !newEvent.startTime || !newEvent.endTime) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const loadingToast = toast.loading('Creating event...');
    try {
      await HackathonEventService.createHackathonEvent(newEvent);
      fetchEvents();
      setIsCreateModalOpen(false);
      setNewEvent({ name: '', description: '', startTime: '', endTime: '' });
      toast.success('Event created successfully', { id: loadingToast });
    } catch (error: any) {
      console.error('Failed to create hackathon event:', error);
      toast.error('Failed to create event: ' + (error.response?.data?.message || error.message), { id: loadingToast });
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
      };
      await HackathonEventService.updateHackathonEvent(selectedEvent.id, updateRequest);
      fetchEvents();
      setIsEditModalOpen(false);
      setSelectedEvent(null);
      toast.success('Event updated successfully', { id: loadingToast });
    } catch (error: any) {
      console.error('Failed to update hackathon event:', error);
      toast.error('Failed to update event: ' + (error.response?.data?.message || error.message), { id: loadingToast });
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    const loadingToast = toast.loading('Deleting event...');
    try {
      await HackathonEventService.deleteHackathonEvent(id);
      fetchEvents();
      toast.success('Event deleted successfully', { id: loadingToast });
    } catch (error: any) {
      console.error('Failed to delete hackathon event:', error);
      toast.error('Failed to delete event: ' + (error.response?.data?.message || error.message), { id: loadingToast });
    }
  };

  const openEditModal = (event: HackathonEvent) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-blue-600" />
            Hackathon Events
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage hackathon events, schedules and descriptions.</p>
        </div>
        
        <Authorizable allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Create Event
          </button>
        </Authorizable>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No events</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new hackathon event.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{event.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{event.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Authorizable 
                        allowedRoles={[Role.ADMIN, Role.ORGANIZER]} 
                        fallback={<span className="text-gray-400 text-xs italic">View Only</span>}
                      >
                        <div className="flex space-x-3">
                          <button
                            onClick={() => openEditModal(event)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </Authorizable>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                    type="text"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                        type="datetime-local"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                        type="datetime-local"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>
            </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
            <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Cancel
            </button>
            <button
                onClick={handleCreateEvent}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Create Event
            </button>
            </div>
        </div>
      </Modal>

      {selectedEvent && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Edit2 size={20} className="text-blue-600" />
                Edit Hackathon Event
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                  type="text"
                  value={selectedEvent.name}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={selectedEvent.description}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={selectedEvent.startTime}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={selectedEvent.endTime}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEvent}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

export default HackathonEventPage;
