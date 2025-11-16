const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, sendAIMessage, generateSummary, deleteMessage, forwardMessage } = require('../controllers/chatController');
const authenticateUser = require('../middleware/firebaseAuth');

/**
 * @swagger
 * /chat/messages:
 *   get:
 *     summary: Get all chat messages
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chat messages
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/messages', authenticateUser, getMessages);

/**
 * @swagger
 * /chat/messages:
 *   post:
 *     summary: Send a new chat message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/messages', authenticateUser, sendMessage);

/**
 * @swagger
 * /chat/ai-message:
 *   post:
 *     summary: Get AI-generated response from Gemini
 *     description: Sends a list of user messages to Gemini AI and receives a response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sender:
 *                       type: string
 *                       enum: [user, ai]
 *                     text:
 *                       type: string
 *     responses:
 *       200:
 *         description: Gemini AI response generated
 *       400:
 *         description: Invalid message format
 *       500:
 *         description: Server error
 */
router.post('/ai-message', sendAIMessage);

/**
 * @swagger
 * /chat/summary:
 *   post:
 *     summary: Generate chat summary
 *     description: Generates a summary of chat messages based on time or message count.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *               days:
 *                 type: number
 *                 description: Number of days to look back (optional)
 *               messageCount:
 *                 type: number
 *                 description: Number of recent messages to summarize (optional)
 *     responses:
 *       200:
 *         description: Summary generated successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.post('/summary', authenticateUser, generateSummary);

/**
 * @swagger
 * /chat/messages/{id}/forward:
 *   post:
 *     summary: Forward a message to another group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Original message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetGroupId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message forwarded successfully
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Message or user not found
 *       500:
 *         description: Server error
 */
router.post('/messages/:id/forward', authenticateUser, forwardMessage);

/**
 * @swagger
 * /chat/messages/{id}/delete:
 *   post:
 *     summary: Delete a message (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.post('/messages/:id/delete', authenticateUser, deleteMessage);

module.exports = router;
