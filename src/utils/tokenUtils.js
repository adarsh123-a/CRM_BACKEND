const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const {
  JWT_ACCESS_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_DAYS,
} = process.env;

function signAccessToken(user) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET);
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

function refreshTokenExpiryDate() {
  const days = parseInt(REFRESH_TOKEN_EXPIRES_DAYS || "30", 10);
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return expires;
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  refreshTokenExpiryDate,
};
