const nodemailer = require('nodemailer');
const Message = require('../models/Message'); // Aapka Message Model

export const replyToMessage = async (req, res) => {
  const { id, to, subject, message, adminPassword } = req.body; 

  // --- SECURITY CHECK ---
  // Sirf tabhi reply bhejein jab request mein sahi password ho
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ success: false, message: "Unauthorized access!" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `AZ Developers <${process.env.EMAIL_USER}>`, // Professional name
      to,
      subject,
      text: message,
    });

    await Message.findByIdAndUpdate(id, { 
      status: 'Replied',
      replyText: message 
    });

    res.status(200).json({ success: true, message: "Reply sent and DB updated!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to send reply" });
  }
};