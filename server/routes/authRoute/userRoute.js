import express from 'express';
import { adminLogin, forgotPassword, getAllUsers, login, logout, register, resetPassword, verifyToken } from '../../controller/authController/userController.js';
import { isAuthenticated } from '../../middleware/isAuthenticated.js';
import { adminOnly } from '../../middleware/isAdmin.js';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/admin-login').post(adminLogin);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/verifyAuth').post( verifyToken);
router.route('/resetPassword').post( resetPassword);
router.route('/get-AllUsers').get(isAuthenticated,adminOnly,getAllUsers);



export default router;