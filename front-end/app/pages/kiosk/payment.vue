<script setup lang="ts">
import { navigateTo, useState, definePageMeta } from "#imports";
import { useCart } from "~/composables/useCart";
import { useKioskPayment } from "~/composables/useKioskPayment";
import { formatRupiah } from "~/utils/format";

definePageMeta({ layout: "kiosk", middleware: [] });

const { items } = useCart();
const customerName = useState<string>("kiosk.customerName", () => "");
const customerWa = useState<string>("kiosk.customerWa", () => "");

if (!items.value.length) await navigateTo("/kiosk");

const {
  orderNumber,
  paymentStatus,
  initError,
  countdownDisplay,
  returnSeconds,
  totals,
  done,
} = useKioskPayment({
  outletId: "out_01",
  customerName: customerName.value,
  customerWa: customerWa.value,
  items: items.value,
});
</script>

<template>
  <div class="flex flex-1 flex-col items-center justify-center px-8">
    <div class="w-full max-w-sm">
      <!-- Header -->
      <div class="mb-4">
        <h2 class="text-lg font-bold text-gray-900">Payment</h2>
        <p class="text-sm font-semibold text-gray-500">
          Order No #{{ orderNumber }}
        </p>
      </div>

      <USeparator class="mb-4" />

      <LazyUAlert
        v-if="initError"
        color="error"
        variant="soft"
        :description="initError"
        class="mb-4"
      />

      <!-- Countdown -->
      <div v-if="paymentStatus === 'pending'" class="mb-4 text-center">
        <p class="text-xs text-gray-500">Selesaikan pembayaran sebelum:</p>
        <p class="font-mono text-2xl font-bold text-gray-900">
          {{ countdownDisplay }}
        </p>
      </div>

      <!-- QRIS Payment Card -->
      <div
        v-if="paymentStatus === 'pending'"
        class="mb-4 overflow-hidden rounded-xl"
        style="background: linear-gradient(135deg, #00b5a3, #009b8c)"
      >
        <div class="flex items-center justify-between px-4 py-2">
          <span class="text-xs font-bold tracking-wider text-white">QRIS</span>
          <span class="text-xs font-bold text-white">GPN</span>
        </div>
        <div class="px-4 pb-1 text-white">
          <p class="text-sm font-bold">PT Kreasi Global Jaya</p>
          <p class="text-xs opacity-80">NMID: ID10135103503150310503 15</p>
        </div>
        <!-- Fake QR area -->
        <div
          class="mx-4 mb-4 flex items-center justify-center rounded-lg bg-white p-4"
        >
          <div class="grid h-32 w-32 grid-cols-8 gap-0.5">
            <div
              v-for="i in 64"
              :key="i"
              class="rounded-sm"
              :class="
                [
                  0, 1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 23, 24, 31, 56, 57, 58, 59,
                  60, 61, 62, 63,
                ].includes(i % 64)
                  ? 'bg-gray-900'
                  : 'bg-gray-100'
              "
            />
          </div>
        </div>
      </div>

      <!-- Success state -->
      <div
        v-if="paymentStatus === 'paid'"
        class="mb-4 flex items-center justify-center rounded-xl py-16"
        style="background: linear-gradient(135deg, #00b5a3, #009b8c)"
      >
        <div class="text-center text-white">
          <UIcon name="i-lucide-check-circle" class="mb-2 text-5xl" />
          <p class="font-semibold">Pembayaran berhasil</p>
        </div>
      </div>

      <USeparator class="mb-4" />

      <!-- Total -->
      <div class="mb-4 flex justify-between font-bold text-gray-900">
        <span>Total Pembayaran</span>
        <span>{{ formatRupiah(totals.total) }}</span>
      </div>

      <!-- Status loading / done -->
      <div
        v-if="paymentStatus === 'pending'"
        class="flex items-center justify-center gap-2 text-sm text-gray-400"
      >
        <UIcon name="i-lucide-loader-circle" class="animate-spin" />
        <span>Menunggu pembayaran...</span>
      </div>

      <template v-if="paymentStatus === 'paid'">
        <UButton block color="primary" size="lg" @click="done">Selesai</UButton>
        <p class="mt-2 text-center text-xs text-gray-400">
          Kembali ke awal dalam {{ returnSeconds }} detik
        </p>
      </template>
    </div>
  </div>
</template>
