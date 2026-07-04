import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const AGENT_LABELS = {
    billing: { label: 'Billing Support', color: 'bg-emerald-500', text: 'text-emerald-400' },
    technical: { label: 'Technical support', color: 'bg-blue-500', text: 'text-blue-400' },
    product: { label: 'Product Inquiry', color: 'bg-amber-500', text: 'text-amber-400' },
    complaint: { label: 'Grievance / Complaint', color: 'bg-rose-500', text: 'text-rose-400' },
    faq: { label: 'General FAQ', color: 'bg-purple-500', text: 'text-purple-400' },
};

export default function Analytics() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            api.get('/analytics')
                .then((res) => {
                    setData(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError('Failed to load analytics data.');
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [user]);

    if (!user) {
        return (
            <div className="flex flex-col h-[calc(100vh-65px)] items-center justify-center bg-surface px-4 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-gray-400 max-w-sm mb-4">Please log in to view the analytics dashboard.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col h-[calc(100vh-65px)] items-center justify-center bg-surface">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-[calc(100vh-65px)] items-center justify-center bg-surface px-4 text-center">
                <p className="text-red-400 font-medium mb-4">{error}</p>
            </div>
        );
    }

    const { totalConversations, totalMessages, avgResponseTime, csat, agentUsage } = data;
    const totalAgentInvocations = Object.values(agentUsage).reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-[calc(100vh-65px)] bg-surface relative overflow-hidden pb-12">
            {/* Ambient glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-4 pt-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white">System Analytics</h1>
                    <p className="mt-2 text-gray-400 text-sm">Performance tracking, satisfaction ratings, and agent usage metrics.</p>
                </div>

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-white/10 transition-all">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Chats</span>
                        <div className="text-3xl font-bold text-white mt-2">{totalConversations}</div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-white/10 transition-all">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Messages</span>
                        <div className="text-3xl font-bold text-white mt-2">{totalMessages}</div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-white/10 transition-all">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Avg Response Time</span>
                        <div className="text-3xl font-bold text-white mt-2">{avgResponseTime > 0 ? `${(avgResponseTime/1000).toFixed(2)}s` : 'N/A'}</div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-white/10 transition-all">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">CSAT Score</span>
                        <div className="text-3xl font-bold text-brand-400 mt-2">{csat}%</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Agent Usage Distribution Chart */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:col-span-2">
                        <h2 className="text-lg font-semibold text-white mb-6">Agent Routing Distribution</h2>
                        <div className="space-y-5">
                            {Object.entries(agentUsage).map(([agent, count]) => {
                                const meta = AGENT_LABELS[agent] || { label: agent, color: 'bg-gray-500', text: 'text-gray-400' };
                                const pct = totalAgentInvocations > 0 ? (count / totalAgentInvocations) * 100 : 0;
                                return (
                                    <div key={agent} className="space-y-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-300">{meta.label}</span>
                                            <span className={`font-semibold ${meta.text}`}>{count} ({pct.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${meta.color} transition-all duration-500`}
                                                style={{ width: `${pct}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {totalAgentInvocations === 0 && (
                                <div className="text-center text-sm text-gray-500 py-12">
                                    No agent routing data available yet. Start chatting to populate metrics!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Insights Card */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4">System Insights</h2>
                            <ul className="space-y-3.5 text-sm text-gray-400">
                                <li className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0"></span>
                                    <span>
                                        CSAT score stands at <strong className="text-white">{csat}%</strong> based on customer ratings.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0"></span>
                                    <span>
                                        Average pipeline execution speed is <strong className="text-white">{(avgResponseTime/1000).toFixed(2)}s</strong>.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0"></span>
                                    <span>
                                        The multi-agent pipeline has successfully handled <strong className="text-white">{totalAgentInvocations}</strong> agent calls.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-8 border-t border-white/5 pt-6 text-center">
                            <span className="text-xs text-gray-500 block mb-1">Last Updated</span>
                            <span className="text-sm font-medium text-gray-300">{new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
