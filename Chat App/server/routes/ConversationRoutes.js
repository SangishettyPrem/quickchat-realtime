import express from "express";
import ensuredAuthenticated from "../Middlewares/ensuredAuthenticated.js";
import { getOrCreateConversation } from "../Controllers/ConversationController.js";
const router = express.Router();

router.post('/getOrCreate', ensuredAuthenticated, getOrCreateConversation);

export default router;