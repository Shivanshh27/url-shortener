const { createShortUrl } = require("../services/urlService");
const { pool } = require("../config/db");
const { client } = require("../config/redis");

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
const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // 🔥 Check Redis
    let cachedUrl = null;

    if (client) {
      cachedUrl = await client.get(shortCode);
    }

    if (cachedUrl) {
      console.log("Cache HIT");

      // ✅ LOG CLICK EVEN ON CACHE HIT
      await pool.query("INSERT INTO clicks (short_code) VALUES ($1)", [
        shortCode,
      ]);

      return res.redirect(cachedUrl);
    }

    console.log("Cache MISS");

    const result = await pool.query(
      "SELECT original_url, expires_at FROM urls WHERE short_code = $1",
      [shortCode],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("URL not found");
    }

    const { original_url, expires_at } = result.rows[0];

    if (expires_at && new Date() > new Date(expires_at)) {
      return res.status(410).send("Link expired");
    }

    // ✅ LOG CLICK
    await pool.query("INSERT INTO clicks (short_code) VALUES ($1)", [
      shortCode,
    ]);

    // Cache it
    if (client) {
      await client.set(shortCode, original_url, { EX: 3600 });
    }

    return res.redirect(original_url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
const getAnalytics = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const result = await pool.query(
      "SELECT COUNT(*) AS total_clicks FROM clicks WHERE short_code = $1",
      [shortCode],
    );

    res.json({
      shortCode,
      totalClicks: result.rows[0].total_clicks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
const getAllUrls = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT short_code, original_url FROM urls ORDER BY id DESC",
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
const deleteUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // ❌ Check if exists
    const existing = await pool.query(
      "SELECT * FROM urls WHERE short_code = $1",
      [shortCode],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }

    // 🔥 Delete clicks first (important)
    await pool.query("DELETE FROM clicks WHERE short_code = $1", [shortCode]);

    // 🔥 Delete URL
    await pool.query("DELETE FROM urls WHERE short_code = $1", [shortCode]);

    // 🔥 Remove from Redis cache
    if (client) {
      await client.del(shortCode);
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = {
  shortenUrl,
  redirectUrl,
  getAnalytics,
  getAllUrls,
  deleteUrl,
};
