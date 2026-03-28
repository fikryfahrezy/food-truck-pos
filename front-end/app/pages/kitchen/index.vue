<script setup lang="ts">
import { definePageMeta } from "#imports";
import { useKitchenOrders } from "~/composables/useKitchenOrders";

definePageMeta({ layout: "kitchen" });

const {
  loading,
  products,
  columns,
  getColumnOrders,
  handleAction,
  handleRemind,
} = useKitchenOrders();
</script>

<template>
  <div class="flex h-full flex-col gap-4 overflow-hidden p-4">
    <!-- Remaining products banner -->
    <div class="rounded-lg bg-white p-4">
      <p class="mb-3 text-xs font-bold tracking-wide text-gray-600 uppercase">
        Sisa Produk Hari Ini
      </p>
      <div class="flex gap-3 overflow-x-auto pb-1">
        <div
          v-for="product in products"
          :key="product.id"
          class="w-24 shrink-0 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center"
        >
          <div
            class="mb-1 flex h-12 w-full items-center justify-center rounded bg-gray-100"
          >
            <UIcon name="i-lucide-image" class="text-gray-400" />
          </div>
          <p class="truncate text-xs text-gray-600">{{ product.name }}</p>
          <p class="text-sm font-bold text-gray-900">
            {{ product.stock_quantity }}
          </p>
        </div>
      </div>
    </div>

    <!-- Kanban -->
    <div v-if="loading" class="flex flex-1 items-center justify-center">
      <UIcon
        name="i-lucide-loader-circle"
        class="text-primary-500 animate-spin text-4xl"
      />
    </div>

    <div v-else class="flex flex-1 gap-4 overflow-hidden">
      <div
        v-for="col in columns"
        :key="col.key"
        class="flex flex-1 flex-col overflow-hidden"
      >
        <!-- Column header -->
        <div class="mb-3 flex items-center gap-2">
          <span
            class="rounded px-2 py-0.5 text-xs font-bold text-white"
            :class="col.color"
          >
            {{ col.label }}
          </span>
          <LazyUBadge
            :label="String(getColumnOrders(col.key).length)"
            color="neutral"
            variant="soft"
            size="sm"
          />
        </div>

        <!-- Card list -->
        <div class="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
          <LazyKitchenOrderCard
            v-for="order in getColumnOrders(col.key)"
            :key="order.id"
            :order="order"
            :column="col.key as 'new' | 'processing' | 'pickup' | 'complete'"
            @action="handleAction"
            @remind="handleRemind"
          />
          <div
            v-if="!getColumnOrders(col.key).length"
            class="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-xs text-gray-500"
          >
            Tidak ada order
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
