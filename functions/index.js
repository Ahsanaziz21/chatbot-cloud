const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { getChatbotResponse } = require('./chatbotLogic');

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Firebase Cloud Functions are running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Messages endpoint
app.post('/messages', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        error: 'Message cannot be empty'
      });
    }

    // Get chatbot response
    const reply = getChatbotResponse(message);

    // Optional: Save message to Firestore for analytics
    const db = admin.firestore();
    await db.collection('messages').add({
      userMessage: message,
      botReply: reply,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      platform: 'firebase'
    }).catch(error => {
      console.warn('Could not save message to Firestore:', error.message);
      // Don't fail the request if Firestore save fails
    });

    // Return response
    res.json({
      reply: reply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);
