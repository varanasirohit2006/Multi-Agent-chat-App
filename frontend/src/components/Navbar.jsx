import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <nav className="border-b border-white/10 bg-surface-light/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-white">Acme AI</span>
                </Link>

                <div className="flex items-center gap-3">
                    <Link
                        to="/chat"
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                        </svg>
                        AI Chat
                    </Link>

                    {user ? (
                        <>
                            <Link to="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                                Dashboard
                            </Link>
                            <Link to="/analytics" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                                Analytics
                            </Link>
                            <span className="text-sm text-gray-500 hidden sm:inline">|</span>
                            <span className="text-sm text-gray-400 hidden sm:inline">{user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
