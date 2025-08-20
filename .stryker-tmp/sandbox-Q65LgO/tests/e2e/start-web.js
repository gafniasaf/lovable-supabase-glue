// @ts-nocheck
const { spawn } = require('child_process');
const path = require('path');

const webDir = path.resolve(__dirname, '../../apps/web');
const command = 'npm run dev:e2e';

const port = process.env.WEB_PORT || '3030';
const base = `http://localhost:${port}`;
const child = spawn(command, {
  cwd: webDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, TEST_MODE: '1', WEB_PORT: port, NEXT_PUBLIC_BASE_URL: base, PLAYWRIGHT_BASE_URL: base }
});

child.on('exit', (code) => {
  process.exit(code || 0);
});


