// Minimal runtime shim to satisfy @education/shared imports during Vercel build
// If a real build exists (packages/shared/dist), prefer it via optional require.
try {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const built = require('./dist/index.js');
  module.exports = built || {};
} catch {
  module.exports = {
    // expose no-op validators/dtos used in web app during static build
    loadServerEnv: () => ({}),
  };
}


