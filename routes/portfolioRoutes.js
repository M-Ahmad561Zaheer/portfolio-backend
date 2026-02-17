const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Project = require('../models/Project');
const nodemailer = require('nodemailer');
const Message = require('../models/Message');
const Review = require('../models/Review');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const adminAuth = require('../Middlewares/authMiddleware'); 

// 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Cloudinary Storage (Vercel ke liye best)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const upload = multer({ storage });

// --- EDUCATION ROUTES ---
router.get('/education', async (req, res) => {
    try {
        const edu = await Education.find().sort({ createdAt: -1 });
        res.json(edu || []);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/education', adminAuth, async (req, res) => {
    try {
        const newEdu = new Education(req.body);
        await newEdu.save();
        res.status(201).json(newEdu);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- EXPERIENCE ROUTES ---
router.get('/experience', async (req, res) => {
    try {
        const exp = await Experience.find().sort({ createdAt: -1 });
        res.json(exp || []);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/experience', adminAuth, async (req, res) => {
    try {
        const newExp = new Experience(req.body);
        await newExp.save();
        res.status(201).json(newExp);
    } catch(err) { res.status(400).json({message : err.message}); }
});

// --- PROJECTS ROUTES ---
router.get('/projects', async (req, res) => {
    try {
        // Check karein ke Project model defined hai ya nahi
        if (!Project) {
            return res.status(500).json({ message: "Project Model not found" });
        }
        
        const projs = await Project.find().sort({ createdAt: -1 });
        // Hamesha array return karein
        res.status(200).json(projs || []);
    } catch (err) { 
        console.error("Projects Fetch Error:", err); // Ye Vercel logs mein dikhega
        res.status(500).json({ message: "Database Error: " + err.message }); 
    }
});

router.post('/projects', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, techStack, liveLink, githubLink } = req.body;
    const imageURL = req.file ? req.file.path : ''; // Cloudinary URL

    const newProject = new Project({
      title,
      description,
      image: imageURL,
      techStack: techStack ? (Array.isArray(techStack) ? techStack : techStack.split(',')) : [],
      liveLink,
      githubLink
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/projects/:id', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.path; // Cloudinary URL update
        }
        if (updateData.techStack && typeof updateData.techStack === 'string') {
            updateData.techStack = updateData.techStack.split(',');
        }
        const updated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- CONTACT & MESSAGES ---
router.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        const newMessage = new Message({ name, email, subject, message });
        await newMessage.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: `New Message: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Sent!" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/messages', adminAuth, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// --- DASHBOARD STATS ROUTE ---
router.get('/dashboard-stats', adminAuth, async (req, res) => {
    try {
        const totalProjects = await Project.countDocuments();
        const totalMessages = await Message.countDocuments();
        const pendingMessages = await Message.countDocuments({ status: 'Pending' });
        const totalExperience = await Experience.countDocuments();
        const totalReviews = await Review.countDocuments();

        res.status(200).json({
            success: true,
            stats: {
                projects: totalProjects,
                messages: totalMessages,
                pending: pendingMessages,
                experience: totalExperience,
                reviews: totalReviews
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- DELETE ROUTES ---

// 1. Delete Project
router.delete('/projects/:id', adminAuth, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Project Deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. Delete Education
router.delete('/education/:id', adminAuth, async (req, res) => {
    try {
        await Education.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Education Deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. Delete Experience
router.delete('/experience/:id', adminAuth, async (req, res) => {
    try {
        await Experience.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Experience Deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 4. Delete Message
router.delete('/messages/:id', adminAuth, async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Message Deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- MESSAGE REPLY ROUTE ---
router.post('/messages/reply', adminAuth, async (req, res) => {
    const { id, to, subject, message } = req.body;

    try {
        // 1. Nodemailer Transporter Setup
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to, // User ka email
            subject: subject,
            text: message
        };

        // 2. Send Email
        await transporter.sendMail(mailOptions);

        // 3. Update Message in Database (Status and Reply Text)
        const updatedMessage = await Message.findByIdAndUpdate(
            id, 
            { 
                status: 'Replied', 
                replyText: message 
            }, 
            { new: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({ success: false, message: "Message ID not found in database." });
        }

        res.status(200).json({ success: true, message: "Reply delivered and database updated!" });

    } catch (err) {
        console.error("Reply Error:", err);
        res.status(500).json({ success: false, message: "Failed to send email. Check your Gmail App Password." });
    }
});
                 
// --- REVIEWS ROUTES ---
 
// 1. Get all reviews (For Admin & Frontend)
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Add a new Review (Admin Only)
router.post('/reviews', adminAuth, async (req, res) => {
    try {
        const newReview = new Review(req.body);
        await newReview.save();
        res.status(201).json({ success: true, message: "Review Added!" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. Delete Review
router.delete('/reviews/:id', adminAuth, async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: "Review Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// 4. Update Review (Admin Only)
router.put('/reviews/:id', adminAuth, async (req, res) => {
    try {
        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Taake updated data wapis milay
        );
        
        if (!updatedReview) {
            return res.status(404).json({ message: "Review not found!" });
        }
        
        res.json({ success: true, message: "Review Updated!", data: updatedReview });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;