import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { UploadCloud, Link as LinkIcon, AlertCircle, CheckCircle2, ChevronLeft, ArrowLeft, Send } from 'lucide-react';

interface Round {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    gradingEnded?: boolean;
    gradingEndTime?: string;
}

interface TeamDetails {
    id: number;
    name: string;
    status: string;
    trackName?: string;
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
    const [event, setEvent] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [eventData, setEventData] = useState<any>(null);

    // Validation states
    const [repoError, setRepoError] = useState('');
    const [demoError, setDemoError] = useState('');
    const [reportError, setReportError] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const max_size = 20 * 1024 * 1024;
        if (file.size > max_size) {
            toast.error("File size exceeds 20MB limit.");
            return;
        }

        const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (extension !== ".pdf" && extension !== ".zip" && extension !== ".pptx") {
            toast.error("Only .pdf, .zip, and .pptx files are allowed.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setUploadingFile(true);
        try {
            const res = await api.post("/files/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            const fileUrl = res.data.url;
            setReportUrl(fileUrl);
            toast.success("File uploaded successfully!");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to upload file.";
            toast.error(msg);
        } finally {
            setUploadingFile(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;
            try {
                const [teamRes, roundsRes, eventRes] = await Promise.all([
                    api.get(`/teams/my-team/event/${eventId}`),
                    api.get(`/rounds/hackathon/${eventId}`),
                    api.get(`/hackathon-events/id/${eventId}`)
                ]);
                setMyTeam(teamRes.data.data);
                setEvent(eventRes.data.data ?? eventRes.data);

                const roundsData = roundsRes.data.data ?? roundsRes.data;
                const fetchedRounds = Array.isArray(roundsData) ? roundsData : [];
                setRounds(fetchedRounds);

                // Auto detect active round based on current date
                const now = new Date();
                const active = fetchedRounds.find((r: any) => {
                    if (r.gradingEnded) return false;
                    const start = new Date(r.startTime);
                    const end = new Date(r.endTime);
                    const gradingEnd = r.gradingEndTime ? new Date(r.gradingEndTime) : null;
                    if (gradingEnd && now >= gradingEnd) return false;
                    return now >= start && now <= end;
                });
                if (active) {
                    setRoundId(active.id);
                } else {
                    setRoundId('');
                }
            } catch (err: any) {
                console.error(err);
                if (err.response?.status === 404) {
                    setError('You are not in any team for this hackathon, or your team does not exist.');
                } else {
                    setError('Unable to load necessary submission data. Please check your connection or contact the organizer.');
                }
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [eventId]);

    const activeRound = rounds.find(r => {
        if (r.gradingEnded) return false;
        const now = new Date();
        const start = new Date(r.startTime);
        const end = new Date(r.endTime);
        const gradingEnd = r.gradingEndTime ? new Date(r.gradingEndTime) : null;
        if (gradingEnd && now >= gradingEnd) return false;
        return now >= start && now <= end;
    });

    const nextRound = rounds.length > 0 ? [...rounds]
        .filter(r => new Date(r.startTime) > new Date())
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] : null;

    const isValidUrl = (url: string) => {
        if (!url) return true; // Optional fields are valid if empty
        const regex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
        return regex.test(url);
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

        if (reportUrl && !isValidUrl(reportUrl)) {
            setReportError('Please enter a valid URL (must start with http:// or https://)');
            valid = false;
        } else {
            setReportError('');
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
                repositoryUrl: repositoryUrl.trim(),
                demoUrl: demoUrl.trim() || undefined,
                reportUrl: reportUrl.trim() || undefined
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-container"></div>
            </div>
        );
    }

    if (error && !myTeam) {
        return (
            <div className="max-w-3xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                <h3 className="text-lg font-bold text-red-800 mb-2">Cannot Submit Project</h3>
                <p className="text-red-600 mb-6 text-sm">{error}</p>
                <Link to="/dashboard" className="inline-flex items-center text-primary-container font-semibold hover:underline text-sm">
                    <ChevronLeft size={16} className="mr-1" /> Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors mb-2">
                <ArrowLeft size={16} />
                Back to Dashboard
            </Link>

            <div className="bg-white p-6 md:p-8 rounded-xl border border-outline-variant shadow-sm space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight flex items-center gap-2">
                        <UploadCloud size={28} className="text-primary-container" />
                        Submit Project
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-1">Submit your team's project repository and demo links for evaluation.</p>
                </div>

                {/* Team Info Banner */}
                <div className="bg-primary-container/5 border border-primary-container/20 rounded-xl p-4 flex items-start gap-3 text-primary">
                    <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Submitting on behalf of:</p>
                        <p className="font-bold text-lg text-on-surface mt-1">{myTeam?.name}</p>
                    </div>
                </div>

                {myTeam?.status === 'DISQUALIFIED' ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-bold">Disqualified</p>
                            <p className="text-sm mt-1">Your team has been disqualified by the organizer and cannot make submissions.</p>
                        </div>
                    </div>
                ) : myTeam?.status !== 'FINALIZED' ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-bold">Team Not Finalized</p>
                            <p className="text-sm mt-1">The team leader must finalize the team before making submissions.</p>
                        </div>
                    </div>
                ) : event?.status !== 'IN_PROGRESS' ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-bold">Hackathon Not Started</p>
                            <p className="text-sm mt-1">The hackathon has not transitioned to "In Progress" yet. Please check back later.</p>
                        </div>
                    </div>
                ) : rounds.length === 0 ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-bold">Rounds Not Configured</p>
                            <p className="text-sm mt-1">The organizer has not configured any rounds for this event yet.</p>
                        </div>
                    </div>
                ) : eventData && new Date() > new Date(eventData.endTime) ? (
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-bold text-base">Event Ended</p>
                            <p className="text-sm mt-1 text-gray-600">You cannot submit projects after the event has ended.</p>
                        </div>
                    </div>
                ) : !activeRound ? (
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={20} />
                        <div>
                            {nextRound ? (
                                <>
                                    <p className="font-bold text-base">Submission Window Closed</p>
                                    <p className="text-sm mt-1 text-gray-600">
                                        The next round <strong>"{nextRound.name}"</strong> will accept submissions starting: <strong>{new Date(nextRound.startTime).toLocaleString()}</strong>.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-bold text-base">Submissions Currently Closed</p>
                                    <p className="text-sm mt-1 text-gray-600">The submission portal is closed for grading or round advancement. Please check back later.</p>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Active Round & Track Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                    Submitting for Round
                                </label>
                                <div className="px-3 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-sm font-semibold text-gray-900">
                                    {activeRound.name}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                    Track
                                </label>
                                <div className="px-3 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-sm font-semibold text-gray-900">
                                    {myTeam?.trackName || 'General Track'}
                                </div>
                            </div>
                        </div>

                        {/* Repository URL */}
                        <div>
                            <label htmlFor="repoUrl" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                Repository URL <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <LinkIcon size={16} />
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
                                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all ${repoError ? 'border-red-300 focus:border-red-500' : 'border-outline-variant focus:border-primary-container'
                                        }`}
                                />
                            </div>
                            {repoError && <p className="mt-1.5 text-xs text-red-600 font-medium">{repoError}</p>}
                        </div>

                        {/* Demo URL */}
                        <div>
                            <label htmlFor="demoUrl" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                Demo URL <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <LinkIcon size={16} />
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
                                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all ${demoError ? 'border-red-300 focus:border-red-500' : 'border-outline-variant focus:border-primary-container'
                                        }`}
                                />
                            </div>
                            {demoError ? (
                                <p className="mt-1.5 text-xs text-red-600 font-medium">{demoError}</p>
                            ) : (
                                <p className="mt-1.5 text-xs text-on-surface-variant">Provide a link to a live demo, video, or presentation if available.</p>
                            )}
                        </div>

                        {/* Report URL or File Upload */}
                        <div>
                            <label htmlFor="reportUrl" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                Report URL or Upload Project File <span className="text-slate-400 font-normal normal-case">(Optional, max 20MB)</span>
                            </label>
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <LinkIcon size={16} />
                                    </div>
                                    <input
                                        id="reportUrl"
                                        type="text"
                                        placeholder="https://docs.google.com/..."
                                        value={reportUrl}
                                        onChange={(e) => {
                                            setReportUrl(e.target.value);
                                            if (reportError) validateForm();
                                        }}
                                        className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all ${reportError ? 'border-red-300 focus:border-red-500' : 'border-outline-variant focus:border-primary-container'
                                            }`}
                                    />
                                </div>
                                <div className="shrink-0 flex items-center">
                                    <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer transition-all border border-slate-700 font-medium text-sm">
                                        <UploadCloud size={16} className={uploadingFile ? "animate-bounce" : ""} />
                                        {uploadingFile ? "Uploading..." : "Upload PDF/ZIP/PPTX"}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.zip,.pptx"
                                            onChange={handleFileUpload}
                                            disabled={uploadingFile}
                                        />
                                    </label>
                                </div>
                            </div>
                            {reportError ? (
                                <p className="mt-1.5 text-xs text-red-600 font-medium">{reportError}</p>
                            ) : (
                                <p className="mt-1.5 text-xs text-on-surface-variant">Provide a URL link or upload a file directly. Supported: .pdf, .zip, .pptx.</p>
                            )}
                        </div>

                        {error && !repoError && !demoError && !reportError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !myTeam || rounds.length === 0}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg font-bold text-sm text-white bg-primary-container hover:bg-[#d9611b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Submit Project
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SubmitProjectPage;