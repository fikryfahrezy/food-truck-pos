import type { PaymentInitiateResponse, PaymentStatusResponse } from "~/types";

export function paymentsInitiate(
  api: string,
  headers: Record<string, string>,
  orderId: string,
  paymentMethod: string,
) {
  return $fetch<PaymentInitiateResponse>(`${api}/v1/payments/initiate`, {
    method: "POST",
    headers,
    body: { order_id: orderId, payment_method: paymentMethod },
  });
}

export function paymentsGetStatus(
  api: string,
  headers: Record<string, string>,
  paymentId: string,
) {
  return $fetch<PaymentStatusResponse>(
    `${api}/v1/payments/${paymentId}/status`,
    { headers },
  );
}
