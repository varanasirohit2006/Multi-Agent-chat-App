import express from 'express';
import { getChats, createChat, getChatById, addMessage, deleteChat, submitFeedback, getAnalytics } from '../controllers/chatcontrollers.js';
import { protect } from '../middleware/auth.js';

const chatRouter = express.Router();

chatRouter.get('/chats', protect, getChats);
chatRouter.post('/chats', protect, createChat);
chatRouter.get('/chats/:id', protect, getChatById);
chatRouter.post('/chats/:id/messages', protect, addMessage);
chatRouter.delete('/chats/:id', protect, deleteChat);
chatRouter.post('/chats/:id/messages/:index/feedback', protect, submitFeedback);
chatRouter.get('/analytics', protect, getAnalytics);

export default chatRouter;
