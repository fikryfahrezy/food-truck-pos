<script setup lang="ts">
import { definePageMeta } from "#imports";
import { useSelectOutlet } from "~/composables/useSelectOutlet";

definePageMeta({ layout: "auth", middleware: [] });

const {
  pendingFullName,
  selectedCityId,
  selectedOutletId,
  cityOptions,
  outletOptions,
  loadingOutlets,
  loadingSubmit,
  error,
  handleProceed,
} = await useSelectOutlet();
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <h2 class="text-center text-base font-medium text-gray-700">
      Welcome, {{ pendingFullName }}
    </h2>

    <div>
      <label for="city-select" class="text-sm font-medium text-gray-700">
        City
      </label>
      <USelect
        id="city-select"
        v-model="selectedCityId"
        :items="cityOptions"
        placeholder="Select city"
        aria-label="Select city"
        class="w-full"
        :ui="{ placeholder: 'text-gray-600' }"
        :disabled="cityOptions.length === 0"
      />
    </div>

    <div>
      <label
        v-if="selectedCityId"
        for="outlet-select"
        class="text-sm font-medium text-gray-700"
      >
        Outlet
      </label>
      <USelect
        v-if="selectedCityId"
        id="outlet-select"
        v-model="selectedOutletId"
        :items="outletOptions"
        placeholder="Select outlet"
        aria-label="Select outlet"
        class="w-full"
        :ui="{ placeholder: 'text-gray-600' }"
        :disabled="loadingOutlets || outletOptions.length === 0"
      />
    </div>

    <LazyUAlert
      v-if="error"
      color="error"
      variant="soft"
      :description="error"
    />

    <div v-if="selectedOutletId" class="flex justify-center">
      <LazyUButton
        color="neutral"
        variant="outline"
        icon="i-lucide-arrow-right"
        aria-label="Continue to selected outlet"
        :loading="loadingSubmit"
        size="xl"
        class="rounded-full"
        @click="handleProceed"
      />
    </div>
  </div>
</template>
