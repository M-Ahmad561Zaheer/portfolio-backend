const mongoose  = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
    company: { type: String, required: true },
    role: { type: String, required: true },
    type: { type: String, enum: ['Job', 'Internship'], default: 'Job' }, // Taakay dono handle ho jayein
    duration: { type: String, required: true },
    description: { type: String }, // Kya kaam kiya wahan?
}, { timestamps: true });

module.exports = mongoose.model('Experience', ExperienceSchema);