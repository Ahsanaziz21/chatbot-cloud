// api/lib/chatbotLogic.js
// Adapted chatbot logic suitable for Vercel serverless functions

class ChatbotLogic {
    constructor() {
        this.responseDatabase = this.initializeResponseDatabase();
    }

    initializeResponseDatabase() {
        return {
            greetings: {
                keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
                responses: [
                    'Hello! Welcome to the Cloud-Based Chatbot System. How can I help you today?',
                    'Hi there! I\'m here to assist you with any questions about our project.',
                    'Greetings! What would you like to know?'
                ]
            },
            project_info: {
                keywords: ['project', 'what is', 'about', 'describe', 'explain'],
                responses: [
                    'The Cloud-Based Chatbot System is a real-time messaging application deployed on cloud infrastructure. It features a modern UI, robust backend API, and scalable architecture.',
                    'This project implements a chatbot system with frontend and backend components, designed for cloud deployment.'
                ]
            },
            architecture: {
                keywords: ['architecture', 'structure', 'how it works', 'design', 'components'],
                responses: [
                    'The system has three main components: Frontend (HTML/CSS/JS), Backend (Express.js/Node.js), and Cloud Deployment (e.g., Vercel, AWS).',
                    'Our architecture consists of a client-side interface communicating with a backend via REST API or serverless functions for stateless operations.'
                ]
            },
            deployment: {
                keywords: ['deploy', 'cloud', 'aws', 'docker', 'production'],
                responses: [
                    'The application can be deployed using cloud providers like Vercel, AWS, or DigitalOcean. Check the deployment folder for configuration files.',
                    'Deployment is simplified through containerization and platform-managed serverless functions.'
                ]
            },
            thanks: {
                keywords: ['thank', 'thanks', 'thank you', 'appreciate', 'grateful'],
                responses: [
                    'You\'re welcome! Feel free to ask if you have any other questions.',
                    'Happy to help! Is there anything else you\'d like to know?'
                ]
            },
            goodbye: {
                keywords: ['bye', 'goodbye', 'see you', 'exit', 'quit', 'farewell'],
                responses: [
                    'Goodbye! Thanks for chatting with me. Have a great day!',
                    'See you later! Feel free to come back if you have more questions.'
                ]
            }
        };
    }

    async processMessage(userMessage) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const response = this.generateResponse(userMessage);
                resolve(response);
            }, 150);
        });
    }

    generateResponse(userMessage) {
        const lowerMessage = (userMessage || '').toLowerCase();

        for (const category in this.responseDatabase) {
            const { keywords, responses } = this.responseDatabase[category];
            for (const keyword of keywords) {
                if (lowerMessage.includes(keyword)) {
                    return this.selectRandomResponse(responses);
                }
            }
        }

        return this.getDefaultResponse(userMessage);
    }

    selectRandomResponse(responses) {
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }

    getDefaultResponse(userMessage) {
        const defaultResponses = [
            'That\'s an interesting question! Could you provide more details?',
            'I\'m not sure I understood that correctly. Could you rephrase?',
            'I\'m still learning! Can you give me more context about your question?'
        ];
        return this.selectRandomResponse(defaultResponses);
    }
}

module.exports = new ChatbotLogic();
