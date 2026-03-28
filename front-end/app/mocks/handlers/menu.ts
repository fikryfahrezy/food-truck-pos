import { http, HttpResponse, delay } from "msw";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "../data";

export function createMenuHandlers(origin: string) {
  const base = `${origin}/v1`;
  return [
    // GET /menu/categories
    http.get(`${base}/menu/categories`, async () => {
      await delay(200);
      return HttpResponse.json({ categories: MOCK_CATEGORIES });
    }),

    // GET /menu/products
    http.get(`${base}/menu/products`, async ({ request }) => {
      await delay(250);
      const url = new URL(request.url);
      const categoryId = url.searchParams.get("category_id");
      const search = url.searchParams.get("search")?.toLowerCase();

      let products = [...MOCK_PRODUCTS];

      if (categoryId) {
        products = products.filter((p) => p.category_id === categoryId);
      }

      if (search) {
        products = products.filter((p) =>
          p.name.toLowerCase().includes(search),
        );
      }

      return HttpResponse.json({ products });
    }),

    // PATCH /menu/products/:productId/stock
    http.patch(
      `${base}/menu/products/:productId/stock`,
      async ({ params, request }) => {
        await delay(200);
        const { productId } = params as { productId: string };
        const body = (await request.json()) as { stock_quantity: number };
        const product = MOCK_PRODUCTS.find((p) => p.id === productId);
        if (!product) {
          return HttpResponse.json(
            { error: "PRODUCT_NOT_FOUND" },
            { status: 404 },
          );
        }
        product.stock_quantity = body.stock_quantity;
        product.is_available = body.stock_quantity > 0;
        return HttpResponse.json({
          id: product.id,
          stock_quantity: product.stock_quantity,
          is_available: product.is_available,
        });
      },
    ),
  ];
}
