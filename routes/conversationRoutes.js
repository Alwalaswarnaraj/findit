// routes/conversationRoutes.js
import express from 'express';
import { createConversation, getUserConversations, sendMessage, getMessages, deleteMessage, deleteConversation} from '../controllers/conversationCon.js';
import  { protect } from '../middleware/authmiddleware.js';

const conversationRoutes = express.Router();

conversationRoutes.post('/', protect, createConversation);
conversationRoutes.get('/', protect, getUserConversations);
conversationRoutes.post('/:conversationId/messages', protect, sendMessage);
conversationRoutes.get('/:conversationId/messages', protect, getMessages);
conversationRoutes.delete('/messages/:messageId', protect, deleteMessage);
conversationRoutes.delete('/:conversationId', protect, deleteConversation); // Delete conversation route

export default conversationRoutes;