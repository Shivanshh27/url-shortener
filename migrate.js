const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  console.log("Running database migrations...");
  try {
    // 1. Alter urls table to add is_active
    await pool.query(`
      ALTER TABLE urls 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    `);
    console.log("Added 'is_active' column to 'urls' table.");

    // 2. Alter clicks table to add user agent, ip, device, browser, os, referrer
    await pool.query(`
      ALTER TABLE clicks 
      ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS browser VARCHAR(50),
      ADD COLUMN IF NOT EXISTS os VARCHAR(50),
      ADD COLUMN IF NOT EXISTS device VARCHAR(50),
      ADD COLUMN IF NOT EXISTS referrer TEXT;
    `);
    console.log("Added rich analytics columns to 'clicks' table.");

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await pool.end();
    console.log("Migration complete.");
  }
}

runMigration();
