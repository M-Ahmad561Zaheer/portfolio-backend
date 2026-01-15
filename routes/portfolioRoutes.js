const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Project = require('../models/Project');
const nodemailer = require('nodemailer');
const Message = require('../models/Message');
const multer = require('multer');
const path = require('path');
const adminAuth = require('../Middlewares/authMiddleware'); 

// --- 1. STORAGE CONFIGURATION (Sab se upar) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Check karein 'backend/uploads' folder maujood hai
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });

// --- 2. EDUCATION ROUTES ---
router.get('/education', async (req, res) => {
    try {
        const edu = await Education.find().sort({ createdAt: -1 });
        res.json(edu || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/education', async (req, res) => {
    try {
        const newEdu = new Education(req.body);
        const savedEdu = await newEdu.save();
        res.status(201).json(savedEdu);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- 3. EXPERIENCE ROUTES ---
router.get('/experience', async (req, res) => {
    try {
        const exp = await Experience.find().sort({ createdAt: -1 });
        res.json(exp || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/experience', async (req, res) => {
    try {
        const newExp = new Experience(req.body);
        const savedExp = await newExp.save();
        res.status(201).json(savedExp);
    } catch(err) {
        res.status(400).json({message : err.message});
    }
});

// --- 4. PROJECTS ROUTES ---
router.get('/projects', async (req, res) => {
    try {
        const projs = await Project.find().sort({ createdAt: -1 });
        res.json(projs || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/projects',adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, techStack, liveLink, githubLink } = req.body; // githubLink yahan add karein
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    const newProject = new Project({
      title,
      description,
      image: imagePath,
      techStack: techStack ? techStack.split(',') : [],
      liveLink,
      githubLink // yahan bhi add karein
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- 5. CONTACT ROUTE ---
router.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        // 1. Database mein save karein
        const newMessage = new Message({ name, email, subject, message });
        await newMessage.save();

        // 2. Email bhejane ka setup
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: email, // Bhejne wale ka email
            to: process.env.EMAIL_USER, // Aapka apna email jahan message receive hoga
            subject: `New Portfolio Message: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (err) {
        console.log("Contact Error:", err); // Error dekhne ke liye
        res.status(500).json({ success: false, message: err.message });
    }
});
// Saare messages dekhne ke liye (Dashboard ke liye)
router.get('/messages', adminAuth, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Kisi purane message ko delete karne ke liye (Optional)
router.delete('/messages/:id', async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// --- 6. UPDATE ROUTES (PUT) ---
// ==========================================

// Update Education
router.put('/education/:id', async (req, res) => {
    try {
        const updated = await Education.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// Update Experience
router.put('/experience/:id', async (req, res) => {
    try {
        const updated = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// Update Project (With Multer for Image)
router.put('/projects/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }
        // TechStack agar string mein aaye toh array banayein
        if (updateData.techStack && typeof updateData.techStack === 'string') {
            updateData.techStack = updateData.techStack.split(',');
        }

        const updated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// ==========================================
// --- 7. DELETE ROUTES (DELETE) ---
// ==========================================

router.delete('/education/:id', async (req, res) => {
    try {
        await Education.findByIdAndDelete(req.params.id);
        res.json({ message: "Education deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/experience/:id', async (req, res) => {
    try {
        await Experience.findByIdAndDelete(req.params.id);
        res.json({ message: "Experience deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/projects/:id', adminAuth, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Project deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
// --- 8. REPLY TO MESSAGE ROUTE (Updated to Save in DB) ---
router.post('/messages/reply', adminAuth, async (req, res) => {
    // Ab hum 'id' bhi le rahe hain frontend se
    const { id, to, subject, message } = req.body; 

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Portfolio Admin" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: message 
        };

        // 1. Pehle email bhejein
        await transporter.sendMail(mailOptions);

        // 2. PHIR DATABASE UPDATE KAREIN (Zaroori Step)
        // Hum message ki ID se usay dhoond kar update kar rahe hain
        await Message.findByIdAndUpdate(id, {
            replyText: message, // Aapka bheja hua text save hoga
            status: 'Replied'    // Status 'Unread' se 'Replied' ho jayega
        });

        res.status(200).json({ success: true, message: "Reply sent and saved to DB!" });
    } catch (err) {
        console.error("Reply Error:", err);
        res.status(500).json({ success: false, message: "Failed to send/save reply." });
    }
});
module.exports = router;