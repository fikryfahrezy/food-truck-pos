<script setup lang="ts">
import { onMounted } from "vue";
import { definePageMeta, navigateTo } from "#imports";
import { useAuth } from "~/composables/useAuth";

definePageMeta({ layout: false, middleware: [] });

const { isAuthenticated, user, outlet } = useAuth();

onMounted(() => {
  if (isAuthenticated.value) {
    if (!outlet.value) return navigateTo("/select-outlet");
    switch (user.value?.role) {
      case "kitchen":
        return navigateTo("/kitchen");
      case "admin":
        return navigateTo("/report");
      default:
        return navigateTo("/cashier");
    }
  } else {
    return navigateTo("/login");
  }
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[#8FA3B1]">
    <UIcon
      name="i-lucide-loader-circle"
      class="animate-spin text-4xl text-white"
    />
  </div>
</template>
