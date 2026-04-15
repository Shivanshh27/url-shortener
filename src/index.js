const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ✅ CORS (robust version)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // ✅ Allow all your environments
      if (
        origin.includes("localhost") ||
        origin.includes("vercel.app") ||
        origin.includes("shivansh.online")
      ) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// ✅ Handle preflight requests
app.options("*", cors());

// ✅ Middleware
app.use(express.json());

// ✅ DB connect
connectDB();

// ✅ Redis (only local)
const { connectRedis } = require("./config/redis");
if (process.env.NODE_ENV !== "production") {
  connectRedis();
}

// ✅ Rate limiter
const rateLimiter = require("./middleware/rateLimiter");
app.use(rateLimiter);

// ✅ Routes
const urlRoutes = require("./routes/urlRoutes");
app.use("/", urlRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
