type AnalyticsEvent = { name: string; payload?: Record<string, any> };
type Analytics = { track: (name: string, payload?: Record<string, any>) => void };

let impl: Analytics = {
  track: (name, payload) => {
    // no-op in dev/test; can be swapped for real vendor in prod
    if (process.env.NODE_ENV !== 'test') {
      try { console.debug('[analytics]', name, payload || {}); } catch {}
    }
  }
};

export function setAnalytics(a: Analytics) { impl = a; }
export function track(name: string, payload?: Record<string, any>) { impl.track(name, payload); }


