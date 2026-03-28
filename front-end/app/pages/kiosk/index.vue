<script setup lang="ts">
import { definePageMeta } from "#imports";
import { useKioskMenu } from "~/composables/useKioskMenu";
import { formatRupiah } from "~/utils/format";

definePageMeta({ layout: "kiosk", middleware: [] });

const {
  totals,
  itemCount,
  selectedCategory,
  categories,
  products,
  addedIds,
  selectedProduct,
  popupQty,
  isModalOpen,
  categoryIcons,
  openProduct,
  addFromPopup,
  handleRestartOrder,
} = await useKioskMenu();
</script>

<template>
  <div class="flex flex-1 overflow-hidden">
    <!-- Category sidebar -->
    <aside
      class="flex w-14 flex-col items-center gap-3 border-r border-gray-100 bg-white py-4"
    >
      <button
        class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        :class="
          selectedCategory === ''
            ? 'bg-primary-500 text-white'
            : 'text-gray-400 hover:text-gray-600'
        "
        @click="selectedCategory = ''"
      >
        <UIcon name="i-lucide-grid-2x2" />
      </button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        :class="
          selectedCategory === cat.id
            ? 'bg-primary-500 text-white'
            : 'text-gray-400 hover:text-gray-600'
        "
        @click="selectedCategory = cat.id"
      >
        <UIcon :name="categoryIcons[cat.id] ?? 'i-lucide-tag'" />
      </button>
    </aside>

    <!-- Product grid -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto p-5">
        <div v-if="products.length" class="grid grid-cols-2 gap-4">
          <div
            v-for="product in products"
            :key="product.id"
            class="cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
            @click="product.is_available && openProduct(product)"
          >
            <!-- Image -->
            <div
              class="relative flex aspect-square items-center justify-center bg-gray-100"
            >
              <UIcon name="i-lucide-image" class="text-4xl text-gray-300" />
              <div
                v-if="addedIds.has(product.id)"
                class="bg-primary-500 absolute top-2 right-2 rounded-full p-0.5"
              >
                <UIcon name="i-lucide-check" class="text-sm text-white" />
              </div>
            </div>
            <div class="p-3">
              <p class="text-sm font-medium text-gray-900">
                {{ product.name }}
              </p>
              <p class="mt-0.5 text-sm font-bold text-gray-800">
                {{ formatRupiah(product.price) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div
        class="flex items-center gap-4 border-t border-gray-100 bg-white px-5 py-3"
      >
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          @click="handleRestartOrder"
        >
          Restart Order
        </UButton>
        <div class="flex-1 text-center">
          <p class="text-xs text-gray-400">Total</p>
          <p class="font-bold text-gray-900">
            {{ formatRupiah(totals.total) }}
          </p>
        </div>
        <UButton
          color="primary"
          :disabled="!itemCount"
          @click="$router.push('/kiosk/cart')"
        >
          View Order ({{ itemCount }})
        </UButton>
      </div>
    </div>

    <!-- Item detail popup (teleports to body via UModal) -->
    <UModal v-model:open="isModalOpen" :title="selectedProduct?.name ?? ''">
      <template #body>
        <div
          v-if="selectedProduct"
          class="flex flex-col items-center gap-4 p-4"
        >
          <div
            class="flex h-36 w-36 items-center justify-center rounded-xl bg-gray-100"
          >
            <UIcon name="i-lucide-image" class="text-5xl text-gray-300" />
          </div>
          <h3 class="text-lg font-bold text-gray-900">
            {{ selectedProduct.name }}
          </h3>
          <p class="text-primary-600 text-xl font-bold">
            {{ formatRupiah(selectedProduct.price) }}
          </p>
          <div class="flex items-center gap-4">
            <UButton
              variant="outline"
              color="neutral"
              icon="i-lucide-minus"
              size="lg"
              class="rounded-full"
              :disabled="popupQty <= 1"
              @click="popupQty--"
            />
            <span class="w-10 text-center text-xl font-bold">{{
              popupQty
            }}</span>
            <UButton
              variant="outline"
              color="primary"
              icon="i-lucide-plus"
              size="lg"
              class="rounded-full"
              @click="popupQty++"
            />
          </div>
          <UButton block color="secondary" size="lg" @click="addFromPopup">
            Add Order
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
