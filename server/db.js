import { Pool } from 'pg';

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || '5433'),
      database: process.env.DB_NAME || 'sativa_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    };

export const pool = new Pool(config);
