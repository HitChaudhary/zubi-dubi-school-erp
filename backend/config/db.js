import { Pool } from 'pg';

// NOTE: This raw `pg` Pool is unused now that the app talks to the database
// through Prisma (see config/prisma.js). Kept here in case you need a raw
// connection pool for anything Prisma doesn't cover (e.g. raw SQL, LISTEN/NOTIFY).
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default pool;
