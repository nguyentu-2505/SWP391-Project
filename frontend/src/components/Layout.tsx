import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { 
    LayoutDashboard, Users, Trophy, FileText, Target, Award, ListOrdered, 
    Activity, Calendar, LogOut, CheckSquare, Shield, UserPlus, Mail, 
    BookUser, HelpCircle, User as UserIcon, Menu, X
} from 'lucide-react';
import { Role, getUserRole } from '../services/authUtils';

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);
    
    return (
        <NavLink 
            to={to} 
            onClick={onClick}
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

const MenuSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <>
        <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">{title}</div>
        {children}
    </>
);

const Sidebar: React.FC<{ isOpen: boolean, closeSidebar: () => void }> = ({ isOpen, closeSidebar }) => {
    const userRole = getUserRole();

    const renderMenu = () => {
        switch (userRole) {
            case Role.ADMIN:
                return (
                    <>
                        <MenuSection title="Main Menu">
                            <SidebarItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={closeSidebar} />
                            <SidebarItem to="/hackathon-events" icon={<Calendar size={20} />} label="Events" onClick={closeSidebar} />
                        </MenuSection>
                        <MenuSection title="Administration">
                            <SidebarItem to="/admin/users" icon={<Users size={20} />} label="User Management" onClick={closeSidebar} />
                            <SidebarItem to="/admin/pending-approvals" icon={<UserPlus size={20} />} label="Pending Approvals" onClick={closeSidebar} />
                            <SidebarItem to="/admin/audit-logs" icon={<Shield size={20} />} label="Audit Logs" onClick={closeSidebar} />
                        </MenuSection>
                    </>
                );
            case Role.ORGANIZER:
                 return (
                    <>
                        <MenuSection title="Main Menu">
                            <SidebarItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={closeSidebar} />
                            <SidebarItem to="/organizer/events" icon={<Calendar size={20} />} label="Manage Events" onClick={closeSidebar} />
                        </MenuSection>
                        <MenuSection title="Evaluation">
                             <SidebarItem to="/rankings" icon={<ListOrdered size={20} />} label="Rankings" onClick={closeSidebar} />
                             <SidebarItem to="/prizes" icon={<Trophy size={20} />} label="Prizes" onClick={closeSidebar} />
                        </MenuSection>
                    </>
                );
            case Role.PARTICIPANT:
                return (
                    <>
                        <MenuSection title="Main Menu">
                            <SidebarItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={closeSidebar} />
                            <SidebarItem to="/events" icon={<Calendar size={20} />} label="Find Events" onClick={closeSidebar} />
                        </MenuSection>
                        <MenuSection title="My Competition">
                            <SidebarItem to="/my-team" icon={<Users size={20} />} label="My Team" onClick={closeSidebar} />
                            <SidebarItem to="/invitations" icon={<Mail size={20} />} label="Invitations" onClick={closeSidebar} />
                            <SidebarItem to="/submissions/new" icon={<FileText size={20} />} label="Submit Project" onClick={closeSidebar} />
                        </MenuSection>
                    </>
                );
            case Role.JUDGE:
                 return (
                    <MenuSection title="Judging">
                        <SidebarItem to="/judge/dashboard" icon={<LayoutDashboard size={20} />} label="My Assignments" onClick={closeSidebar} />
                    </MenuSection>
                );
            case Role.MENTOR:
                return (
                    <MenuSection title="Mentorship">
                        <SidebarItem to="/mentor/dashboard" icon={<LayoutDashboard size={20} />} label="My Sessions" onClick={closeSidebar} />
                        <SidebarItem to="/mentor/requests" icon={<HelpCircle size={20} />} label="Open Requests" onClick={closeSidebar} />
                    </MenuSection>
                );
            default:
                return (
                     <MenuSection title="Main Menu">
                        <SidebarItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={closeSidebar} />
                     </MenuSection>
                );
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
                    onClick={closeSidebar}
                />
            )}
            
            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col shadow-xl 
                transform transition-transform duration-300 ease-in-out md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Trophy size={24} className="text-white" />
                        </div>
                        <div className="text-xl font-bold tracking-tight">HackManager</div>
                    </div>
                    <button onClick={closeSidebar} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                    {renderMenu()}
                </div>
            </div>
        </>
    );
};

const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    return (
        <header className="flex items-center justify-between w-full h-16 px-4 md:px-8 bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar} 
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                <NotificationBell />
                 <NavLink to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors hidden sm:flex">
                    <UserIcon size={16} />
                    Profile
                </NavLink>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};

const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
            <div className="flex flex-col flex-grow md:ml-64 transition-all duration-300 w-full min-w-0">
                <Header toggleSidebar={() => setSidebarOpen(true)} />
                <main className="flex-grow p-4 md:p-8 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;