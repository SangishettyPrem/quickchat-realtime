import express from "express"
import ensuredAuthenticated from "../Middlewares/ensuredAuthenticated.js";
import { fetchUsers } from "../Controllers/ChatsControllers.js";

const router = express.Router();

router.get('/fetchUsers', ensuredAuthenticated, fetchUsers);

export default router;