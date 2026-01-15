const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String }, // URL from Cloudinary or direct link
    techStack: [{ type: String }], // e.g., ["React", "Node", "Tailwind"]
    liveLink: { type: String },
    githubLink: { type: String },
    featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);