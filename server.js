const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. Middlewares
// server.js mein cors wala hissa aise change karein
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://az-developers.vercel.app" // Apni live site ko allow karein
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "admin-secret-key"],
  credentials: true
}));
app.use(express.json());

// 2. Static Folder for Images (Multer ke liye zaroori hai)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected...');
  })
  .catch((err) => { 
    console.error('❌ Error connecting to MongoDB:', err);
  });

// 4. Routes Import
const portfolioRoutes = require('./routes/portfolioRoutes');

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
    res.status(401).json({ success: false, message: "Ghalat Password!" });
  }
});

// 7. Port Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));