import { setupWorker } from "msw/browser";
import { createHandlers } from "./handlers";
import { resolveMockApiBase } from "./config";

export function createWorker(apiBase: string | null | undefined) {
  return setupWorker(...createHandlers(resolveMockApiBase(apiBase)));
}
