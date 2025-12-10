// Chatbot Logic for Firebase Cloud Functions
// Keyword-based responses for the chatbot

const responses = {
  'hello': 'Hi there! Welcome to the Cloud-Based Chatbot System. How can I help you today?',
  'hi': 'Hello! What can I do for you?',
  'help': 'I can help with questions about the chatbot system. Try asking about features, deployment, or setup.',
  'features': 'The chatbot system includes: Cloud-Based Deployment, Real-time Messaging, MongoDB Integration, Docker Support, AWS/Firebase/Vercel Options.',
  'deployment': 'The system supports deployment on AWS (EC2, ECS), Firebase, Vercel, and Docker. Choose the option that best fits your needs.',
  'setup': 'To set up the chatbot: 1) Clone the repo 2) Install dependencies 3) Configure your cloud platform 4) Deploy using provided scripts.',
  'database': 'The system uses MongoDB for message storage. You can use MongoDB Atlas for cloud hosting or local MongoDB with Docker.',
  'api': 'The API endpoint is /api/messages. Send POST requests with { "message": "your message" } to get bot responses.',
  'architecture': 'Architecture: Frontend (HTML/CSS/JS) → Backend (Node.js/Express or Cloud Functions) → Database (MongoDB). Fully containerized with Docker.',
  'github': 'The project is hosted on GitHub at https://github.com/Ahsanaziz21/chatbot-cloud. Feel free to fork and contribute!',
  'firebase': 'This instance is deployed on Google Firebase using Cloud Functions and Hosting. Fast, scalable, and serverless!',
  'default': 'I didn\'t quite understand that. Try asking about features, deployment, setup, or database. Type "help" for more options.'
};

/**
 * Generate a chatbot response based on user message
 * @param {string} userMessage - The message from the user
 * @returns {string} - The chatbot's response
 */
function getChatbotResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase().trim();

  // Check for exact matches first
  if (responses[lowerMessage]) {
    return responses[lowerMessage];
  }

  // Check for keyword matches
  for (const [keyword, response] of Object.entries(responses)) {
    if (keyword !== 'default' && lowerMessage.includes(keyword)) {
      return response;
    }
  }

  // Return default response if no match
  return responses['default'];
}

module.exports = { getChatbotResponse };
