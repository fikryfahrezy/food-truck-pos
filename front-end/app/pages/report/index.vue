<script setup lang="ts">
import { definePageMeta } from "#imports";
import { useReport } from "~/composables/useReport";
import { formatRupiah } from "~/utils/format";

definePageMeta({ layout: "report" });

const {
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
} = await useReport();
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Controls -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UInput
          v-model="startDate"
          type="date"
          size="sm"
          placeholder="Start Date"
        />
        <UInput
          v-model="endDate"
          type="date"
          size="sm"
          placeholder="End Date"
        />
        <UButton
          size="sm"
          color="neutral"
          variant="outline"
          @click="applyFilters"
          >Terapkan</UButton
        >
      </div>
      <UButton
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-lucide-download"
        @click="handleExport"
      >
        Download
      </UButton>
    </div>

    <!-- Summary -->
    <div v-if="summary">
      <div class="mb-3 flex items-center justify-between">
        <p class="font-bold text-gray-700">Summary</p>
        <p class="text-xs text-gray-600">Last 7 days</p>
      </div>
      <div class="grid grid-cols-5 gap-3">
        <div class="rounded-lg border border-gray-100 bg-white p-4">
          <p class="mb-1 text-xs text-gray-600">Sales</p>
          <p class="font-bold text-gray-900">
            {{ formatRupiah(summary.total_sales) }}
          </p>
        </div>
        <div class="rounded-lg border border-gray-100 bg-white p-4">
          <p class="mb-1 text-xs text-gray-600">Transactions</p>
          <p class="font-bold text-gray-900">
            {{ summary.total_transactions }}
          </p>
        </div>
        <div class="rounded-lg border border-gray-100 bg-white p-4">
          <p class="mb-1 text-xs text-gray-600">Buyer</p>
          <p class="font-bold text-gray-900">{{ summary.total_buyers }}</p>
        </div>
        <div class="rounded-lg border border-gray-100 bg-white p-4">
          <p class="mb-1 text-xs text-gray-600">Code Redeemed</p>
          <p class="font-bold text-gray-900">{{ summary.codes_redeemed }}</p>
        </div>
        <div class="rounded-lg border border-gray-100 bg-white p-4">
          <p class="mb-1 text-xs text-gray-600">Top City/Outlet</p>
          <p class="text-sm font-bold text-gray-900">{{ summary.top_city }}</p>
        </div>
      </div>
    </div>

    <!-- Product Performance -->
    <div class="rounded-lg border border-gray-100 bg-white p-4">
      <p class="mb-3 font-bold text-gray-700">Product Performance</p>
      <div class="flex gap-3 overflow-x-auto">
        <div
          v-for="product in products"
          :key="product.id"
          class="flex w-28 shrink-0 flex-col items-center gap-1 rounded-lg bg-gray-50 p-3"
        >
          <div
            class="flex h-14 w-full items-center justify-center rounded bg-gray-100"
          >
            <UIcon name="i-lucide-image" class="text-2xl text-gray-400" />
          </div>
          <p class="w-full truncate text-center text-xs text-gray-600">
            {{ product.name }}
          </p>
          <p class="font-bold text-gray-900">{{ product.quantity_sold }}</p>
        </div>
      </div>
    </div>

    <!-- Sales Trends Chart -->
    <div class="rounded-lg border border-gray-100 bg-white p-4">
      <div class="mb-3 flex items-center justify-between">
        <p class="font-bold text-gray-700">Sales Trends</p>
        <div class="flex gap-1">
          <UButton
            size="xs"
            :color="trendsGranularity === 'hourly' ? 'primary' : 'neutral'"
            :variant="trendsGranularity === 'hourly' ? 'solid' : 'ghost'"
            @click="trendsGranularity = 'hourly'"
            >Hourly</UButton
          >
          <UButton
            size="xs"
            :color="trendsGranularity === 'daily' ? 'primary' : 'neutral'"
            :variant="trendsGranularity === 'daily' ? 'solid' : 'ghost'"
            @click="trendsGranularity = 'daily'"
            >Daily</UButton
          >
        </div>
      </div>
      <SalesChart
        v-if="trends?.series?.length"
        :series="trends.series"
        :granularity="trends.granularity"
      />
      <div
        v-else
        class="flex h-48 items-center justify-center text-sm text-gray-500"
      >
        Memuat data chart...
      </div>
    </div>

    <!-- City/Outlet Performance Table -->
    <div class="rounded-lg border border-gray-100 bg-white p-4">
      <p class="mb-3 font-bold text-gray-700">City/Outlet Performance</p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              class="border-b border-gray-100 text-left text-xs text-gray-500"
            >
              <th class="pb-2 font-medium">City</th>
              <th class="pb-2 font-medium">Sales</th>
              <th class="pb-2 font-medium">Transaction</th>
              <th class="pb-2 font-medium">Redeem Code</th>
              <th v-for="p in productColumns" :key="p" class="pb-2 font-medium">
                {{ p }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in outletRows"
              :key="row.city"
              class="border-b border-gray-50 hover:bg-gray-50"
            >
              <td class="py-2 text-gray-700">{{ row.city }}</td>
              <td class="py-2 text-gray-700">
                {{ formatRupiah(row.total_sales) }}
              </td>
              <td class="py-2 text-gray-700">{{ row.transactions }}</td>
              <td class="py-2 text-gray-700">{{ row.codes_redeemed }}</td>
              <td
                v-for="p in productColumns"
                :key="p"
                class="py-2 text-gray-700"
              >
                {{
                  row.products.find(
                    (rp: { name: string; quantity: number }) => rp.name === p,
                  )?.quantity ?? "-"
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Voucher Program Impact -->
    <div v-if="voucher" class="rounded-lg border border-gray-100 bg-white p-4">
      <p class="mb-3 font-bold text-gray-700">Voucher Program Impact</p>
      <div class="grid grid-cols-2 gap-4">
        <div
          class="flex items-center justify-between rounded border border-gray-100 p-3"
        >
          <span class="text-sm text-gray-600">Total Redeem Code Used</span>
          <span class="font-bold text-gray-900">{{
            voucher.total_codes_used
          }}</span>
        </div>
        <div
          class="flex items-center justify-between rounded border border-gray-100 p-3"
        >
          <span class="text-sm text-gray-600">Total Sales (With Code)</span>
          <span class="font-bold text-gray-900">{{
            formatRupiah(voucher.total_sales_with_code)
          }}</span>
        </div>
        <div
          class="flex items-center justify-between rounded border border-gray-100 p-3"
        >
          <span class="text-sm text-gray-600">Avg. Order (With Code)</span>
          <span class="font-bold text-gray-900">{{
            formatRupiah(voucher.avg_order_with_code)
          }}</span>
        </div>
        <div
          class="flex items-center justify-between rounded border border-gray-100 p-3"
        >
          <span class="text-sm text-gray-600">Avg. Order (Without Code)</span>
          <span class="font-bold text-gray-900">{{
            formatRupiah(voucher.avg_order_without_code)
          }}</span>
        </div>
        <div
          class="col-span-2 flex items-center justify-between rounded border border-gray-100 p-3"
        >
          <span class="text-sm text-gray-600">Uplift in Avg Order Value</span>
          <span class="font-bold text-green-600"
            >+{{ voucher.uplift_percentage }}%</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
