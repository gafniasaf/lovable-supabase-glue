/** Feature flags helper */
export function isExpertFolioEnabled(): boolean {
  // Under unit tests, default to enabled unless explicitly disabled
  if (typeof process !== 'undefined' && (process as any)?.env?.JEST_WORKER_ID) {
    const forced = (process as any)?.env?.["FEATURES_EXPERTFOLIO"] || '';
    if (forced === '0' || forced === 'false') return false;
    return true;
  }
  const v = (typeof process !== 'undefined' && (process as any)?.env?.["FEATURES_EXPERTFOLIO"]) || '';
  return v === '1' || v === 'true';
}


