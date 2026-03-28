<script setup lang="ts">
import { definePageMeta } from "#imports";
import { useLogin } from "~/composables/useLogin";

definePageMeta({ layout: "auth", middleware: [] });

const { username, loading, error, handleLogin } = useLogin();
</script>

<template>
  <div class="flex w-full flex-col gap-5">
    <h2 class="text-center text-lg font-semibold text-gray-800">Login</h2>

    <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700"
          >Username</label
        >
        <UInput
          v-model="username"
          placeholder="Enter username"
          leading-icon="i-lucide-user"
          autocomplete="username"
          class="w-full"
          :disabled="loading"
        />
      </div>

      <LazyUAlert
        v-if="error"
        color="error"
        variant="soft"
        :description="error"
      />

      <UButton
        type="submit"
        color="primary"
        block
        :loading="loading"
        :disabled="!username.trim()"
      >
        Login
      </UButton>
    </form>
  </div>
</template>
