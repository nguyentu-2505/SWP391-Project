import React from 'react';

const NotificationsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-headline-lg font-bold text-on-surface mb-6">Notification Center</h1>
      <div className="bg-surface-container-lowest border border-neutral-border rounded-lg shadow-floating overflow-hidden">
        <div className="p-4 border-b border-neutral-border flex justify-between items-center">
          <span className="text-label-lg text-on-surface font-semibold">Recent Alerts</span>
          <button className="text-primary hover:text-primary-container text-sm font-semibold">
            Mark all as read
          </button>
        </div>
        <div className="divide-y divide-neutral-border">
          <div className="p-6 flex items-start space-x-4 bg-surface-container-low">
            <div className="flex-1">
              <p className="text-body-md text-on-surface font-semibold">Team Advancement Approved</p>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Congratulations! Your team has advanced to the final round. Please update your submission materials.
              </p>
              <span className="text-label-md text-on-surface-variant block mt-2">10 minutes ago</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
          </div>
          <div className="p-6 flex items-start space-x-4">
            <div className="flex-1">
              <p className="text-body-md text-on-surface">Mentorship Request Accepted</p>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Mentor John Doe accepted your request for technical guidance. Check your emails for session links.
              </p>
              <span className="text-label-md text-on-surface-variant block mt-2">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
