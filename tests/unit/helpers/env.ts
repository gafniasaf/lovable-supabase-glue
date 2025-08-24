type Env = Record<string,string>;

export async function withEnv(overrides: Env, fn: () => Promise<void> | void) {
  const original = { ...process.env } as Record<string,string>;
  try {
    process.env = { ...original, ...overrides } as any;
    await fn();
  } finally {
    process.env = original as any;
  }
}


