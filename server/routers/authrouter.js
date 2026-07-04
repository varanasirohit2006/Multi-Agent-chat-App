import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authcontrollers.js';
import { protect } from '../middleware/auth.js';

const authrouter = express.Router();

authrouter.post('/auth/register', registerUser);
authrouter.post('/auth/login', loginUser);
authrouter.get('/auth/me', protect, getMe);

export default authrouter;