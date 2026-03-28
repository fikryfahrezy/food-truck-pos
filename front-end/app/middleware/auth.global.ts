import { defineNuxtRouteMiddleware, navigateTo } from "#imports";
import { useAuth } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware((to) => {
  const publicRoutes = [
    "/login",
    "/pin",
    "/select-outlet",
    "/kiosk",
    "/kiosk/cart",
    "/kiosk/checkout",
    "/kiosk/payment",
  ];
  if (publicRoutes.some((r) => to.path === r || to.path.startsWith("/kiosk")))
    return;

  const { isAuthenticated, outlet, user } = useAuth();

  if (!isAuthenticated.value) {
    return navigateTo("/login");
  }

  // After auth + outlet selection, redirect / to appropriate page
  if (to.path === "/") {
    if (!outlet.value) return navigateTo("/select-outlet");
    switch (user.value?.role) {
      case "kitchen":
        return navigateTo("/kitchen");
      case "admin":
        return navigateTo("/report");
      default:
        return navigateTo("/cashier");
    }
  }

  // Require outlet for protected POS routes
  if (!outlet.value && to.path !== "/select-outlet") {
    return navigateTo("/select-outlet");
  }
});
