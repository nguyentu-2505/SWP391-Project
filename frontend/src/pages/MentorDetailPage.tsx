import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserService, User } from '../services/UserService';
import { MentorshipRequestService } from '../services/MentorshipRequestService';
import { HackathonEventService } from '../services/HackathonEventService';
import api from '../services/api';

const MentorDetailPage: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const [mentor, setMentor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [teamId, setTeamId] = useState<number | ''>('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch Mentor
        const mentors = await UserService.getUsersByRole('MENTOR');
        const found = mentors.find(m => m.id === Number(mentorId));
        if (found) setMentor(found);

        // Try to find the user's teams from active events
        const events = await HackathonEventService.getHackathonEvents(0, 50);
        const teams = [];
        if (Array.isArray(events)) {
          for (const ev of events) {
            try {
              const res = await api.get(`/teams/my-team/event/${ev.id}`);
              if (res.data?.data?.id) {
                // Add event info to team for display
                teams.push({ ...res.data.data, eventName: ev.name });
              }
            } catch (e) {
              // Ignore errors (user not in team for this event)
            }
          }
        }
        setMyTeams(teams);
        if (teams.length > 0) {
          setTeamId(teams[0].id);
        }
      } catch (error) {
        console.error('Failed to init MentorDetailPage:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [mentorId]);

  const handleSubmit = async () => {
    if (!teamId) {
      setErrorMsg('You must select a team to request mentorship.');
      return;
    }
    if (!topic.trim()) {
      setErrorMsg('Topic cannot be empty.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      await MentorshipRequestService.createRequest({
        teamId: teamId,
        title: topic,
        description: description
      });
      setSuccess(true);
      setTopic('');
      setDescription('');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error?.message || error.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading mentor profile...</div>;
  }

  if (!mentor) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">Mentor not found!</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/mentors" className="text-primary hover:underline font-semibold text-sm">
          &larr; Back to Directory
        </Link>
      </div>
      <div className="bg-surface-container-lowest border border-neutral-border rounded-lg p-8 shadow-floating max-w-3xl">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-3xl uppercase">
            {mentor.username?.[0] || 'M'}
          </div>
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">{mentor.username}</h1>
            <p className="text-body-lg text-primary font-semibold">{mentor.email}</p>
            <p className="text-body-sm text-on-surface-variant">Mentor ID: {mentorId}</p>
          </div>
        </div>
        
        {/* We can show skills/bio here if added to the user model later */}

        <div className="border-t border-neutral-border pt-6 space-y-6">
          <div>
            <h3 className="text-headline-sm font-semibold text-on-surface mb-2">Request Mentorship</h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Note: Mentorship requests are broadcasted to all available mentors.
            </p>
            
            {errorMsg && <div className="text-red-500 mb-4 text-sm font-semibold">{errorMsg}</div>}
            {success && <div className="text-green-500 mb-4 text-sm font-semibold">Mentorship request submitted successfully!</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface">Select Team</label>
                {myTeams.length > 0 ? (
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(Number(e.target.value))}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-on-surface ring-1 ring-inset ring-outline-variant focus:ring-2 focus:ring-primary sm:text-sm bg-surface-container-lowest"
                  >
                    {myTeams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name || 'Unnamed Team'} ({t.eventName})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-2 text-sm text-red-500 font-semibold">
                    You are not in any active team. You must join a team to request mentorship.
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface">Topic / Title</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-on-surface ring-1 ring-inset ring-outline-variant focus:ring-2 focus:ring-primary sm:text-sm bg-surface-container-lowest"
                  placeholder="E.g., Need help with React Router"
                  disabled={myTeams.length === 0}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface">Description (Optional)</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-on-surface ring-1 ring-inset ring-outline-variant focus:ring-2 focus:ring-primary sm:text-sm bg-surface-container-lowest"
                  placeholder="Describe what you need help with in more detail..."
                  disabled={myTeams.length === 0}
                />
              </div>
              <button 
                onClick={handleSubmit}
                disabled={submitting || myTeams.length === 0}
                className="bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-container disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Mentorship Request'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDetailPage;
