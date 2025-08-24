// Minimal pino shim for tests without installing the real dependency
type PinoLike = ((opts?: any) => any) & { redact?: any };

const pinoFactory = ((opts?: any) => {
  const bindings: any = {};
  const api: any = {
    child: (b?: any) => {
      Object.assign(bindings, b || {});
      return api;
    },
    bindings: () => ({ ...bindings }),
    info: () => {},
    error: () => {},
    debug: () => {},
    warn: () => {}
  };
  api.__opts = opts || {};
  // Apply redaction to bindings snapshot for tests that introspect
  const redact = (opts as any)?.redact?.paths as string[] | undefined;
  if (Array.isArray(redact)) {
    const censor = '[REDACTED]';
    api.bindings = () => {
      const src = { ...bindings } as any;
      for (const path of redact) {
        const segs = path.replace(/^env\./, 'env.').split('.');
        let obj = src;
        for (let i = 0; i < segs.length - 1; i++) {
          obj = obj?.[segs[i]];
          if (!obj) break;
        }
        const last = segs[segs.length - 1];
        if (obj && last in obj) obj[last] = censor;
      }
      return src;
    };
  }
  return api;
}) as PinoLike;

export = pinoFactory;


