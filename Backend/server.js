require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const MongoStore = require("connect-mongo");
const path = require("path");

// ================= DATABASE =================
const connectDB = require("./config/db");

// ================= ROUTES =================
const authRoutes = require("./routes/authRoutes");
const jobsRoutes = require("./routes/jobsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const applyRoutes = require("./routes/applyRoutes");
const saveJobRoutes = require("./routes/saveJobRoutes");
const profileRoutes = require("./routes/profileRoutes");
const aiRoutes = require("./routes/aiRoutes");

// ================= APP =================
const app = express();

// ================= BASIC MIDDLEWARE =================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= CORS =================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ================= SESSION =================

app.use(
  session({
    secret: process.env.SESSION_SECRET || "job-portal-secret-key",

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,

      collectionName: "sessions",

      ttl: 24 * 60 * 60,
    }),

    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// ================= DATABASE =================

connectDB();

// ================= ROUTES =================

// Authentication
app.use("/api/auth", authRoutes);

// Jobs
app.use("/api/jobs", jobsRoutes);

// Payment
app.use("/api/payment", paymentRoutes);
// Applications
app.use("/api/apply", applyRoutes);

// Saved Jobs
app.use("/api/save", saveJobRoutes);

// Profile
app.use("/api/profile", profileRoutes);

// AI
app.use("/api/ai", aiRoutes);

// ================= STATIC FILES =================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Job Portal API is running...",
  });
});

// ================= SESSION TEST =================

app.get("/api/auth/session-test", (req, res) => {
  res.json({
    sessionExists: !!req.session,
    sessionId: req.sessionID,
    userId: req.session.userId || null,
    role: req.session.role || null,
  });
});

// ================= 404 =================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("=================================");
  console.error("SERVER ERROR");
  console.error(err);
  console.error("=================================");

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});