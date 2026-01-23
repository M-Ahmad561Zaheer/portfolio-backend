const nodemailer = require('nodemailer');
const Message = require('../models/Message');

// "export const" ko "const" kar dein agar CommonJS use kar rahe hain
const replyToMessage = async (req, res) => {
  // 1. adminPassword yahan se hata dein kyunke ye frontend se nahi aa raha
  const { id, to, subject, message } = req.body; 

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Email bhejna
    await transporter.sendMail({
      from: `AZ Developers <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
    });

    // 3. Database update karna
    await Message.findByIdAndUpdate(id, { 
      status: 'Replied',
      replyText: message 
    });

    res.status(200).json({ success: true, message: "Reply sent and DB updated!" });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to send reply" });
  }
};

module.exports = { replyToMessage }; // Export sahi karein