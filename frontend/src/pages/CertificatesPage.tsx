import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Trophy, Award, Printer, Sparkles, User, Search, Filter, Calendar, Layers, X, AlertCircle, Copy, CheckCircle, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CertificateData {
    studentId: number;
    username: string;
    eventId: number;
    eventName: string;
    studentName: string;
    userRoleInTeam: 'Team Leader' | 'Team Member';
    teamName: string;
    trackName: string;
    roundName: string;
    rank: number | null;
    awardTitle: string;
    issueDate: string;
    eventSeason: string;
    rawDate: Date;
}

const isNonStudentName = (name: string, role?: string) => {
    if (role && (role === 'JUDGE' || role === 'MENTOR' || role === 'ORGANIZER' || role === 'ADMIN')) return true;
    if (!name) return true;
    const n = name.toLowerCase();
    return n.includes('judge') || n.includes('mentor') || n.includes('organizer') || n.includes('admin');
};

// Generate a unique shareable certificate ID — URL-safe base64, safe for Unicode/Vietnamese names
// Standard base64 uses +, /, = which break URL path params. URL-safe variant: + → -, / → _, strip =
const toUrlSafeBase64 = (str: string): string =>
    btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

const generateCertId = (cert: CertificateData): string => {
    const payload = {
        certId: '',
        studentName: cert.studentName,
        username: cert.username,
        eventId: cert.eventId,
        eventName: cert.eventName,
        teamName: cert.teamName,
        trackName: cert.trackName,
        roundName: cert.roundName,
        role: cert.userRoleInTeam,
        awardTitle: cert.awardTitle,
        issueDate: cert.issueDate,
        eventSeason: cert.eventSeason,
    };
    return toUrlSafeBase64(JSON.stringify(payload));
};

