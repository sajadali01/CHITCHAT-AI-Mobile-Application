// Leave group endpoint

const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authenticateUser = require('../middleware/firebaseAuth');

// Leave group endpoint
router.post('/:id/leave', authenticateUser, groupController.leaveGroup);

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Group created
 *       500:
 *         description: Server error
 */
router.post('/', groupController.createGroup);

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: List of groups
 *       500:
 *         description: Server error
 */
router.get('/', groupController.getGroups);

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Get group by ID
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group data
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.get('/:id', groupController.getGroupById);

module.exports = router;
