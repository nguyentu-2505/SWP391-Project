import React from 'react';
import { useParams, Link } from 'react-router-dom';

const TeamDetailPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/teams" className="text-primary hover:underline font-semibold text-sm">
          &larr; Back to Teams
        </Link>
      </div>
      <div className="bg-surface-container-lowest border border-neutral-border rounded-lg p-8 shadow-floating max-w-3xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">Alpha Coders</h1>
            <p className="text-body-md text-on-surface-variant">Team ID: {teamId}</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-status-active-bg text-status-active-text">
            Active
          </span>
        </div>
        <div className="border-t border-neutral-border pt-6 space-y-6">
          <div>
            <h3 className="text-headline-sm font-semibold text-on-surface mb-4">Members</h3>
            <ul className="divide-y divide-neutral-border border border-neutral-border rounded-md overflow-hidden bg-surface-container-lowest">
              <li className="p-4 flex justify-between items-center">
                <span className="font-semibold text-on-surface">Alice (Leader)</span>
                <span className="text-sm text-on-surface-variant">alice@example.com</span>
              </li>
              <li className="p-4 flex justify-between items-center">
                <span className="text-on-surface">Bob</span>
                <span className="text-sm text-on-surface-variant">bob@example.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailPage;
