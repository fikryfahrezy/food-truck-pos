<script setup lang="ts">
import { useState } from "#imports";
import { formatTanggal } from "~/utils/format";
const outlet = useState<{ id: string; name: string } | null>(
  "kiosk.outlet",
  () => ({
    id: "out_01",
    name: "Food Truck Jajanan Bango JKT",
  }),
);
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white">
    <!-- Header -->
    <header class="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
      <div
        class="bg-primary-500 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
      >
        <UIcon name="i-lucide-utensils" class="text-white" />
      </div>
      <div>
        <h1 class="font-bold text-gray-900">
          {{ outlet?.name ?? "Food Truck Jajanan Bango" }}
        </h1>
        <p class="text-xs text-gray-400">{{ formatTanggal() }}</p>
      </div>
    </header>

    <!-- Content -->
    <main class="flex flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>
