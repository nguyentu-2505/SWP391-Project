import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
    return (
        <div className="w-64 h-screen bg-gray-800 text-white">
            <div className="p-4 text-2xl font-bold">SEAL</div>
            <nav className="mt-10">
                <NavLink to="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-700">Dashboard</NavLink>
                <NavLink to="/teams" className="block px-4 py-2 text-sm hover:bg-gray-700">Teams</NavLink>
                <NavLink to="/rounds" className="block px-4 py-2 text-sm hover:bg-gray-700">Rounds</NavLink>
                <NavLink to="/submissions" className="block px-4 py-2 text-sm hover:bg-gray-700">Submissions</NavLink>
                <NavLink to="/users" className="block px-4 py-2 text-sm hover:bg-gray-700">Users</NavLink>
                <NavLink to="/prizes" className="block px-4 py-2 text-sm hover:bg-gray-700">Prizes</NavLink>
                <NavLink to="/scores" className="block px-4 py-2 text-sm hover:bg-gray-700">Scores</NavLink>
                <NavLink to="/tracks" className="block px-4 py-2 text-sm hover:bg-gray-700">Tracks</NavLink>
                <NavLink to="/rankings" className="block px-4 py-2 text-sm hover:bg-gray-700">Rankings</NavLink>
                <NavLink to="/audit-logs" className="block px-4 py-2 text-sm hover:bg-gray-700">Audit Logs</NavLink>
            </nav>
        </div>
    );
};

const Header: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    return (
        <header className="flex items-center justify-end w-full h-16 px-4 bg-white shadow">
            <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
                Logout
            </button>
        </header>
    );
};

const Layout: React.FC = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex flex-col flex-grow">
                <Header />
                <main className="flex-grow p-6 bg-gray-100">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;