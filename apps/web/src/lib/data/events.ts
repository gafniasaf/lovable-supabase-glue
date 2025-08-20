import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type EventsGateway = {
  list(): Promise<any[]>;
};

function buildHttpGateway(): EventsGateway {
  return {
    async list() {
      return fetchJson(`/api/events`, z.array(z.any()));
    }
  };
}

function buildTestGateway(): EventsGateway { return buildHttpGateway(); }
export function createHttpGateway(): EventsGateway { return buildHttpGateway(); }
export function createTestGateway(): EventsGateway { return buildTestGateway(); }
export function createEventsGateway(): EventsGateway { return isTestMode() ? createTestGateway() : createHttpGateway(); }


