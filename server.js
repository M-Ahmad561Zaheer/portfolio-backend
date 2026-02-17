const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser'); // ✅ Zaroori import
require('dotenv').config();

const app = express();

// 1. Middlewares - Re-configured for Vercel Cookies
app.use(cors({
  origin: [
    "https://az-developers.vercel.app", 
    "https://portfolio-frontend-rust-pi.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], // admin-secret-key yahan se hata dein
  credentials: true 
}));

app.use(cookieParser()); // ✅ Ye line missing thi, iske baghair req.cookies nahi chalega
app.use(express.json());

// ⚠️ Static files logic
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Database Connection
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

// 8. Updated Login Route with Cookie Drop
app.post('/api/v1/auth/login', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET_KEY) {
        return res.status(500).json({ message: "Server configuration missing (Env variables)" });
    }

    if (password === process.env.ADMIN_PASSWORD) {
      // ✅ Drop the cookie here
      res.cookie('adminToken', process.env.ADMIN_SECRET_KEY, {
        httpOnly: true,
        secure: true,      // Must be true for Vercel/HTTPS
        sameSite: 'none',  // Must be 'none' for cross-domain cookies
        maxAge: 24 * 60 * 60 * 1000 
      });

      return res.json({ 
        success: true, 
        message: "Logged in successfully!" 
      });
    } else {
      return res.status(401).json({ success: false, message: "Incorrect Password!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error during login" });
  }
});

// Logout logic
app.post('/api/v1/auth/logout', (req, res) => {
    res.clearCookie('adminToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.json({ success: true, message: "Logged out" });
});

// Global Error Handler
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