const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma.js");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

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
prisma.$connect().then(() => console.log("Database connected"));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
