import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserService, User } from '../services/UserService';

const MentorDirectoryPage: React.FC = () => {
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await UserService.getUsersByRole('MENTOR');
        setMentors(data);
      } catch (error: any) {
        console.error('Failed to fetch mentors:', error);
        setErrorMsg(error.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-headline-lg font-bold text-on-surface mb-6">Mentor Directory</h1>
      <p className="text-body-md text-on-surface-variant mb-6">
        Browse and connect with mentors available to guide your hackathon project.
      </p>

      {loading ? (
        <div className="text-center py-10">Loading mentors...</div>
      ) : errorMsg ? (
        <div className="text-center py-10 text-red-500">Error: {errorMsg}</div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-10 text-on-surface-variant">No mentors found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="bg-surface-container-lowest border border-neutral-border rounded-lg p-6 shadow-floating flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl uppercase">
                    {mentor.username?.[0] || 'M'}
                  </div>
                  <div>
                    <h3 className="text-headline-sm font-semibold text-on-surface">{mentor.username}</h3>
                    <span className="text-label-md text-primary font-semibold">{mentor.email}</span>
                  </div>
                </div>
                <p className="text-body-sm text-on-surface-variant mb-4">
                  Registered Mentor for SEAL Hackathon.
                </p>
              </div>
              <Link
                to={`/mentors/${mentor.id}`}
                className="text-center bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-container"
              >
                View Profile & Request
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorDirectoryPage;
