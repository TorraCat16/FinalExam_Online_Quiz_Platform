import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // database URL from .env
});

// Test connection
try {
  await pool.connect();
  console.log("Connected to PostgreSQL");
} catch (err) {
  console.error("PostgreSQL connection error:", err);
}

export default pool;
