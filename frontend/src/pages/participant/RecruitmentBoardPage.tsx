import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Users, UserPlus, MessageSquare, Trash2, Plus, Calendar, Mail, ArrowLeft, Loader2, Info } from 'lucide-react';
import Modal from '../../components/Modal';

interface RecruitmentPost {
    id: number;
    type: string;
    title: string;
    content: string;
    userId: number;
    username: string;
    userEmail: string;
    teamId?: number;
    teamName?: string;
    createdAt: string;
}

const RecruitmentBoardPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [posts, setPosts] = useState<RecruitmentPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('ALL');
    const [myTeam, setMyTeam] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [eventDetails, setEventDetails] = useState<any>(null);

    // Form Modal states
    const [showModal, setShowModal] = useState(false);
    const [type, setType] = useState('LOOKING_FOR_TEAM');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPosts = async () => {
        try {
            const res = await api.get(`/recruitment/event/${eventId}`);
            setPosts(res.data.data ?? []);
        } catch (err: any) {
            toast.error('Failed to load recruitment posts');
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            // Get current user profile
            const profileRes = await api.get('/auth/profile');
            setCurrentUser(profileRes.data.data);

            // Get team details if any
            try {
                const teamRes = await api.get(`/teams/my-team/event/${eventId}`);
                setMyTeam(teamRes.data.data);
            } catch {
                setMyTeam(null);
            }

            // Get event details
            const eventRes = await api.get(`/hackathon-events/id/${eventId}`);
            setEventDetails(eventRes.data.data ?? eventRes.data);
        } catch (err) {
            console.error('Error fetching initial data:', err);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchPosts();
            fetchInitialData();
        }
    }, [eventId]);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error('Title and content are required.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                eventId: Number(eventId),
                type,
                title: title.trim(),
                content: content.trim(),
                teamId: type === 'LOOKING_FOR_MEMBERS' && myTeam ? myTeam.id : undefined
            };

            await api.post('/recruitment', payload);
            toast.success('Post created successfully!');
            setTitle('');
            setContent('');
            setShowModal(false);
            fetchPosts();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/recruitment/${postId}`);
            toast.success('Post deleted successfully');
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete post');
        }
    };

    const filteredPosts = posts.filter(post => {
        if (filterType === 'ALL') return true;
        return post.type === filterType;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-brand-orange" size={36} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <Link to={`/events/id/${eventId}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2">
                        <ArrowLeft size={14} />
                        Back to Hackathon
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Team Recruitment Board</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Find a team to join or recruit talented members for your team in <span className="text-brand-orange font-medium">{eventDetails?.title}</span>
                    </p>
                </div>
                <div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover-interactive"
                    >
                        <Plus size={16} />
                        Create Recruitment Post
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-slate-800 mb-6 gap-2">
                <button
                    onClick={() => setFilterType('ALL')}
                    className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${filterType === 'ALL' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                    All Posts ({posts.length})
                </button>
                <button
                    onClick={() => setFilterType('LOOKING_FOR_TEAM')}
                    className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${filterType === 'LOOKING_FOR_TEAM' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                    Looking for Teams
                </button>
                <button
                    onClick={() => setFilterType('LOOKING_FOR_MEMBERS')}
                    className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${filterType === 'LOOKING_FOR_MEMBERS' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                    Looking for Members
                </button>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-brand-navy/30 border border-slate-800/80 rounded-xl p-8">
                    <MessageSquare size={48} className="mx-auto text-slate-600 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-1">No posts found</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        There are no recruitment posts in this category yet. Be the first to share one!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPosts.map(post => {
                        const isOwner = currentUser?.id === post.userId;
                        const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'ORGANIZER';

                        return (
                            <div key={post.id} className="flex flex-col justify-between p-5 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl transition-all duration-200 card-interactive">
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${post.type === 'LOOKING_FOR_TEAM' ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-green-900/20 text-green-400 border-green-800/50'}`}>
                                            {post.type === 'LOOKING_FOR_TEAM' ? 'LOOKING FOR TEAM' : 'RECRUITING MEMBERS'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-medium">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-white mb-2 leading-snug">{post.title}</h3>
                                    <p className="text-sm text-slate-300 mb-4 whitespace-pre-line leading-relaxed">{post.content}</p>
                                </div>

                                <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-semibold text-slate-200">{post.username}</span>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <Mail size={12} className="text-slate-500" />
                                            <a href={`mailto:${post.userEmail}`} className="hover:underline text-slate-400 hover:text-brand-orange">{post.userEmail}</a>
                                        </div>
                                        {post.teamName && (
                                            <span className="text-[11px] text-slate-400 mt-1">
                                                Team: <strong className="text-brand-orange">{post.teamName}</strong>
                                            </span>
                                        )}
                                    </div>

                                    {(isOwner || isAdmin) && (
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="self-end sm:self-auto p-1.5 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                                            title="Delete Post"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Post Modal */}
            {showModal && (
                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Recruitment Post">
                    <form onSubmit={handleCreatePost} className="space-y-4 p-2">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Post Type</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                            >
                                <option value="LOOKING_FOR_TEAM">I am looking for a team to join</option>
                                <option value="LOOKING_FOR_MEMBERS" disabled={!myTeam}>
                                    My team is looking for new members {!myTeam && '(You must be in a team)'}
                                </option>
                            </select>
                        </div>

                        {type === 'LOOKING_FOR_MEMBERS' && myTeam && (
                            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center gap-2 text-xs text-brand-orange">
                                <Info size={14} className="shrink-0" />
                                <span>This post will be linked to your team: <strong>{myTeam.name}</strong></span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Post Title *</label>
                            <input
                                type="text"
                                placeholder="e.g. Frontend Developer looking for a Web dev team!"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description & Contact *</label>
                            <textarea
                                placeholder="Describe your skills, what project ideas you have, or what roles your team needs. Don't forget to include how you'd like people to reach out!"
                                rows={5}
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-slate-800 text-slate-300 hover:bg-slate-900 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                            >
                                {submitting ? 'Creating...' : 'Submit Post'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default RecruitmentBoardPage;
