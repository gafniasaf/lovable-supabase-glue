const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on('error', reject);
  });
}

(async () => {
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3030';
  const url = `${base}/api/health`;
  const end = Date.now() + 60_000;
  while (Date.now() < end) {
    try {
      const code = await get(url);
      if (code && code < 500) process.exit(0);
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  console.error('Health check timeout');
  process.exit(1);
})();


