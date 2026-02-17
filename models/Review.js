// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    clientRole: { type: String },
    reviewText: { type: String, required: true },
    rating: { type: Number, default: 5 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);