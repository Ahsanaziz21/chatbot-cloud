document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // IMPORTANT: **Change this URL** to your deployed cloud API endpoint for submission.
    // Use http://localhost:3000 for local testing only.
    const serverUrl = 'http://localhost:3000/api/chat'; 

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    /**
     * Appends a message to the chat display.
     * @param {string} sender - 'user' or 'bot'
     * @param {string} text - The message content
     */
    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
    }

    /**
     * Handles sending the user message to the server API[cite: 34].
     */
    async function sendMessage() {
        const userMessage = userInput.value.trim();
        if (userMessage === '') return;

        // 1. Display user message and clear input
        appendMessage('user', userMessage);
        userInput.value = '';

        try {
            // 2. POST the message to the Server-Side API [cite: 34]
            const response = await fetch(serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) {
                // Handle non-200 responses
                throw new Error(`API error! Status: ${response.status}`);
            }

            // 3. Get the chatbot response [cite: 35]
            const data = await response.json();
            const botResponse = data.response;

            // 4. Display the response in real time [cite: 36]
            appendMessage('bot', botResponse);

        } catch (error) {
            console.error('Error communicating with the server:', error);
            appendMessage('bot', `Error: Cannot reach the API at ${serverUrl}. Ensure the server is running and the URL is correct for the cloud deployment.`);
        }
    }
});