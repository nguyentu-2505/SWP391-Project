import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Award, Shield, CheckCircle, Copy, ExternalLink, Share2, Printer, ArrowLeft } from 'lucide-react';

interface VerifiedCertData {
    certId: string;
    studentName: string;
    username: string;
    eventName: string;
    teamName: string;
    trackName: string;
    roundName: string;
    role: string;
    awardTitle: string;
    issueDate: string;
    eventSeason: string;
}

// Decode certId → cert data, safe for Unicode/Vietnamese names
const decodeCertId = (certId: string): VerifiedCertData | null => {
    try {
        const decoded = decodeURIComponent(escape(atob(certId)));
        const data = JSON.parse(decoded);
        return data as VerifiedCertData;
    } catch {
        return null;
    }
};

const CertificateVerifyPage: React.FC = () => {
    const { certId } = useParams<{ certId: string }>();
    const [cert, setCert] = useState<VerifiedCertData | null>(null);
    const [copied, setCopied] = useState(false);
    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        if (!certId) { setInvalid(true); return; }
        const data = decodeCertId(certId);
        if (!data || !data.studentName || !data.eventName) {
            setInvalid(true);
        } else {
            setCert(data);
        }
    }, [certId]);

    const shareUrl = window.location.href;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handlePrint = () => window.print();

    if (invalid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                        <Shield className="text-red-400" size={36} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Certificate Not Found</h1>
                    <p className="text-slate-400 mb-6">This certificate link is invalid or has expired.</p>
                    <Link to="/" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!cert) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #printable-cert, #printable-cert * { visibility: visible !important; }
                    #printable-cert {
                        position: fixed !important; left: 0 !important; top: 0 !important;
                        width: 100vw !important; height: 100vh !important;
                        background: #18130b !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        display: flex !important; align-items: center !important; justify-content: center !important;
                        z-index: 9999 !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

                {/* TOP NAV BAR */}
                <div className="no-print border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center font-extrabold text-lg tracking-widest">
                                <span className="text-orange-500">F</span>
                                <span className="text-green-500">P</span>
                                <span className="text-cyan-500">T</span>
                            </div>
                            <div className="w-px h-5 bg-slate-600"></div>
                            <span className="text-slate-300 text-sm font-semibold">SEAL Hackathon</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="no-print inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm font-semibold hover:bg-slate-700 transition-all cursor-pointer"
                            >
                                {copied ? <CheckCircle size={15} className="text-green-400" /> : <Copy size={15} />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                            <button
                                onClick={handlePrint}
                                className="no-print inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all cursor-pointer border border-blue-500/40"
                            >
                                <Printer size={15} />
                                Save as PDF
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">

                    {/* LEFT: CERTIFICATE */}
                    <div className="flex-1">
                        <div
                            id="printable-cert"
                            className="bg-[#1f160a] text-[#fef08a] p-8 md:p-12 rounded-2xl border-[6px] border-[#d4af37] shadow-[0_0_80px_rgba(212,175,55,0.35)] relative overflow-hidden flex flex-col items-center text-center"
                            style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
                        >
                            <div className="w-full border-2 border-[#d4af37]/70 p-6 md:p-10 rounded-xl flex flex-col items-center bg-gradient-to-b from-[#2b1e0d] via-[#1f160a] to-[#120b04] relative">
                                {/* Corner Accents */}
                                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#d4af37]"></div>
                                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#d4af37]"></div>
                                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#d4af37]"></div>
                                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#d4af37]"></div>

                                {/* FPT Badge */}
                                <div className="flex items-center font-extrabold text-xl tracking-widest px-4 py-1.5 bg-black/50 rounded-lg border border-[#d4af37]/60 font-sans shadow-inner mb-4">
                                    <span className="text-orange-500">F</span>
                                    <span className="text-green-500">P</span>
                                    <span className="text-cyan-500">T</span>
                                </div>

                                <h4 className="text-xs font-sans tracking-[0.3em] text-[#fef08a] font-extrabold uppercase mb-2">
                                    SEAL HACKATHON — {cert.eventSeason}
                                </h4>

                                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide my-3 drop-shadow-lg">
                                    {cert.awardTitle}
                                </h1>

                                <div className="w-16 h-[3px] bg-blue-500 rounded-full my-3 shadow-[0_0_12px_#3b82f6]"></div>

                                <p className="italic text-amber-200/90 text-sm mb-2">This certificate is proudly presented to</p>

                                <h2 className="text-4xl md:text-5xl font-extrabold text-[#38bdf8] font-serif tracking-wider my-4 drop-shadow-xl">
                                    {cert.studentName}
                                </h2>

                                <p className="max-w-lg text-amber-100/90 text-sm leading-relaxed my-4 px-2 font-sans">
                                    for participating in SEAL Summer 2026 as <strong className="text-white">{cert.role}</strong> of team{' '}
                                    <strong className="text-white">"{cert.teamName}"</strong> in the{' '}
                                    <strong className="text-white">{cert.trackName}</strong> track, completing the{' '}
                                    <strong className="text-white">{cert.roundName}</strong> round.
                                </p>

                                <div className="w-full flex justify-between items-end mt-8 pt-6 border-t border-[#d4af37]/40">
                                    <div className="text-left">
                                        <div className="text-sm font-sans font-bold text-amber-100 mb-1">{cert.issueDate}</div>
                                        <div className="text-[10px] font-sans tracking-[0.2em] text-amber-400 font-bold uppercase border-t border-amber-600/50 pt-1">DATE ISSUED</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-base font-serif italic text-amber-100 mb-1">SEAL Organizing Committee</div>
                                        <div className="text-[10px] font-sans tracking-[0.2em] text-amber-400 font-bold uppercase border-t border-amber-600/50 pt-1">EVENT COORDINATOR</div>
                                    </div>
                                </div>

                                {/* Verification ID watermark */}
                                <div className="mt-6 text-[10px] font-mono text-amber-600/50 tracking-widest">
                                    CERT ID: {certId?.slice(0, 20).toUpperCase()}...
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: VERIFICATION PANEL */}
                    <div className="no-print lg:w-80 flex flex-col gap-4">

                        {/* Verified Badge */}
                        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 flex items-start gap-3">
                            <CheckCircle className="text-green-400 shrink-0 mt-0.5" size={22} />
                            <div>
                                <h3 className="text-green-300 font-bold text-sm mb-1">✅ Certificate Verified</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    This certificate is officially issued by FPT SEAL Hackathon and is authentic.
                                </p>
                            </div>
                        </div>

                        {/* Certificate Details */}
                        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-5 space-y-3">
                            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                                <Shield size={15} className="text-amber-400" />
                                Certificate Details
                            </h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-slate-400 shrink-0">Recipient</span>
                                    <span className="text-white font-semibold text-right">{cert.studentName}</span>
                                </div>
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-slate-400 shrink-0">Event</span>
                                    <span className="text-white font-semibold text-right">{cert.eventName}</span>
                                </div>
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-slate-400 shrink-0">Award</span>
                                    <span className="text-amber-300 font-semibold text-right">{cert.awardTitle}</span>
                                </div>
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-slate-400 shrink-0">Team</span>
                                    <span className="text-white font-semibold text-right">{cert.teamName}</span>
                                </div>
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-slate-400 shrink-0">Track</span>
                                    <span className="text-emerald-400 font-semibold text-right">{cert.trackName}</span>
                                </div>
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-slate-400 shrink-0">Role</span>
                                    <span className="text-blue-400 font-semibold text-right">{cert.role}</span>
                                </div>
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-slate-400 shrink-0">Issue Date</span>
                                    <span className="text-white font-semibold text-right">{cert.issueDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Share Section */}
                        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-5">
                            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                                <Share2 size={15} className="text-amber-400" />
                                Share This Certificate
                            </h3>
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 flex items-center gap-2 mb-3">
                                <span className="text-slate-400 text-xs font-mono flex-1 truncate">{shareUrl}</span>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                {copied ? <CheckCircle size={16} className="text-white" /> : <Copy size={16} />}
                                {copied ? 'Link Copied!' : 'Copy Shareable Link'}
                            </button>
                        </div>

                        {/* Issuer Info */}
                        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-5">
                            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                                <Award size={15} className="text-amber-400" />
                                Issued By
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-black/60 border border-[#d4af37]/40 flex items-center justify-center font-extrabold text-sm tracking-widest shrink-0">
                                    <span className="text-orange-500">F</span>
                                    <span className="text-green-500">P</span>
                                    <span className="text-cyan-500">T</span>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-xs">FPT SEAL Hackathon</div>
                                    <div className="text-slate-400 text-xs mt-0.5">Official Digital Certificate Platform</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default CertificateVerifyPage;
