import { isTestMode } from '../../apps/web/src/lib/testMode';

describe('testMode', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
  });

  test('isTestMode true when TEST_MODE=1', () => {
    process.env.TEST_MODE = '1';
    delete (process.env as any).PLAYWRIGHT;
    expect(isTestMode()).toBe(true);
  });

  test('isTestMode true when PLAYWRIGHT is set', () => {
    delete (process.env as any).TEST_MODE;
    process.env.PLAYWRIGHT = '1';
    expect(isTestMode()).toBe(true);
  });

  test('isTestMode false otherwise', () => {
    delete (process.env as any).TEST_MODE;
    delete (process.env as any).PLAYWRIGHT;
    expect(isTestMode()).toBe(false);
  });
});


