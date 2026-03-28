import { ref, computed } from "vue";
import { useRuntimeConfig, useAsyncData } from "#imports";
import { menuGetCategories, menuGetProducts } from "~/api/menu";
import { useAuth } from "~/composables/useAuth";
import { useCart } from "~/composables/useCart";
import type { Category, Product } from "~/types";

export async function useCashierPos() {
  const config = useRuntimeConfig();
  const API = config.public.apiBase as string;
  const { authHeaders, outlet } = useAuth();
  const cart = useCart();

  // ─── Category + product fetching (queries — useFetch is correct) ─────────────

  const selectedCategory = ref("");
  const searchQuery = ref("");

  const { data: categoriesData } = await useAsyncData(
    "cashier-categories",
    () => menuGetCategories(API, authHeaders()),
  );
  const categories = computed<Category[]>(
    () => categoriesData.value?.categories ?? [],
  );

  const { data: productsData } = await useAsyncData(
    "cashier-products",
    () =>
      menuGetProducts(API, authHeaders(), {
        outletId: outlet.value?.id ?? "",
        categoryId: selectedCategory.value,
        search: searchQuery.value,
      }),
    { watch: [selectedCategory, searchQuery] },
  );
  const products = computed<Product[]>(
    () => productsData.value?.products ?? [],
  );

  return {
    ...cart,
    outlet,
    selectedCategory,
    searchQuery,
    categories,
    products,
  };
}
