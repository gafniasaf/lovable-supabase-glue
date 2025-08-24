import { describe, it, expect, beforeEach } from '@jest/globals';

// We will read the feature flag via a small helper that reads process.env or config file.
// For the walking skeleton, assert behavior based on env only.

describe('features: expertfolio flag', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.FEATURES_EXPERTFOLIO;
  });

  it('is disabled by default when flag not set', async () => {
    const isEnabled = (process.env.FEATURES_EXPERTFOLIO === '1' || process.env.FEATURES_EXPERTFOLIO === 'true');
    expect(isEnabled).toBe(false);
  });

  it('enables when FEATURES_EXPERTFOLIO=1', async () => {
    process.env.FEATURES_EXPERTFOLIO = '1';
    const isEnabled = (process.env.FEATURES_EXPERTFOLIO === '1' || process.env.FEATURES_EXPERTFOLIO === 'true');
    expect(isEnabled).toBe(true);
  });
});


