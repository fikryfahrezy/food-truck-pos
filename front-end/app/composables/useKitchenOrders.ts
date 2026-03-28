import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRuntimeConfig, useAsyncData } from "#imports";
import { menuGetProducts } from "~/api/menu";
import {
  ordersGetByOutlet,
  ordersUpdateStatus,
  ordersRemindPickup,
} from "~/api/orders";
import { useAuth } from "~/composables/useAuth";
import type { Order, OrderStatus, Product } from "~/types";

export function useKitchenOrders() {
  const config = useRuntimeConfig();
  const API = config.public.apiBase as string;
  const { authHeaders, outlet } = useAuth();

  // ─── Products list (query — useAsyncData is correct) ───────────────────────────────

  const { data: productsData } = useAsyncData("kitchen-products", () =>
    menuGetProducts(API, authHeaders(), {
      outletId: outlet.value?.id ?? "out_01",
    }),
  );
  const products = computed(
    () =>
      (productsData.value as { products: Product[] } | null)?.products ?? [],
  );

  // ─── Orders (polled — mutation-safe $fetch + interval) ───────────────────────

  const orders = ref<Order[]>([]);
  const loading = ref(true);

  async function fetchOrders() {
    try {
      const data = await ordersGetByOutlet(
        API,
        authHeaders(),
        outlet.value?.id ?? "out_01",
      );
      orders.value = data.orders;
    } finally {
      loading.value = false;
    }
  }

  let intervalId: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    fetchOrders();
    intervalId = setInterval(fetchOrders, 5000);
  });

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
  });

  const columns: { key: OrderStatus; label: string; color: string }[] = [
    { key: "new", label: "NEW ORDER", color: "bg-gray-700" },
    { key: "processing", label: "ON PROCESS", color: "bg-yellow-500" },
    { key: "pickup", label: "PICKUP", color: "bg-blue-500" },
    { key: "complete", label: "COMPLETE", color: "bg-green-500" },
  ];

  function getColumnOrders(status: OrderStatus) {
    return orders.value.filter(
      (o) => o.status === status && o.payment_status === "paid",
    );
  }

  async function handleAction(orderId: string, newStatus: OrderStatus) {
    try {
      await ordersUpdateStatus(API, authHeaders(), orderId, newStatus);
      await fetchOrders();
    } catch {
      /* show toast or ignore */
    }
  }

  async function handleRemind(orderId: string) {
    try {
      await ordersRemindPickup(API, authHeaders(), orderId);
    } catch {
      /* ignore rate limit */
    }
  }

  return {
    orders,
    loading,
    products,
    columns,
    getColumnOrders,
    handleAction,
    handleRemind,
  };
}
