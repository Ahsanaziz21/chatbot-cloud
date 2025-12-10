# Firebase Deployment Guide

This guide covers deploying the Cloud-Based Chatbot System to Google Firebase using Cloud Functions and Hosting.

## Prerequisites

1. **Google Cloud Account** — create one at [https://cloud.google.com/](https://cloud.google.com/)
2. **Firebase Project** — create via [Firebase Console](https://console.firebase.google.com/)
3. **Node.js 18+** — [install here](https://nodejs.org/)
4. **Firebase CLI** — install globally:
   ```bash
   npm install -g firebase-tools
   ```

## Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `chatbot-cloud-project`
4. Accept default settings and create
5. Once created, note your **Project ID**

### Step 2: Authenticate with Firebase

```bash
firebase login
```

This will open a browser and authenticate your Google account.

### Step 3: Configure Your Project

Update `.firebaserc` with your Firebase project ID:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

Replace `your-firebase-project-id` with your actual Firebase project ID.

### Step 4: Install Dependencies

Install both main and functions dependencies:

```bash
# Install main project dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

## Local Development & Testing

### Test Cloud Functions Locally

```bash
firebase emulators:start --only functions
```

This starts the Firebase Functions emulator on `http://localhost:5001`. Update your frontend API endpoint in `index.html` if testing locally:

```html
<meta name="api-endpoint" content="http://localhost:5001/chatbot-cloud-project/us-central1/api/messages">
```

### Test Frontend with Local Functions

```bash
# In a separate terminal, serve the frontend
cd client/public
python3 -m http.server 8000
```

Open `http://localhost:8000` and test chatbot interactions. The frontend will call the local Firebase Functions emulator.

## Deployment

### Deploy Everything to Firebase

```bash
firebase deploy
```

This will:
1. Deploy Cloud Functions to Firebase Functions
2. Deploy frontend to Firebase Hosting

Expected output:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project-id
Hosting URL: https://your-project-id.web.app
Functions URL: https://us-central1-your-project-id.cloudfunctions.net/api
```

### Deploy Only Functions

```bash
firebase deploy --only functions
```

### Deploy Only Hosting

```bash
firebase deploy --only hosting
```

## Accessing Your Deployment

- **Frontend** — https://your-project-id.web.app
- **API Health Check** — https://your-project-id.web.app/api/health
- **Send Message** — POST to https://your-project-id.web.app/api/messages

## Viewing Logs

View real-time Cloud Functions logs:

```bash
firebase functions:log
```

## Database Integration (Optional)

To enable message storage in Firestore:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → **Firestore Database**
3. Click **Create Database**
4. Choose **Start in production mode**
5. Select a region (e.g., `us-central1`)
6. Click **Create**

Messages will now be automatically saved to the `messages` collection. You can view them in the Firebase Console.

## Environment Configuration

Create a `functions/.env.local` file for local development (if needed):

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
```

Firebase automatically provides credentials for Cloud Functions, so additional authentication is usually not needed.

## Cleanup

To delete all Firebase resources:

```bash
firebase delete
```

Then confirm when prompted. This will remove:
- Cloud Functions
- Firebase Hosting deployment
- Firestore database (if enabled)

## Troubleshooting

### CORS Errors
The API has CORS enabled by default. If you still get CORS errors:
- Check that requests are from your Firebase Hosting domain
- Verify `firebase.json` rewrites are correct

### Functions Not Deploying
- Run `firebase deploy --debug` for verbose output
- Ensure all dependencies are installed: `cd functions && npm install`
- Check Node.js version: `node --version` (should be 18+)

### Can't Connect to Local Emulator
- Ensure emulator is running: `firebase emulators:start --only functions`
- Update frontend API endpoint to the full local URL
- Check firewall settings

### Project ID Not Found
- Run `firebase projects:list` to see available projects
- Update `.firebaserc` with the correct project ID

## Support

For more information:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [Firestore Database Guide](https://firebase.google.com/docs/firestore)
