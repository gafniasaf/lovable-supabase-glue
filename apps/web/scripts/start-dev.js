const { spawn } = require('child_process');

const mode = process.argv[2] || 'dev';
const defaults = { dev: 3000, test: 3020, e2e: 3030 };
const port = process.env.WEB_PORT || String(defaults[mode] || 3000);

const env = { ...process.env };
if (mode !== 'dev') {
  env.TEST_MODE = '1';
  env.NEXT_PUBLIC_TEST_MODE = env.NEXT_PUBLIC_TEST_MODE || '1';
  env.E2E_ALLOW_TEST_MODE = env.E2E_ALLOW_TEST_MODE || '1';
  // Enable interactive runtime + v2 for test/e2e by default
  env.INTERACTIVE_RUNTIME = env.INTERACTIVE_RUNTIME || '1';
  env.RUNTIME_API_V2 = env.RUNTIME_API_V2 || '1';
  // Allowlist common external dev/stage origins (Lovable) for CORS/frame-src in test
  const lovable = [
    'https://wcgyhwvugdnzhegwiiam.lovable.dev',
    'https://wcgyhwvugdnzhegwiiam.lovable.app'
  ];
  const corsList = (env.RUNTIME_CORS_ALLOW || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const o of lovable) if (!corsList.includes(o)) corsList.push(o);
  env.RUNTIME_CORS_ALLOW = corsList.join(',');
  const frameList = (env.RUNTIME_FRAME_SRC_ALLOW || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const o of lovable) if (!frameList.includes(o)) frameList.push(o);
  env.RUNTIME_FRAME_SRC_ALLOW = frameList.join(',');
  // HS256 secret for local dev (prod uses RS256)
  env.NEXT_RUNTIME_SECRET = env.NEXT_RUNTIME_SECRET || 'dev-secret';
}
// Always force development mode for dev/test/e2e server runs
env.NODE_ENV = 'development';
env.NEXT_DISABLE_SWC_NATIVE = env.NEXT_DISABLE_SWC_NATIVE || '1';
env.PORT = port;

const args = ['next', 'dev', '-p', port];
const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, {
  stdio: 'inherit',
  shell: true,
  env,
});

child.on('exit', (code) => process.exit(code || 0));


