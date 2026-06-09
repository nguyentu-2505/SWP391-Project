import React from 'react';
import { Link } from 'react-router-dom';

const MentorDirectoryPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-headline-lg font-bold text-on-surface mb-6">Mentor Directory</h1>
      <p className="text-body-md text-on-surface-variant mb-6">
        Browse and connect with mentors available to guide your hackathon project.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest border border-neutral-border rounded-lg p-6 shadow-floating flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl">
                JD
              </div>
              <div>
                <h3 className="text-headline-sm font-semibold text-on-surface">John Doe</h3>
                <span className="text-label-md text-primary font-semibold">Software Architecture</span>
              </div>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Expert in React, Node.js, and cloud deployment pipelines with 10+ years of industry experience.
            </p>
          </div>
          <Link
            to="/mentors/1"
            className="text-center bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-container"
          >
            View Profile & Request
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MentorDirectoryPage;
