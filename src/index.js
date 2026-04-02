const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors"); // ✅ ADD THIS

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173", // local frontend
  process.env.FRONTEND_URL, // production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
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
