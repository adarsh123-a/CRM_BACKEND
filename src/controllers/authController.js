const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const {
  signAccessToken,
  generateRefreshToken,
  refreshTokenExpiryDate,
} = require("../utils/tokenUtils");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

async function register(req, res) {
  try {
    const { email, password, name, role, companyId } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const roleNormalized = (role || "SALES_EXECUTIVE").toUpperCase();
    const allowedRoles = ["ADMIN", "MANAGER", "SALES_EXECUTIVE"];
    const assignedRole = allowedRoles.includes(roleNormalized)
      ? roleNormalized
      : "SALES_EXECUTIVE";

    // Validate company ID if provided
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return res.status(400).json({ error: "Invalid company ID" });
      }
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userData = {
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: assignedRole,
    };

    // Add company ID if provided
    if (companyId) {
      userData.companyId = companyId;
    }

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        companyId: true,
        company: true,
      },
    });

    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email & password required" });

    // Check database connection before proceeding
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbErr) {
      console.error("Database connection error", dbErr);
      return res
        .status(503)
        .json({ error: "Service unavailable. Database connection failed." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        company: true,
      },
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = signAccessToken(user);
    const refreshToken = generateRefreshToken();
    const expiresAt = refreshTokenExpiryDate();

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt,
        user: { connect: { id: user.id } },
      },
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
    });
  } catch (err) {
    console.error("Login error", err);
    // Provide more specific error messages
    if (err.code === "ECONNREFUSED") {
      return res
        .status(503)
        .json({ error: "Service unavailable. Cannot connect to database." });
    }
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}

module.exports = { register, login };
