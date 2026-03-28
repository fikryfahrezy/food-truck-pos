<script setup lang="ts">
import { definePageMeta } from "#imports";
import { useCashierPos } from "~/composables/useCashierPos";
import { formatRupiah } from "~/utils/format";

definePageMeta({ layout: "pos" });

const {
  items,
  orderType,
  totals,
  addItem,
  removeItem,
  updateQuantity,
  updateNotes,
  selectedCategory,
  searchQuery,
  categories,
  products,
} = await useCashierPos();
</script>

<template>
  <div class="flex h-full overflow-hidden">
    <div class="flex flex-1 flex-col overflow-hidden border-r border-gray-100">
      <!-- Category tabs + search -->
      <div class="bg-white px-5 pt-4 pb-2">
        <div class="mb-3 flex items-center gap-4">
          <!-- Category tabs -->
          <nav class="flex gap-1">
            <button
              class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              :class="
                selectedCategory === ''
                  ? 'text-primary-600 border-primary-500 border-b-2'
                  : 'text-gray-500 hover:text-gray-700'
              "
              @click="selectedCategory = ''"
            >
              Semua
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              :class="
                selectedCategory === cat.id
                  ? 'text-primary-600 border-primary-500 border-b-2'
                  : 'text-gray-500 hover:text-gray-700'
              "
              @click="selectedCategory = cat.id"
            >
              {{ cat.name }}
            </button>
          </nav>

          <div class="ml-auto w-52">
            <UInput
              v-model="searchQuery"
              placeholder="Cari Item"
              leading-icon="i-lucide-search"
              size="sm"
            />
          </div>
        </div>
      </div>

      <!-- Product grid -->
      <div class="flex-1 overflow-y-auto px-5 py-3">
        <p
          class="mb-3 text-xs font-semibold tracking-wide text-gray-600 uppercase"
        >
          Pilih Item
        </p>
        <div v-if="products.length" class="grid grid-cols-3 gap-3">
          <AppProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            mode="cashier"
            @add="addItem(product)"
          />
        </div>
        <div
          v-else
          class="flex h-32 items-center justify-center text-sm text-gray-500"
        >
          Tidak ada produk ditemukan
        </div>
      </div>
    </div>

    <!-- RIGHT: Order panel -->
    <div class="flex w-80 shrink-0 flex-col overflow-hidden bg-white">
      <!-- Order type toggle -->
      <div class="border-b border-gray-100 px-4 pt-4 pb-2">
        <p class="mb-2 text-sm font-semibold text-gray-700">Order No #00001</p>
        <div class="flex gap-2">
          <UButton
            size="xs"
            :color="orderType === 'dine_in' ? 'secondary' : 'neutral'"
            :variant="orderType === 'dine_in' ? 'solid' : 'outline'"
            @click="orderType = 'dine_in'"
          >
            Dine In
          </UButton>
          <UButton
            size="xs"
            :color="orderType === 'take_away' ? 'secondary' : 'neutral'"
            :variant="orderType === 'take_away' ? 'solid' : 'outline'"
            @click="orderType = 'take_away'"
          >
            Take Away
          </UButton>
        </div>
      </div>

      <!-- Items list -->
      <div class="flex-1 overflow-y-auto px-4 py-3">
        <div
          v-if="!items.length"
          class="flex h-32 items-center justify-center text-sm text-gray-500"
        >
          Belum ada item
        </div>
        <div v-else class="flex flex-col gap-3">
          <div
            v-for="item in items"
            :key="item.product_id"
            class="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0"
          >
            <div class="flex items-center gap-2">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100"
              >
                <UIcon name="i-lucide-image" class="text-xs text-gray-400" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-medium text-gray-900">
                  {{ item.product_name }}
                </p>
                <p class="text-xs text-gray-600">
                  {{ formatRupiah(item.product_price) }}
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-1">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-minus"
                  aria-label="Decrease quantity"
                  @click="updateQuantity(item.product_id, item.quantity - 1)"
                />
                <span class="w-5 text-center text-xs font-semibold">{{
                  item.quantity
                }}</span>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-plus"
                  aria-label="Increase quantity"
                  @click="updateQuantity(item.product_id, item.quantity + 1)"
                />
              </div>
              <p
                class="w-16 shrink-0 text-right text-xs font-semibold text-gray-800"
              >
                {{ formatRupiah(item.product_price * item.quantity) }}
              </p>
              <UButton
                size="xs"
                variant="ghost"
                color="error"
                icon="i-lucide-trash-2"
                aria-label="Remove item"
                @click="removeItem(item.product_id)"
              />
            </div>
            <UInput
              :model-value="item.notes"
              placeholder="Order Notes"
              size="xs"
              class="ml-10"
              @update:model-value="updateNotes(item.product_id, $event)"
            />
          </div>
        </div>
      </div>

      <!-- Totals + CTA -->
      <div class="border-t border-gray-100 px-4 py-4">
        <div class="mb-4 flex flex-col gap-1 text-sm">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{{ formatRupiah(totals.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Service Charge 5%</span>
            <span>{{ formatRupiah(totals.serviceCharge) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>PB1 10%</span>
            <span>{{ formatRupiah(totals.taxPb1) }}</span>
          </div>
          <USeparator class="my-1" />
          <div class="flex justify-between font-bold text-gray-900">
            <span>Total Pembayaran</span>
            <span>{{ formatRupiah(totals.total) }}</span>
          </div>
        </div>

        <UButton
          block
          color="primary"
          size="lg"
          :disabled="!items.length"
          @click="$router.push('/cashier/confirm')"
        >
          Lanjut Bayar
        </UButton>
      </div>
    </div>
  </div>
</template>
