// dbConfig.js - Database Configuration

const mongoose = require('mongoose');

/**
 * Initialize and configure database connection
 */
class DatabaseConfig {
    constructor() {
        this.connected = false;
    }

    /**
     * Connect to MongoDB database
     * @param {string} connectionString - MongoDB connection URI
     * @returns {Promise<void>}
     */
    async connect(connectionString) {
        try {
            const mongoUri = connectionString || process.env.DATABASE_URL || 'mongodb://localhost:27017/chatbot';

            await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            this.connected = true;
            console.log('✓ Database connected successfully');
        } catch (error) {
            console.error('✗ Database connection failed:', error);
            throw error;
        }
    }

    /**
     * Disconnect from database
     * @returns {Promise<void>}
     */
    async disconnect() {
        try {
            await mongoose.disconnect();
            this.connected = false;
            console.log('✓ Database disconnected');
        } catch (error) {
            console.error('✗ Database disconnection failed:', error);
            throw error;
        }
    }

    /**
     * Check if database is connected
     * @returns {boolean}
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Get database instance
     * @returns {Object} Mongoose connection
     */
    getConnection() {
        return mongoose.connection;
    }
}

// Message Schema
const messageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    userMessage: {
        type: String,
        required: true,
    },
    botResponse: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    sessionId: {
        type: String,
        index: true,
    },
});

// Create Message model
const Message = mongoose.model('Message', messageSchema);

// Export modules
module.exports = {
    DatabaseConfig: new DatabaseConfig(),
    Message,
};
