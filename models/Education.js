const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
    degree: { 
        type: String, 
        required: [true, "Degree name is required"],
        trim: true 
    },
    institute: { 
        type: String, 
        required: [true, "Institute name is required"],
        trim: true 
    },
    duration: { 
        type: String, 
        required: [true, "Duration is required (e.g. 2020-2024)"],
        trim: true 
    },
    description: { 
        type: String,
        trim: true 
    }
}, { 
    timestamps: true // Ye automatically 'createdAt' aur 'updatedAt' add kar dega
});

module.exports = mongoose.model('Education', EducationSchema);