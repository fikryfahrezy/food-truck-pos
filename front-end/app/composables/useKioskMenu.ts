import { ref, computed } from "vue";
import { useRuntimeConfig, useAsyncData } from "#imports";
import { menuGetCategories, menuGetProducts } from "~/api/menu";
import { useCart } from "~/composables/useCart";
import type { Category, Product } from "~/types";

const OUTLET_ID = "out_01";

export async function useKioskMenu() {
  const config = useRuntimeConfig();
  const API = config.public.apiBase as string;
  const cart = useCart();

  // ─── Menu (queries — useAsyncData is correct) ─────────────────────────────────────

  const selectedCategory = ref("");

  const { data: categoriesData } = await useAsyncData("kiosk-categories", () =>
    menuGetCategories(API, {}),
  );
  const categories = computed<Category[]>(
    () => categoriesData.value?.categories ?? [],
  );

  const { data: productsData } = await useAsyncData(
    "kiosk-products",
    () =>
      menuGetProducts(
        API,
        {},
        { outletId: OUTLET_ID, categoryId: selectedCategory.value },
      ),
    { watch: [selectedCategory] },
  );
  const products = computed<Product[]>(
    () => productsData.value?.products ?? [],
  );

  const addedIds = computed(
    () => new Set(cart.items.value.map((i) => i.product_id)),
  );

  // ─── Item detail popup ────────────────────────────────────────────────────────

  const selectedProduct = ref<Product | null>(null);
  const popupQty = ref(1);

  function openProduct(product: Product) {
    selectedProduct.value = product;
    popupQty.value = 1;
  }

  function addFromPopup() {
    if (!selectedProduct.value) return;
    for (let i = 0; i < popupQty.value; i++)
      cart.addItem(selectedProduct.value);
    selectedProduct.value = null;
  }

  function handleRestartOrder() {
    if (window.confirm("Hapus semua item dan mulai ulang?")) cart.clearCart();
  }

  const isModalOpen = computed({
    get: () => !!selectedProduct.value,
    set: (v) => {
      if (!v) selectedProduct.value = null;
    },
  });

  const categoryIcons: Record<string, string> = {
    cat_01: "i-lucide-utensils",
    cat_02: "i-lucide-coffee",
  };

  return {
    ...cart,
    selectedCategory,
    categories,
    products,
    addedIds,
    selectedProduct,
    popupQty,
    isModalOpen,
    categoryIcons,
    openProduct,
    addFromPopup,
    handleRestartOrder,
  };
}
