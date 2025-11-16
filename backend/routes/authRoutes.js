const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/firebaseAuth');
const { register, login, googleRegister, googleLogin } = require('../controllers/authController');
const User = require('../models/User');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register or login user with Firebase token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registration/login successful, returns user data
 *       401:
 *         description: Invalid or missing token
 *       500:
 *         description: Server error
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Verify Firebase token and get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Login successful, returns user data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found in DB
 *       500:
 *         description: Server error
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/google-register:
 *   post:
 *     summary: Register user with Google token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Google registration successful, returns user data
 *       401:
 *         description: Invalid or missing token
 *       500:
 *         description: Server error
 */
router.post('/google-register', authenticateUser, googleRegister);

/**
 * @swagger
 * /auth/google-login:
 *   post:
 *     summary: Login user with Google token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Google login successful, returns user data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found in DB
 *       500:
 *         description: Server error
 */
router.post('/google-login', authenticateUser, googleLogin);

module.exports = router;
