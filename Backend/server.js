require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./middleware/auth");

const app = express();

// ------------------- CORS -------------------
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://task-flow-umber-sigma.vercel.app",
      "https://hoppscotch.io"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// ONLY ONCE
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
