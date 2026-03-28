<script setup lang="ts">
import { useRouter, navigateTo, definePageMeta } from "#imports";
import { useCart } from "~/composables/useCart";
import { formatRupiah } from "~/utils/format";

definePageMeta({ layout: "kiosk", middleware: [] });

const { items, totals, removeItem, updateQuantity, clearCart } = useCart();
const router = useRouter();

if (!items.value.length) {
  await navigateTo("/kiosk");
}

function handleRestart() {
  if (window.confirm("Hapus semua item dan mulai ulang?")) {
    clearCart();
    router.push("/kiosk");
  }
}
</script>

<template>
  <div class="flex flex-1 overflow-hidden">
    <!-- Category sidebar placeholder -->
    <aside
      class="flex w-14 flex-col items-center gap-3 border-r border-gray-100 bg-white py-4"
    >
      <div
        class="bg-primary-500 flex h-9 w-9 items-center justify-center rounded-lg"
      >
        <UIcon name="i-lucide-shopping-cart" class="text-white" />
      </div>
    </aside>

    <!-- Cart items -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto p-5">
        <div
          v-if="!items.length"
          class="flex h-full items-center justify-center text-sm text-gray-300"
        >
          Keranjang kosong
        </div>
        <div v-else class="grid grid-cols-2 gap-4">
          <div
            v-for="item in items"
            :key="item.product_id"
            class="overflow-hidden rounded-xl border border-gray-100 bg-white"
          >
            <div
              class="relative flex aspect-square items-center justify-center bg-gray-100"
            >
              <UIcon name="i-lucide-image" class="text-4xl text-gray-300" />
              <div
                class="bg-primary-500 absolute top-2 right-2 rounded-full p-0.5"
              >
                <UIcon name="i-lucide-check" class="text-sm text-white" />
              </div>
            </div>
            <div class="p-3">
              <p class="text-sm font-medium text-gray-900">
                {{ item.product_name }}
              </p>
              <p class="text-sm font-bold text-gray-800">
                {{ formatRupiah(item.product_price) }}
              </p>
              <div class="mt-2 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UButton
                    size="xs"
                    variant="outline"
                    color="neutral"
                    icon="i-lucide-minus"
                    class="rounded-full"
                    @click="updateQuantity(item.product_id, item.quantity - 1)"
                  />
                  <span class="text-sm font-semibold">{{ item.quantity }}</span>
                  <UButton
                    size="xs"
                    variant="outline"
                    color="primary"
                    icon="i-lucide-plus"
                    class="rounded-full"
                    @click="updateQuantity(item.product_id, item.quantity + 1)"
                  />
                </div>
                <UButton
                  size="xs"
                  color="error"
                  variant="soft"
                  icon="i-lucide-trash-2"
                  @click="removeItem(item.product_id)"
                >
                  Hapus
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Totals + bottom bar -->
      <div class="border-t border-gray-100 bg-white px-5 py-3">
        <div class="mb-3 flex flex-col gap-1 text-sm">
          <div class="flex justify-between text-gray-500">
            <span>Subtotal</span
            ><span>{{ formatRupiah(totals.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-gray-500">
            <span>Service Charge 5%</span
            ><span>{{ formatRupiah(totals.serviceCharge) }}</span>
          </div>
          <div class="flex justify-between text-gray-500">
            <span>PB1 10%</span><span>{{ formatRupiah(totals.taxPb1) }}</span>
          </div>
          <div class="flex justify-between font-bold text-gray-900">
            <span>Total Pembayaran</span
            ><span>{{ formatRupiah(totals.total) }}</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <UButton variant="ghost" color="neutral" @click="handleRestart"
            >Restart Order</UButton
          >
          <div class="flex-1 text-center">
            <p class="text-xs text-gray-400">Total</p>
            <p class="font-bold text-gray-900">
              {{ formatRupiah(totals.total) }}
            </p>
          </div>
          <UButton
            color="primary"
            icon="i-lucide-arrow-right"
            :disabled="!items.length"
            @click="$router.push('/kiosk/checkout')"
          >
            Buat Pesanan
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
