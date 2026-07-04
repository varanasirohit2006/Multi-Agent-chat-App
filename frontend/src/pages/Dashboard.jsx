import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="min-h-[calc(100vh-65px)] bg-surface relative">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-brand-600/8 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-5xl px-4 py-12">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="mt-2 text-gray-400">Welcome back. You are signed in.</p>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                    {/* Profile card */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Your Profile</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-gray-500">Name</dt>
                                <dd className="font-medium text-gray-200 mt-0.5">{user?.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Email</dt>
                                <dd className="font-medium text-gray-200 mt-0.5">{user?.email}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Quick action card */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-2">AI Support Chat</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Got questions? Our multi-agent AI can help with billing, products, technical issues, and complaints.
                            </p>
                        </div>
                        <Link
                            to="/chat"
                            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                            </svg>
                            Open AI Chat
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
