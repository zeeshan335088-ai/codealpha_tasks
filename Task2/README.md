# CommApp - Real-Time Communication App

A full-stack real-time communication application with video calls, chat, whiteboard, and file sharing capabilities.

## Features

- **Video Calls**: Real-time peer-to-peer video calls using WebRTC
- **Chat**: One-on-one private messaging
- **Whiteboard**: Collaborative drawing canvas
- **File Sharing**: Upload and share files
- **Online Presence**: See when users are online
- **User Authentication**: Sign up and log in to access features

## Tech Stack

### Backend
- Node.js
- Express.js
- Socket.io (for real-time communication)
- MongoDB (with Mongoose ODM)
- JWT (for authentication)
- bcryptjs (for password hashing)

### Frontend
- React
- Vite (build tool)
- Tailwind CSS (for styling)
- Socket.io Client
- Lucide React (for icons)
- Axios (for API calls)

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB running locally or a MongoDB Atlas account

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Communication App
   ```

2. **Backend Setup**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the backend directory with the following variables:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/comm-app  # or your MongoDB Atlas URI
     JWT_SECRET=your-secret-key-here
     ```
   - Start the backend server:
     ```bash
     npm start
     # or for development with nodemon:
     npm run dev
     ```

3. **Frontend Setup**:
   - Open a new terminal, navigate to the frontend directory:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the frontend development server:
     ```bash
     npm run dev
     ```

## Usage

1. **Sign Up / Log In**: Create an account or log in to an existing one.
2. **Add Contacts**: Search for and add other users to your contacts list.
3. **Start a Chat**: Select a contact to start a private chat.
4. **Make a Video Call**: Click the video call button in the People List or Chat to call a contact. The recipient will receive a notification to accept or decline the call.
5. **Use the Whiteboard**: Navigate to the Draw tab to use the collaborative whiteboard.
6. **Share Files**: Use the Files tab to upload and share files (coming soon!).

## Project Structure

```
Communication App/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── fileController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── chat.js
│   │   └── files.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth.jsx
    │   │   ├── Chat.jsx
    │   │   ├── ChatList.jsx
    │   │   ├── PeopleList.jsx
    │   │   └── SearchModal.jsx
    │   ├── App.jsx
    │   ├── VideoRoom.jsx
    │   ├── Whiteboard.jsx
    │   ├── index.css
    │   ├── main.jsx
    │   └── socket.js
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## License

MIT
