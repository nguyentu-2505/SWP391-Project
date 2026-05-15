import React from 'react';
import { Trophy, Users, Calendar, Award } from 'lucide-react';
import { getUserRole } from '../services/authUtils';

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, bgColor: string }> = ({ title, value, icon, bgColor }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
        <div className={`p-4 rounded-lg mr-4 ${bgColor}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    const role = getUserRole();
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back! You are logged in as <span className="font-semibold text-blue-600">{role}</span>.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Active Events" 
                    value="3" 
                    icon={<Calendar size={24} className="text-blue-600" />} 
                    bgColor="bg-blue-50"
                />
                <StatCard 
                    title="Total Teams" 
                    value="42" 
                    icon={<Users size={24} className="text-green-600" />} 
                    bgColor="bg-green-50"
                />
                <StatCard 
                    title="Submissions" 
                    value="156" 
                    icon={<Trophy size={24} className="text-purple-600" />} 
                    bgColor="bg-purple-50"
                />
                <StatCard 
                    title="Prizes Awarded" 
                    value="$15k" 
                    icon={<Award size={24} className="text-yellow-600" />} 
                    bgColor="bg-yellow-50"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="text-gray-500 text-sm py-4 text-center">
                    No recent activity to display.
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;