import { ref, computed, watch } from "vue";
import { useRuntimeConfig, useAsyncData } from "#imports";
import {
  reportsGetSummary,
  reportsGetProducts,
  reportsGetSalesTrends,
  reportsGetOutlets,
  reportsGetVoucherImpact,
  reportsGetExport,
} from "~/api/reports";
import { useAuth } from "~/composables/useAuth";
import type {
  ReportSummary,
  ReportProduct,
  SalesTrendsResponse,
  OutletReportRow,
  VoucherImpact,
} from "~/types";

export async function useReport() {
  const config = useRuntimeConfig();
  const API = config.public.apiBase as string;
  const { authHeaders } = useAuth();

  // ─── Date filters ─────────────────────────────────────────────────────────────

  const endDate = ref(new Date().toISOString().split("T")[0]);
  const startDate = ref(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const queryParams = computed(
    () => `start_date=${startDate.value}&end_date=${endDate.value}`,
  );

  // ─── Data fetching (queries — useAsyncData is correct) ────────────────────────────────

  const { data: summaryData, refresh: refreshSummary } = await useAsyncData(
    "report-summary",
    () => reportsGetSummary(API, authHeaders(), queryParams.value),
  );

  const { data: productsData, refresh: refreshProducts } = await useAsyncData(
    "report-products",
    () => reportsGetProducts(API, authHeaders(), queryParams.value),
  );

  const trendsGranularity = ref<"hourly" | "daily">("hourly");

  const { data: trendsData, refresh: refreshTrends } = await useAsyncData(
    "report-trends",
    () =>
      reportsGetSalesTrends(
        API,
        authHeaders(),
        queryParams.value,
        trendsGranularity.value,
      ),
  );

  const { data: outletsData, refresh: refreshOutlets } = await useAsyncData(
    "report-outlets",
    () => reportsGetOutlets(API, authHeaders(), queryParams.value),
  );

  const { data: voucherData, refresh: refreshVoucher } = await useAsyncData(
    "report-voucher",
    () => reportsGetVoucherImpact(API, authHeaders(), queryParams.value),
  );

  // ─── Derived state ────────────────────────────────────────────────────────────

  const summary = computed(() => summaryData.value as ReportSummary | null);
  const products = computed(
    () =>
      (productsData.value as { products: ReportProduct[] } | null)?.products ??
      [],
  );
  const trends = computed(() => trendsData.value as SalesTrendsResponse | null);
  const outletRows = computed(
    () => (outletsData.value as { rows: OutletReportRow[] } | null)?.rows ?? [],
  );
  const voucher = computed(() => voucherData.value as VoucherImpact | null);

  const productColumns = computed(() => {
    const names = new Set<string>();
    outletRows.value.forEach((r) =>
      r.products.forEach((p) => names.add(p.name)),
    );
    return Array.from(names).slice(0, 5);
  });

  // ─── Actions ─────────────────────────────────────────────────────────────────

  async function applyFilters() {
    await Promise.all([
      refreshSummary(),
      refreshProducts(),
      refreshTrends(),
      refreshOutlets(),
      refreshVoucher(),
    ]);
  }

  watch(trendsGranularity, () => refreshTrends());

  async function handleExport() {
    try {
      const data = await reportsGetExport(
        API,
        authHeaders(),
        queryParams.value,
        "csv",
      );
      if (data.download_url && data.download_url !== "#") {
        window.open(data.download_url, "_blank");
      }
    } catch {
      /* ignore */
    }
  }

  return {
    startDate,
    endDate,
    trendsGranularity,
    summary,
    products,
    trends,
    outletRows,
    voucher,
    productColumns,
    applyFilters,
    handleExport,
  };
}
