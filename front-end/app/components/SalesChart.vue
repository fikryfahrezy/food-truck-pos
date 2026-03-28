<script setup lang="ts">
/**
 * SalesChart — wraps vue-chartjs Line chart for the report page.
 * Loaded dynamically (client-only) to avoid SSR hydration issues.
 */
import { computed, shallowRef, onMounted, markRaw } from "vue";
import type { Component } from "vue";
import type { SalesTrendSeries } from "~/types";

const LineChart = shallowRef<Component | null>(null);

onMounted(async () => {
  const { Line } = await import("vue-chartjs");
  const chartjs = await import("chart.js");
  chartjs.Chart.register(
    chartjs.CategoryScale,
    chartjs.LinearScale,
    chartjs.PointElement,
    chartjs.LineElement,
    chartjs.Title,
    chartjs.Tooltip,
    chartjs.Legend,
  );
  LineChart.value = markRaw(Line);
});

const props = defineProps<{
  series: SalesTrendSeries[];
  granularity: "hourly" | "daily";
}>();

const COLORS = [
  "#14b8a6",
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#22c55e",
];

const chartData = computed(() => {
  if (!props.series.length) return { labels: [], datasets: [] };

  const labels = (props.series[0]?.data ?? []).map((d) =>
    props.granularity === "hourly"
      ? new Date(d.timestamp).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date(d.timestamp).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
  );

  const datasets = props.series.map((s, i) => ({
    label: s.product_name,
    data: s.data.map((d) => Math.round(d.amount / 100000)),
    borderColor: COLORS[i % COLORS.length],
    backgroundColor: (COLORS[i % COLORS.length] ?? "") + "20",
    tension: 0.3,
    pointRadius: 3,
  }));

  return { labels, datasets };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { font: { size: 11 }, boxWidth: 12 },
    },
  },
  scales: {
    y: {
      ticks: { callback: (v: unknown) => `${v}00rb` },
      grid: { color: "#f0f2f5" },
    },
    x: { grid: { display: false } },
  },
};
</script>

<template>
  <div class="h-48">
    <component
      :is="LineChart"
      v-if="LineChart"
      :data="chartData"
      :options="chartOptions"
      aria-label="Sales trends line chart showing product sales over time"
    />
    <div
      v-else
      class="flex h-full items-center justify-center text-sm text-gray-500"
    >
      Loading chart...
    </div>
  </div>
</template>
