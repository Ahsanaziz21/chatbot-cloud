// api/messages.js - Vercel Serverless handler for POST /api/messages
const chatbotLogic = require('./lib/chatbotLogic');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    // CORS preflight (Vercel handles this but keep safe)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body || {};
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const reply = await chatbotLogic.processMessage(message);
    return res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error('Error in /api/messages:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
