import { ref } from "vue";
import { useRouter } from "#imports";
import { useAuth } from "~/composables/useAuth";

export function usePinAuth() {
  const { verifyPin, pendingFullName } = useAuth();
  const router = useRouter();

  const pin = ref("");
  const loading = ref(false);
  const error = ref("");
  const lockedUntil = ref<string | null>(null);

  const numpad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "X"];

  async function handleDigit(d: string) {
    if (loading.value || pin.value.length >= 4) return;
    pin.value += d;
    if (pin.value.length === 4) {
      await submitPin();
    }
  }

  function handleClear() {
    pin.value = pin.value.slice(0, -1);
    error.value = "";
  }

  function handleCancel() {
    pin.value = "";
    router.push("/login");
  }

  async function submitPin() {
    loading.value = true;
    error.value = "";
    try {
      await verifyPin(pin.value);
      router.push("/select-outlet");
    } catch (e: unknown) {
      const err = e as {
        status?: number;
        data?: { message?: string; locked_until?: string };
      };
      pin.value = "";
      if (err.status === 423) {
        lockedUntil.value = err.data?.locked_until ?? null;
        error.value = "Akun terkunci. Coba lagi setelah 5 menit.";
      } else {
        error.value = `PIN salah. ${err.data?.message ?? ""}`;
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    pin,
    loading,
    error,
    lockedUntil,
    numpad,
    pendingFullName,
    handleDigit,
    handleClear,
    handleCancel,
  };
}
