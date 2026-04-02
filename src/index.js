const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors"); // ✅ ADD THIS

dotenv.config();

const cors = require("cors");

app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman / server-to-server
      if (!origin) return callback(null, true);

      const allowed = [
        "http://localhost:5173",
        "https://url-shortener-theta-ecru.vercel.app",
      ];

      if (allowed.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(null, false); // ❗ IMPORTANT: don't throw error
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());

// DB connect
connectDB();

const { connectRedis } = require("./config/redis");
if (process.env.NODE_ENV !== "production") {
  connectRedis();
}

const rateLimiter = require("./middleware/rateLimiter");
app.use(rateLimiter);

// Routes
const urlRoutes = require("./routes/urlRoutes");
app.use("/", urlRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
