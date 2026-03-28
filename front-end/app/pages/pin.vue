<script setup lang="ts">
import { definePageMeta } from "#imports";
import { usePinAuth } from "~/composables/usePinAuth";

definePageMeta({ layout: "auth", middleware: [] });

const {
  pin,
  loading,
  error,
  numpad,
  pendingFullName,
  handleDigit,
  handleClear,
  handleCancel,
} = usePinAuth();
</script>

<template>
  <div class="flex w-full flex-col items-center gap-5">
    <h2 class="text-base font-medium text-gray-700">
      Welcome, {{ pendingFullName }}
    </h2>

    <!-- PIN dots -->
    <div class="flex gap-3">
      <div
        v-for="i in 4"
        :key="i"
        class="h-3 w-3 rounded-full border-2 transition-colors"
        :class="
          pin.length >= i
            ? 'bg-primary-500 border-primary-500'
            : 'border-gray-300'
        "
      />
    </div>

    <p class="text-xs text-gray-600">Enter your 4 digits PIN</p>

    <LazyUAlert
      v-if="error"
      color="error"
      variant="soft"
      :description="error"
      class="w-full"
    />

    <!-- Numpad -->
    <div class="grid w-full max-w-xs grid-cols-3 gap-3">
      <button
        v-for="key in numpad"
        :key="key"
        class="active:bg-primary-100 flex h-12 items-center justify-center rounded-full bg-gray-100 text-base font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
        :disabled="loading"
        :aria-label="
          key === 'C'
            ? 'Delete previous digit'
            : key === 'X'
              ? 'Cancel PIN entry'
              : `Enter digit ${key}`
        "
        @click="
          key === 'C'
            ? handleClear()
            : key === 'X'
              ? handleCancel()
              : handleDigit(key)
        "
      >
        <span v-if="key === 'X'">
          <UIcon name="i-lucide-x" class="text-sm" />
        </span>
        <span v-else>{{ key }}</span>
      </button>
    </div>
  </div>
</template>
