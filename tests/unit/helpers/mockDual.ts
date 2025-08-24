export function mockDual(moduleRel: string, moduleAlias: string, factory: () => any) {
  const mod = factory();
  // Register both module ids so any import path gets the same instance
  jest.mock(moduleRel, () => mod);
  jest.mock(moduleAlias, () => mod);
  return mod;
}


