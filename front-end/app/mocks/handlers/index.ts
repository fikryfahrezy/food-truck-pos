import { createAuthHandlers } from "./auth";
import { createMenuHandlers } from "./menu";
import { createOrdersHandlers } from "./orders";
import { createPaymentsHandlers } from "./payments";
import { createReportsHandlers } from "./reports";

export function createHandlers(origin: string) {
  return [
    ...createAuthHandlers(origin),
    ...createMenuHandlers(origin),
    ...createOrdersHandlers(origin),
    ...createPaymentsHandlers(origin),
    ...createReportsHandlers(origin),
  ];
}
