import { defineNuxtPlugin, useRuntimeConfig } from "#imports";

/**
 * MSW (Mock Service Worker) browser plugin.
 *
 * Activates MSW in development when NUXT_PUBLIC_ENABLE_MSW=true.
 * After installing dependencies, run `bun run msw:init` to generate
 * the service worker file at public/mockServiceWorker.js.
 */
export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();
  if (String(config.public.enableMsw).toLowerCase() !== "true") return;

  const { createWorker } = await import("~/mocks/browser");
  const worker = createWorker(config.public.apiBase as string);

  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
});
