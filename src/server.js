const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Log environment variables (without exposing sensitive data)
console.log("Environment variables:");
console.log("- PORT:", process.env.PORT || "Not set (defaulting to 4000)");
console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
console.log("- NODE_ENV:", process.env.NODE_ENV || "Not set");

// Try to import prisma, but handle if it fails
let prisma;
try {
  prisma = require("./config/prisma.js");
  console.log("Prisma client loaded successfully");
} catch (error) {
  console.error("Failed to import Prisma client:", error.message);
  console.log("Attempting to start server without database connection...");
  prisma = null;
}

const authRoutes = require("./routes/auth.route");
const leadRoutes = require("./routes/leadRoute");
const companyRoutes = require("./routes/companyRoute");
const userRoutes = require("./routes/userRoute");

const app = express();

// Configure CORS to allow requests from frontend
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://crm-app-sable.vercel.app",
  ], // Frontend URLs
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.send("Backend running"));

const PORT = process.env.PORT || 4000;

// Health check endpoint
app.get("/health", (req, res) => {
  const healthStatus = {
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    port: PORT,
  };

  if (prisma) {
    healthStatus.database = "Prisma client loaded";
  } else {
    healthStatus.database = "Prisma client not available";
  }

  res.status(200).json(healthStatus);
});

// Database connection test endpoint with detailed information
app.get("/db-test", async (req, res) => {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    return res.status(400).json({
      status: "error",
      message: "DATABASE_URL environment variable is not set",
      details:
        "Please set the DATABASE_URL environment variable in your Render dashboard",
    });
  }

  if (!prisma) {
    return res.status(503).json({
      status: "error",
      message: "Prisma client not available",
      details: "Prisma client failed to initialize",
    });
  }

  try {
    console.log("Attempting database connection test...");
    // Try to connect to the database
    await prisma.$connect();

    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Database query result:", result);

    res.status(200).json({
      status: "success",
      message: "Database connection successful",
      queryResult: result,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: {
        message: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      databaseUrl: process.env.DATABASE_URL
        ? `${process.env.DATABASE_URL.substring(0, 30)}...`
        : "Not set",
    });
  }
});

// Start server with or without database connection
if (prisma) {
  prisma
    .$connect()
    .then(() => {
      console.log("Database connected successfully");
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((error) => {
      console.error("Database connection error:", error.message);
      console.log("Starting server without database connection...");
      app.listen(PORT, () =>
        console.log(`Server running on port ${PORT} (without database)`)
      );
    });
} else {
  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT} (without database)`)
  );
}
