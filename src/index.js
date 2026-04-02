const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors"); // ✅ ADD THIS

dotenv.config();

const cors = require("cors");

const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests like Postman (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
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
