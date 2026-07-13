// API Gateway (:4000) — single entry point. Routes by path prefix and hosts one
// composite flow (item sourcing) that orchestrates shop + notification services.
const http = require('node:http');

const SERVICES = {
  register: 4001, login: 4001, users: 4001,
  shops: 4002,
  decorators: 4003, bookings: 4003, threads: 4003,
  notifications: 4004,
};

const PORT = 4000;

async function compositeSourcing(body) {
  // 1. match identified items to local shops (FR-15)
  const matches = await fetch('http://localhost:4002/shops/match', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).then((r) => r.json());
  // 2. find shops whose catchment radius covers this client (FR-18)
  const inRadius = await fetch('http://localhost:4002/shops/radius-match', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).then((r) => r.json());
  // 3. fire radius alerts to those shop owners (FR-26)
  await fetch('http://localhost:4004/notifications/radius-alert', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shops: inRadius, items: body.items, area: body.area }),
  }).catch(() => {});
  // 4. online alternatives (FR-16/17)
  const online = await fetch('http://localhost:4002/shops/online-sources', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).then((r) => r.json());
  return { matches, online, alertedShops: inRadius.length };
}

http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.end();

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const head = url.pathname.split('/').filter(Boolean)[0];

  let body = '';
  for await (const chunk of req) body += chunk;

  try {
    if (req.method === 'POST' && url.pathname === '/sourcing/items') {
      const result = await compositeSourcing(JSON.parse(body || '{}'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    const port = SERVICES[head];
    if (!port) { res.writeHead(404); return res.end(`gateway: unknown service for /${head}`); }

    const upstream = await fetch(`http://localhost:${port}${url.pathname}${url.search}`, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: ['POST', 'PATCH'].includes(req.method) ? body : undefined,
    });
    res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
    res.end(await upstream.text());
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `gateway: ${err.message}` }));
  }
}).listen(PORT, () => console.log(`[gateway] listening on :${PORT}`));
