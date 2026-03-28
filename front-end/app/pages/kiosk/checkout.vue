<script setup lang="ts">
import { navigateTo, definePageMeta } from "#imports";
import { useKioskCheckout } from "~/composables/useKioskCheckout";

definePageMeta({ layout: "kiosk", middleware: [] });

const { items, customerName, customerWa, error, isValid, proceed } =
  useKioskCheckout();

if (!items.value.length) {
  await navigateTo("/kiosk");
}
</script>

<template>
  <div class="flex flex-1 flex-col items-center justify-center px-8">
    <div class="flex w-full max-w-sm flex-col gap-6">
      <div>
        <h2 class="text-xl font-bold text-gray-900">
          Isi Nama dan Nomor WhatsApp
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          untuk kebutuhan notifikasi status order
        </p>
        <p class="mt-0.5 text-xs text-gray-400">
          Digital Struk akan dikirim melalui WhatsApp
        </p>
      </div>

      <LazyUAlert
        v-if="error"
        color="error"
        variant="soft"
        :description="error"
      />

      <div class="flex flex-col gap-4">
        <UInput
          v-model="customerName"
          placeholder="Nama Pemesan"
          leading-icon="i-lucide-user"
          size="lg"
        />
        <UInput
          v-model="customerWa"
          placeholder="Nomor WhatsApp"
          leading-icon="i-lucide-smartphone"
          type="tel"
          size="lg"
        />
      </div>

      <div class="flex flex-col gap-3">
        <UButton
          block
          color="primary"
          size="xl"
          :disabled="!isValid"
          @click="proceed"
        >
          Lanjut ke Pembayaran
        </UButton>
        <UButton
          block
          variant="outline"
          color="neutral"
          size="xl"
          @click="$router.back()"
        >
          Kembali ke Order
        </UButton>
      </div>
    </div>
  </div>
</template>
