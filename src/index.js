const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors"); // ✅ ADD THIS

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(express.json());

// DB connect
connectDB();

const { connectRedis } = require("./config/redis");
connectRedis();

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
