// Boots the whole DecorAI GH backend: 4 microservices + gateway, one command.
// A stale copy of the backend left running holds our ports and crashes startup with
// EADDRINUSE — so free the dev ports first by killing whatever is still bound to them.
const { execSync } = require('node:child_process');
const PORTS = [4000, 4001, 4002, 4003, 4004];

try {
  if (process.platform === 'win32') {
    const out = execSync('netstat -ano', { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
      const m = line.match(/TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)/);
      if (m && PORTS.includes(Number(m[1])) && Number(m[2]) !== process.pid) pids.add(m[2]);
    }
    for (const pid of pids) {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`Freed ports held by stale backend (pid ${pid}).`);
    }
  } else {
    execSync(`lsof -t ${PORTS.map((p) => `-i tcp:${p}`).join(' ')} | xargs -r kill`, { stdio: 'ignore' });
  }
} catch { /* nothing was holding the ports */ }

require('./auth-service');
require('./shop-service');
require('./decorator-service');
require('./notification-service');
require('./gateway');
console.log('DecorAI GH backend up — gateway :4000 → auth :4001, shops :4002, decorators :4003, notifications :4004');
