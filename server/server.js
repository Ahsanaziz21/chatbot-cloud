// server.js - Main Express.js Server

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes and modules
const messageRoutes = require('./src/api/messageRoutes');
const chatbotLogic = require('./src/chatbot/chatbotLogic');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Cloud-Based Chatbot Server is running!',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            api: '/api/messages',
            websocket: '/socket.io'
        }
    });
});

// Routes
app.use('/api', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Server is running', timestamp: new Date() });
});

// WebSocket Events
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('message', async (data) => {
        console.log(`Message from ${socket.id}:`, data.message);

        try {
            const reply = await chatbotLogic.processMessage(data.message);
            socket.emit('reply', { message: reply, timestamp: new Date() });
        } catch (error) {
            console.error('Error processing message:', error);
            socket.emit('error', { message: 'Error processing your request' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = server;
