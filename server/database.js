import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Open data.db inside the server folder
const dbPath = path.resolve(__dirname, 'data.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables on startup
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at DATETIME NOT NULL
  );
`);

// Migration: switch primary identifier from phone to email
try {
  const tableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get()?.sql || '';
  const needsMigration = tableSql.includes('phone TEXT UNIQUE NOT NULL');

  if (needsMigration) {
    console.log('Migrating database: switching primary identifier from phone to email...');
    db.exec(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const users = db.prepare('SELECT * FROM users').all();
    const insert = db.prepare(
      'INSERT INTO users_new (id, name, email, phone, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    );

    for (const user of users) {
      const email = user.email && user.email !== ''
        ? user.email
        : `${user.phone}@legacy.nammacard.local`;
      insert.run(user.id, user.name, email, user.phone || null, user.password_hash, user.created_at);
    }

    db.exec('DROP TABLE users; ALTER TABLE users_new RENAME TO users;');
  }
} catch (err) {
  console.error('Migration error updating users table:', err.message);
}

export default db;
