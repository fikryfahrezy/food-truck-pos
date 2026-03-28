<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center bg-slate-500"
  >
    <header>
      <h1 class="mb-8 text-2xl font-bold text-white">
        Food Truck Jajanan Bango
      </h1>
    </header>
    <main
      class="flex w-full max-w-sm flex-col items-center gap-6 rounded-xl bg-white px-8 py-10 shadow-lg"
    >
      <slot />
      <p class="mt-auto pt-4 text-xs text-gray-600">POS System V1.0</p>
    </main>
  </div>
</template>
