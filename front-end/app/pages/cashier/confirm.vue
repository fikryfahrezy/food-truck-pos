<script setup lang="ts">
import { navigateTo, definePageMeta } from "#imports";
import { useCashierConfirm } from "~/composables/useCashierConfirm";
import { useCart } from "~/composables/useCart";
import { formatRupiah } from "~/utils/format";

definePageMeta({ layout: "pos" });

const { updateQuantity, removeItem, updateNotes } = useCart();

const {
  items,
  orderType,
  totals,
  paymentMethod,
  customerName,
  customerWa,
  tableNumber,
  loading,
  error,
  paymentMethods,
  handleConfirm,
  cancelOrder,
} = useCashierConfirm();

if (!items.value.length) {
  await navigateTo("/cashier");
}
</script>

<template>
  <div class="flex h-full overflow-hidden">
    <!-- Blurred background (left - menu is blurred) -->
    <div class="relative flex-1 overflow-hidden">
      <div class="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm" />
    </div>

    <!-- Confirmation panel (right) -->
    <div
      class="flex w-105 shrink-0 flex-col overflow-y-auto bg-white shadow-xl"
    >
      <!-- Header -->
      <div class="border-b border-gray-100 px-5 pt-5 pb-3">
        <div class="mb-1 flex items-center gap-3">
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-arrow-left"
            size="xs"
            @click="$router.back()"
          />
          <h2 class="font-bold text-gray-900">Confirmation</h2>
        </div>
        <p class="ml-7 text-sm text-gray-500">Order No #00001</p>
      </div>

      <!-- Split layout: order list + payment info -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Left: order items -->
        <div class="flex-1 overflow-y-auto border-r border-gray-100 px-5 py-4">
          <div v-for="item in items" :key="item.product_id" class="mb-4">
            <div class="flex items-center gap-2">
              <p class="flex-1 truncate text-sm font-medium text-gray-900">
                {{ item.product_name }}
              </p>
              <div class="flex items-center gap-1">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-minus"
                  @click="
                    () => updateQuantity(item.product_id, item.quantity - 1)
                  "
                />
                <span class="text-sm font-semibold">{{ item.quantity }}</span>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-plus"
                  @click="
                    () => updateQuantity(item.product_id, item.quantity + 1)
                  "
                />
              </div>
              <span class="w-20 text-right text-sm font-semibold text-gray-700">
                {{ formatRupiah(item.product_price * item.quantity) }}
              </span>
              <UButton
                size="xs"
                variant="ghost"
                color="error"
                icon="i-lucide-trash-2"
                @click="() => removeItem(item.product_id)"
              />
            </div>
            <p class="ml-0 text-xs text-gray-400">
              {{ formatRupiah(item.product_price) }}
            </p>
            <UInput
              :model-value="item.notes"
              placeholder="Order Notes"
              size="xs"
              class="mt-1"
              @update:model-value="(v) => updateNotes(item.product_id, v)"
            />
          </div>

          <USeparator class="my-3" />

          <div class="flex flex-col gap-1 text-sm">
            <div class="flex justify-between font-bold text-gray-900">
              <span>Subtotal</span>
              <span>{{ formatRupiah(totals.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>Service Charge 5%</span>
              <span>{{ formatRupiah(totals.serviceCharge) }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>PB1 10%</span>
              <span>{{ formatRupiah(totals.taxPb1) }}</span>
            </div>
            <div class="mt-1 flex justify-between font-bold text-gray-900">
              <span>Total Pembayaran</span>
              <span>{{ formatRupiah(totals.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Right: payment info -->
        <div class="flex w-56 flex-col gap-4 px-4 py-4">
          <div>
            <p class="mb-2 text-xs font-semibold text-gray-600">
              Metode Pembayaran
            </p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="pm in paymentMethods"
                :key="pm.value"
                class="rounded border px-3 py-1 text-xs font-medium transition-colors"
                :class="
                  paymentMethod === pm.value
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                "
                @click="paymentMethod = pm.value"
              >
                {{ pm.label }}
              </button>
            </div>
          </div>

          <UInput
            v-model="customerName"
            placeholder="Isi Nama Pemesan"
            size="sm"
            leading-icon="i-lucide-user"
          />
          <UInput
            v-model="customerWa"
            placeholder="Isi No. Whatsapp"
            size="sm"
            leading-icon="i-lucide-smartphone"
            type="tel"
          />

          <div class="flex gap-2">
            <USelect
              v-model="orderType"
              :items="[
                { label: 'Dine in', value: 'dine_in' },
                { label: 'Take Away', value: 'take_away' },
              ]"
              size="sm"
              class="flex-1"
            />
            <UInput
              v-if="orderType === 'dine_in'"
              v-model="tableNumber"
              placeholder="No. Meja"
              size="sm"
              class="w-20"
            />
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="flex flex-col gap-2 border-t border-gray-100 px-5 py-4">
        <LazyUAlert
          v-if="error"
          color="error"
          variant="soft"
          :description="error"
        />
        <UButton
          block
          color="primary"
          size="lg"
          :loading="loading"
          @click="handleConfirm"
        >
          Konfirmasi Pembayaran
        </UButton>
        <UButton
          block
          variant="ghost"
          color="neutral"
          size="sm"
          @click="cancelOrder"
        >
          Batalkan Order
        </UButton>
      </div>
    </div>
  </div>
</template>
