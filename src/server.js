const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Try to import prisma, but handle if it fails
let prisma;
try {
  prisma = require("./config/prisma.js");
} catch (error) {
  console.error("Failed to import Prisma client:", error);
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

// Start server with or without database connection
if (prisma) {
  prisma
    .$connect()
    .then(() => {
      console.log("Database connected");
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((error) => {
      console.error("Failed to connect to database:", error);
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
