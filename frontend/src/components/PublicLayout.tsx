import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Trophy, LogIn } from 'lucide-react';
import { isAuthenticated } from '../services/authUtils';

const PublicHeader: React.FC = () => {
    const navigate = useNavigate();
    const loggedIn = isAuthenticated();

    return (
        <header className="flex items-center justify-between w-full h-16 px-8 bg-white border-b border-gray-200 sticky top-0 z-10">
             <Link to="/" className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Trophy size={24} className="text-white" />
                </div>
                <div className="text-2xl font-bold tracking-tight text-gray-900">HackManager</div>
            </Link>
            
            {loggedIn ? (
                 <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go to Dashboard
                </button>
            ) : (
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <LogIn size={16} />
                    Sign In
                </button>
            )}
        </header>
    );
};


const PublicLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <PublicHeader />
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    );
};

export default PublicLayout;
