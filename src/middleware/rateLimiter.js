const { client } = require("../config/redis");

const rateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;

    const key = `rate:${ip}`;

    if (!client) return next(); // skip if Redis not available
    const requests = await client.get(key);

    if (requests && requests >= 100) {
      return res.status(429).send("Too many requests");
    }

    if (requests) {
      await client.incr(key);
    } else {
      await client.set(key, 1, { EX: 900 }); // 15 minutes
    }

    next();
  } catch (err) {
    console.error(err);
    next(); // don’t block request if Redis fails
  }
};

module.exports = rateLimiter;
