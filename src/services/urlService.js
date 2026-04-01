const { pool } = require("../config/db");
const { encode } = require("../utils/base62");

const createShortUrl = async (originalUrl) => {
  const result = await pool.query(
    "INSERT INTO urls (original_url) VALUES ($1) RETURNING id",
    [originalUrl],
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
