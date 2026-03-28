<script setup lang="ts">
import { useHead } from "#imports";

useHead({
  htmlAttrs: { lang: "id" },
  title: "Food Truck Jajanan Bango POS",
});
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
