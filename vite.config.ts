// DISABLED: This is a demo project. Use apps/web for the real Next.js application.
console.log("❌ This root directory contains a Vite demo that should not be used.");
console.log("✅ Please set Root Directory to 'apps/web' in Lovable settings.");
console.log("📖 See HANDOFF.md for integration instructions.");
process.exit(1);

import { defineConfig } from 'vite'

export default defineConfig({
  // This config is disabled - use apps/web instead
  build: {
    rollupOptions: {
      input: 'non-existent-file.js' // Force failure
    }
  }
})