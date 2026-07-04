import Chat from '../shemas/chat.js';

// GET /api/chats — list all chats for the logged-in user (without full messages)
export const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({ user: req.user._id })
            .select('title createdAt updatedAt')
            .sort({ updatedAt: -1 });
        return res.status(200).json(chats);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch chats', error: error.message });
    }
};

// POST /api/chats — create a new chat
export const createChat = async (req, res) => {
    try {
        const chat = await Chat.create({
            user: req.user._id,
            title: req.body.title || 'New Chat',
            messages: [],
        });
        return res.status(201).json(chat);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create chat', error: error.message });
    }
};

// GET /api/chats/:id — get a single chat with all messages
export const getChatById = async (req, res) => {
    try {
        const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        return res.status(200).json(chat);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch chat', error: error.message });
    }
};

// POST /api/chats/:id/messages — append a message to a chat
export const addMessage = async (req, res) => {
    try {
        const { role, content, intents, agent_outputs, feedback, responseTime } = req.body;

        if (!role || !content) {
            return res.status(400).json({ message: 'role and content are required' });
        }

        const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        chat.messages.push({ role, content, intents, agent_outputs, feedback, responseTime });

        // Auto-set the title from the first user message
        if (chat.title === 'New Chat' && role === 'user') {
            chat.title = content.length > 50 ? content.substring(0, 50) + '...' : content;
        }

        await chat.save();
        return res.status(200).json(chat);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to add message', error: error.message });
    }
};

// DELETE /api/chats/:id — delete a chat
export const deleteChat = async (req, res) => {
    try {
        const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        return res.status(200).json({ message: 'Chat deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete chat', error: error.message });
    }
};

// POST /api/chats/:id/messages/:index/feedback — submit feedback for a specific bot message
export const submitFeedback = async (req, res) => {
    try {
        const { feedback } = req.body;
        const index = parseInt(req.params.index);

        if (feedback !== null && !['up', 'down'].includes(feedback)) {
            return res.status(400).json({ message: 'Invalid feedback value. Must be "up", "down", or null.' });
        }

        const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        if (index < 0 || index >= chat.messages.length) {
            return res.status(400).json({ message: 'Invalid message index' });
        }

        chat.messages[index].feedback = feedback;
        await chat.save();

        return res.status(200).json(chat);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
    }
};

// GET /api/analytics — retrieve RAG agent analytics for the user
export const getAnalytics = async (req, res) => {
    try {
        const chats = await Chat.find({ user: req.user._id });
        
        let totalConversations = chats.length;
        let totalMessages = 0;
        let totalResponseTime = 0;
        let responseTimeCount = 0;
        let thumbsUp = 0;
        let totalFeedbacked = 0;
        
        const agentUsage = {
            billing: 0,
            technical: 0,
            product: 0,
            complaint: 0,
            faq: 0
        };

        for (const chat of chats) {
            totalMessages += chat.messages.length;
            for (const msg of chat.messages) {
                if (msg.role === 'bot') {
                    // Track response times
                    if (msg.responseTime && msg.responseTime > 0) {
                        totalResponseTime += msg.responseTime;
                        responseTimeCount++;
                    }
                    // Track feedback
                    if (msg.feedback) {
                        totalFeedbacked++;
                        if (msg.feedback === 'up') {
                            thumbsUp++;
                        }
                    }
                    // Track agent routing
                    if (msg.intents && msg.intents.length > 0) {
                        for (const intent of msg.intents) {
                            if (agentUsage.hasOwnProperty(intent)) {
                                agentUsage[intent]++;
                            }
                        }
                    }
                }
            }
        }

        const avgResponseTime = responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : 0;
        const csat = totalFeedbacked > 0 ? Math.round((thumbsUp / totalFeedbacked) * 100) : 100;

        return res.status(200).json({
            totalConversations,
            totalMessages,
            avgResponseTime,
            csat,
            agentUsage
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
    }
};
