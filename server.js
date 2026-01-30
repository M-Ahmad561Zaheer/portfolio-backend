const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. Middlewares
app.use(cors({
  origin: [
    "https://az-developers.vercel.app", 
    "https://portfolio-frontend-rust-pi.vercel.app", // Fixed '.gapp' to '.app'
    "http://localhost:5173" // Local testing ke liye zaroori hai
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "admin-secret-key", "Authorization"],
  credentials: true
}));

// CORS ke baad ye zaroor likhein
app.options('*', cors());

app.use(express.json());

// ⚠️ Vercel par static uploads folder aksar kaam nahi karta agar aap file write kar rahe hon
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Database Connection (Improved with Error Catching)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected...'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 4. Routes
const portfolioRoutes = require('./routes/portfolioRoutes');
app.use('/api/v1', portfolioRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('Portfolio API is Running...');
});

// 8. Login Route
app.post('/api/v1/auth/login', (req, res) => {
  try {
    const { password } = req.body;
    
    // Debugging ke liye (Vercel Logs mein dikhega)
    if (!process.env.ADMIN_PASSWORD) {
        return res.status(500).json({ message: "Server configuration missing: ADMIN_PASSWORD" });
    }

    if (password === process.env.ADMIN_PASSWORD) {
      return res.json({ 
        success: true, 
        adminKey: process.env.ADMIN_SECRET_KEY 
      });
    } else {
      return res.status(401).json({ success: false, message: "Incorrect Password!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error during login" });
  }
});

// Global Error Handler (Ye 500 error ko catch karega aur message dikhayega)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    success: false,
    message: "Something went wrong on the server!",
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));

module.exports = app;