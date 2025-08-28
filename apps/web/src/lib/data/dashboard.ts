export function createDashboardGateway() {
  return {
    async get(): Promise<any> {
      return { role: null, data: null };
    }
  };
}
