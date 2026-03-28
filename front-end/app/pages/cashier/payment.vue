<script setup lang="ts">
import { navigateTo, useRoute, definePageMeta } from "#imports";
import { useCashierPayment } from "~/composables/useCashierPayment";
import { formatRupiah } from "~/utils/format";

definePageMeta({ layout: "pos" });

const route = useRoute();
const orderId = route.query.order_id as string;
if (!orderId) await navigateTo("/cashier");

const {
  paymentStatus,
  orderNumber,
  orderData,
  countdownDisplay,
  totals,
  done,
} = await useCashierPayment(orderId);
</script>

<template>
  <div class="flex h-full overflow-hidden">
    <!-- Background (blurred) -->
    <div class="flex-1 bg-white/60 backdrop-blur-sm" />

    <!-- Payment panel -->
    <div class="flex w-96 shrink-0 flex-col overflow-y-auto bg-white shadow-xl">
      <div
        class="flex items-center gap-3 border-b border-gray-100 px-6 pt-6 pb-4"
      >
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          size="xs"
          :disabled="paymentStatus !== 'pending'"
          @click="$router.back()"
        />
        <div>
          <h2 class="font-bold text-gray-900">Payment</h2>
          <p class="text-sm text-gray-500">Order No #{{ orderNumber }}</p>
        </div>
      </div>

      <USeparator />

      <div class="flex flex-1 flex-col items-center gap-4 px-6 py-5">
        <!-- Countdown -->
        <div v-if="paymentStatus === 'pending'" class="text-center">
          <p class="text-xs text-gray-500">Selesaikan pembayaran sebelum:</p>
          <p class="font-mono text-2xl font-bold text-gray-900">
            {{ countdownDisplay }}
          </p>
        </div>

        <!-- QRIS Card -->
        <div
          v-if="paymentStatus === 'pending'"
          class="w-full overflow-hidden rounded-xl"
          style="background: linear-gradient(135deg, #00b5a3, #009b8c)"
        >
          <div class="flex items-center justify-between px-4 py-3">
            <div class="text-white">
              <p class="text-xs font-bold tracking-wider">QRIS</p>
            </div>
            <div class="text-xs font-bold text-white">GPN</div>
          </div>
          <div class="px-4 pb-2 text-white">
            <p class="text-sm font-bold">PT Kreasi Global Jaya</p>
            <p class="text-xs opacity-80">NMID: ID10135103503150310503 15</p>
          </div>
          <!-- Fake QR code area -->
          <div
            class="mx-4 mb-4 flex items-center justify-center rounded-lg bg-white p-3"
          >
            <div class="grid h-36 w-36 grid-cols-7 gap-0.5">
              <div
                v-for="i in 49"
                :key="i"
                class="rounded-sm"
                :class="
                  [
                    0, 1, 2, 3, 4, 5, 6, 7, 13, 14, 20, 21, 27, 28, 42, 43, 44,
                    45, 46, 47, 48,
                  ].includes(i % 49)
                    ? 'bg-gray-900'
                    : 'bg-gray-100'
                "
              />
            </div>
          </div>
        </div>

        <!-- SUCCESS state -->
        <div
          v-if="paymentStatus === 'paid'"
          class="flex w-full items-center justify-center rounded-xl py-16"
          style="background: linear-gradient(135deg, #00b5a3, #009b8c)"
        >
          <div class="text-center text-white">
            <UIcon name="i-lucide-check-circle" class="mb-2 text-5xl" />
            <p class="font-semibold">Pembayaran berhasil</p>
          </div>
        </div>

        <!-- EXPIRED / FAILED state -->
        <div
          v-if="paymentStatus === 'expired' || paymentStatus === 'failed'"
          class="flex w-full items-center justify-center rounded-xl bg-red-50 py-16"
        >
          <div class="text-center text-red-500">
            <UIcon name="i-lucide-x-circle" class="mb-2 text-5xl" />
            <p class="font-semibold">
              {{
                paymentStatus === "expired"
                  ? "Pembayaran Kadaluarsa"
                  : "Pembayaran Gagal"
              }}
            </p>
          </div>
        </div>
      </div>

      <USeparator />

      <div class="flex flex-col gap-3 px-6 py-4">
        <div class="flex justify-between font-bold text-gray-900">
          <span>Total Pembayaran</span>
          <span>{{
            formatRupiah(orderData?.total_amount ?? totals.total)
          }}</span>
        </div>

        <div
          v-if="paymentStatus === 'pending'"
          class="flex items-center justify-center gap-2 text-sm text-gray-400"
        >
          <UIcon name="i-lucide-loader-circle" class="animate-spin" />
          <span>Menunggu pembayaran...</span>
        </div>

        <UButton
          v-if="paymentStatus === 'paid'"
          block
          color="primary"
          size="lg"
          @click="done"
        >
          Selesai
        </UButton>

        <UButton
          v-if="paymentStatus === 'expired' || paymentStatus === 'failed'"
          block
          color="neutral"
          variant="outline"
          @click="$router.push('/cashier/confirm')"
        >
          Coba Lagi
        </UButton>
      </div>
    </div>
  </div>
</template>
