
// Configuration for expertfolio adapters
// [pkg-01-config]

export interface AdapterConfig {
  baseUrl: string;
  environment: 'development' | 'production' | 'test';
  testMode: boolean;
}

// Default configuration
let config: AdapterConfig = {
  baseUrl: '',
  environment: 'development',
  testMode: false
};

// Initialize config based on environment
if (typeof window !== 'undefined') {
  // Browser environment
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  config = {
    baseUrl: '',
    environment: isDev ? 'development' : 'production',
    testMode: isDev
  };
} else if (typeof process !== 'undefined') {
  // Node.js environment
  config = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.VITE_BASE_URL || '',
    environment: (process.env.NODE_ENV as any) || 'development',
    testMode: process.env.NODE_ENV === 'test' || process.env.TEST_MODE === '1'
  };
}

export { config };

export const setTestMode = (enabled: boolean) => {
  config.testMode = enabled;
  if (config.environment === 'development') {
    console.debug(`[Adapters] Test mode ${enabled ? 'enabled' : 'disabled'}`);
  }
};
