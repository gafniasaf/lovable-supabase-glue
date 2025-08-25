// v0 PR scan: enforce constraints on generated UI under apps/web/src/ui/v0/
/* eslint-disable */
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = process.cwd();
let changed = [];
try {
  changed = execSync('git diff --name-only origin/main...HEAD', { encoding: 'utf8' })
    .split('\n').filter(Boolean).filter(f => f.startsWith('apps/web/src/ui/v0/'));
} catch {
  // fallback: scan all v0 files
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p); else if (p.endsWith('.tsx') || p.endsWith('.ts')) changed.push(p.replace(ROOT + path.sep, ''));
    }
  }
  const target = path.join(ROOT, 'apps/web/src/ui/v0');
  if (fs.existsSync(target)) walk(target);
}

const forbidden = ['@mui', 'antd', 'chakra-ui', 'shadcn', 'framer-motion'];
const violations = [];

for (const rel of changed) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  const src = fs.readFileSync(full, 'utf8');
  for (const bad of forbidden) {
    if (src.includes(`from '${bad}`) || src.includes(`from "${bad}`)) violations.push(`${rel}: forbidden import ${bad}`);
  }
  if (/\bfetch\(/.test(src)) violations.push(`${rel}: inline fetch() not allowed`);
}

if (violations.length) {
  console.error('v0-scan found issues:\n' + violations.map(v => '- ' + v).join('\n'));
  process.exit(1);
}
console.log('v0-scan OK');
