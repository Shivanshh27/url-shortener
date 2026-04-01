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

const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const result = await pool.query(
      "SELECT original_url, expires_at FROM urls WHERE short_code = $1",
      [shortCode],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("URL not found");
    }

    const { original_url, expires_at } = result.rows[0];

    // 🔥 Check expiry
    if (expires_at && new Date() > new Date(expires_at)) {
      return res.status(410).send("Link expired");
    }

    return res.redirect(original_url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
module.exports = { shortenUrl, redirectUrl };