
// Config for expertfolio adapters
// [pkg-01-config]

let testMode = false;

export const config = {
  baseUrl: '',  // Same origin
  get isTestMode() {
    return testMode;
  }
};

export const setTestMode = (enabled: boolean) => {
  testMode = enabled;
};
