import type {
  ReportSummary,
  ReportProduct,
  SalesTrendsResponse,
  OutletReportRow,
  VoucherImpact,
} from "~/types";

export function reportsGetSummary(
  api: string,
  headers: Record<string, string>,
  queryParams: string,
) {
  return $fetch<ReportSummary>(`${api}/v1/reports/summary?${queryParams}`, {
    headers,
  });
}

export function reportsGetProducts(
  api: string,
  headers: Record<string, string>,
  queryParams: string,
) {
  return $fetch<{ products: ReportProduct[] }>(
    `${api}/v1/reports/products?${queryParams}`,
    {
      headers,
    },
  );
}

export function reportsGetSalesTrends(
  api: string,
  headers: Record<string, string>,
  queryParams: string,
  granularity: string,
) {
  return $fetch<SalesTrendsResponse>(
    `${api}/v1/reports/sales-trends?${queryParams}&granularity=${granularity}`,
    { headers },
  );
}

export function reportsGetOutlets(
  api: string,
  headers: Record<string, string>,
  queryParams: string,
) {
  return $fetch<{ rows: OutletReportRow[] }>(
    `${api}/v1/reports/outlets?${queryParams}`,
    { headers },
  );
}

export function reportsGetVoucherImpact(
  api: string,
  headers: Record<string, string>,
  queryParams: string,
) {
  return $fetch<VoucherImpact>(
    `${api}/v1/reports/voucher-impact?${queryParams}`,
    { headers },
  );
}

export function reportsGetExport(
  api: string,
  headers: Record<string, string>,
  queryParams: string,
  format: string,
) {
  return $fetch<{ download_url: string }>(
    `${api}/v1/reports/export?${queryParams}&format=${format}`,
    { headers },
  );
}
