import React from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Trophy, 
    FileText, 
    Target, 
    Award, 
    ListOrdered, 
    Activity, 
    Calendar,
    LogOut,
    CheckSquare,
    Shield
} from 'lucide-react';
import Authorizable from './Authorizable';
import { Role } from '../services/authUtils';

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);
    
    return (
        <NavLink 
            to={to} 
            className={`flex items-center px-4 py-3 mx-2 my-1 rounded-lg transition-colors duration-200 ${
                isActive 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
        >
            <span className="mr-3">{icon}</span>
            <span className="font-medium">{label}</span>
        </NavLink>
    );
};

const Sidebar: React.FC = () => {
    return (
        <div className="w-64 h-screen bg-gray-900 text-white flex flex-col shadow-xl fixed">
            <div className="p-6 flex items-center gap-3 border-b border-gray-800">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Trophy size={24} className="text-white" />
                </div>
                <div className="text-2xl font-bold tracking-tight">HackManager</div>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main Menu</div>
                <SidebarItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                <SidebarItem to="/hackathon-events" icon={<Calendar size={20} />} label="Events" />
                <SidebarItem to="/tracks" icon={<Target size={20} />} label="Tracks" />
                
                <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Competition</div>
                <SidebarItem to="/teams" icon={<Users size={20} />} label="Teams" />
                <SidebarItem to="/team-members" icon={<Users size={20} />} label="Team Members" />
                <SidebarItem to="/submissions" icon={<FileText size={20} />} label="Submissions" />
                
                <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Evaluation</div>
                <SidebarItem to="/rounds" icon={<Activity size={20} />} label="Rounds" />
                <SidebarItem to="/criterion" icon={<CheckSquare size={20} />} label="Criterion" />
                <SidebarItem to="/scores" icon={<Award size={20} />} label="Scores" />
                <SidebarItem to="/rankings" icon={<ListOrdered size={20} />} label="Rankings" />
                <SidebarItem to="/prizes" icon={<Trophy size={20} />} label="Prizes" />
                
                <Authorizable allowedRoles={[Role.ADMIN]}>
                    <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Administration</div>
                    <SidebarItem to="/users" icon={<Users size={20} />} label="Users" />
                    <SidebarItem to="/audit-logs" icon={<Shield size={20} />} label="Audit Logs" />
                </Authorizable>
            </div>
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
        <header className="flex items-center justify-between w-full h-16 px-8 bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="text-xl font-semibold text-gray-800">
                {/* Could map current route to a title here, but keep simple for now */}
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
                <LogOut size={16} />
                Logout
            </button>
        </header>
    );
};

const Layout: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-grow ml-64">
                <Header />
                <main className="flex-grow p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;