const express = require('express');
const router = express.Router();
const { listUsers, listMessages, getStats } = require('../controllers/adminController');
const authenticateUser = require('../middleware/firebaseAuth'); 

// If you want only admins, you can add a middleware like isAdmin

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get admin stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics
 *       500:
 *         description: Server error
 */
router.get('/stats', authenticateUser, getStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Server error
 */
router.get('/users', authenticateUser, listUsers);

/**
 * @swagger
 * /admin/messages:
 *   get:
 *     summary: List all messages (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of messages
 *       500:
 *         description: Server error
 */
router.get('/messages', authenticateUser, listMessages);

module.exports = router;
