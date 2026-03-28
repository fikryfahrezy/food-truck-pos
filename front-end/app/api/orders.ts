import type { Order, OrderStatus, CreateOrderRequest } from "~/types";

export function ordersCreate(
  api: string,
  headers: Record<string, string>,
  body: CreateOrderRequest,
) {
  return $fetch<{ id: string; order_number: string }>(`${api}/v1/orders`, {
    method: "POST",
    headers,
    body,
  });
}

export function ordersGetById(
  api: string,
  headers: Record<string, string>,
  orderId: string,
) {
  return $fetch<{ order_number: string; total_amount: number }>(
    `${api}/v1/orders/${orderId}`,
    {
      headers,
    },
  );
}

export function ordersGetByOutlet(
  api: string,
  headers: Record<string, string>,
  outletId: string,
) {
  return $fetch<{ orders: Order[] }>(`${api}/v1/orders?outlet_id=${outletId}`, {
    headers,
  });
}

export function ordersUpdateStatus(
  api: string,
  headers: Record<string, string>,
  orderId: string,
  status: OrderStatus,
) {
  return $fetch(`${api}/v1/orders/${orderId}/status`, {
    method: "PATCH",
    headers,
    body: { status },
  });
}

export function ordersRemindPickup(
  api: string,
  headers: Record<string, string>,
  orderId: string,
) {
  return $fetch(`${api}/v1/orders/${orderId}/remind-pickup`, {
    method: "POST",
    headers,
  });
}
