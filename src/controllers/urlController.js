const { createShortUrl } = require("../services/urlService");

const shortenUrl = async (req, res) => {
  try {
    const { url, customAlias, expiresAt } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    const shortCode = await createShortUrl(url, customAlias, expiresAt);

    res.json({
      shortUrl: `http://localhost:5000/${shortCode}`,
    });
  } catch (err) {
    if (err.message === "Custom alias already taken") {
      return res.status(400).json({ error: err.message });
    }

    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
const { pool } = require("../config/db");
const { client } = require("../config/redis");

const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // 🔥 Step 1: Check Redis
    const cachedUrl = await client.get(shortCode);

    if (cachedUrl) {
      console.log("Cache HIT");
      return res.redirect(cachedUrl);
    }

    console.log("Cache MISS");

    // 🔥 Step 2: DB lookup
    const result = await pool.query(
      "SELECT original_url, expires_at FROM urls WHERE short_code = $1",
      [shortCode],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("URL not found");
    }

    const { original_url, expires_at } = result.rows[0];

    // ✅ 🔥 FIX GOES HERE (VERY IMPORTANT)
    if (expires_at && new Date() > new Date(expires_at)) {
      return res.status(410).send("Link expired");
    }

    // ✅ Only cache valid links
    await client.set(shortCode, original_url, {
      EX: 3600,
    });

    return res.redirect(original_url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
module.exports = { shortenUrl, redirectUrl };