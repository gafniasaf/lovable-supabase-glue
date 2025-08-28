export function createNotificationsGateway() {
  return {
    async list(offset: number, limit: number): Promise<any[]> {
      return [];
    }
  };
}
