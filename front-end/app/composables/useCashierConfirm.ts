import { ref } from "vue";
import { useRuntimeConfig, useRouter } from "#imports";
import { ordersCreate } from "~/api/orders";
import { useAuth } from "~/composables/useAuth";
import { useCart } from "~/composables/useCart";
import type { PaymentMethod } from "~/types";

export function useCashierConfirm() {
  const config = useRuntimeConfig();
  const API = config.public.apiBase as string;
  const { authHeaders, outlet } = useAuth();
  const { items, orderType, totals, clearCart } = useCart();
  const router = useRouter();

  const paymentMethod = ref<PaymentMethod>("qris");
  const customerName = ref("");
  const customerWa = ref("");
  const tableNumber = ref("");
  const loading = ref(false);
  const error = ref("");

  const paymentMethods: { label: string; value: PaymentMethod }[] = [
    { label: "QRIS", value: "qris" },
    { label: "Gopay", value: "gopay" },
    { label: "Cash", value: "cash" },
  ];

  // ─── POST create order (mutation — onMounted would work, but here it's
  //     user-triggered, so a plain async function is correct) ─────────────────

  async function handleConfirm() {
    loading.value = true;
    error.value = "";
    try {
      const order = await ordersCreate(API, authHeaders(), {
        outlet_id: outlet.value?.id ?? "",
        source: "cashier",
        order_type: orderType.value,
        table_number:
          orderType.value === "dine_in" ? tableNumber.value : undefined,
        customer_name: customerName.value,
        customer_wa: customerWa.value,
        payment_method: paymentMethod.value,
        items: items.value.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          notes: i.notes,
        })),
      });

      if (paymentMethod.value === "cash") {
        clearCart();
        router.push("/cashier");
      } else {
        router.push(`/cashier/payment?order_id=${order.id}`);
      }
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } };
      error.value =
        err.data?.message ?? "Gagal membuat order. Silahkan coba lagi.";
    } finally {
      loading.value = false;
    }
  }

  function cancelOrder() {
    if (window.confirm("Batalkan order ini?")) {
      clearCart();
      router.push("/cashier");
    }
  }

  return {
    items,
    orderType,
    totals,
    paymentMethod,
    customerName,
    customerWa,
    tableNumber,
    loading,
    error,
    paymentMethods,
    handleConfirm,
    cancelOrder,
  };
}
