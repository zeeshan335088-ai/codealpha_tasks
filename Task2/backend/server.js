const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/api/chat', require('./routes/chat'));

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comm-app';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

    const onlineUsers = new Map(); // userId -> socketId

    // Socket.io connection
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('user-online', (userId) => {
            onlineUsers.set(userId, socket.id);
            io.emit('presence-update', Array.from(onlineUsers.keys()));
        });

        // Handle incoming call
        socket.on('initiate-call', ({ callerId, callerName, recipientId, roomId }) => {
            const recipientSocketId = onlineUsers.get(recipientId);
            if (recipientSocketId) {
                socket.to(recipientSocketId).emit('incoming-call', {
                    callerId,
                    callerName,
                    roomId
                });
            }
        });

        // Handle call acceptance
        socket.on('accept-call', ({ roomId, callerId }) => {
            const callerSocketId = onlineUsers.get(callerId);
            if (callerSocketId) {
                socket.to(callerSocketId).emit('call-accepted', { roomId });
            }
        });

        // Handle call decline
        socket.on('decline-call', ({ callerId }) => {
            const callerSocketId = onlineUsers.get(callerId);
            if (callerSocketId) {
                socket.to(callerSocketId).emit('call-declined');
            }
        });

        socket.on('join-room', (roomId, userId) => {
            socket.join(roomId);
            console.log(`User ${userId} joined room ${roomId}`);
            
            // Notify others in the room
            socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });

            socket.on('disconnect', () => {
                console.log(`User ${userId} disconnected`);
                onlineUsers.delete(userId);
                io.emit('presence-update', Array.from(onlineUsers.keys()));
                socket.to(roomId).emit('user-left', { userId, socketId: socket.id });
            });
        });

        // Private messaging
        socket.on('private-message', async (data) => {
            const { conversationId, senderId, recipientId, text } = data;
            const Message = require('./models/Message');
            const Conversation = require('./models/Conversation');

            const newMessage = new Message({
                conversationId,
                sender: senderId,
                text
            });
            await newMessage.save();

            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: newMessage._id
            });

            const recipientSocketId = onlineUsers.get(recipientId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('new-private-message', {
                    conversationId,
                    message: newMessage
                });
            }
        });

        // WebRTC Signaling
        socket.on('offer', (data) => {
            socket.to(data.to).emit('offer', {
                offer: data.offer,
                from: socket.id,
                userId: data.userId
            });
        });

        socket.on('answer', (data) => {
            socket.to(data.to).emit('answer', {
                answer: data.answer,
                from: socket.id
            });
        });

        socket.on('ice-candidate', (data) => {
            socket.to(data.to).emit('ice-candidate', {
                candidate: data.candidate,
                from: socket.id
            });
        });

        // Whiteboard drawing event
        socket.on('draw', (data) => {
            socket.to(data.roomId).emit('draw', data);
        });

        // Chat messaging
        socket.on('send-message', (data) => {
            socket.to(data.roomId).emit('receive-message', {
                text: data.text,
                sender: data.sender,
                timestamp: new Date().toLocaleTimeString()
            });
        });
    });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
