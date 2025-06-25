import express from 'express';
import { sendMessage, getMessages, markMessagesAsRead } from '../Controllers/MessageController.js';
import ensuredAuthenticated from '../Middlewares/ensuredAuthenticated.js';
const router = express.Router();

router.post('/send', ensuredAuthenticated, sendMessage);
router.patch('/mark-as-read/:id', ensuredAuthenticated, markMessagesAsRead)
router.get('/:conversationId', ensuredAuthenticated, getMessages);

export default router;
