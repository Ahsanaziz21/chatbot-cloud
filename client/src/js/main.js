// Main.js - Frontend Chat Application

class ChatbotUI {
    constructor() {
        this.chatBox = document.getElementById('chat-box');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.apiEndpoint = 'http://localhost:3000/api/messages';

        this.init();
    }

    init() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    /**
     * Send a message to the chatbot
     */
    async sendMessage() {
        const message = this.userInput.value.trim();

        if (!message) {
            return;
        }

        // Display user message
        this.displayMessage(message, 'user');
        this.userInput.value = '';
        this.userInput.focus();

        try {
            // Send message to backend
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botMessage = data.reply || 'Sorry, I could not process your request.';

            // Display bot response
            this.displayMessage(botMessage, 'bot');
        } catch (error) {
            console.error('Error sending message:', error);
            this.displayMessage(
                'Error: Unable to connect to the chatbot service. Please try again later.',
                'bot'
            );
        }
    }

    /**
     * Display a message in the chat box
     * @param {string} text - The message text
     * @param {string} sender - 'user' or 'bot'
     */
    displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const paragraph = document.createElement('p');
        paragraph.textContent = text;

        messageDiv.appendChild(paragraph);
        this.chatBox.appendChild(messageDiv);

        // Auto-scroll to the latest message
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }
}

// Initialize the chatbot UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ChatbotUI();
    console.log('Chatbot UI initialized');
});
