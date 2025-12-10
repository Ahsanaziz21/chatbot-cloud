// messageRoutes.js - API Routes for Message Handling

const express = require('express');
const router = express.Router();
const chatbotLogic = require('../chatbot/chatbotLogic');

/**
 * POST /api/messages
 * Handle incoming user messages and return chatbot responses
 */
router.post('/messages', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                error: 'Message cannot be empty',
            });
        }

        // Process message through chatbot logic
        const reply = await chatbotLogic.processMessage(message);

        res.status(200).json({
            success: true,
            userMessage: message,
            reply: reply,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Error in messageRoutes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process message',
            details: error.message,
        });
    }
});

/**
 * GET /api/messages/:id
 * Retrieve message history for a session/user
 */
router.get('/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // TODO: Implement message history retrieval from database
        const messages = [];

        res.status(200).json({
            success: true,
            sessionId: id,
            messages: messages,
        });
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve messages',
            details: error.message,
        });
    }
});

/**
 * DELETE /api/messages/:id
 * Clear message history for a session
 */
router.delete('/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // TODO: Implement message history deletion from database
        res.status(200).json({
            success: true,
            message: `Message history cleared for session ${id}`,
        });
    } catch (error) {
        console.error('Error deleting messages:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete messages',
            details: error.message,
        });
    }
});

module.exports = router;
