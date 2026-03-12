const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "202.10.45.55",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "NewPassword123!",
  database: process.env.DB_NAME || "postgres",
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Database error:", err);
});

module.exports = pool;
