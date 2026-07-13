// User database — real SQLite (node:sqlite, built into Node 22.5+), file lives at
// server/data/decorai.db. Passwords are stored as salted scrypt hashes, never plain.
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'decorai.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    email     TEXT UNIQUE,
    passhash  TEXT,
    phone     TEXT DEFAULT '',
    location  TEXT DEFAULT '',
    role      TEXT DEFAULT 'client',
    provider  TEXT DEFAULT 'email',
    avatar    TEXT,
    createdAt TEXT
  )
`);

function hash(password) {
  if (!password) return null;
  const salt = crypto.randomBytes(8).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 32).toString('hex')}`;
}

function verify(password, stored) {
  if (!stored) return true; // social accounts carry no password
  const [salt, digest] = stored.split(':');
  const candidate = crypto.scryptSync(password || '', salt, 32).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(digest));
}

// Strip the hash before anything leaves the service.
const publicUser = (row) => {
  if (!row) return null;
  const { passhash, ...user } = row;
  return user;
};

const COLUMNS = ['name', 'email', 'phone', 'location', 'role', 'provider', 'avatar'];

const users = {
  findByEmail: (email) => db.prepare('SELECT * FROM users WHERE email = ?').get(email ?? ''),
  findById: (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id),
  create(u) {
    db.prepare(`
      INSERT INTO users (id, name, email, passhash, phone, location, role, provider, avatar, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(u.id, u.name, u.email || null, u.passhash, u.phone || '', u.location || '',
           u.role || 'client', u.provider || 'email', u.avatar || null, new Date().toISOString());
    return this.findById(u.id);
  },
  update(id, patch) {
    const keys = COLUMNS.filter((k) => patch[k] !== undefined);
    if (keys.length) {
      db.prepare(`UPDATE users SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`)
        .run(...keys.map((k) => patch[k]), id);
    }
    if (patch.password) db.prepare('UPDATE users SET passhash = ? WHERE id = ?').run(hash(patch.password), id);
    return this.findById(id);
  },
};

// Seed demo accounts on first run (password: 1234) — matches the old users.json seed.
if (db.prepare('SELECT COUNT(*) AS n FROM users').get().n === 0) {
  [
    { id: 'u1', name: 'Seyram Dede', email: 'seyram@decorai.gh', phone: '+233 24 000 1111', location: 'Kumasi', role: 'client' },
    { id: 'u2', name: 'Akosua Mensah', email: 'akosua@royaltouch.gh', phone: '+233 24 555 1122', location: 'Kumasi', role: 'decorator' },
    { id: 'u3', name: 'Kwame Boateng', email: 'kwame@adumblooms.gh', phone: '+233 24 111 2233', location: 'Kumasi', role: 'shop' },
  ].forEach((u) => users.create({ ...u, passhash: hash('1234'), provider: 'email' }));
}

module.exports = { users, hash, verify, publicUser };
