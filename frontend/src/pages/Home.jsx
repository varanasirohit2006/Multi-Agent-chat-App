import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
        ),
        title: 'Multi-Agent RAG',
        desc: 'Queries are intelligently routed to specialized AI agents — billing, technical, product, and complaint — for accurate, domain-specific answers.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
        ),
        title: 'Instant Answers',
        desc: 'Powered by vector search and LLMs, get real-time responses grounded in your company knowledge base documents.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
        ),
        title: 'Secure & Private',
        desc: 'JWT-based authentication protects your sessions. Your data stays on your infrastructure — no third-party data sharing.',
    },
];

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="min-h-[calc(100vh-65px)] bg-surface overflow-hidden relative">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl"></div>
            </div>

            {/* Hero */}
            <section className="relative z-10 mx-auto max-w-5xl px-4 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-8">
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                    Multi-Agent RAG System
                </div>

                <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight">
                    AI-Powered{' '}
                    <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Customer Support
                    </span>
                </h1>

                <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Ask anything about billing, products, technical issues, or complaints.
                    Our multi-agent system routes your query to the right specialist and
                    delivers precise answers from the knowledge base.
                </p>

                <div className="mt-10 flex justify-center gap-4">
                    <Link
                        to="/chat"
                        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-3.5 font-semibold text-white shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                        </svg>
                        Start Chatting
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>

                    {!user && (
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 font-semibold text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
                        >
                            Create Account
                        </Link>
                    )}
                </div>
            </section>

            {/* Features */}
            <section className="relative z-10 mx-auto max-w-5xl px-4 pb-24">
                <div className="grid md:grid-cols-3 gap-5">
                    {FEATURES.map((f) => (
                        <div
                            key={f.title}
                            className="group rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-6 hover:border-brand-500/30 hover:bg-white/[0.05] transition-all duration-300"
                        >
                            <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4 group-hover:bg-brand-500/20 transition-colors">
                                {f.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
