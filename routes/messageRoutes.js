const express = require('express');
const router = express.Router();
// Controller functions ko import karein
const { replyToMessage, getMessages, deleteMessage } = require('../Controllers/messageController');

// 💡 Alag file se middleware ko import karein
const adminAuth = require('../Middlewares/authMiddleware'); 

// Ab saare routes protected hain
router.post('/reply', adminAuth, replyToMessage);
router.get('/', adminAuth, getMessages);
router.delete('/:id', adminAuth, deleteMessage);

module.exports = router;