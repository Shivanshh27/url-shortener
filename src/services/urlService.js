const { pool } = require("../config/db");
const { encode } = require("../utils/base62");

const createShortUrl = async (originalUrl, customAlias, expiresAt) => {
  // ✅ Normalize URL (ADD THIS)
  if (!originalUrl.startsWith("http")) {
    originalUrl = "https://" + originalUrl;
  }

  // Custom alias provided
  if (customAlias) {
    const existing = await pool.query(
      "SELECT * FROM urls WHERE short_code = $1",
      [customAlias],
    );

    if (existing.rows.length > 0) {
      throw new Error("Custom alias already taken");
    }

    await pool.query(
      "INSERT INTO urls (short_code, original_url, expires_at) VALUES ($1, $2, $3)",
      [customAlias, originalUrl, expiresAt || null],
    );

    return customAlias;
  }

  // Auto-generate
  const result = await pool.query(
    "INSERT INTO urls (original_url, expires_at) VALUES ($1, $2) RETURNING id",
    [originalUrl, expiresAt || null],
  );

  const id = result.rows[0].id;
  const shortCode = encode(id);

  await pool.query("UPDATE urls SET short_code = $1 WHERE id = $2", [
    shortCode,
    id,
  ]);

  return shortCode;
};

module.exports = { createShortUrl };
