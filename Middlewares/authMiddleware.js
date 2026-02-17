const adminAuth = (req, res, next) => {
  try {
    // 1. Cookie se token uthayen (Jo server.js mein set kiya tha)
    const token = req.cookies ? req.cookies.adminToken : null;

    // Debugging (Vercel logs mein check karne ke liye)
    console.log("Token from Cookie:", token ? "Found" : "Missing");

    // 2. Env variable ke sath match karein
    if (token && token === process.env.ADMIN_SECRET_KEY) {
      next(); // Access Granted ✅
    } else {
      // 3. Agar cookie nahi hai ya match nahi hui
      console.log("Auth Failed: Token mismatch or missing");
      return res.status(401).json({ 
        success: false, 
        message: "Cyber-access denied! Unauthorized session." 
      });
    }
  } catch (err) {
    console.error("Auth Middleware Crash:", err);
    res.status(500).json({ success: false, message: "Internal Auth Error" });
  }
};

module.exports = adminAuth;