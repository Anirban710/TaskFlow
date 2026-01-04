require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const auth = require("./middleware/auth");

process.env.JWT_SECRET = "supersecret123";

const app = express();

// CORS MUST BE FIRST — before everything
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Then body parsing
app.use(express.json());

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/projects", require("./routes/projects"));
app.use("/lists", require("./routes/lists"));
app.use("/tasks", require("./routes/tasks")); 

// Protected test route
app.get("/profile", auth, (req, res) => {
  res.json({
    message: "You are logged in",
    user: req.user,
  });
});

// MongoDB connection
mongoose
  .mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running 🚀" });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
