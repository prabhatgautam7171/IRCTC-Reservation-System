import express from 'express';
import { googleAuth } from '../../controller/authController/googleAuthController.js';
const router = express.Router();

router.route('/login').post(googleAuth);

export default router;
