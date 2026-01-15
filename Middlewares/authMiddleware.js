const adminAuth = (req, res, next) => {
  const adminKey = req.headers['admin-secret-key'];

  console.log("Key from Frontend:", adminKey);
  console.log("Key in .env:", process.env.ADMIN_SECRET_KEY);

  if (adminKey && adminKey === process.env.ADMIN_SECRET_KEY) {
    next();
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
module.exports = adminAuth;