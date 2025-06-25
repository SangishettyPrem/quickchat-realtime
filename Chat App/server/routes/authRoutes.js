import express from "express";
import { LoginController, Logout, SignUpController, VerifyUser, UpdateProfile } from "../Controllers/AuthController.js";
import ensuredAuthenticated from "../Middlewares/ensuredAuthenticated.js";
import upload from "../Middlewares/multer.js";

const router = express.Router();

router.get('/verifyUser', VerifyUser);
router.get('/logout', Logout);

router.post('/signup', SignUpController);
router.post('/login', LoginController);

router.put('/UpdateProfile/:id', ensuredAuthenticated, upload.single('profileImage'), UpdateProfile)

export default router;