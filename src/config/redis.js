const redis = require("redis");

let client = null;

const connectRedis = async () => {
  if (process.env.NODE_ENV === "production") {
    console.log("Redis disabled in production");
    return;
  }

  client = redis.createClient({
    url: "redis://127.0.0.1:6379",
  });

  client.on("error", (err) => {
    console.error("Redis error:", err);
  });

  await client.connect();
  console.log("Redis connected");
};

module.exports = { client, connectRedis };
