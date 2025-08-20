import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type AuditLogRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details?: any;
  created_at: string;
};

export type AuditLogsGateway = {
  list(limit?: number): Promise<AuditLogRow[]>;
};

const auditSchema = z.object({
  id: z.string(),
  actor_id: z.string().nullable(),
  action: z.string(),
  entity_type: z.string().nullable(),
  entity_id: z.string().nullable(),
  details: z.any().optional(),
  created_at: z.string()
});

function buildHttpGateway(): AuditLogsGateway {
  return {
    async list(limit = 100) {
      return fetchJson(`/api/admin/audit-logs?limit=${limit}`, z.array(auditSchema));
    }
  };
}

function buildTestGateway(): AuditLogsGateway {
  return buildHttpGateway();
}

export function createHttpGateway(): AuditLogsGateway {
  return buildHttpGateway();
}

export function createTestGateway(): AuditLogsGateway {
  return buildTestGateway();
}

export function createAuditLogsGateway(): AuditLogsGateway {
  return isTestMode() ? createTestGateway() : createHttpGateway();
}



