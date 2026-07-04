import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'bot'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    intents: {
        type: [String],
        default: [],
    },
    agent_outputs: {
        type: Map,
        of: String,
        default: {},
    },
    feedback: {
        type: String,
        enum: ['up', 'down', null],
        default: null,
    },
    responseTime: {
        type: Number,
        default: 0,
    },
}, { _id: false, timestamps: { createdAt: true, updatedAt: false } });

const chatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        default: 'New Chat',
    },
    messages: {
        type: [messageSchema],
        default: [],
    },
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
