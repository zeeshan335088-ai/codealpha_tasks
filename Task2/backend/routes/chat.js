const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Assuming there's an auth middleware

// Search for users
router.get('/search', auth, async (req, res) => {
    try {
        const users = await User.find({
            username: { $regex: req.query.username, $options: 'i' },
            _id: { $ne: req.user.id }
        }).select('username avatar');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a contact
router.post('/add-contact', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.contacts.includes(req.body.contactId)) {
            user.contacts.push(req.body.contactId);
            await user.save();
        }
        res.json({ message: 'Contact added successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get contacts
router.get('/contacts', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('contacts', 'username avatar');
        res.json(user.contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all conversations for a user
router.get('/conversations', async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id
        })
        .populate('participants', 'username avatar')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });
        
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get messages for a conversation
router.get('/messages/:conversationId', async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        })
        .sort({ createdAt: 1 });
        
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create or get conversation between two users
router.post('/conversation', async (req, res) => {
    const { recipientId } = req.body;
    try {
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user.id, recipientId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [req.user.id, recipientId]
            });
            await conversation.save();
        }

        res.json(conversation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
