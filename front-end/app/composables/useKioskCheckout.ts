import { ref, computed } from "vue";
import { useRouter, useState } from "#imports";
import { useCart } from "~/composables/useCart";

export function useKioskCheckout() {
  const { items } = useCart();
  const router = useRouter();

  const customerName = ref("");
  const customerWa = ref("");
  const error = ref("");

  const isValid = computed(
    () =>
      customerName.value.trim().length > 0 &&
      /^\d{10,13}$/.test(customerWa.value.replace(/^0/, "62")),
  );

  function proceed() {
    if (!isValid.value) {
      error.value =
        "Mohon isi nama dan nomor WhatsApp yang valid (10-13 digit)";
      return;
    }
    useState("kiosk.customerName", () => "").value = customerName.value;
    useState("kiosk.customerWa", () => "").value = customerWa.value;
    router.push("/kiosk/payment");
  }

  return { items, customerName, customerWa, error, isValid, proceed };
}
