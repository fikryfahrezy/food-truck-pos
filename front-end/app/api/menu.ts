import type { Category, Product } from "~/types";

export function menuGetCategories(
  api: string,
  headers: Record<string, string>,
) {
  return $fetch<{ categories: Category[] }>(`${api}/v1/menu/categories`, {
    headers,
  });
}

export function menuGetProducts(
  api: string,
  headers: Record<string, string>,
  params: { outletId?: string; categoryId?: string; search?: string },
) {
  const p = new URLSearchParams();
  if (params.outletId) p.set("outlet_id", params.outletId);
  if (params.categoryId) p.set("category_id", params.categoryId);
  if (params.search) p.set("search", params.search);
  return $fetch<{ products: Product[] }>(`${api}/v1/menu/products?${p}`, {
    headers,
  });
}
