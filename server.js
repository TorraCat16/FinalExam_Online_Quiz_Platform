import express from "express";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import dotenv from "dotenv";

import pool from "./models/connection.mjs"; // PostgreSQL connection

// Import routes
import authRoutes from "./routes/authRoutes.mjs";
import userRoutes from "./routes/userRoutes.mjs";
import quizRoutes from "./routes/quizRoutes.mjs";
import questionRoutes from "./routes/questionRoutes.mjs";
import attemptRoutes from "./routes/attemptRoutes.mjs";
import reportRoutes from "./routes/reportRoutes.mjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable JSON parsing
app.use(express.json());

// Enable CORS for frontend
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Session setup that is stored in PostgreSQL
const PgStore = pgSession(session);

app.use(session({
  store: new PgStore({
    pool,            // PostgreSQL pool
    tableName: "session"
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,   // true if using HTTPS
    maxAge: 1000 * 60 * 60  // 1 hour
  }
}));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/reports", reportRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Quiz Platform API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
