# Cloud-Based Chatbot System

A comprehensive cloud-based chatbot application with a modern frontend interface and a robust backend API built with Express.js and Node.js.

## Project Overview

This project implements a real-time chatbot system deployed on cloud infrastructure (AWS). It features:
- **Frontend**: HTML, CSS, and JavaScript for an interactive user interface
- **Backend**: Node.js/Express server with WebSocket/RESTful API support
- **Cloud Deployment**: AWS infrastructure with CloudFormation and Docker support
- **Database**: Optional MongoDB/PostgreSQL integration

## Project Structure

```
Cloud-Based-Chatbot-System/
├── README.md
├── .gitignore
├── Docs/
│   ├── Project_Report.docx
│   ├── Architecture_Diagram.png
│   └── Chatbot_Logic_Flowchart.png
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   │       ├── css/
│   │       │   └── style.css
│   │       └── images/
│   ├── src/
│   │   └── js/
│   │       └── main.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── api/
│   │   │   └── messageRoutes.js
│   │   ├── chatbot/
│   │   │   └── chatbotLogic.js
│   │   └── database/
│   │       └── dbConfig.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── deployment/
    ├── aws-config/
    │   ├── cloudformation.yaml
    │   └── ec2_setup_script.sh
    └── Dockerfile
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- AWS account (for deployment)
- Docker (optional, for containerization)

### Installation

#### Backend Setup
```bash
cd server
npm install
```

#### Frontend Setup
```bash
cd client
npm install
```

### Running Locally

#### Start Backend Server
```bash
cd server
npm start
```

The server will run on `http://localhost:3000`

#### Open Frontend
Open `client/public/index.html` in your browser or serve it with a local web server.

## API Documentation

### Endpoints

- **POST** `/api/messages` - Send a message to the chatbot
- **GET** `/api/messages/:id` - Retrieve message history
- **WebSocket** `/socket.io` - Real-time message streaming

## Deployment

### AWS Deployment

1. Configure AWS credentials
2. Update `deployment/aws-config/cloudformation.yaml` with your parameters
3. Deploy using CloudFormation:
   ```bash
   aws cloudformation create-stack --stack-name chatbot-stack --template-body file://deployment/aws-config/cloudformation.yaml
   ```

### Docker Deployment

```bash
docker build -t chatbot-app .
docker run -p 3000:3000 chatbot-app
```

## Environment Variables

Create a `.env` file in the `server/` directory:

```
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/chatbot
API_KEY=your_api_key_here
```

## Features

- Real-time message processing
- Cloud-based infrastructure
- Scalable architecture
- RESTful API and WebSocket support
- Responsive UI design
- Error handling and logging

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@chatbotsystem.com or open an issue in the repository.
