<script setup lang="ts">
import { useRouter } from "#imports";
import { useAuth } from "~/composables/useAuth";
import { formatTanggal } from "~/utils/format";

const { user, outlet, logout } = useAuth();
const router = useRouter();

async function handleLogout() {
  const confirmed = window.confirm("Yakin ingin logout?");
  if (!confirmed) return;
  await logout();
  router.push("/login");
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#F0F2F5]">
    <!-- Sidebar -->
    <aside
      class="flex w-14 shrink-0 flex-col items-center gap-4 bg-white py-4 shadow-sm"
    >
      <div
        class="bg-primary-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
      >
        <UIcon name="i-lucide-utensils" class="text-lg text-white" />
      </div>
      <div
        class="bg-secondary-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
      >
        <UIcon name="i-lucide-chef-hat" class="text-lg text-white" />
      </div>
      <div class="mt-auto">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-power"
          aria-label="Logout"
          @click="handleLogout"
        />
      </div>
    </aside>

    <!-- Main -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <header
        class="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3"
      >
        <div>
          <h1 class="font-bold text-gray-900">
            {{ outlet?.name ?? "Food Truck Jajanan Bango" }}
          </h1>
          <p class="text-xs text-gray-600">{{ formatTanggal() }}</p>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span>Hi, {{ user?.full_name }}</span>
          <UAvatar :alt="user?.full_name" size="sm" />
        </div>
      </header>

      <main class="flex-1 overflow-hidden">
        <slot />
      </main>
    </div>
  </div>
</template>
