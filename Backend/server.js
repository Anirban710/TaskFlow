require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const auth = require("./middleware/auth");

const app = express();

// ------------------- CORS (Express 5 safe) -------------------
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://task-flow-umber-sigma.vercel.app",
    "https://hoppscotch.io"
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ------------------- Body Parser -------------------
app.use(express.json());

// ------------------- Routes -------------------
app.use("/auth", require("./routes/auth"));
app.use("/projects", require("./routes/projects"));
app.use("/lists", require("./routes/lists"));
app.use("/tasks", require("./routes/tasks"));

// ------------------- Test protected route -------------------
app.get("/profile", auth, (req, res) => {
  res.json({
    message: "You are logged in",
    user: req.user,
  });
});

// ------------------- MongoDB -------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ------------------- Health -------------------
app.get("/health", (req, res) => {
  res.json({ status: "Server is running 🚀" });
});

// ------------------- Start -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
