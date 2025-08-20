// @ts-nocheck
const { spawn } = require('child_process');

const mode = process.argv[2] || 'dev';
const defaults = { dev: 3000, test: 3020, e2e: 3030 };
const port = process.env.WEB_PORT || String(defaults[mode] || 3000);

const env = { ...process.env };
if (mode !== 'dev') env.TEST_MODE = '1';
env.NEXT_DISABLE_SWC_NATIVE = env.NEXT_DISABLE_SWC_NATIVE || '1';
env.PORT = port;

const args = ['next', 'dev', '-p', port];
const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, {
  stdio: 'inherit',
  shell: true,
  env,
});

child.on('exit', (code) => process.exit(code || 0));


