// Database setup script for local PostgreSQL
// require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function setupDatabase() {
  console.log('Setting up database tables...');
  
  try {
    await pool.query(`
      -- Create sessions table
      CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR PRIMARY KEY,
          sess JSONB NOT NULL,
          expire TIMESTAMP NOT NULL
      );
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    `);
    
    await pool.query(`
      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR UNIQUE NOT NULL,
          password VARCHAR NOT NULL,
          first_name VARCHAR,
          last_name VARCHAR,
          profile_image_url VARCHAR,
          is_locked BOOLEAN DEFAULT false,
          failed_attempts INTEGER DEFAULT 0,
          last_failed_attempt TIMESTAMP,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      -- Create otps table
      CREATE TABLE IF NOT EXISTS otps (
          id SERIAL PRIMARY KEY,
          email VARCHAR NOT NULL,
          code VARCHAR NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          is_used BOOLEAN DEFAULT false,
          attempts INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      -- Create tasks table
      CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) NOT NULL,
          description TEXT NOT NULL,
          is_completed BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      -- Create security_logs table
      CREATE TABLE IF NOT EXISTS security_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          email VARCHAR,
          action VARCHAR NOT NULL,
          details TEXT,
          ip_address VARCHAR,
          user_agent VARCHAR,
          success BOOLEAN NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Database tables created successfully!');
    
    // Test the connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    
  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();