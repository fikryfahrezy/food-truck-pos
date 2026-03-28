import { http, HttpResponse, delay } from "msw";
import { MOCK_ORDERS, MOCK_PAYMENTS, simulatePaymentSuccess } from "../data";

export function createPaymentsHandlers(origin: string) {
  const base = `${origin}/v1`;
  return [
    // POST /payments/initiate
    http.post(`${base}/payments/initiate`, async ({ request }) => {
      await delay(500);
      const body = (await request.json()) as {
        order_id: string;
        payment_method: string;
      };
      const order = MOCK_ORDERS.find((o) => o.id === body.order_id);
      if (!order) {
        return HttpResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
      }

      const paymentId = `pay_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      if (body.payment_method === "cash") {
        order.payment_status = "paid";
        order.status = "new";
        return HttpResponse.json({
          payment_id: paymentId,
          order_id: body.order_id,
          payment_method: "cash",
          status: "paid",
          amount: order.total_amount,
        });
      }

      // QRIS / GoPay – auto-pay after ~8 seconds in mock
      MOCK_PAYMENTS[paymentId] = { status: "pending", expires_at: expiresAt };
      simulatePaymentSuccess(paymentId, 8000);

      return HttpResponse.json({
        payment_id: paymentId,
        order_id: body.order_id,
        payment_method: body.payment_method,
        qr_string:
          "00020101021226480014ID.CO.QRIS.WWW0215ID10230000088750303UEQ51440014ID.LINKAJA.WWW0215H000000000000000303UEQ5204799953033605405981755802ID5920PT Kreasi Global Jaya6013Jakarta Pusat6105101106304B85D",
        qr_image_url: null,
        amount: order.total_amount,
        expires_at: expiresAt,
      });
    }),

    // GET /payments/:paymentId/status
    http.get(`${base}/payments/:paymentId/status`, async ({ params }) => {
      await delay(200);
      const { paymentId } = params as { paymentId: string };
      const payment = MOCK_PAYMENTS[paymentId];
      if (!payment) {
        // Return pending for unknown payments (first poll before data is set)
        return HttpResponse.json({
          payment_id: paymentId,
          status: "pending",
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        });
      }
      return HttpResponse.json({ payment_id: paymentId, ...payment });
    }),
  ];
}
