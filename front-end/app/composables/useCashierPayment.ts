import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRuntimeConfig, useRouter } from "#imports";
import { ordersGetById } from "~/api/orders";
import { paymentsInitiate, paymentsGetStatus } from "~/api/payments";
import { useAuth } from "~/composables/useAuth";
import { useCart } from "~/composables/useCart";
import type { PaymentInitiateResponse } from "~/types";

export async function useCashierPayment(orderId: string) {
  const config = useRuntimeConfig();
  const API = config.public.apiBase as string;
  const { authHeaders } = useAuth();
  const { totals, clearCart } = useCart();
  const router = useRouter();

  // ─── Fetch order details + initiate payment (top-level awaits run at
  //     setup time in <script setup>, so this is fine for the initial load) ────

  const payment = ref<PaymentInitiateResponse | null>(null);
  const paymentStatus = ref<"pending" | "paid" | "failed" | "expired">(
    "pending",
  );
  const orderNumber = ref("00001");
  const orderData = ref<{ order_number: string; total_amount: number } | null>(
    null,
  );

  try {
    const d = await ordersGetById(API, authHeaders(), orderId);
    orderData.value = d;
    orderNumber.value = d.order_number;
  } catch {
    /* ignore */
  }

  try {
    const data = await paymentsInitiate(API, authHeaders(), orderId, "qris");
    payment.value = data;
  } catch {
    router.push("/cashier");
  }

  // ─── Countdown ───────────────────────────────────────────────────────────────

  const expiresAt = computed(() =>
    payment.value?.expires_at
      ? new Date(payment.value.expires_at)
      : new Date(Date.now() + 600000),
  );
  const secondsLeft = ref(0);

  function updateCountdown() {
    secondsLeft.value = Math.max(
      0,
      Math.floor((expiresAt.value.getTime() - Date.now()) / 1000),
    );
  }

  const countdownDisplay = computed(() => {
    const m = Math.floor(secondsLeft.value / 60);
    const s = secondsLeft.value % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  });

  // ─── Polling ─────────────────────────────────────────────────────────────────

  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let countdownInterval: ReturnType<typeof setInterval> | null = null;

  function stopPolling() {
    if (pollInterval) clearInterval(pollInterval);
    if (countdownInterval) clearInterval(countdownInterval);
  }

  async function pollStatus() {
    if (!payment.value?.payment_id) return;
    try {
      const data = await paymentsGetStatus(
        API,
        authHeaders(),
        payment.value.payment_id,
      );
      if (data.status === "paid") {
        paymentStatus.value = "paid";
        stopPolling();
      } else if (data.status === "expired" || data.status === "failed") {
        paymentStatus.value = data.status;
        stopPolling();
      }
    } catch {
      /* ignore poll errors */
    }
  }

  onMounted(() => {
    updateCountdown();
    countdownInterval = setInterval(() => {
      updateCountdown();
      if (secondsLeft.value <= 0) {
        paymentStatus.value = "expired";
        stopPolling();
      }
    }, 1000);
    pollInterval = setInterval(pollStatus, 2000);
  });

  onUnmounted(stopPolling);

  function done() {
    clearCart();
    router.push("/cashier");
  }

  return {
    payment,
    paymentStatus,
    orderNumber,
    orderData,
    countdownDisplay,
    totals,
    done,
  };
}
