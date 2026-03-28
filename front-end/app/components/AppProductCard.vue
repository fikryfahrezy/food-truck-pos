<script setup lang="ts">
import type { Product } from "~/types";
import { formatRupiah } from "~/utils/format";

defineProps<{
  product: Product;
  /** 'cashier' shows Add button; 'kiosk' shows larger card with tap behavior */
  mode?: "cashier" | "kiosk";
  added?: boolean;
}>();

const emit = defineEmits<{
  add: [product: Product];
  tap: [product: Product];
}>();
</script>

<template>
  <div
    class="flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white"
    :class="
      mode === 'kiosk' ? 'cursor-pointer transition-shadow hover:shadow-md' : ''
    "
    @click="mode === 'kiosk' ? emit('tap', product) : undefined"
  >
    <!-- Image -->
    <div
      class="relative flex aspect-video items-center justify-center bg-gray-100"
    >
      <LazyNuxtImg
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
        class="h-full w-full object-cover"
      />
      <div v-else class="flex flex-col items-center gap-1 text-gray-400">
        <UIcon name="i-lucide-image" class="text-3xl" />
      </div>
      <!-- Kiosk added indicator -->
      <div
        v-if="mode === 'kiosk' && added"
        class="bg-primary-500 absolute top-2 right-2 rounded-full p-0.5"
      >
        <UIcon name="i-lucide-check" class="text-sm text-white" />
      </div>
    </div>

    <!-- Info -->
    <div class="flex flex-1 flex-col gap-1.5 p-3">
      <p class="line-clamp-2 text-sm leading-tight font-medium text-gray-900">
        {{ product.name }}
      </p>
      <p class="text-sm font-bold text-gray-800">
        {{ formatRupiah(product.price) }}
      </p>

      <template v-if="mode !== 'kiosk'">
        <div class="mt-1 flex items-center justify-between">
          <span
            class="text-xs"
            :class="product.is_available ? 'text-gray-600' : 'text-red-600'"
          >
            {{
              product.is_available
                ? `Tersedia   ${product.stock_quantity} item`
                : "Habis   0 item"
            }}
          </span>
        </div>
        <UButton
          size="xs"
          block
          :color="product.is_available ? 'secondary' : 'neutral'"
          :disabled="!product.is_available"
          icon="i-lucide-plus"
          @click.stop="emit('add', product)"
        >
          Tambahkan
        </UButton>
      </template>

      <template v-else>
        <p class="text-sm font-bold text-gray-800">
          {{ formatRupiah(product.price) }}
        </p>
      </template>
    </div>
  </div>
</template>
