import React from 'react';
import { useParams, Link } from 'react-router-dom';

const MentorDetailPage: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/mentors" className="text-primary hover:underline font-semibold text-sm">
          &larr; Back to Directory
        </Link>
      </div>
      <div className="bg-surface-container-lowest border border-neutral-border rounded-lg p-8 shadow-floating max-w-3xl">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-3xl">
            JD
          </div>
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">John Doe</h1>
            <p className="text-body-lg text-primary font-semibold">Software Architect & Advisor</p>
            <p className="text-body-sm text-on-surface-variant">Mentor ID: {mentorId}</p>
          </div>
        </div>
        <div className="border-t border-neutral-border pt-6 space-y-6">
          <div>
            <h3 className="text-headline-sm font-semibold text-on-surface mb-2">Biography</h3>
            <p className="text-body-md text-on-surface-variant">
              John is a software engineering leader with a passion for mentoring student developers.
            </p>
          </div>
          <div>
            <h3 className="text-headline-sm font-semibold text-on-surface mb-2">Request Mentorship</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface">Topic / Question</label>
                <textarea
                  rows={4}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-on-surface ring-1 ring-inset ring-outline-variant focus:ring-2 focus:ring-primary sm:text-sm bg-surface-container-lowest"
                  placeholder="Describe what you need help with..."
                />
              </div>
              <button className="bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-container">
                Submit Mentorship Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDetailPage;
