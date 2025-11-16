const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUsers, changePassword } = require('../controllers/userController');
const authenticateUser = require('../middleware/firebaseAuth');
const User = require('../models/User');

/**
 * @swagger
 * /users/users:
 *   get:
 *     summary: Get list of all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of user objects
 *       500:
 *         description: Server error
 */
router.get('/users', authenticateUser, getUsers);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get your own profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Your user profile
 */
router.get('/me', authenticateUser, getProfile);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update your profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/me', authenticateUser, updateProfile);

/**
 * @swagger
 * /users/me/change-password:
 *   post:
 *     summary: Change your password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/me/change-password', authenticateUser, changePassword);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get list of all users
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '_id name email profileImage'); // only select needed fields
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 