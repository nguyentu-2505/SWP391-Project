import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Trophy, Rocket, ArrowRight, Brain, Gavel, 
    ChevronDown, Eye, Maximize, Calendar, 
    Mail, Phone, MapPin, ExternalLink 
} from 'lucide-react';
import { isAuthenticated } from '../services/authUtils';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const loggedIn = isAuthenticated();

    const handleGetStarted = () => {
        if (loggedIn) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="text-on-surface bg-background min-h-screen">
            {/* Hero Section */}
            <section className="max-w-[1440px] mx-auto px-margin-desktop py-12 pt-32">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="flex-1 text-center lg:text-left space-y-6">
                        <span className="inline-block px-4 py-1.5 bg-primary-container/10 text-primary-container rounded-full font-label-md text-label-md uppercase tracking-wider">
                            Academic Excellence 2024
                        </span>
                        <h1 className="font-display-lg text-display-lg text-on-surface leading-tight">
                            Unleash Your Innovation at <span className="text-primary-container">SEAL Hackathon</span>
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            The premier academic technology competition for FPT University students. Build, compete, and lead the next generation of digital creators.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <button 
                                onClick={handleGetStarted}
                                className="bg-primary-container text-on-primary px-8 py-4 rounded-lg font-headline-sm text-headline-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-soft shadow-lg shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Register Team
                                <Rocket size={20} />
                            </button>
                            <button 
                                onClick={() => navigate('/events')}
                                className="border border-outline-variant bg-surface px-8 py-4 rounded-lg font-headline-sm text-headline-sm text-on-surface-variant hover:bg-surface-container hover:scale-[1.02] transition-soft flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Browse Hackathons
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 w-full max-w-2xl relative group">
                        <div className="absolute -inset-4 bg-primary-container/5 rounded-3xl blur-2xl group-hover:bg-primary-container/10 transition-soft"></div>
                        <img 
                            alt="Hero Illustration" 
                            className="relative z-10 w-full h-auto drop-shadow-2xl rounded-2xl transform transition-soft group-hover:scale-[1.01]" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9wFbBoWgx4Xu7C4sEaruvzbIpycqTHCSmgCsVY2fsW9M49CIc78HQEXNew-YEar0v7wwf7bLhg3lFGEfYGqpG7OJKLQ73pchaLzKrVexuyUyPW82YRLARyThjU19IJq9MuCmhRZ713ZjU5i-GsoRQ2vE-KR44Mp38kdm3ppFIKmyu7ZX8NWPDmmrBksmR2NQ5aQI1PEMhhhz3_1FKMFZS5yEOsIFhgnd4y5nmCPI-MmzCSJSa2lOZNbC975K90BKqwLOCcFHnEs-O"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-surface-container-low py-12 border-y border-outline-variant/30">
                <div className="max-w-[1440px] mx-auto px-margin-desktop">
                    <div className="text-center mb-12 space-y-2">
                        <h2 className="font-headline-lg text-headline-lg text-on-surface">Empowering Performance</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">Advanced tools and systems designed for competitive excellence.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Real-time Ranking */}
                        <div className="glass-card p-8 rounded-xl transition-soft hover:-translate-y-2 hover:border-primary-container hover:shadow-floating">
                            <div className="w-12 h-12 bg-primary-container/10 rounded-lg flex items-center justify-center mb-6">
                                <Trophy className="text-primary-container" size={24} />
                            </div>
                            <h3 className="font-headline-sm text-headline-sm mb-3 text-brand-navy">Real-time Ranking</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                                Live updates on scoreboards that keep the competitive fire alive every second of the event.
                            </p>
                        </div>
                        {/* Professional Mentorship */}
                        <div className="glass-card p-8 rounded-xl transition-soft hover:-translate-y-2 hover:border-primary-container hover:shadow-floating">
                            <div className="w-12 h-12 bg-tertiary-container/10 rounded-lg flex items-center justify-center mb-6">
                                <Brain className="text-tertiary" size={24} />
                            </div>
                            <h3 className="font-headline-sm text-headline-sm mb-3 text-brand-navy">Professional Mentorship</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                                Direct access to industry veterans from FPT and global tech giants for project guidance.
                            </p>
                        </div>
                        {/* Fair Judging System */}
                        <div className="glass-card p-8 rounded-xl transition-soft hover:-translate-y-2 hover:border-primary-container hover:shadow-floating">
                            <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center mb-6">
                                <Gavel className="text-on-surface-variant" size={24} />
                            </div>
                            <h3 className="font-headline-sm text-headline-sm mb-3 text-brand-navy">Fair Judging System</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                                Transparent criteria and a multi-stage review process ensuring every innovation gets its due.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Choose Your Path Section */}
            <section className="py-12 max-w-[1440px] mx-auto px-margin-desktop">
                <div className="mb-12 space-y-2 text-center lg:text-left">
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Choose Your Path</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Whether you are building, guiding, or judging, there is a place for you.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Participants */}
                    <div className="relative overflow-hidden rounded-2xl group border border-outline-variant hover:border-primary-container transition-soft shadow-sm bg-white">
                        <img 
                            className="w-full h-64 object-cover transition-soft group-hover:scale-105" 
                            alt="Participants collaborating"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9qYPqNHn7Ig-mKGQWJHWlO9rZTe42u2aJeD9owVt8hw0vNole6Hz6dcMmvglfIOvpVSaTbHdhc2XQthVzTUUAR77jyXQRV2URhDnEOhf59cHuNkzQNpcV-GP-5izaKJ_FAzGQiHTqbeEzajogVPgU7LI5cS-cnms4MTDgNAnPTDABMZ8UPgcbFzWloLKs0v_FpXcsswsGtAYB4NpUsljehjmICdZd9QLMaahFlAlnGxyNceQ6GvZhoNmp8uFE5BttwA6HnFlV8Zk7" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full space-y-2">
                            <h4 className="font-headline-md text-headline-md text-brand-navy">Participants</h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Battle for the top spot, win scholarships, and build your dream portfolio.</p>
                            <a className="inline-flex items-center text-primary-container font-label-lg text-label-lg group-hover:translate-x-1 transition-all gap-1" href="#register">
                                View Roadmap <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                    {/* Judges */}
                    <div className="relative overflow-hidden rounded-2xl group border border-outline-variant hover:border-primary-container transition-soft shadow-sm bg-white">
                        <img 
                            className="w-full h-64 object-cover transition-soft group-hover:scale-105" 
                            alt="Judges evaluating"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCczrB77_J97Bwipbu6KdYGxjJsmNVne03dvpWTEStQxsH1hblpsDrFr87WBewHDxO5FCcIy7_2kvRUWee6ALuT3k-T1CvxZrL0EA9Jth585Hk4qPH3daxgx_t0wSQMWdlQsLBGM95qh6VzPua30CZc3Ea1N3QuYtd6H9mUETyNnTh450k1634W4fiRNophEFVe3GQgn3fGSJwFqI8z2FkjR-5sjbqXsrYzR3TkVqcv75cFD75utc_1Hp8pvKdgzZeVo2w8p1cFTSsa" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full space-y-2">
                            <h4 className="font-headline-md text-headline-md text-brand-navy">Judges</h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Evaluate world-changing ideas and provide expert feedback to top talent.</p>
                            <a className="inline-flex items-center text-primary-container font-label-lg text-label-lg group-hover:translate-x-1 transition-all gap-1" href="#about">
                                Criteria <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                    {/* Mentors */}
                    <div className="relative overflow-hidden rounded-2xl group border border-outline-variant hover:border-primary-container transition-soft shadow-sm bg-white">
                        <img 
                            className="w-full h-64 object-cover transition-soft group-hover:scale-105" 
                            alt="Mentors guiding"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT288b-ZovEUZ8rYuZiPHZPoQv5gWf9Dcbd1PoHzp-BPSO3NGZ-FGPoyU8jg4OxA77998JKheoPfjthWRqqwPhP8NgXYFg2mcSvqcRpatTkDye_cOZXU5oHXJlazASxBUdxz9ctMEX_EZOnO2oeDXFriQRNDYh6IwR2uDGvU7AuwRk6TfxR8OGqUIP70_BInkj_Qbho40NI9Tar290qlKK8_eDBnbQmZsvF6kFcAQOFoneFpC5aNlMfpGkJ_HB6jOna3afE4OnGuTU" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full space-y-2">
                            <h4 className="font-headline-md text-headline-md text-brand-navy">Mentors</h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Guide students through technical hurdles and share industry wisdom.</p>
                            <a className="inline-flex items-center text-primary-container font-label-lg text-label-lg group-hover:translate-x-1 transition-all gap-1" href="#about">
                                Join Panel <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leaderboard Preview */}
            <section className="bg-surface-container-low py-12 border-y border-outline-variant/30">
                <div className="max-w-[1440px] mx-auto px-margin-desktop">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div>
                            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Live Rankings</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant">The current standings in the race to the finish line.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/events')}
                            className="px-5 py-2.5 bg-white border border-outline-variant rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:border-primary-container hover:text-primary transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                            Full Leaderboard <Maximize size={16} className="text-brand-orange" />
                        </button>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-floating">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                                    <th className="text-left px-6 py-4 font-label-lg text-label-lg text-on-surface-variant">Rank</th>
                                    <th className="text-left px-6 py-4 font-label-lg text-label-lg text-on-surface-variant">Team Name</th>
                                    <th className="text-left px-6 py-4 font-label-lg text-label-lg text-on-surface-variant">Score</th>
                                    <th className="text-left px-6 py-4 font-label-lg text-label-lg text-on-surface-variant">Status</th>
                                    <th className="text-right px-6 py-4 font-label-lg text-label-lg text-on-surface-variant">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20">
                                <tr className="hover:bg-neutral-base transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center font-bold text-[#b8860b]">1</div>
                                    </td>
                                    <td className="px-6 py-5 font-headline-sm text-headline-sm text-brand-navy">Code Ninjas</td>
                                    <td className="px-6 py-5 font-body-md text-body-md font-bold text-primary-container">12,450 pts</td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> ACTIVE
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-on-surface-variant hover:text-primary-container p-1 rounded hover:bg-neutral-divider transition-colors">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-neutral-base transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="w-8 h-8 rounded-full bg-[#C0C0C0]/20 flex items-center justify-center font-bold text-secondary">2</div>
                                    </td>
                                    <td className="px-6 py-5 font-headline-sm text-headline-sm text-brand-navy">AI Mavericks</td>
                                    <td className="px-6 py-5 font-body-md text-body-md font-bold text-primary-container">11,820 pts</td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span> ACTIVE
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-on-surface-variant hover:text-primary-container p-1 rounded hover:bg-neutral-divider transition-colors">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-neutral-base transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="w-8 h-8 rounded-full bg-[#CD7F32]/20 flex items-center justify-center font-bold text-[#8b4513]">3</div>
                                    </td>
                                    <td className="px-6 py-5 font-headline-sm text-headline-sm text-brand-navy">Cyber Guardians</td>
                                    <td className="px-6 py-5 font-body-md text-body-md font-bold text-primary-container">11,400 pts</td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span> ACTIVE
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-on-surface-variant hover:text-primary-container p-1 rounded hover:bg-neutral-divider transition-colors">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ & Support Contact */}
            <section className="py-12 max-w-[1440px] mx-auto px-margin-desktop">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            <details className="group bg-white border border-outline-variant rounded-xl p-5 cursor-pointer transition-all shadow-sm">
                                <summary className="list-none flex justify-between items-center font-headline-sm text-headline-sm text-brand-navy">
                                    Who can participate in SEAL Hackathon?
                                    <ChevronDown size={20} className="group-open:rotate-180 transition-transform text-brand-orange" />
                                </summary>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 leading-relaxed">
                                    All currently enrolled students at FPT University across all campuses are eligible to register as individuals or teams of 3-5 members.
                                </p>
                            </details>
                            <details className="group bg-white border border-outline-variant rounded-xl p-5 cursor-pointer transition-all shadow-sm">
                                <summary className="list-none flex justify-between items-center font-headline-sm text-headline-sm text-brand-navy">
                                    What technologies can we use?
                                    <ChevronDown size={20} className="group-open:rotate-180 transition-transform text-brand-orange" />
                                </summary>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 leading-relaxed">
                                    Participants are encouraged to use any open-source or licensed tools. We have special tracks for AI, Blockchain, and IoT using FPT's internal platform APIs.
                                </p>
                            </details>
                            <details className="group bg-white border border-outline-variant rounded-xl p-5 cursor-pointer transition-all shadow-sm">
                                <summary className="list-none flex justify-between items-center font-headline-sm text-headline-sm text-brand-navy">
                                    How are the winners selected?
                                    <ChevronDown size={20} className="group-open:rotate-180 transition-transform text-brand-orange" />
                                </summary>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 leading-relaxed">
                                    Judging is based on Impact (40%), Technical Execution (30%), Innovation (20%), and Presentation (10%).
                                </p>
                            </details>
                        </div>
                    </div>
                    <div className="bg-primary-container/5 rounded-2xl p-8 md:p-12 border border-primary-container/20 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="font-headline-lg text-headline-lg text-brand-navy mb-2">Need Help?</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed">
                                Our support team is available 24/7 during the event to assist with registration, technical issues, or general inquiries.
                            </p>
                        </div>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block font-label-lg text-label-lg text-brand-navy mb-1.5">Full Name</label>
                                <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-4 focus:ring-primary-container/10 focus:border-primary-container outline-none transition-all text-body-sm" placeholder="Enter your name" type="text" />
                            </div>
                            <div>
                                <label className="block font-label-lg text-label-lg text-brand-navy mb-1.5">Email Address</label>
                                <input className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-4 focus:ring-primary-container/10 focus:border-primary-container outline-none transition-all text-body-sm" placeholder="student@fpt.edu.vn" type="email" />
                            </div>
                            <div>
                                <label className="block font-label-lg text-label-lg text-brand-navy mb-1.5">Message</label>
                                <textarea className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-4 focus:ring-primary-container/10 focus:border-primary-container outline-none transition-all text-body-sm" placeholder="How can we help you?" rows={4}></textarea>
                            </div>
                            <button className="w-full bg-primary-container text-on-primary py-3.5 rounded-lg font-headline-sm text-headline-sm hover:opacity-90 transition-all shadow-md shadow-primary/20 cursor-pointer font-semibold">Send Message</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-lowest border-t border-outline-variant mt-12">
                <div className="flex flex-col items-center md:items-start gap-1">
                    <span className="font-headline-sm text-headline-sm font-bold text-brand-navy">SEAL Hackathon</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 SEAL Hackathon Management System. FPT University.</p>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
                    <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-brand-orange transition-colors" href="#">Privacy Policy</a>
                    <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-brand-orange transition-colors" href="#">Terms of Service</a>
                    <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-brand-orange transition-colors" href="#">Contact Support</a>
                    <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-brand-orange transition-colors" href="#">University Site</a>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
