// Shared micro-kit for all DecorAI GH services: HTTP server + JSON-file store + CORS.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

// JSON-file store — one file per collection, seeded on first run.
function store(name, seed = []) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(seed, null, 2));
  return {
    all: () => JSON.parse(fs.readFileSync(file, 'utf8')),
    save: (rows) => fs.writeFileSync(file, JSON.stringify(rows, null, 2)),
    add(row) { const rows = this.all(); rows.push(row); this.save(rows); return row; },
    update(id, patch) {
      const rows = this.all();
      const i = rows.findIndex((r) => r.id === id);
      if (i === -1) return null;
      rows[i] = { ...rows[i], ...patch };
      this.save(rows);
      return rows[i];
    },
  };
}

const id = () => Math.random().toString(36).slice(2, 10);

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, d = (x) => (x * Math.PI) / 180;
  const a = Math.sin(d(lat2 - lat1) / 2) ** 2 +
    Math.cos(d(lat1)) * Math.cos(d(lat2)) * Math.sin(d(lng2 - lng1) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// routes: { 'GET /shops': (req, res, { query, params }) => data, 'POST /bookings': ... }
// Path segments starting with ':' capture params: 'GET /bookings/:id'
function service(name, port, routes) {
  const table = Object.entries(routes).map(([key, handler]) => {
    const [method, pattern] = key.split(' ');
    return { method, parts: pattern.split('/').filter(Boolean), handler };
  });

  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.end();

    const url = new URL(req.url, `http://localhost:${port}`);
    const segs = url.pathname.split('/').filter(Boolean);
    const match = table.find((r) => {
      if (r.method !== req.method || r.parts.length !== segs.length) return false;
      return r.parts.every((p, i) => p.startsWith(':') || p === segs[i]);
    });
    if (!match) { res.writeHead(404); return res.end(`${name}: no route ${req.method} ${url.pathname}`); }

    const params = {};
    match.parts.forEach((p, i) => { if (p.startsWith(':')) params[p.slice(1)] = segs[i]; });

    let body = '';
    for await (const chunk of req) body += chunk;

    try {
      const result = await match.handler(JSON.parse(body || '{}'), {
        params, query: Object.fromEntries(url.searchParams),
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result ?? { ok: true }));
    } catch (err) {
      res.writeHead(err.status || 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[${name}] port ${port} is already in use — an old copy of the backend is still running.`);
      console.error(`Fix (PowerShell):  Get-NetTCPConnection -LocalPort ${port} -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }`);
      process.exit(1);
    }
    throw err;
  });
  server.listen(port, () => console.log(`[${name}] listening on :${port}`));
  return server;
}

module.exports = { service, store, id, haversineKm };
