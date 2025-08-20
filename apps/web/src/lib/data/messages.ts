import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";
import { message, messageThread } from "@education/shared";

export type MessagesGateway = {
  listThreads(): Promise<(z.infer<typeof messageThread> & { unread?: number })[]>;
  createThread(participant_ids: string[]): Promise<z.infer<typeof messageThread>>;
  listMessages(thread_id: string): Promise<z.infer<typeof message>[]>;
  sendMessage(input: { thread_id: string; body: string }): Promise<z.infer<typeof message>>;
  markRead(id: string): Promise<z.infer<typeof message>>;
};

function buildHttpGateway(): MessagesGateway {
  return {
    async listThreads() {
      return fetchJson(`/api/messages/threads`, z.array(messageThread));
    },
    async createThread(participant_ids) {
      return fetchJson(`/api/messages/threads`, messageThread, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ participant_ids })
      });
    },
    async listMessages(thread_id) {
      return fetchJson(`/api/messages?thread_id=${encodeURIComponent(thread_id)}`, z.array(message));
    },
    async sendMessage(input) {
      return fetchJson(`/api/messages`, message, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      });
    },
    async markRead(id) {
      return fetchJson(`/api/messages?id=${encodeURIComponent(id)}`, message, { method: "PATCH" });
    }
  };
}

function buildTestGateway(): MessagesGateway {
  return buildHttpGateway();
}

export function createHttpGateway(): MessagesGateway {
  return buildHttpGateway();
}

export function createTestGateway(): MessagesGateway {
  return buildTestGateway();
}

export function createMessagesGateway(): MessagesGateway {
  return isTestMode() ? createTestGateway() : createHttpGateway();
}


