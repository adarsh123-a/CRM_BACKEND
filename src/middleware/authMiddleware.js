const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
require("dotenv").config();

const { JWT_ACCESS_SECRET } = process.env;

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(401).json({ error: "Authorization header missing" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res.status(401).json({ error: "Invalid auth format" });

    const token = parts[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired access token" });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    console.error("Authenticate error", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = authenticate;
