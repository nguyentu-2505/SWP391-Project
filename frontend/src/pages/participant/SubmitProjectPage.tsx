import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { UploadCloud, Link as LinkIcon, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

interface Round {
    id: number;
    name: string;
}

interface TeamDetails {
    id: number;
    name: string;
}

const SubmitProjectPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    const [roundId, setRoundId] = useState<number | ''>('');
    const [repositoryUrl, setRepositoryUrl] = useState('');
    const [demoUrl, setDemoUrl] = useState('');
    const [reportUrl, setReportUrl] = useState('');
    
    const [myTeam, setMyTeam] = useState<TeamDetails | null>(null);
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    // Validation states
    const [repoError, setRepoError] = useState('');
    const [demoError, setDemoError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;
            try {
                const [teamRes, roundsRes] = await Promise.all([
                    api.get(`/teams/my-team/event/${eventId}`),
                    api.get(`/rounds/hackathon/${eventId}`)
                ]);
                setMyTeam(teamRes.data.data);
                
                const roundsData = roundsRes.data.data ?? roundsRes.data;
                setRounds(Array.isArray(roundsData) ? roundsData : []);
            } catch (err) {
                setError('Failed to load necessary data for submission. Are you in a team for this event?');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [eventId]);

    const isValidUrl = (url: string) => {
        if (!url) return true; // Optional fields are valid if empty
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        } catch {
            return false;
        }
    };

    const validateForm = () => {
        let valid = true;
        
        if (!repositoryUrl) {
            setRepoError('Repository URL is required');
            valid = false;
        } else if (!isValidUrl(repositoryUrl)) {
            setRepoError('Please enter a valid URL (must start with http:// or https://)');
            valid = false;
        } else {
            setRepoError('');
        }

        if (demoUrl && !isValidUrl(demoUrl)) {
            setDemoError('Please enter a valid URL (must start with http:// or https://)');
            valid = false;
        } else {
            setDemoError('');
        }

        if (!roundId) {
            setError('Please select a round.');
            valid = false;
        }

        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) return;
        if (!myTeam) {
            setError('You must be in a team to submit a project.');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/submissions', {
                teamId: myTeam.id,
                roundId: roundId,
                repositoryUrl,
                demoUrl,
                reportUrl
            });
            toast.success('Project submitted successfully!');
            navigate(`/dashboard`);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Failed to submit project. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="max-w-3xl mx-auto flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error && !myTeam) {
        return (
            <div className="max-w-3xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Cannot Submit Project</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <Link to="/dashboard" className="inline-flex items-center text-red-700 font-medium hover:underline">
                    <ChevronLeft size={16} className="mr-1" /> Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ChevronLeft size={16} className="mr-1" />
                    Back
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Submit Project</h1>
                <p className="text-gray-500 mt-2">Submit your team's work for evaluation by the judges.</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                {/* Team Info Banner */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                    <CheckCircle2 className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-sm font-medium text-blue-900">Submitting on behalf of team:</p>
                        <p className="text-blue-700 font-bold text-lg">{myTeam?.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Round Selection */}
                    <div>
                        <label htmlFor="round" className="block text-sm font-semibold text-gray-900 mb-1.5">
                            Select Round <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="round"
                            value={roundId}
                            onChange={(e) => {
                                setRoundId(Number(e.target.value));
                                setError('');
                            }}
                            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-shadow ${
                                !roundId && error ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500 bg-white'
                            }`}
                        >
                            <option value="" disabled>-- Select the round you are submitting for --</option>
                            {rounds.map(round => (
                                <option key={round.id} value={round.id}>{round.name}</option>
                            ))}
                        </select>
                        {rounds.length === 0 && (
                            <p className="mt-1.5 text-xs text-amber-600 font-medium flex items-center gap-1">
                                <AlertCircle size={12} /> No rounds available for this event yet.
                            </p>
                        )}
                    </div>

                    {/* Repository URL */}
                    <div>
                        <label htmlFor="repoUrl" className="block text-sm font-semibold text-gray-900 mb-1.5">
                            Repository URL <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <LinkIcon size={16} className="text-gray-400" />
                            </div>
                            <input
                                id="repoUrl"
                                type="text"
                                placeholder="https://github.com/your-username/project"
                                value={repositoryUrl}
                                onChange={(e) => {
                                    setRepositoryUrl(e.target.value);
                                    if (repoError) validateForm();
                                }}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-shadow ${
                                    repoError ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                }`}
                            />
                        </div>
                        {repoError && <p className="mt-1.5 text-sm text-red-600 font-medium">{repoError}</p>}
                    </div>

                    {/* Demo URL */}
                    <div>
                        <label htmlFor="demoUrl" className="block text-sm font-semibold text-gray-900 mb-1.5">
                            Demo URL <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <UploadCloud size={16} className="text-gray-400" />
                            </div>
                            <input
                                id="demoUrl"
                                type="text"
                                placeholder="https://your-demo-site.com"
                                value={demoUrl}
                                onChange={(e) => {
                                    setDemoUrl(e.target.value);
                                    if (demoError) validateForm();
                                }}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-shadow ${
                                    demoError ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                }`}
                            />
                        </div>
                        {demoError ? (
                            <p className="mt-1.5 text-sm text-red-600 font-medium">{demoError}</p>
                        ) : (
                            <p className="mt-1.5 text-xs text-gray-500">Provide a link to a live demo, video, or presentation if available.</p>
                        )}
                    </div>

                    {error && !repoError && !demoError && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100 flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={submitting || !myTeam || rounds.length === 0}
                            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Project'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitProjectPage;