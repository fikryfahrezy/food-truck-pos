import { http, HttpResponse, delay } from "msw";
import {
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  addOrder,
  getNextOrderNumber,
} from "../data";
import type { CreateOrderRequest, Order } from "~/types";

export function createOrdersHandlers(origin: string) {
  const base = `${origin}/v1`;
  return [
    // POST /orders
    http.post(`${base}/orders`, async ({ request }) => {
      await delay(400);
      const body = (await request.json()) as CreateOrderRequest;

      // Validate products are available
      for (const item of body.items) {
        const product = MOCK_PRODUCTS.find((p) => p.id === item.product_id);
        if (!product || !product.is_available) {
          return HttpResponse.json(
            {
              error: "PRODUCT_UNAVAILABLE",
              message: `Product '${product?.name ?? item.product_id}' is out of stock`,
              product_id: item.product_id,
            },
            { status: 422 },
          );
        }
      }

      const orderItems = body.items.map((item, idx) => {
        const product = MOCK_PRODUCTS.find((p) => p.id === item.product_id)!;
        return {
          id: `oi_${Date.now()}_${idx}`,
          product_id: item.product_id,
          product_name: product.name,
          product_price: product.price,
          quantity: item.quantity,
          notes: item.notes,
          line_total: product.price * item.quantity,
        };
      });

      const subtotal = orderItems.reduce((sum, i) => sum + i.line_total, 0);
      const serviceCharge = Math.round(subtotal * 0.05);
      const taxPb1 = Math.round(subtotal * 0.1);

      const newOrder: Order = {
        id: `ord_${Date.now()}`,
        order_number: getNextOrderNumber(),
        outlet_id: body.outlet_id,
        source: body.source,
        order_type: body.order_type,
        table_number: body.table_number ?? null,
        customer_name: body.customer_name,
        customer_wa: body.customer_wa,
        status: "new",
        payment_status: body.payment_method === "cash" ? "paid" : "pending",
        payment_method: body.payment_method,
        items: orderItems,
        subtotal,
        service_charge: serviceCharge,
        tax_pb1: taxPb1,
        total_amount: subtotal + serviceCharge + taxPb1,
        created_at: new Date().toISOString(),
      };

      addOrder(newOrder);
      return HttpResponse.json(newOrder, { status: 201 });
    }),

    // GET /orders/:orderId
    http.get(`${base}/orders/:orderId`, async ({ params }) => {
      await delay(200);
      const { orderId } = params as { orderId: string };
      const order = MOCK_ORDERS.find((o) => o.id === orderId);
      if (!order) {
        return HttpResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
      }
      return HttpResponse.json(order);
    }),

    // GET /orders
    http.get(`${base}/orders`, async ({ request }) => {
      await delay(250);
      const url = new URL(request.url);
      const outletId = url.searchParams.get("outlet_id");
      const status = url.searchParams.get("status");

      let orders = [...MOCK_ORDERS];
      if (outletId) orders = orders.filter((o) => o.outlet_id === outletId);
      if (status) orders = orders.filter((o) => o.status === status);

      // Sort by created_at descending
      orders.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      return HttpResponse.json({ orders, total: orders.length });
    }),

    // PATCH /orders/:orderId/status
    http.patch(
      `${base}/orders/:orderId/status`,
      async ({ params, request }) => {
        await delay(300);
        const { orderId } = params as { orderId: string };
        const body = (await request.json()) as { status: string };
        const order = MOCK_ORDERS.find((o) => o.id === orderId);
        if (!order) {
          return HttpResponse.json(
            { error: "ORDER_NOT_FOUND" },
            { status: 404 },
          );
        }

        const validTransitions: Record<string, string[]> = {
          new: ["processing", "cancelled"],
          processing: ["pickup", "cancelled"],
          pickup: ["complete"],
        };

        if (!validTransitions[order.status]?.includes(body.status)) {
          return HttpResponse.json(
            {
              error: "INVALID_TRANSITION",
              message: `Cannot transition from '${order.status}' to '${body.status}'`,
            },
            { status: 422 },
          );
        }

        order.status = body.status as Order["status"];
        order.updated_at = new Date().toISOString();

        return HttpResponse.json({
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          updated_at: order.updated_at,
        });
      },
    ),

    // POST /orders/:orderId/remind-pickup
    http.post(`${base}/orders/:orderId/remind-pickup`, async ({ params }) => {
      await delay(300);
      const { orderId } = params as { orderId: string };
      const order = MOCK_ORDERS.find((o) => o.id === orderId);
      if (!order || order.status !== "pickup") {
        return HttpResponse.json(
          { error: "INVALID", message: "Order not in pickup status" },
          { status: 422 },
        );
      }
      return HttpResponse.json({
        message: "Reminder sent",
        next_allowed_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
      });
    }),
  ];
}
