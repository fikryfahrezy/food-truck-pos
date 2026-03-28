import { http, HttpResponse, delay } from "msw";

function randomAmount(base: number) {
  return Math.round(base * (0.8 + Math.random() * 0.4));
}

export function createReportsHandlers(origin: string) {
  const base = `${origin}/v1`;
  return [
    // GET /reports/summary
    http.get(`${base}/reports/summary`, async () => {
      await delay(300);
      return HttpResponse.json({
        period: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          end: new Date().toISOString().split("T")[0],
        },
        total_sales: 320000000,
        total_transactions: 345,
        total_buyers: 330,
        codes_redeemed: 314,
        top_city: "Jakarta",
        top_outlet: "Food Truck Jajanan Bango JKT",
      });
    }),

    // GET /reports/products
    http.get(`${base}/reports/products`, async () => {
      await delay(300);
      return HttpResponse.json({
        products: [
          {
            id: "prod_01",
            name: "Product A",
            image_url: null,
            quantity_sold: 150,
          },
          {
            id: "prod_06",
            name: "Product F",
            image_url: null,
            quantity_sold: 130,
          },
          {
            id: "prod_03",
            name: "Product C",
            image_url: null,
            quantity_sold: 110,
          },
          {
            id: "prod_04",
            name: "Product D",
            image_url: null,
            quantity_sold: 80,
          },
          {
            id: "prod_02",
            name: "Product B",
            image_url: null,
            quantity_sold: 60,
          },
        ],
      });
    }),

    // GET /reports/sales-trends
    http.get(`${base}/reports/sales-trends`, async ({ request }) => {
      await delay(350);
      const url = new URL(request.url);
      const granularity = (url.searchParams.get("granularity") ?? "hourly") as
        | "hourly"
        | "daily";

      const now = new Date();
      const hours = [4, 8, 12, 16, 20, 24];
      const products = [
        "Product A",
        "Product B",
        "Product C",
        "Product D",
        "Product E",
      ];

      const series = products.map((name, i) => ({
        product_id: `prod_0${i + 1}`,
        product_name: name,
        data: hours.map((h) => ({
          timestamp: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            h,
          ).toISOString(),
          amount: randomAmount(15000000 + i * 5000000),
        })),
      }));

      return HttpResponse.json({ granularity, series });
    }),

    // GET /reports/outlets
    http.get(`${base}/reports/outlets`, async () => {
      await delay(300);
      return HttpResponse.json({
        rows: [
          {
            city: "Jakarta",
            outlet: "FJB JKT",
            total_sales: 450000000,
            transactions: 150,
            codes_redeemed: 10,
            products: [
              { product_id: "prod_01", name: "Product A", quantity: 10 },
              { product_id: "prod_02", name: "Product B", quantity: 10 },
              { product_id: "prod_03", name: "Product C", quantity: 10 },
              { product_id: "prod_04", name: "Product D", quantity: 10 },
            ],
          },
          {
            city: "Bandung",
            outlet: "FJB BDG",
            total_sales: 450000000,
            transactions: 120,
            codes_redeemed: 10,
            products: [
              { product_id: "prod_01", name: "Product A", quantity: 10 },
              { product_id: "prod_02", name: "Product B", quantity: 10 },
              { product_id: "prod_03", name: "Product C", quantity: 10 },
              { product_id: "prod_04", name: "Product D", quantity: 10 },
            ],
          },
          {
            city: "Surabaya",
            outlet: "FJB SBY",
            total_sales: 450000000,
            transactions: 80,
            codes_redeemed: 5,
            products: [
              { product_id: "prod_01", name: "Product A", quantity: 5 },
              { product_id: "prod_02", name: "Product B", quantity: 5 },
              { product_id: "prod_03", name: "Product C", quantity: 5 },
              { product_id: "prod_04", name: "Product D", quantity: 5 },
            ],
          },
          {
            city: "Semarang",
            outlet: "FJB SMG",
            total_sales: 450000000,
            transactions: 50,
            codes_redeemed: 2,
            products: [
              { product_id: "prod_01", name: "Product A", quantity: 2 },
              { product_id: "prod_02", name: "Product B", quantity: 2 },
              { product_id: "prod_03", name: "Product C", quantity: 2 },
              { product_id: "prod_04", name: "Product D", quantity: 2 },
            ],
          },
          {
            city: "Solo",
            outlet: "FJB SLO",
            total_sales: 450000000,
            transactions: 30,
            codes_redeemed: 4,
            products: [
              { product_id: "prod_01", name: "Product A", quantity: 4 },
              { product_id: "prod_02", name: "Product B", quantity: 4 },
              { product_id: "prod_03", name: "Product C", quantity: 4 },
              { product_id: "prod_04", name: "Product D", quantity: 4 },
            ],
          },
        ],
      });
    }),

    // GET /reports/voucher-impact
    http.get(`${base}/reports/voucher-impact`, async () => {
      await delay(300);
      return HttpResponse.json({
        total_codes_used: 80,
        total_sales_with_code: 320000000,
        avg_order_with_code: 21000000,
        avg_order_without_code: 18000000,
        uplift_percentage: 16.7,
      });
    }),

    // GET /reports/export
    http.get(`${base}/reports/export`, async () => {
      await delay(500);
      return HttpResponse.json({
        download_url: "#",
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      });
    }),
  ];
}
