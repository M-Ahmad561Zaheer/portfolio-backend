const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. Middlewares
app.use(cors({
  origin: ["https://az-developers.vercel.app", "https://portfolio-frontend-rust-pi.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // OPTIONS yahan shamil hai
  allowedHeaders: ["Content-Type", "admin-secret-key", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
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


// 8. Login Route
app.post('/api/v1/auth/login', (req, res) => {
  const { password } = req.body;

  // Logs hamesha response se PEHLE honi chahiye
  console.log("Input Pass:", password);
  console.log("Env Pass:", process.env.ADMIN_PASSWORD);

  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ 
      success: true, 
      adminKey: process.env.ADMIN_SECRET_KEY 
    });
  } else {
    // Agar ye 401 aa raha hai, toh upar wala log bataye ga kyun
    return res.status(401).json({ success: false, message: "Ghalat Password!" });
  }
});

// 9. Port Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));

module.exports=app;