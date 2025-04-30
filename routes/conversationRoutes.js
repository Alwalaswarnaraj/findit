// routes/conversationRoutes.js
import express from 'express';
import { createConversation, getUserConversations, sendMessage, getMessages } from '../controllers/conversationCon.js';
import  { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

router.post('/', protect, createConversation);
router.get('/', protect, getUserConversations);
router.post('/:conversationId/messages', protect, sendMessage);
router.get('/:conversationId/messages', protect, getMessages);

export default router;
