const mongoose = require('mongoose'); // <--- Ye line add karein

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String },
    message: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    replyText: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);