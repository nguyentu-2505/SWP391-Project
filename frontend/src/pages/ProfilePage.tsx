import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Link, BookOpen, School, Hash, Loader2, Save } from 'lucide-react';

interface ProfileData {
    username: string;
    email: string;
    fullName: string;
    fptStudentId: string;
    schoolName: string;
    githubUrl: string;
    skills: string;
    role: string;
}

interface FormState {
    fullName: string;
    fptStudentId: string;
    schoolName: string;
    githubUrl: string;
    skills: string;
}

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [form, setForm] = useState<FormState>({
        fullName: '',
        fptStudentId: '',
        schoolName: '',
        githubUrl: '',
        skills: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/profile/me');
                const data: ProfileData = response.data.data;
                setProfile(data);
                setForm({
                    fullName: data.fullName ?? '',
                    fptStudentId: data.fptStudentId ?? '',
                    schoolName: data.schoolName ?? '',
                    githubUrl: data.githubUrl ?? '',
                    skills: data.skills ?? '',
                });
            } catch {
                toast.error('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/profile/me', form);
            setProfile(prev => prev ? { ...prev, ...response.data.data } : prev);
            toast.success('Profile updated successfully!');
        } catch {
            toast.error('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
    );

    const roleColors: Record<string, string> = {
        ADMIN: 'bg-red-100 text-red-700',
        ORGANIZER: 'bg-purple-100 text-purple-700',
        JUDGE: 'bg-yellow-100 text-yellow-700',
        MENTOR: 'bg-teal-100 text-teal-700',
        PARTICIPANT: 'bg-blue-100 text-blue-700',
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile header card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        {profile?.username?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{profile?.username}</h1>
                        <p className="text-sm text-gray-500">{profile?.email}</p>
                        {profile?.role && (
                            <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[profile.role] ?? 'bg-gray-100 text-gray-600'}`}>
                                {profile.role}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Edit Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <span className="flex items-center gap-1.5"><User size={14} /> Full Name</span>
                        </label>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                            placeholder="Your full name"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* FPT Student ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="flex items-center gap-1.5"><Hash size={14} /> FPT Student ID</span>
                            </label>
                            <input
                                type="text"
                                value={form.fptStudentId}
                                onChange={e => setForm(f => ({ ...f, fptStudentId: e.target.value }))}
                                placeholder="e.g. SE170001"
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* School Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="flex items-center gap-1.5"><School size={14} /> School / University</span>
                            </label>
                            <input
                                type="text"
                                value={form.schoolName}
                                onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))}
                                placeholder="e.g. FPT University"
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* GitHub URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <span className="flex items-center gap-1.5"><Link size={14} /> GitHub URL</span>
                        </label>
                        <input
                            type="url"
                            value={form.githubUrl}
                            onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
                            placeholder="https://github.com/yourusername"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {form.githubUrl && (
                            <a
                                href={form.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                            >
                                View profile ↗
                            </a>
                        )}
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <span className="flex items-center gap-1.5"><BookOpen size={14} /> Skills</span>
                        </label>
                        <textarea
                            rows={3}
                            value={form.skills}
                            onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                            placeholder="e.g. React, Spring Boot, Machine Learning, UI/UX Design"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">Separate skills with commas. This helps teams find the right collaborators.</p>
                    </div>

                    {/* Skills Preview */}
                    {form.skills && (
                        <div className="flex flex-wrap gap-1.5">
                            {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                                <span key={skill} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
