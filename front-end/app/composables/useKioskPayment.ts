import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRuntimeConfig, useRouter } from "#imports";
import { ordersCreate } from "~/api/orders";
import { paymentsInitiate, paymentsGetStatus } from "~/api/payments";
import { useCart } from "~/composables/useCart";
import type { CartItem, PaymentInitiateResponse } from "~/types";

interface OrderInput {
  outletId: string;
  customerName: string;
  customerWa: string;
  items: readonly CartItem[];
}

export function useKioskPayment(input: OrderInput) {
  const config = useRuntimeConfig();
  const API = config.public.apiBase as string;
  const router = useRouter();
  const { clearCart, totals } = useCart();

  // ─── State ──────────────────────────────────────────────────────────────────

  const payment = ref<PaymentInitiateResponse | null>(null);
  const orderNumber = ref("");
  const paymentStatus = ref<"pending" | "paid" | "failed" | "expired">(
    "pending",
  );
  const initError = ref("");
  const secondsLeft = ref(600);
  const returnSeconds = ref(10);

  const countdownDisplay = computed(() => {
    const m = Math.floor(secondsLeft.value / 60);
    const s = secondsLeft.value % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  });

  // ─── Intervals ──────────────────────────────────────────────────────────────

  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let countdownInterval: ReturnType<typeof setInterval> | null = null;
  let returnInterval: ReturnType<typeof setInterval> | null = null;

  function stopAll() {
    if (pollInterval) clearInterval(pollInterval);
    if (countdownInterval) clearInterval(countdownInterval);
  }

  function startReturnCountdown() {
    returnInterval = setInterval(() => {
      returnSeconds.value--;
      if (returnSeconds.value <= 0) {
        clearCart();
        router.push("/kiosk");
      }
    }, 1000);
  }

  function startPolling(paymentId: string) {
    countdownInterval = setInterval(() => {
      secondsLeft.value--;
      if (secondsLeft.value <= 0) {
        paymentStatus.value = "expired";
        stopAll();
      }
    }, 1000);

    pollInterval = setInterval(async () => {
      try {
        const data = await paymentsGetStatus(API, {}, paymentId);
        if (data.status === "paid") {
          paymentStatus.value = "paid";
          stopAll();
          startReturnCountdown();
        } else if (data.status === "expired" || data.status === "failed") {
          paymentStatus.value = data.status;
          stopAll();
        }
      } catch {
        /* ignore polling errors */
      }
    }, 2000);
  }

  // ─── Order + payment initiation (mutations — intentionally onMounted) ───────

  onMounted(async () => {
    try {
      const order = await ordersCreate(
        API,
        {},
        {
          outlet_id: input.outletId,
          source: "kiosk",
          order_type: "take_away",
          customer_name: input.customerName,
          customer_wa: input.customerWa,
          payment_method: "qris",
          items: input.items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            notes: "",
          })),
        },
      );
      orderNumber.value = order.order_number;

      const pay = await paymentsInitiate(API, {}, order.id, "qris");
      payment.value = pay;
      startPolling(pay.payment_id);
    } catch {
      initError.value = "Gagal membuat order. Silahkan coba lagi.";
    }
  });

  onUnmounted(() => {
    stopAll();
    if (returnInterval) clearInterval(returnInterval);
  });

  // ─── Actions ─────────────────────────────────────────────────────────────────

  function done() {
    clearCart();
    router.push("/kiosk");
  }

  return {
    payment,
    orderNumber,
    paymentStatus,
    initError,
    countdownDisplay,
    returnSeconds,
    totals,
    done,
  };
}
