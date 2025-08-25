#!/usr/bin/env node
// Import a single TSX component from a public GitHub repo (v0 export) into our monorepo
// Usage:
//   node tools/v0-import.js gafniasaf/v0-ef-ui- main apps/web/src/ui/v0/SupervisorQueue.tsx apps/web/src/ui/v0/SupervisorQueue.tsx
// It fetches the raw file from GitHub and writes to the destination path.

const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const [repo, branch, srcPath, destPath] = process.argv.slice(2);
  if (!repo || !branch || !srcPath || !destPath) {
    console.error('Usage: node tools/v0-import.js <repo> <branch> <srcPath> <destPath>');
    process.exit(1);
  }
  const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${srcPath}`;
  console.log(`Fetching ${rawUrl}`);
  let res;
  try {
    // Node 18+ supports global fetch
    res = await fetch(rawUrl);
  } catch (e) {
    console.error('Fetch failed:', e);
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`HTTP ${res.status} fetching ${rawUrl}`);
    const text = await res.text().catch(() => '');
    console.error(text);
    process.exit(1);
  }
  const content = await res.text();
  const abs = path.join(process.cwd(), destPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  console.log(`Wrote ${destPath} (${content.length} bytes)`);
}

main().catch((e) => { console.error(e); process.exit(1); });