const CertificatesPage: React.FC = () => {
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState<CertificateData[]>([]);
    const [allStudentsCertificates, setAllStudentsCertificates] = useState<CertificateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
    const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

    const [userRole, setUserRole] = useState<string>('PARTICIPANT');
    const [currentUserId, setCurrentUserId] = useState<number>(0);
    const [currentUsername, setCurrentUsername] = useState<string>('');
    
    const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('ALL');
    const [studentSearchInput, setStudentSearchInput] = useState<string>('All Students');
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState<boolean>(false);

    const [eventFilter, setEventFilter] = useState<string>('ALL');
    const [eventSearchInput, setEventSearchInput] = useState<string>('All Completed Events');
    const [isEventDropdownOpen, setIsEventDropdownOpen] = useState<boolean>(false);

    const [dateSort, setDateSort] = useState<string>('NEWEST');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const studentDropdownRef = useRef<HTMLDivElement>(null);
    const eventDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
                setIsStudentDropdownOpen(false);
                if (selectedStudentFilter === 'ALL') {
                    setStudentSearchInput('All Students');
                } else {
                    setStudentSearchInput(selectedStudentFilter);
                }
            }
            if (eventDropdownRef.current && !eventDropdownRef.current.contains(event.target as Node)) {
                setIsEventDropdownOpen(false);
                if (eventFilter === 'ALL') {
                    setEventSearchInput('All Completed Events');
                } else {
                    setEventSearchInput(eventFilter);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedStudentFilter, eventFilter]);

    useEffect(() => {
        loadCertificateData();
    }, []);

    const loadCertificateData = async () => {
        setLoading(true);
        try {
            // 1. Fetch current logged-in user profile
            const profileRes = await api.get('/profile');
            const profile = profileRes.data?.data || profileRes.data || {};
            const role = profile.role || 'PARTICIPANT';
            const uId = profile.id || 0;
            const uName = profile.username || '';

            setUserRole(role);
            setCurrentUserId(uId);
            setCurrentUsername(uName);

            // 2. Fetch events from database
            const eventsRes = await api.get('/hackathon-events');
            const events = Array.isArray(eventsRes.data?.data) ? eventsRes.data.data : 
                           Array.isArray(eventsRes.data) ? eventsRes.data : [];

            // BUSINESS RULE: Certificates issued for:
            // 1. Events with status COMPLETED (organizer explicitly marked done), OR
            // 2. Events whose endTime has already passed (event over, organizer may not have clicked Complete yet)
            // This prevents the page being always empty when organizer forgets to click Complete.
            const now = new Date();
            const eligibleEvents = events.filter((e: any) => {
                if (e.isDeleted) return false;
                if (e.status === 'COMPLETED') return true;
                // Also include PUBLISHED/ONGOING events that have ended by endTime
                if (e.endTime && new Date(e.endTime) < now) return true;
                return false;
            });

            const certList: CertificateData[] = [];
            const formattedDate = now.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            // 3. Query teams and members from database for eligible events
            for (const ev of eligibleEvents) {
                try {
                    // Fetch rounds for the event
                    const roundsRes = await api.get(`/rounds/hackathon/${ev.id}`);
                    const rounds = Array.isArray(roundsRes.data?.data) ? roundsRes.data.data : 
                                   Array.isArray(roundsRes.data) ? roundsRes.data : [];

                    // Find the final round (with highest roundOrder)
                    const finalRound = rounds.reduce((max: any, r: any) => 
                        !max || r.roundOrder > max.roundOrder ? r : max, null
                    );

                    // Fetch final rankings if finalRound exists
                    const rankMap = new Map<number, number>();
                    let finalRoundName = 'Final Round';
                    if (finalRound) {
                        finalRoundName = finalRound.name;
                        try {
                            const rankingsRes = await api.get(`/rankings/round/${finalRound.id}`);
                            const rankings = Array.isArray(rankingsRes.data?.data) ? rankingsRes.data.data : 
                                             Array.isArray(rankingsRes.data) ? rankingsRes.data : [];
                            rankings.forEach((r: any) => {
                                if (r.teamId && r.rank) {
                                    rankMap.set(r.teamId, r.rank);
                                }
                            });
                        } catch (err) {
                            console.log('Failed to fetch rankings for round', finalRound.id, err);
                        }
                    }

                    const teamRes = await api.get(`/teams/event/${ev.id}`);
                    const teams = Array.isArray(teamRes.data?.data) ? teamRes.data.data : 
                                  Array.isArray(teamRes.data) ? teamRes.data : [];

                    for (const t of teams) {
                        const rank = rankMap.get(t.id) || null;

                        // Only award certificates to teams that won a prize (ranks 1, 2, or 3)
                        if (rank === null || rank > 3) {
                            continue;
                        }

                        let defaultAwardTitle = 'Certificate of Participation';
                        if (rank === 1) defaultAwardTitle = '1st Place Grand Champion';
                        else if (rank === 2) defaultAwardTitle = '2nd Place Runner-Up';
                        else if (rank === 3) defaultAwardTitle = '3rd Place Bronze Winner';

                        const trackName = t.trackName || 'General Track';
                        let awardTitle = defaultAwardTitle;
                        if (rank === 1 && trackName) awardTitle = `1st Place ${trackName} Champion`;
                        else if (rank === 2 && trackName) awardTitle = `2nd Place ${trackName} Runner-Up`;
                        else if (rank === 3 && trackName) awardTitle = `3rd Place ${trackName} Bronze Winner`;

                        if (t.members && t.members.length > 0) {
                            t.members
                                .filter((m: any) => !isNonStudentName(m.fullName || m.username, m.role))
                                .forEach((m: any) => {
                                    certList.push({
                                        studentId: m.userId || m.id || 0,
                                        username: m.username || '',
                                        eventId: ev.id,
                                        eventName: ev.name || 'FPT SEAL Innovation Challenge 2026',
                                        studentName: m.fullName || m.username || 'Student',
                                        userRoleInTeam: m.isLeader ? 'Team Leader' : 'Team Member',
                                        teamName: t.name || 'SEAL Innovators',
                                        trackName: trackName,
                                        roundName: finalRoundName,
                                        rank: rank,
                                        awardTitle: awardTitle,
                                        issueDate: formattedDate,
                                        eventSeason: 'SUMMER 2026',
                                        rawDate: new Date(ev.startTime || Date.now())
                                    });
                                });
                        }
                    }
                } catch (err) {
                    console.log('Error loading team certificate data for completed event ID', ev.id);
                }
            }

            // Filter non-student entries
            const studentOnlyDirectory = certList.filter(item => !isNonStudentName(item.studentName));

            const uniqueMap = new Map();
            studentOnlyDirectory.forEach(item => {
                const key = `${item.username || item.studentName}-${item.eventId}-${item.teamName}`;
                if (!uniqueMap.has(key)) uniqueMap.set(key, item);
            });
            const finalDirectory = Array.from(uniqueMap.values());

            setAllStudentsCertificates(finalDirectory);

            if (role === 'ADMIN' || role === 'ORGANIZER') {
                setCertificates(finalDirectory);
            } else {
                // Participant mode: Filter EXACTLY to current student's own completed certificates
                const myCerts = finalDirectory.filter(c => 
                    (uId > 0 && c.studentId === uId) ||
                    (uName !== '' && c.username.toLowerCase() === uName.toLowerCase())
                );
                setCertificates(myCerts);
            }

        } catch (err: any) {
            console.error('Failed to load certificate data from database', err);
            const isNetworkError = !err?.response;
            toast.error(
                isNetworkError
                    ? 'Cannot connect to server. Please make sure the backend is running.'
                    : 'Failed to load certificates from database.',
                { id: 'cert-load-error', duration: 5000 }
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleStudentFocus = () => {
        setIsStudentDropdownOpen(true);
        if (selectedStudentFilter === 'ALL') {
            setStudentSearchInput('');
        } else {
            setStudentSearchInput(selectedStudentFilter);
        }
    };

    const handleSelectStudent = (studentName: string) => {
        setSelectedStudentFilter(studentName);
        setStudentSearchInput(studentName === 'ALL' ? 'All Students' : studentName);
        setIsStudentDropdownOpen(false);
    };

    const handleEventFocus = () => {
        setIsEventDropdownOpen(true);
        if (eventFilter === 'ALL') {
            setEventSearchInput('');
        } else {
            setEventSearchInput(eventFilter);
        }
    };

    const handleSelectEvent = (eventName: string) => {
        setEventFilter(eventName);
        setEventSearchInput(eventName === 'ALL' ? 'All Completed Events' : eventName);
        setIsEventDropdownOpen(false);
    };

    // Filter & Sort Logic
    const filteredCertificates = certificates.filter(cert => {
        const matchesSearch = cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              cert.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              cert.trackName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              cert.eventName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStudent = selectedStudentFilter === 'ALL' || cert.studentName === selectedStudentFilter;
        const matchesEvent = eventFilter === 'ALL' || cert.eventName === eventFilter;
        
        return matchesSearch && matchesStudent && matchesEvent;
    }).sort((a, b) => {
        if (dateSort === 'NEWEST') return b.rawDate.getTime() - a.rawDate.getTime();
        if (dateSort === 'OLDEST') return a.rawDate.getTime() - b.rawDate.getTime();
        return 0;
    });

    const isAdminOrOrganizer = userRole === 'ADMIN' || userRole === 'ORGANIZER';

    // Unique Student Names for Filter Dropdown
    const uniqueStudents = Array.from(new Set(allStudentsCertificates.map(c => c.studentName)));
    const filteredStudents = uniqueStudents.filter(sName => 
        sName.toLowerCase().includes(studentSearchInput.toLowerCase())
    );

    // Unique Event Names for Filter Dropdown
    const uniqueEvents = Array.from(new Set(allStudentsCertificates.map(c => c.eventName)));
    const filteredEventsList = uniqueEvents.filter(eName => 
        eName.toLowerCase().includes(eventSearchInput.toLowerCase())
    );

    return (
        <>
            {/* CSS Print Stylesheet */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-certificate, #printable-certificate * {
                        visibility: visible !important;
                    }
                    #printable-certificate {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        margin: 0 !important;
                        padding: 20px !important;
                        background-color: #18130b !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        z-index: 9999999 !important;
                    }
                    .hide-on-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="container mx-auto px-4 py-8">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <Trophy className="text-yellow-500" size={32} />
                            {isAdminOrOrganizer ? 'Student Certificates Directory' : 'My Hackathon Certificates'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Official verified digital certificates are automatically issued upon official event completion (`COMPLETED` status).
                        </p>
                    </div>
                </div>

                {/* UNIVERSAL FILTER BAR */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 mb-8 border border-slate-700/60 shadow-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                            <Filter size={16} />
                            Filter & Sort Certificates
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                            Showing {filteredCertificates.length} verified certificates
                        </span>
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdminOrOrganizer ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3`}>
                        
                        {/* Search Input */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search event, team, track..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 w-full"
                            />
                        </div>

                        {/* Filter by Student (Admin / Organizer Only) */}
                        {isAdminOrOrganizer && (
                            <div className="flex items-center gap-2 relative" ref={studentDropdownRef}>
                                <User size={14} className="text-slate-400 flex-shrink-0" />
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        value={studentSearchInput}
                                        onFocus={handleStudentFocus}
                                        onChange={e => setStudentSearchInput(e.target.value)}
                                        placeholder="Search student..."
                                        className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-amber-400 font-medium cursor-text"
                                    />
                                    <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400 text-[10px]">▼</div>
                                    
                                    {isStudentDropdownOpen && (
                                        <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[9999]">
                                            <div
                                                onClick={() => handleSelectStudent('ALL')}
                                                className={`px-3 py-2 text-xs text-white hover:bg-amber-500/20 cursor-pointer ${selectedStudentFilter === 'ALL' ? 'bg-amber-500/10 text-amber-400 font-semibold' : ''}`}
                                            >
                                                All Students ({allStudentsCertificates.length})
                                            </div>
                                            {filteredStudents.length > 0 ? (
                                                filteredStudents.map((sName, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleSelectStudent(sName)}
                                                        className={`px-3 py-2 text-xs text-white hover:bg-amber-500/20 cursor-pointer ${selectedStudentFilter === sName ? 'bg-amber-500/10 text-amber-400 font-semibold' : ''}`}
                                                    >
                                                        {sName}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-xs text-slate-500 italic">No students found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Filter by Event */}
                        <div className="flex items-center gap-2 relative" ref={eventDropdownRef}>
                            <Layers size={14} className="text-slate-400 flex-shrink-0" />
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={eventSearchInput}
                                    onFocus={handleEventFocus}
                                    onChange={e => setEventSearchInput(e.target.value)}
                                    placeholder="Search completed event..."
                                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-amber-400 font-medium cursor-text"
                                />
                                <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400 text-[10px]">▼</div>
                                
                                {isEventDropdownOpen && (
                                    <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[9999]">
                                        <div
                                            onClick={() => handleSelectEvent('ALL')}
                                            className={`px-3 py-2 text-xs text-white hover:bg-amber-500/20 cursor-pointer ${eventFilter === 'ALL' ? 'bg-amber-500/10 text-amber-400 font-semibold' : ''}`}
                                        >
                                            All Completed Events
                                        </div>
                                        {filteredEventsList.length > 0 ? (
                                            filteredEventsList.map((eName, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => handleSelectEvent(eName)}
                                                    className={`px-3 py-2 text-xs text-white hover:bg-amber-500/20 cursor-pointer ${eventFilter === eName ? 'bg-amber-500/10 text-amber-400 font-semibold' : ''}`}
                                                >
                                                    {eName}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-xs text-slate-500 italic">No events found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sort by Date */}
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                            <select
                                value={dateSort}
                                onChange={e => setDateSort(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
                            >
                                <option value="NEWEST">Date: Newest First</option>
                                <option value="OLDEST">Date: Oldest First</option>
                            </select>
                        </div>

                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                    </div>
                ) : filteredCertificates.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <AlertCircle className="mx-auto h-16 w-16 text-amber-500 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No Verified Certificates Available</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                            Certificates are automatically generated and issued once a hackathon event reaches <strong className="text-purple-600 font-semibold">`COMPLETED`</strong> status by the organizing committee.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCertificates.map((cert, index) => (
                            <div 
                                key={index}
                                className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl border border-amber-500/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                            >
                                {/* Gold Glow Accent */}
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>

                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                            <Sparkles size={14} />
                                            {cert.awardTitle}
                                        </div>
                                        <span className="text-xs text-slate-400 font-mono">{cert.issueDate}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{cert.eventName}</h3>
                                    
                                    <div className="space-y-1.5 text-xs text-slate-300 mb-6 bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Student Name:</span>
                                            <span className="font-semibold text-amber-300">{cert.studentName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Role in Team:</span>
                                            <span className="font-semibold text-blue-400">{cert.userRoleInTeam}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Team Name:</span>
                                            <span className="font-medium text-white">{cert.teamName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Track & Round:</span>
                                            <span className="font-medium text-emerald-400">{cert.trackName} ({cert.roundName})</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedCert(cert)}
                                        className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform group-hover:scale-[1.02] cursor-pointer"
                                    >
                                        <Award size={16} />
                                        View Certificate
                                    </button>
                                    <button
                                        onClick={() => {
                                            const id = generateCertId(cert);
                                            const url = `${window.location.origin}/verify/${id}`;
                                            navigator.clipboard.writeText(url);
                                            setCopiedCertId(id);
                                            setTimeout(() => setCopiedCertId(null), 2500);
                                            toast.success('Certificate link copied!');
                                        }}
                                        title="Copy shareable link"
                                        className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                                    >
                                        {copiedCertId === generateCertId(cert)
                                            ? <CheckCircle size={16} className="text-green-400" />
                                            : <Share2 size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FULLSCREEN CERTIFICATE MODAL POPUP */}
            {selectedCert && (
                <div
                    className="fixed inset-0 z-[999999] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-start md:justify-center p-4 md:p-6 overflow-y-auto gap-4"
                    onClick={() => setSelectedCert(null)}
                >
                    
                    {/* TOP ACTION BAR — stopPropagation to avoid closing modal */}
                    <div
                        className="w-full max-w-5xl flex justify-between items-center bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-2xl shrink-0 hide-on-print"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-left">
                            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">Official Digital Certificate</span>
                            <span className="text-sm text-white font-semibold">{selectedCert.studentName} - {selectedCert.teamName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    const id = generateCertId(selectedCert);
                                    const url = `${window.location.origin}/verify/${id}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success('Shareable link copied!');
                                }}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all cursor-pointer border border-slate-600"
                            >
                                <Copy size={15} />
                                Copy Link
                            </button>
                            <button
                                onClick={() => navigate(`/verify/${generateCertId(selectedCert)}`)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all cursor-pointer border border-emerald-500/40"
                            >
                                <Share2 size={15} />
                                Share Page
                            </button>
                            <button
                                onClick={handlePrint}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-xl flex items-center gap-2 transition-all cursor-pointer border border-blue-400/40"
                            >
                                <Printer size={15} />
                                Save PDF
                            </button>
                            <button
                                onClick={() => setSelectedCert(null)}
                                className="bg-rose-600 hover:bg-rose-500 text-white p-2 rounded-lg font-bold shadow-lg transition-all cursor-pointer border border-rose-400/40"
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* CERTIFICATE — Landscape 16:9, clean typography */}
                    <div
                        id="printable-certificate"
                        className="rounded-2xl border-[6px] border-[#d4af37] shadow-[0_0_100px_rgba(212,175,55,0.45)] max-w-5xl w-full relative overflow-hidden shrink-0 my-2 md:my-0"
                        style={{ fontFamily: "'Times New Roman', Georgia, serif", aspectRatio: '16/9', minHeight: '420px', background: 'linear-gradient(160deg, #1e1208 0%, #140e05 50%, #0c0803 100%)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Inner frame */}
                        <div className="absolute inset-3 border border-[#d4af37]/40 rounded-xl pointer-events-none"></div>

                        {/* Corner ornaments */}
                        <div className="absolute top-5 left-5 w-10 h-10 border-t-[3px] border-l-[3px] border-[#d4af37]"></div>
                        <div className="absolute top-5 right-5 w-10 h-10 border-t-[3px] border-r-[3px] border-[#d4af37]"></div>
                        <div className="absolute bottom-5 left-5 w-10 h-10 border-b-[3px] border-l-[3px] border-[#d4af37]"></div>
                        <div className="absolute bottom-5 right-5 w-10 h-10 border-b-[3px] border-r-[3px] border-[#d4af37]"></div>

                        {/* Dot watermark background */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{
                            backgroundImage: 'radial-gradient(circle, #d4af37 1px, transparent 1px)',
                            backgroundSize: '32px 32px'
                        }}></div>

                        {/* CONTENT — single centered column */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-16 py-10">

                            {/* Top: FPT + Event */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center font-extrabold text-2xl tracking-widest px-3 py-1 rounded-lg border border-[#d4af37]/60 bg-black/40 font-sans">
                                    <span className="text-[#f97316]">F</span>
                                    <span className="text-[#22c55e]">P</span>
                                    <span className="text-[#06b6d4]">T</span>
                                </div>
                                <div className="w-px h-6 bg-[#d4af37]/30"></div>
                                <span className="text-xs font-sans tracking-[0.28em] text-[#d4af37]/80 font-bold uppercase">
                                    SEAL HACKATHON — {selectedCert.eventSeason}
                                </span>
                            </div>

                            {/* Top ornamental line */}
                            <div className="flex items-center gap-3 w-full max-w-2xl mb-5">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#d4af37]/50"></div>
                                <span className="text-[#d4af37]/50 text-sm">✦</span>
                                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#d4af37]/50"></div>
                            </div>

                            {/* Label */}
                            <p className="text-[11px] font-sans tracking-[0.4em] text-[#d4af37]/60 font-bold uppercase mb-3">
                                Certificate of Achievement
                            </p>

                            {/* Award Title */}
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-wide mb-4 drop-shadow-lg leading-tight">
                                {selectedCert.awardTitle}
                            </h1>

                            {/* Blue divider */}
                            <div className="w-24 h-[3px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full shadow-[0_0_12px_#38bdf8] mb-4"></div>

                            <p className="italic text-amber-200/60 text-base mb-2">This certificate is proudly presented to</p>

                            {/* Student Name */}
                            <h2 className="text-5xl md:text-6xl font-extrabold font-serif tracking-wider mb-4 drop-shadow-xl"
                                style={{ color: '#38bdf8', textShadow: '0 0 40px rgba(56,189,248,0.35)' }}>
                                {selectedCert.studentName}
                            </h2>

                            {/* Description */}
                            <p className="text-amber-100/75 text-base leading-relaxed font-sans max-w-2xl mb-5">
                                for participating as <strong className="text-white font-semibold">{selectedCert.userRoleInTeam}</strong>{' '}
                                of team <strong className="text-white font-semibold">"{selectedCert.teamName}"</strong>{' '}
                                in the <strong className="text-white font-semibold">{selectedCert.trackName}</strong> track.
                            </p>

                            {/* Bottom ornamental line */}
                            <div className="flex items-center gap-3 w-full max-w-2xl mb-4">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#d4af37]/50"></div>
                                <span className="text-[#d4af37]/50 text-sm">✦</span>
                                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#d4af37]/50"></div>
                            </div>

                            {/* Footer */}
                            <div className="w-full max-w-2xl flex justify-between items-end">
                                <div className="text-left">
                                    <div className="text-base font-sans font-bold text-amber-100">{selectedCert.issueDate}</div>
                                    <div className="text-[10px] font-sans tracking-[0.25em] text-amber-400/60 font-bold uppercase border-t border-[#d4af37]/30 pt-1 mt-1">Date Issued</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-serif italic text-amber-200/90">SEAL Organizing Committee</div>
                                    <div className="text-[10px] font-sans tracking-[0.25em] text-amber-400/60 font-bold uppercase border-t border-[#d4af37]/30 pt-1 mt-1">Event Coordinator</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CertificatesPage;
