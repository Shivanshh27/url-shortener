const { createShortUrl } = require("../services/urlService");

const shortenUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    const shortCode = await createShortUrl(url);

    res.json({
      shortUrl: `http://localhost:5000/${shortCode}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
const { pool } = require("../config/db");

const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const result = await pool.query(
      "SELECT original_url FROM urls WHERE short_code = $1",
      [shortCode],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("URL not found");
    }

    const originalUrl = result.rows[0].original_url;

    return res.redirect(originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
module.exports = { shortenUrl, redirectUrl };