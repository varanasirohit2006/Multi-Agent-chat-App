import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 bg-surface relative">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl"></div>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
                <div className="text-center mb-2">
                    <h1 className="text-2xl font-bold text-white">Create account</h1>
                    <p className="text-sm text-gray-400 mt-1">Get started with Acme Support AI</p>
                </div>

                {error && (
                    <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">{error}</p>
                )}

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-300">Name</label>
                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-all"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-300">Email</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-all"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-300">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 font-semibold text-white hover:shadow-lg hover:shadow-brand-500/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                    {submitting ? 'Creating account...' : 'Register'}
                </button>

                <p className="text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </form>
        </div>
    );
}
