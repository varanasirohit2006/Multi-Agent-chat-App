import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const INTENT_COLORS = {
    billing: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    technical: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
    product: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
    complaint: { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/30' },
    faq: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
};

const SUGGESTIONS = [
    "What is NimbusFlow?",
    "What is Acme's support email?",
    "How do I file a complaint?",
    "I need help with installation",
];

function TypingIndicator() {
    return (
        <div className="flex items-start gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl rounded-tl-sm px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
            </div>
        </div>
    );
}

function MessageBubble({ message, index, onFeedback, showFeedbackControls }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex items-start gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                isUser
                    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-violet-500/20'
                    : 'bg-gradient-to-br from-brand-500 to-purple-600 shadow-brand-500/20'
            }`}>
                {isUser ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                )}
            </div>

            <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-5 py-3.5 leading-relaxed ${
                    isUser
                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-tr-sm shadow-lg shadow-brand-500/20'
                        : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-200 rounded-tl-sm'
                }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                    </div>
                </div>

                {!isUser && (
                    <div className="flex items-center justify-between mt-2 ml-1">
                        {/* Intent badges */}
                        {message.intents && message.intents.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {message.intents.map((intent) => {
                                    const colors = INTENT_COLORS[intent] || { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' };
                                    return (
                                        <span
                                            key={intent}
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                                            {intent}
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        {/* Thumbs up/down feedback controls */}
                        {showFeedbackControls && (
                            <div className="flex gap-1.5 ml-auto">
                                <button
                                    onClick={() => onFeedback(index, 'up')}
                                    className={`p-1 rounded hover:bg-white/10 transition-colors cursor-pointer ${
                                        message.feedback === 'up' ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                    title="Helpful response"
                                >
                                    <svg className="w-3.5 h-3.5" fill={message.feedback === 'up' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onFeedback(index, 'down')}
                                    className={`p-1 rounded hover:bg-white/10 transition-colors cursor-pointer ${
                                        message.feedback === 'down' ? 'text-rose-400' : 'text-gray-500 hover:text-rose-300'
                                    }`}
                                    title="Unhelpful response"
                                >
                                    <svg className="w-3.5 h-3.5" fill={message.feedback === 'down' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-7h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ChatItem({ chat, isActive, onClick, onDelete }) {
    return (
        <button
            onClick={onClick}
            className={`w-full group flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all cursor-pointer ${
                isActive
                    ? 'bg-brand-500/15 text-white border border-brand-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
            }`}
        >
            <svg className="w-4 h-4 flex-shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            <span className="flex-1 truncate">{chat.title}</span>
            <span
                onClick={(e) => { e.stopPropagation(); onDelete(chat._id); }}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all cursor-pointer p-0.5"
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
            </span>
        </button>
    );
}

export default function Chat() {
    const { user } = useAuth();
    const [chatList, setChatList] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    /* ── Load chat list ── */
    useEffect(() => {
        if (user) {
            api.get('/chats')
                .then((res) => setChatList(res.data))
                .catch(() => {});
        }
    }, [user]);

    /* ── Auto-scroll ── */
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [activeChatId]);

    /* ── Select chat ── */
    const selectChat = useCallback(async (chatId) => {
        setActiveChatId(chatId);
        if (user) {
            try {
                const res = await api.get(`/chats/${chatId}`);
                setMessages(res.data.messages || []);
            } catch {
                setMessages([]);
            }
        }
    }, [user]);

    /* ── Create new chat ── */
    const createNewChat = useCallback(async () => {
        if (user) {
            try {
                const res = await api.post('/chats', { title: 'New Chat' });
                setChatList((prev) => [res.data, ...prev]);
                setActiveChatId(res.data._id);
                setMessages([]);
            } catch {
                setActiveChatId(null);
                setMessages([]);
            }
        } else {
            setActiveChatId(null);
            setMessages([]);
        }
    }, [user]);

    /* ── Delete chat ── */
    const deleteChat = useCallback(async (chatId) => {
        if (user) {
            try {
                await api.delete(`/chats/${chatId}`);
            } catch { /* ignore */ }
        }
        setChatList((prev) => prev.filter((c) => c._id !== chatId));
        if (activeChatId === chatId) {
            setActiveChatId(null);
            setMessages([]);
        }
    }, [user, activeChatId]);

    /* ── Save a message ── */
    const saveMessage = useCallback(async (chatId, msg) => {
        if (!user || !chatId) return;
        try {
            const res = await api.post(`/chats/${chatId}/messages`, msg);
            setChatList((prev) =>
                prev.map((c) => c._id === chatId ? { ...c, title: res.data.title } : c)
            );
        } catch { /* ignore */ }
    }, [user]);

    /* ── Toggling response feedback ── */
    const handleFeedback = async (index, type) => {
        if (!user || !activeChatId) return;
        
        const currentFeedback = messages[index].feedback;
        const newFeedback = currentFeedback === type ? null : type;
        
        try {
            await api.post(`/chats/${activeChatId}/messages/${index}/feedback`, { feedback: newFeedback });
            setMessages((prev) =>
                prev.map((msg, idx) => idx === index ? { ...msg, feedback: newFeedback } : msg)
            );
        } catch { /* ignore */ }
    };

    /* ── Send message ── */
    async function handleSend(text) {
        const query = (text || input).trim();
        if (!query || loading) return;

        let chatId = activeChatId;
        if (user && !chatId) {
            try {
                const res = await api.post('/chats', { title: 'New Chat' });
                chatId = res.data._id;
                setChatList((prev) => [res.data, ...prev]);
                setActiveChatId(chatId);
            } catch { /* continue */ }
        }

        const userMsg = { role: 'user', content: query };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        saveMessage(chatId, userMsg);

        const startTime = Date.now();

        try {
            const res = await axios.post(`${import.meta.env.VITE_RAG_URL || '/rag'}/query`, { query });
            const responseTime = Date.now() - startTime;

            const botMsg = {
                role: 'bot',
                content: res.data.final_response,
                intents: res.data.intents,
                agent_outputs: res.data.agent_outputs,
                responseTime: responseTime,
                feedback: null
            };
            setMessages((prev) => [...prev, botMsg]);
            saveMessage(chatId, botMsg);
        } catch (err) {
            const responseTime = Date.now() - startTime;
            const errorMsg = {
                role: 'bot',
                content: err.response?.data?.detail || 'Sorry, something went wrong. Please try again.',
                intents: [],
                responseTime: responseTime,
                feedback: null
            };
            setMessages((prev) => [...prev, errorMsg]);
            saveMessage(chatId, errorMsg);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    const isEmpty = messages.length === 0;

    return (
        <div className="flex h-[calc(100vh-65px)] bg-surface">
            {/* Sidebar */}
            {user && sidebarOpen && (
                <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-surface-light/50 flex flex-col">
                    <div className="p-3">
                        <button
                            onClick={createNewChat}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            New Chat
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                        {chatList.map((chat) => (
                            <ChatItem
                                key={chat._id}
                                chat={chat}
                                isActive={chat._id === activeChatId}
                                onClick={() => selectChat(chat._id)}
                                onDelete={deleteChat}
                            />
                        ))}
                        {chatList.length === 0 && (
                            <p className="text-xs text-gray-600 text-center mt-8">No chats yet</p>
                        )}
                    </div>
                </aside>
            )}

            {/* Main chat */}
            <div className="flex-1 flex flex-col relative animate-fade-in">
                {/* Glow backgrounds */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
                </div>

                {user && (
                    <button
                        onClick={() => setSidebarOpen((v) => !v)}
                        className="absolute top-3 left-3 z-20 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                )}

                <div ref={scrollRef} className="flex-1 overflow-y-auto relative z-10">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-full px-4 animate-fade-in">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-brand-500/30 mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Acme Support AI</h2>
                            <p className="text-gray-400 text-sm mb-8 text-center max-w-md">
                                Powered by multi-agent RAG. Ask about billing, products, technical support, or file a complaint.
                            </p>

                            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleSend(s)}
                                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 hover:border-brand-500/40 hover:text-white transition-all duration-200 cursor-pointer"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {!user && (
                                <p className="text-xs text-gray-600 mt-6">
                                    Sign in to save your chat history.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
                            {messages.map((msg, i) => (
                                <MessageBubble
                                    key={i}
                                    index={i}
                                    message={msg}
                                    onFeedback={handleFeedback}
                                    showFeedbackControls={!!user && !!activeChatId}
                                />
                            ))}
                            {loading && <TypingIndicator />}
                        </div>
                    )}
                </div>

                {/* Input bar */}
                <div className="relative z-10 border-t border-white/5 bg-surface-light/80 backdrop-blur-xl">
                    <div className="max-w-3xl mx-auto px-4 py-4">
                        <div className="flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-brand-500/50 focus-within:shadow-lg focus-within:shadow-brand-500/5 transition-all duration-300">
                            <textarea
                                ref={inputRef}
                                id="chat-input"
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything about our products, billing, or support..."
                                disabled={loading}
                                className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm resize-none outline-none max-h-32 disabled:opacity-50"
                                style={{ fieldSizing: 'content' }}
                            />
                            <button
                                id="chat-send-btn"
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                                className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 flex items-center justify-center text-white disabled:opacity-30 hover:shadow-lg hover:shadow-brand-500/30 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-[11px] text-gray-600 text-center mt-2">
                            Acme Support AI uses RAG with multi-agent routing to deliver accurate answers from our knowledge base.
                        </p>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out both;
                }
            `}</style>
        </div>
    );
}
