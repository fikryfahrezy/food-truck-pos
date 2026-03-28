import { ref, computed, watch } from "vue";
import { useRuntimeConfig, useRouter, useAsyncData } from "#imports";
import { authGetCities, authGetOutlets } from "~/api/auth";
import { useAuth } from "~/composables/useAuth";

export async function useSelectOutlet() {
  const { selectOutlet, pendingFullName, user } = useAuth();
  const config = useRuntimeConfig();
  const API = config.public.apiBase as string;
  const router = useRouter();

  // ─── Cities (query — useAsyncData is correct here) ──────────────────────────

  const { data: citiesData } = await useAsyncData("auth-cities", () =>
    authGetCities(API),
  );
  const cities = computed(() => citiesData.value?.cities ?? []);

  const cityOptions = computed(() =>
    cities.value.map((c) => ({ label: c.name, value: c.id })),
  );

  // ─── Outlets (fetched reactively when city changes) ──────────────────────────

  const selectedCityId = ref("");
  const selectedOutletId = ref("");
  const outlets = ref<{ id: string; name: string }[]>([]);
  const loadingOutlets = ref(false);
  const loadingSubmit = ref(false);
  const error = ref("");

  watch(selectedCityId, async (cityId) => {
    selectedOutletId.value = "";
    outlets.value = [];
    if (!cityId) return;
    loadingOutlets.value = true;
    try {
      const data = await authGetOutlets(API, cityId);
      outlets.value = data.outlets;
    } finally {
      loadingOutlets.value = false;
    }
  });

  const outletOptions = computed(() =>
    outlets.value.map((o) => ({ label: o.name, value: o.id })),
  );

  // ─── Submit ──────────────────────────────────────────────────────────────────

  async function handleProceed() {
    if (!selectedOutletId.value) return;
    loadingSubmit.value = true;
    error.value = "";
    try {
      await selectOutlet(selectedOutletId.value);
      switch (user.value?.role) {
        case "kitchen":
          router.push("/kitchen");
          break;
        case "admin":
          router.push("/report");
          break;
        default:
          router.push("/cashier");
      }
    } catch {
      error.value = "Gagal memilih outlet. Silahkan coba lagi.";
    } finally {
      loadingSubmit.value = false;
    }
  }

  return {
    pendingFullName,
    selectedCityId,
    selectedOutletId,
    cityOptions,
    outletOptions,
    loadingOutlets,
    loadingSubmit,
    error,
    handleProceed,
  };
}
