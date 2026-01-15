const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. Body Parser sabse upar
app.use(express.json());

// 2. CORS Setup
app.use(cors({
  origin: "https://az-developers.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "admin-secret-key"]
}));

// 3. Manual Pre-flight Handler (Vercel ke liye bulletproof tareeka)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://az-developers.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, admin-secret-key');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// 4. Login Route (Isay portfolioRoutes se UPAR rakhein)
app.post('/api/v1/auth/login', (req, res) => {
  const { password } = req.body;
  
  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ 
      success: true, 
      adminKey: process.env.ADMIN_SECRET_KEY 
    });
  } else {
    return res.status(401).json({ success: false, message: "Wrong Password!" });
  }
});

// 5. Routes Middleware
app.use('/api/v1', portfolioRoutes);

// 6. Base Route
app.get('/', (req, res) => {
    res.send('Portfolio API is Running...');
});

// 7. Login Route
app.post('/api/v1/auth/login', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ 
      success: true, 
      adminKey: process.env.ADMIN_SECRET_KEY // Backend se "len5616" bhej raha hai
    });
  } else {
    res.status(401).json({ success: false, message: "Wrong Password!" });
  }
});

// 7. Port Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));